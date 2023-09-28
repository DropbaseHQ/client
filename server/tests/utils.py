def has_obj_with_id(arr: list[dict], *, id: str) -> bool:
    # returns True if a db object with primary key pk is in arr
    for db_obj in arr:
        if db_obj.get("id") == id:
            return True
    return False
