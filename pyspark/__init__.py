"""Minimal PySpark compatibility layer for the liquor distribution demo."""

from .dataframe import DataFrame, Row
from .session import SparkSession

__all__ = ["SparkSession", "DataFrame", "Row"]
