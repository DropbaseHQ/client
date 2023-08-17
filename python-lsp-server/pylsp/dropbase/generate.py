import os
from abc import ABC
from typing import Callable, Generic, List, Type, TypeVar

from pydantic import BaseModel
from pylsp.workspace import Document, Workspace

T = TypeVar("T", Workspace, Document)


class GeneratedFile(ABC, BaseModel, Generic[T]):
    # Relative path to write to
    path: str
    # A None return value should not be written
    content_fn: Callable[[T], str | None]

    # Writes the content of the content_fn to the given file path (content is overwritten)
    def write(self, basepath: str, resource: T):
        file = os.path.join(basepath, self.path)
        os.makedirs(os.path.dirname(file), exist_ok=True)

        content = self.content_fn(resource)
        if content is None:
            return

        fd = os.open(file, os.O_WRONLY | os.O_CREAT)
        n = os.pwrite(fd, content.encode("utf-8"), 0)
        os.truncate(fd, n)


class GenerateHandler(ABC, BaseModel, Generic[T]):
    # Receives the triggering resource and returns whether to generate any files or not
    # Used for conditional file generation
    match_fn: Callable[[T], bool] = lambda _: True
    # The files to generate
    files: List[GeneratedFile[T]]


# On workspace create
class WorkspaceCreateHandler(GenerateHandler[Workspace]):
    pass


# On document create
class DocumentCreateHandler(GenerateHandler[Document]):
    pass


# On document content change
class DocumentChangeHandler(GenerateHandler[Document]):
    pass


# Filters the generate list and handles the appropriate generate event handlers
def handleGenerateEvent(
    event_list: List[GenerateHandler], event_handler: Type[GenerateHandler], resource, basepath: str
):
    for handler in event_list:
        if not isinstance(handler, event_handler):
            continue

        if not handler.match_fn(resource):
            continue

        for generate_file in handler.files:
            generate_file.write(basepath, resource)
