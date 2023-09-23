import os
import shutil
import tempfile

from .. import uris
from ..workspace import Document as _Document
from ..workspace import Workspace as _Workspace
from ..workspace import lock


class Workspace(_Workspace):
    def __init__(self, root_uri, endpoint, config=None):
        super().__init__(root_uri, endpoint, config)
        self.dropbase = True

        # Create temporary directory for workspace
        dir_path = tempfile.mkdtemp()
        # This is the root path for all future file operations
        self._root_path = dir_path

        # Copy the template directory into the workspace
        current_path = os.path.abspath(__file__)
        # The path is relative to this file (./template)
        template_dir = os.path.join(os.path.dirname(current_path), "template")
        shutil.copytree(template_dir, self._root_path, dirs_exist_ok=True)

        print("NEW WORKSPACE", self._root_path)

        # Ignore Ruff linter errors (https://beta.ruff.rs/docs/rules/#error-e)
        self.update_config({"pylsp": {"plugins": {"ruff": {"ignore": ["F403", "F405"]}}}})

        from .generatelist import handleTriggeredEvents, workspaceCreateEvents

        handleTriggeredEvents(workspaceCreateEvents, self)

    def __del__(self):
        # On delete, clean up temporary directory by deleting it and all contents
        if self._root_path:
            shutil.rmtree(self._root_path, ignore_errors=True)

    # Overwrite super() to use our Document class
    def _create_document(self, doc_uri, source=None, version=None):
        path = uris.to_fs_path(doc_uri)
        return Document(
            doc_uri,
            self,
            source=source,
            version=version,
            extra_sys_path=self.source_roots(path),
            rope_project_builder=self._rope_project_builder,
        )


class Document(_Document):
    def __init__(
        self,
        uri,
        workspace,
        source=None,
        version=None,
        local=True,
        extra_sys_path=None,
        rope_project_builder=None,
    ):
        super().__init__(uri, workspace, source, version, local, extra_sys_path, rope_project_builder)
        self.dropbase = True
        self._workspace: Workspace = self._workspace

        path = uris.to_fs_path(uri)
        # Convert absolute path to relative
        self.rel_path = path[1:] if path[0] == "/" else path

        # Rename fetchers to have python importable names
        rel_dir = os.path.dirname(self.rel_path)
        if rel_dir == "fetchers":
            filename = os.path.basename(self.rel_path).replace("-", "_")  # replace hyphens
            filename = f"_{filename}"  # ensure valid first character
            self.rel_path = os.path.join(rel_dir, filename)

        # Base the relative path at workspace dir path
        self.path = os.path.join(workspace._root_path, self.rel_path)
        # Make necessary directories
        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        # Store file descriptor
        self._fd = os.open(self.path, os.O_WRONLY | os.O_CREAT)  # | os.O_SYNC)
        print("NEW FILE", self.path)

        from .generatelist import documentCreateEvents, handleTriggeredEvents

        handleTriggeredEvents(documentCreateEvents, self)

    # Rewrites the file with the current source
    @lock
    def rewrite_file(self):
        # Encode source to bytes
        buf = (self._source or "").encode("utf-8")
        # Write at start of file
        n = os.pwrite(self._fd, buf, 0)
        # Truncate file to appropriate length
        os.truncate(self._fd, n)

    # Apply change and rewrite the file
    def apply_change(self, change):
        super().apply_change(change)
        self.rewrite_file()

        from .generatelist import documentChangeEvents, handleTriggeredEvents

        handleTriggeredEvents(documentChangeEvents, self)
