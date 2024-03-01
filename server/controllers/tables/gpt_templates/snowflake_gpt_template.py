def get_snowflake_gpt_input(db_schema: dict, user_sql: str, column_names: list) -> str:
    return f"""Given a database schema and a SQL query, output a JSON object that contains each column referenced in the SQL query.

Sample JSON object key
```json
"output column"
```

Sample JSON object value
```json
{{
        "name": "output column",
        "schema_name": "public",
        "table_name": "customer",
        "column_name": "name"
}}
```

In the sample JSON, "output column" is the column name as it would be output when executing the SQL statement.
You will be provided a list of column names that will be returned by the query. Your job is to, for each column name, determine its schema_name, table_name, and column_name based on the SQL query. You may only return information on the columns specified in Column names. You must return information on each of the columns specified in Column names.
"table" is the table name and "column" is the column name, both are inferred from the SQL query.
"schema" is the schema, this can be found by referencing the Database schema.
If not otherwise specified, use the default schema specified in the Database schema metadata.

Make sure you include each and every column referenced in the SQL statement. Do not miss any columns. When in doubt, make a guess about which column is part of which table based on your understanding of the world and web application building to make sure all columns are covered.

Database schema
```json
{db_schema}
```

SQL query:
```sql
{user_sql}
```

Column names:
```json
{column_names}
```

Output no prose, no explanations, just JSON. Exclude calculated columns from the JSON output. Don't format output. Ensure that the output is one JSON object not multiple. Furthermore label the output column the actual column name don't just call it "output column". 
"""