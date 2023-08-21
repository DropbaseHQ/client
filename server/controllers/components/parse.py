import ast

from pydantic import BaseModel


class GeneratedUIComponent(BaseModel):
    class_name: str
    kwargs: dict


def extract_class_instantiations(code_string: str) -> list[GeneratedUIComponent]:
    """Extracts class instantiations from a string of code. This means that
    it will only look for lines of code that look like this:
    `variable_name = ClassName(arg1, arg2, kwarg1=value1, kwarg2=value2)`
    """
    generated_class_instances = []
    parsed_tree = ast.parse(code_string)
    for node in ast.walk(parsed_tree):
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Call):
            class_name = node.value.func.id
            kwargs = {}
            for keyword in node.value.keywords:
                if isinstance(keyword.value, ast.Name):
                    keyword_value = keyword.value.id
                else:
                    keyword_value = ast.literal_eval(keyword.value)
                kwargs[keyword.arg] = keyword_value
            generated_class_instances.append(GeneratedUIComponent(class_name=class_name, kwargs=kwargs))

    return generated_class_instances
