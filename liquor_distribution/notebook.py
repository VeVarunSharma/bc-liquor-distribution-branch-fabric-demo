from __future__ import annotations

import os
from typing import Iterable, Sequence

from pyspark.dataframe import DataFrame
from pyspark.session import SparkSession


SAMPLE_ROWS = [
    {"branch": "Victoria", "product": "BC Lager", "quantity": 120, "unit_price": 12.5, "revenue": 1500.0},
    {"branch": "Vancouver", "product": "Maple Rum", "quantity": 90, "unit_price": 25.5, "revenue": 2295.0},
    {"branch": "Victoria", "product": "Silver Creek Vodka", "quantity": 150, "unit_price": 18.0, "revenue": 2700.0},
    {"branch": "Kelowna", "product": "BC Cider", "quantity": "", "unit_price": 9.75, "revenue": ""},
    {"branch": " victoria ", "product": "Maple Rye", "quantity": 75, "unit_price": "5.00", "revenue": "375"},
]


def load_liquor_data(data_path: str | os.PathLike[str] | None = None, rows: Sequence[dict] | None = None):
    if rows is not None:
        return DataFrame(rows)
    if data_path and os.path.exists(os.fspath(data_path)):
        return SparkSession.builder().appName("bc-liquor-demo").getOrCreate().read.csv(os.fspath(data_path))
    return DataFrame(SAMPLE_ROWS)


def read_liquor_data(data_path: str | os.PathLike[str] | None = None, rows: Sequence[dict] | None = None):
    return load_liquor_data(data_path=data_path, rows=rows)


def _normalise_column_name(name):
    cleaned = str(name).strip().lower().replace(" ", "_").replace("-", "_")
    aliases = {"sales_amount": "revenue", "total_sales": "revenue", "qty": "quantity", "volume": "quantity"}
    return aliases.get(cleaned, cleaned)


def _coerce_float(value):
    if value in (None, "", "null", "None", "nan"):
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return 0.0


def normalize_columns(df: DataFrame):
    rows = []
    for row in df.collect():
        converted = {}
        for key, value in row.items():
            cleaned_key = _normalise_column_name(key)
            converted[cleaned_key] = value
        rows.append(converted)
    return DataFrame(rows)


def _normalise_rows(df: DataFrame):
    return normalize_columns(df)


def prepare_data(df: DataFrame):
    df = _normalise_rows(df)

    for column in ["branch", "product", "quantity", "unit_price", "revenue"]:
        if column not in df.columns:
            df = df.withColumn(column, 0 if column in {"quantity", "unit_price", "revenue"} else "unknown")

    df = df.withColumn("branch", lambda row: str(row.get("branch", "unknown")).strip().title() or "Unknown")
    df = df.withColumn("quantity", lambda row: _coerce_float(row.get("quantity")))
    df = df.withColumn("unit_price", lambda row: _coerce_float(row.get("unit_price")))
    df = df.withColumn("revenue", lambda row: _coerce_float(row.get("revenue")))
    if "total_volume" not in df.columns:
        df = df.withColumn("total_volume", lambda row: (row.get("quantity") or 0) * (row.get("unit_price") or 0))
    df = df.fillna({"branch": "Unknown", "quantity": 0.0, "unit_price": 0.0, "revenue": 0.0, "total_volume": 0.0})
    return df


def _prepare_data(df: DataFrame):
    return prepare_data(df)
    df = _normalise_rows(df)

    for column in ["branch", "product", "quantity", "unit_price", "revenue"]:
        if column not in df.columns:
            df = df.withColumn(column, 0 if column in {"quantity", "unit_price", "revenue"} else "unknown")

    df = df.withColumn("branch", lambda row: str(row.get("branch", "unknown")).strip().title() or "Unknown")
    df = df.withColumn("quantity", lambda row: _coerce_float(row.get("quantity")))
    df = df.withColumn("unit_price", lambda row: _coerce_float(row.get("unit_price")))
    df = df.withColumn("revenue", lambda row: _coerce_float(row.get("revenue")))
    if "total_volume" not in df.columns:
        df = df.withColumn("total_volume", lambda row: (row.get("quantity") or 0) * (row.get("unit_price") or 0))
    df = df.fillna({"branch": "Unknown", "quantity": 0.0, "unit_price": 0.0, "revenue": 0.0, "total_volume": 0.0})
    return df


def fix_pyspark_data_notebook_bug(data_path: str | os.PathLike[str] | None = None, rows: Sequence[dict] | None = None):
    df = load_liquor_data(data_path=data_path, rows=rows)
    cleaned = _prepare_data(df)
    summary = cleaned.groupBy("branch").agg(
        __import__("pyspark.sql.functions", fromlist=["sum"]).sum("revenue").alias("total_revenue"),
        __import__("pyspark.sql.functions", fromlist=["sum"]).sum("quantity").alias("total_quantity"),
    )
    return summary.orderBy("total_revenue", ascending=False)


def build_distribution_summary(data_path: str | os.PathLike[str] | None = None, rows: Sequence[dict] | None = None):
    return fix_pyspark_data_notebook_bug(data_path=data_path, rows=rows)


def summarize_distribution(data_path: str | os.PathLike[str] | None = None, rows: Sequence[dict] | None = None):
    return build_distribution_summary(data_path=data_path, rows=rows)
