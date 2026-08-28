from __future__ import annotations

from typing import Any, Sequence


class Column:
    def __init__(self, name: str) -> None:
        self.name = name

    def __str__(self) -> str:
        return self.name

    def __repr__(self) -> str:
        return f"Column({self.name!r})"

    def __eq__(self, other: Any):
        return Comparison("==", self, other)

    def __ne__(self, other: Any):
        return Comparison("!=", self, other)

    def __lt__(self, other: Any):
        return Comparison("<", self, other)

    def __le__(self, other: Any):
        return Comparison("<=", self, other)

    def __gt__(self, other: Any):
        return Comparison(">", self, other)

    def __ge__(self, other: Any):
        return Comparison(">=", self, other)

    def alias(self, alias_name: str):
        return FunctionExpression("column", self.name, alias_name=alias_name)


class Comparison:
    def __init__(self, operator: str, left: Any, right: Any) -> None:
        self.operator = operator
        self.left = left
        self.right = right


class FunctionExpression:
    def __init__(self, operation: str, column_name: str, alias_name: str | None = None) -> None:
        self.operation = operation
        self.column_name = column_name
        self.alias_name = alias_name

    @property
    def output_name(self) -> str:
        if self.alias_name:
            return self.alias_name
        return f"{self.operation}_{self.column_name}"

    def alias(self, alias_name: str):
        self.alias_name = alias_name
        return self


class Literal:
    def __init__(self, value: Any) -> None:
        self.value = value


def col(name: str):
    return Column(name)


def lit(value: Any):
    return Literal(value)


def sum(column_name: str):
    return FunctionExpression("sum", column_name)


def avg(column_name: str):
    return FunctionExpression("avg", column_name)


def count(column_name: str):
    return FunctionExpression("count", column_name)


def min(column_name: str):
    return FunctionExpression("min", column_name)


def max(column_name: str):
    return FunctionExpression("max", column_name)


def concat(*values: Any):
    return FunctionExpression("concat", "_".join(str(v) for v in values if v is not None))


def lower(value: Any):
    if isinstance(value, Column):
        return FunctionExpression("lower", value.name)
    return str(value).lower()


def upper(value: Any):
    if isinstance(value, Column):
        return FunctionExpression("upper", value.name)
    return str(value).upper()


def trim(value: Any):
    if isinstance(value, Column):
        return FunctionExpression("trim", value.name)
    return str(value).strip()


def when(condition: Any, value: Any, otherwise: Any = None):
    return {"condition": condition, "value": value, "otherwise": otherwise}
