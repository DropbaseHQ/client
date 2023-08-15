import os

row_data = {
    "public": {
        "customer": [
            {
                "name": "name",
                "type": "str",
            },
            {
                "name": "age",
                "type": "int",
            },
        ],
        "products": [
            {
                "name": "name",
                "type": "str",
            },
            {
                "name": "price",
                "type": "float",
            },
        ],
    },
    "stripe": {
        "customer": [
            {
                "name": "name",
                "type": "str",
            },
            {
                "name": "age",
                "type": "int",
            },
        ],
    },
}


def compose_classes_from_row_data(row_data: dict):
    all_cls = "from dataclasses import dataclass\n"
    row_cls_str = "@dataclass\n"
    row_cls_str += "class Row:\n"

    for schema, tables in row_data.items():
        schema_cls_str = "@dataclass\n"
        schema_name = schema.capitalize()
        schema_cls_str += f"class {schema_name}:\n"

        for table, column in tables.items():
            table_name = schema_name + table.capitalize()
            cls_str = "@dataclass\n"
            cls_str += f"class {table_name}:\n"
            for val in column:
                cls_str += f"    {val['name']}: {val['type']}\n"
            all_cls += cls_str + "\n"
            schema_cls_str += f"    {table}: {table_name}\n"
        all_cls += schema_cls_str + "\n"
        row_cls_str += f"    {schema}: {schema_name}\n"
    all_cls += row_cls_str
    return all_cls


# all_classes_str = compose_classes_from_row_data(row_data)


generate = [("dropbase/input.py", lambda: compose_classes_from_row_data(row_data))]
