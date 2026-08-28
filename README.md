# BC Liquor Distribution Fabric Demo

This repository contains a minimal PySpark-style notebook fix for a liquor distribution demo.

The notebook now:
- loads branch sales data from a CSV or in-memory rows
- normalizes field names and branch names
- fills empty values without crashing the pipeline
- aggregates revenue and quantity by branch for reporting

Run the validation tests with:

python -m unittest discover -s tests -v