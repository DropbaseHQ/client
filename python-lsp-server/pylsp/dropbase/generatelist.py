import os
from typing import List

from .fetchers import generate_fetcher_module
from .generate import GeneratedFile, GenerateHandler, T

# from .input import generate as generate_userinput
# from .state import generate as generate_uistate
from .workspace import Document, Workspace

# Events on workspace create
workspaceCreateEvents: List[GenerateHandler[Workspace]] = []

# Events on document create
documentCreateEvents: List[GenerateHandler[Document]] = [
    # Generate __init__.py when a fetcher document is created
    GenerateHandler[Document](
        match_fn=lambda document: os.path.dirname(document.rel_path) == "fetchers",
        files=[GeneratedFile[Document](path="fetchers/__init__.py", content_fn=generate_fetcher_module)],
    ),
]

# Events on document content change
documentChangeEvents: List[GenerateHandler[Document]] = [
    # Generate UserInput dataclass schema when uiComponent.py is edited
    GenerateHandler[Document](
        match_fn=lambda document: document.rel_path == "uiComponent.py",
        files=[
            # GeneratedFile[Document](
            #     path="dropbase/input.py",
            #     content_fn=lambda document: generate_userinput(document._source),
            # ),
            # GeneratedFile[Document](
            #     path="dropbase/state.py",
            #     content_fn=lambda document: generate_uistate(document._source),
            # ),
        ],
    ),
]


# Generates files from a triggered event list
def handleTriggeredEvents(events: List[GenerateHandler[T]], resource: T):
    if isinstance(resource, Document):
        basepath = resource._workspace._root_path
    else:
        # resource is a Workspace
        basepath = resource._root_path

    for event in events:
        if not event.match_fn(resource):
            continue

        for file in event.files:
            file.write(basepath, resource)
