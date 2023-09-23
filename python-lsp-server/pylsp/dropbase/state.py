def clean_name(name: str) -> str:
    return name.title().replace(" ", "")


def get_tables_pydantic_model(state) -> str:
    model_str = ""
    tables_str = "class Tables(BaseModel):\n"

    tables = state["state"]["tables"]
    for tableName in tables:
        tables_str += f"    {clean_name(tableName)}: {clean_name(tableName)}Model\n"
        table = tables[tableName]
        model_str = f"class {clean_name(tableName)}Model(TableStateProperty):\n"

        for columnName in table["columns"]:
            model_str += f"    {clean_name(columnName)}: PgColumnStateProperty\n"

    return model_str + tables_str


def get_widgets_pydantic_model(state) -> str:
    model_str = ""
    widgets_str = "class Widget(BaseModel):\n"

    widgets = state["state"]["widget"]
    for widgetName in widgets:
        widgets_str += f"    {clean_name(widgetName)}: {clean_name(widgetName)}Model\n"
        widget = widgets[widgetName]
        model_str = f"class {clean_name(widgetName)}Model(WidgetStateProperty):\n"

        for componentName in widget["components"]:
            model_str += f"    {clean_name(componentName)}: WidgetStateProperty\n"

    return model_str + widgets_str


def get_state_pydantic_model(state) -> str:
    model_str = get_tables_pydantic_model(state) + get_widgets_pydantic_model(state)
    model_str += "class State(BaseModel):\n"
    model_str += "    tables: Tables\n"
    model_str += "    widget: Widget\n"
    return model_str


import json


def generate(s: str):
    state = json.loads(s)
    content = "from .states import *\n"
    content += "from pydantic import BaseModel\n"
    content += get_state_pydantic_model(state)
    return content
