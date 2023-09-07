def get_class_properties(pydantic_model):
    # ordered_keys = [key for key in pydantic_model.__annotations__]
    model_props = pydantic_model.schema()["properties"]
    obj_props = []
    for key in model_props.keys():
        prop = model_props[key]
        prop["name"] = key
        if "description" in prop:
            prop["type"] = prop["description"]
            prop.pop("description")
        if "enum" in prop:
            prop["type"] = "select"
        obj_props.append(prop)
    return obj_props


def get_class_dict(pydantic_model):
    model_props = pydantic_model.schema()["properties"]
    obj_props = {key: None for key in model_props.keys()}
    return obj_props
