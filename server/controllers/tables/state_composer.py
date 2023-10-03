from typing import List

from server import crud
from server.controllers.tables.helper import pg_pydantic_dtype_mapper
from server.schemas.columns import ReadColumns
from server.schemas.tables import ReadTables
from server.utils.helper import clean_name_for_class

column_type_to_state_model = {"postgres": "PgColumnStateProperty"}
imports_str = """from pydantic import BaseModel
from typing import Any, Optional, Literal, List, Dict\n\n\n"""


def get_selected_and_display_table_models(db, table: ReadTables):
    tables_display_model = "class TablesDisplayState(BaseModel):\n"
    tables_selection_model = "class TablesSelectionState(BaseModel):\n"

    table_display_models, table_selection_models = [], []
    # get table selection
    tables = crud.tables.get_page_tables(db, table.page_id)
    for table in tables:
        columns = crud.columns.get_table_columns(db, table.id)
        # get table name for model name
        table_model_name = clean_name_for_class(table.name)

        # add table model name to root StateTables model
        tables_display_model += f"    {table.name}: Optional[{table_model_name}DisplayState]\n"
        # get table display model
        table_display_model = get_table_display_props(table_model_name, columns)
        table_display_models.append(table_display_model)

        # add table model name to root TableSelection model
        tables_selection_model += f"    {table.name}: Optional[{table_model_name}SelectionState]\n"
        # get table selection model
        table_selection_model = get_table_selection_model(table_model_name, columns)
        table_selection_models.append(table_selection_model)

    # if no tables are present, add pass to StateTables class
    if len(tables) == 0:
        tables_display_model += "    pass\n"
        tables_selection_model += "    pass\n"

    all_table_display_models = "\n\n".join(table_display_models) + "\n\n"
    all_table_selection_models = "\n\n".join(table_selection_models) + "\n\n"

    return {
        "display": {
            "tables": all_table_display_models,
            "base": tables_display_model,
        },
        "selected": {
            "tables": all_table_selection_models,
            "base": tables_selection_model,
        },
    }


# get ui state
def get_table_display_props(table_model_name: str, columns: List[ReadColumns]):
    """
    compose schema for table columns
    class Table1Columns(BaseModel):
        id: PgColumnStateProperty
        name: PgColumnStateProperty
    """
    display_column_model_name = f"{table_model_name}Columns"
    display_column_model = f"class {display_column_model_name}(BaseModel):\n"
    for col in columns:
        col_prop = col.property
        col_name = col_prop.get("name")
        display_column_model += f"    {col_name}: {column_type_to_state_model.get(col.type)}\n"
    if len(columns) == 0:
        display_column_model += "    pass\n"
    display_column_model += "\n\n"

    """
    compose schema for table itseld, which includes table disaply props and columns. example:
    class Table1TableStateProperty(TableDisplayProperty):
        columns: Table1Columns
    """
    display_table_model_name = f"{table_model_name}DisplayState"
    display_table_model = f"""class {display_table_model_name}(TableDisplayProperty):
    columns: {display_column_model_name}\n"""

    # put these together for the final result. we need to export both the column model and table model
    final_display_table_model = display_column_model + display_table_model

    return final_display_table_model


def get_table_selection_model(table_model_name: str, columns: List[ReadColumns]):
    """
    returns a pydantic model for the table selection. for example:
    class Table1Selection(BaseModel):
        id: Optional[int]
        name: Optional[str]
    """

    table_selection_model_str = f"class {table_model_name}SelectionState(BaseModel):\n"

    for col in columns:
        # column props
        col_pg_props = col.property
        col_python_type = pg_pydantic_dtype_mapper.get(col_pg_props.get("type"))
        table_selection_model_str += f"    {col_pg_props.get('name')}: Optional[{col_python_type if col_python_type else 'Any'}]\n"

    if len(columns) == 0:
        table_selection_model_str += "    pass\n"

    return table_selection_model_str


def get_selected_table_models(db, table: ReadTables):
    tables_selection_model = "class TablesSelectionState(BaseModel):\n"

    table_selection_models = []
    # get table selection
    tables = crud.tables.get_page_tables(db, table.page_id)
    for table in tables:
        # get table models
        columns = crud.columns.get_table_columns(db, table.id)
        # get table name for model name
        table_model_name = clean_name_for_class(table.name)

        # add table model name to root TableSelection model
        tables_selection_model += f"    {table.name}: Optional[{table_model_name}SelectionState]\n"
        # get table selection model
        table_selection_model = get_table_selection_model(table_model_name, columns)
        table_selection_models.append(table_selection_model)

    # if no tables are present, add pass to StateTables class
    if len(tables) == 0:
        tables_selection_model += "    pass\n"

    all_table_selection_models = "\n\n".join(table_selection_models) + "\n\n"

    return {"tables": all_table_selection_models, "base": tables_selection_model}
