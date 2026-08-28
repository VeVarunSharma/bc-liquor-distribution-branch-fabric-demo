from __future__ import annotations

from .dataframe import DataFrame


class SparkSession:
    """A tiny SparkSession-compatible wrapper for notebook-style testing."""

    def __init__(self, app_name: str = "bc-liquor-demo") -> None:
        self.app_name = app_name

    @classmethod
    def builder(cls):
        return _Builder()

    @property
    def read(self):
        return _DataFrameReader()

    def sql(self, query: str):
        raise NotImplementedError("SQL execution is not implemented in this local compatibility layer.")

    def stop(self):
        return None


class _Builder:
    def __init__(self) -> None:
        self._app_name = "bc-liquor-demo"

    def appName(self, app_name: str):
        self._app_name = app_name
        return self

    def getOrCreate(self):
        return SparkSession(self._app_name)


class _DataFrameReader:
    def csv(self, path: str, **kwargs):
        return DataFrame.from_csv(path, **kwargs)
