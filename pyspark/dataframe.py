from __future__ import annotations

import csv
from collections import OrderedDict
from typing import Any, Iterable, Mapping


class Row(dict):
    def __getattr__(self, name: str):
        try:
            return self[name]
        except KeyError as exc:  # pragma: no cover - explicit attribute error path
            raise AttributeError(name) from exc

    def asDict(self):
        return dict(self)


class GroupedDataFrame:
    def __init__(self, df, columns):
        self.df = df
        self.columns = list(columns)

    def agg(self, *aggregations):
        from .sql.functions import FunctionExpression

        groups = OrderedDict()
        for row in self.df._rows:
            key = tuple(row.get(col) for col in self.columns)
            groups.setdefault(key, []).append(row)

        output_rows = []
        output_columns = list(self.columns)

        for expr in aggregations:
            if isinstance(expr, FunctionExpression):
                output_columns.append(expr.output_name)
            elif isinstance(expr, Mapping):
                for name, inner in expr.items():
                    output_columns.append(name)
            else:
                output_columns.append(str(expr))

        for key, rows in groups.items():
            row = {column: key[index] for index, column in enumerate(self.columns)}
            for expr in aggregations:
                if isinstance(expr, FunctionExpression):
                    row[expr.output_name] = _aggregate_rows(rows, expr)
                elif isinstance(expr, Mapping):
                    for column_name, inner in expr.items():
                        value = _aggregate_rows(rows, inner)
                        row[column_name] = value
                else:
                    row[str(expr)] = _aggregate_rows(rows, expr)
            output_rows.append(row)

        return DataFrame(output_rows, output_columns)


def _aggregate_rows(rows, expr):
    if expr is None:
        return None

    if isinstance(expr, str):
        values = [row.get(expr) for row in rows]
        cleaned = [float(v) for v in values if v not in (None, "")]
        return sum(cleaned) if cleaned else 0

    if hasattr(expr, "operation"):
        column_name = expr.column_name
        values = [row.get(column_name) for row in rows]
        cleaned = [float(v) for v in values if v not in (None, "")]
        if expr.operation == "sum":
            return sum(cleaned) if cleaned else 0
        if expr.operation == "avg":
            return sum(cleaned) / len(cleaned) if cleaned else 0
        if expr.operation == "count":
            return len([v for v in values if v not in (None, "")])
        if expr.operation == "min":
            return min(cleaned) if cleaned else 0
        if expr.operation == "max":
            return max(cleaned) if cleaned else 0
        if expr.operation == "column":
            return _coerce_value(rows[0].get(column_name) if rows else None)

    return None


def _coerce_value(value):
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return value


def _sort_value(value):
    if value is None:
        return ""
    try:
        return float(value)
    except (TypeError, ValueError):
        return str(value).lower()


class DataFrame:
    def __init__(self, rows: Iterable[Mapping[str, Any]] | None = None, columns: Iterable[str] | None = None):
        self._rows = []
        if rows is None:
            rows = []
        rows = list(rows)
        if rows and isinstance(rows[0], dict):
            explicit_columns = list(columns) if columns is not None else list(rows[0].keys())
            self._columns = list(explicit_columns)
            for row in rows:
                clean_row = {}
                for column in self._columns:
                    clean_row[column] = row.get(column)
                self._rows.append(clean_row)
        else:
            self._columns = list(columns) if columns is not None else []
            for row in rows:
                self._rows.append(dict(row))

    @staticmethod
    def from_csv(path: str, **kwargs):
        with open(path, "r", newline="") as handle:
            reader = csv.DictReader(handle)
            rows = list(reader)
            return DataFrame(rows, reader.fieldnames or [])

    @property
    def columns(self):
        return list(self._columns)

    def collect(self):
        return [dict(row) for row in self._rows]

    def toPandas(self):
        try:
            import pandas as pd
        except ModuleNotFoundError:  # pragma: no cover - optional dependency
            return self.collect()
        return pd.DataFrame(self.collect())

    def __len__(self):
        return len(self._rows)

    def __iter__(self):
        return iter(self._rows)

    def __repr__(self):
        preview = self._rows[:5]
        return f"DataFrame({preview!r}, columns={self._columns!r})"

    def show(self, n: int = 20, truncate: bool = True):
        rows = self._rows[:n]
        if not rows:
            print("Empty DataFrame")
            return
        for row in rows:
            print(row)

    def filter(self, condition):
        if callable(condition):
            predicate = condition
        elif isinstance(condition, str):
            predicate = _expression_filter(condition)
        else:
            predicate = lambda row: bool(condition)
        return DataFrame([row for row in self._rows if predicate(row)], self._columns)

    def where(self, condition):
        return self.filter(condition)

    def select(self, *columns):
        if len(columns) == 1 and isinstance(columns[0], (list, tuple)):
            columns = tuple(columns[0])
        target = [str(column) for column in columns]
        if not target:
            target = list(self._columns)
        return DataFrame(
            [{column: row.get(column) for column in target} for row in self._rows],
            target,
        )

    def withColumn(self, name: str, value):
        if name in self._columns:
            new_rows = []
            for row in self._rows:
                updated = dict(row)
                if callable(value):
                    updated[name] = value(updated)
                elif hasattr(value, "evaluate"):
                    updated[name] = value.evaluate(updated)
                else:
                    updated[name] = value
                new_rows.append(updated)
            return DataFrame(new_rows, self._columns)

        new_rows = []
        for row in self._rows:
            updated = dict(row)
            if callable(value):
                updated[name] = value(updated)
            elif hasattr(value, "evaluate"):
                updated[name] = value.evaluate(updated)
            else:
                updated[name] = value
            new_rows.append(updated)
        return DataFrame(new_rows, list(self._columns) + [name])

    def drop(self, *columns):
        columns = set(str(column) for column in columns)
        remaining = [col for col in self._columns if col not in columns]
        return DataFrame(
            [{col: row.get(col) for col in remaining} for row in self._rows],
            remaining,
        )

    def orderBy(self, *columns, ascending: bool = True):
        if len(columns) == 1 and isinstance(columns[0], (list, tuple)):
            columns = tuple(columns[0])
        if not columns:
            return DataFrame(self._rows, self._columns)

        rows = list(self._rows)
        for column in reversed(columns):
            rows.sort(key=lambda row: _sort_value(row.get(column)), reverse=not ascending)
        return DataFrame(rows, self._columns)

    def fillna(self, value=None, **kwargs):
        replacements = dict(kwargs)
        if isinstance(value, Mapping):
            replacements.update(value)
        elif value is not None:
            for column in self._columns:
                replacements.setdefault(column, value)

        new_rows = []
        for row in self._rows:
            clean_row = dict(row)
            for column, replacement in replacements.items():
                if clean_row.get(column) in (None, ""):
                    clean_row[column] = replacement
            new_rows.append(clean_row)
        return DataFrame(new_rows, self._columns)

    def groupBy(self, *columns):
        return GroupedDataFrame(self, columns)

    def count(self):
        return len(self._rows)

    def first(self):
        return self._rows[0] if self._rows else None

    def alias(self, alias_name: str):
        return DataFrame(self._rows, [alias_name])


def _expression_filter(expression: str):
    expression = expression.strip()

    def predicate(row):
        left, operator, right = _split_expression(expression)
        left_value = row.get(left)
        right_value = right
        if isinstance(right, str) and right.strip().startswith("'") and right.strip().endswith("'"):
            right_value = right.strip()[1:-1]
        elif right.isdigit():
            right_value = int(right)
        elif right.replace(".", "", 1).isdigit():
            right_value = float(right)
        return _compare(left_value, operator, right_value)

    return predicate


def _split_expression(expression: str):
    for operator in ("==", "!=", ">=", "<=", ">", "<"):
        if operator in expression:
            left, right = expression.split(operator, 1)
            return left.strip(), operator, right.strip()
    raise ValueError(f"Unsupported filter expression: {expression!r}")


def _compare(left, operator, right):
    if operator == "==":
        return left == right
    if operator == "!=":
        return left != right
    if operator == ">":
        return left > right
    if operator == ">=":
        return left >= right
    if operator == "<":
        return left < right
    if operator == "<=":
        return left <= right
    return False
