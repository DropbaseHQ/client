import os
from abc import ABC
from typing import Any, Callable, List, Tuple

from pydantic import BaseModel

from .row import generate as generate_row_code
from .userinput import generate as generate_userinput


class GeneratedFile(BaseModel):
    # Relative path to write to
    path: str
    # A None return value should not be written
    content_fn: Callable[[Any], str | None]

    def write(self, basepath: str, content_fn_args: Tuple = (None,)):
        file = os.path.join(basepath, self.path)
        os.makedirs(os.path.dirname(file), exist_ok=True)

        content = self.content_fn(*content_fn_args)
        if content is None:
            return

        fd = os.open(file, os.O_WRONLY | os.O_CREAT)
        os.write(fd, content.encode("utf-8"))


class GenerateHandler(ABC, BaseModel):
    files: List[GeneratedFile]


# On workspace create
class WorkspaceCreateHandler(GenerateHandler):
    pass


# On document create
# class DocumentCreateHandler(GenerateHandler):
#     pass


# On document content change
class DocumentChangeHandler(GenerateHandler):
    trigger_paths: List[str]


generate: List[GenerateHandler] = [
    WorkspaceCreateHandler(files=[GeneratedFile(path="dropbase/row.py", content_fn=generate_row_code)]),
    DocumentChangeHandler(
        trigger_paths=["uiComponent.py"],
        files=[
            GeneratedFile(path="dropbase/input.py", content_fn=lambda code: generate_userinput(code))
        ],
    ),
]
