import os
from typing import List

from pylsp.workspace import Document, Workspace

from .fetchers import generate_fetcher_module
from .generate import (
    DocumentChangeHandler,
    DocumentCreateHandler,
    GeneratedFile,
    GenerateHandler,
    WorkspaceCreateHandler,
)
from .input import generate as generate_userinput
from .row import generate as generate_row_code

# TODO: refactor so that each generate file exports its own handlers, they can then be combined here

# Generate handler list
generate: List[GenerateHandler] = [
    WorkspaceCreateHandler(
        files=[GeneratedFile[Workspace](path="dropbase/row.py", content_fn=generate_row_code)]
    ),
    DocumentChangeHandler(
        match_fn=lambda document: document.rel_path == "uiComponent.py",
        files=[
            GeneratedFile[Document](
                path="dropbase/input.py",
                content_fn=lambda document: generate_userinput(document._source),
            )
        ],
    ),
    DocumentCreateHandler(
        match_fn=lambda document: os.path.dirname(document.rel_path) == "fetchers",
        files=[GeneratedFile[Document](path="fetchers/__init__.py", content_fn=generate_fetcher_module)],
    ),
]
