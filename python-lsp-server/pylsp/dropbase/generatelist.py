import os
from typing import List

from pylsp.workspace import Document

from .fetchers import generate_fetcher_module
from .generate import DocumentChangeHandler, DocumentCreateHandler, GeneratedFile, GenerateHandler
from .input import generate as generate_userinput

# TODO: refactor so that each generate file exports its own handlers, they can then be combined here

# Generate handler list
generate: List[GenerateHandler] = [
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
