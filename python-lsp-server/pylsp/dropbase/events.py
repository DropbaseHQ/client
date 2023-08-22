from pylsp.workspace import Document, Workspace

from .generate import (
    DocumentChangeHandler,
    DocumentCreateHandler,
    WorkspaceCreateHandler,
    handleGenerateEvent,
)
from .generatelist import generate


def generateWorkspaceCreateFiles(workspace: Workspace):
    handleGenerateEvent(generate, WorkspaceCreateHandler, workspace, workspace._root_path)


def generateDocumentCreateFiles(document: Document):
    handleGenerateEvent(generate, DocumentCreateHandler, document, document._workspace._root_path)


def generateDocumentChangeFiles(document: Document):
    handleGenerateEvent(generate, DocumentChangeHandler, document, document._workspace._root_path)
