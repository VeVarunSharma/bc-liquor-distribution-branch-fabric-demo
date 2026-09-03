import unittest

import pyspark
from notebook import fix_pyspark_data_notebook_bug


class NotebookFixTests(unittest.TestCase):
    def test_pyspark_compatibility_module_imports(self):
        self.assertTrue(hasattr(pyspark, "SparkSession"))

    def test_notebook_fix_normalizes_rows_and_summarizes_branch_totals(self):
        rows = [
            {"Branch": " victoria ", "Product": "BC Lager", "Volume": 120, "Unit Price": 12.5, "Revenue": 1500.0},
            {"Branch": "Vancouver", "Product": "Maple Rum", "Volume": 90, "Unit Price": 25.5, "Revenue": 2295.0},
            {"Branch": "Victoria", "Product": "Silver Creek Vodka", "Volume": 150, "Unit Price": 18.0, "Revenue": 2700.0},
            {"Branch": "Kelowna", "Product": "BC Cider", "Volume": "", "Unit Price": 9.75, "Revenue": ""},
            {"Branch": " victoria ", "Product": "Maple Rye", "Volume": 75, "Unit Price": "5.00", "Revenue": "375"},
        ]

        result = fix_pyspark_data_notebook_bug(rows=rows)
        summary = {entry["branch"]: entry for entry in result.collect()}

        self.assertIn("Victoria", summary)
        self.assertEqual(summary["Victoria"]["total_revenue"], 4575.0)
        self.assertEqual(summary["Victoria"]["total_quantity"], 345.0)
        self.assertIn("total_revenue", result.columns)
        self.assertIn("total_quantity", result.columns)


if __name__ == "__main__":
    unittest.main()
