from typing import Any, TypedDict

from server.controllers.state.models import PgColumnBaseProperty, PyColumnBaseProperty

column_type_to_schema_mapper = {"postgres": PgColumnBaseProperty, "python": PyColumnBaseProperty}


def get_row_schema(columns):
    # convert to selected row input
    row_input = {}
    for column in columns:
        ColumnClass = column_type_to_schema_mapper[column.type]
        col = ColumnClass(**column.property)
        row_input[col.name] = None
    return row_input


FullDBSchema = dict[str, dict[str, dict[str, dict[str, Any]]]]


GPTDBSchema = dict[str, dict[str, list[str]]]


class DBSchemaMetadata(TypedDict):
    default_schema: str


class GPTSchema(TypedDict):
    metadata: DBSchemaMetadata
    schema: GPTDBSchema
