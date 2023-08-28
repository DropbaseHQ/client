import logging

from ..python_lsp import PythonLSPServer as _PythonLSPServer
from .generate import GeneratedFile
from .workspace import Workspace

log = logging.getLogger(__name__)


class PythonLSPServer(_PythonLSPServer):
    # Dropbase defined event (LSP notifcation is called "workspace/setTableSchema")
    # Writes the passed dataclass to dropbase/row.py
    def m_workspace__set_table_schema(self, dataclass: str = "", **_kwargs):
        if self.workspace is not None:
            GeneratedFile[Workspace](path="dropbase/row.py", content_fn=lambda _: dataclass).write(
                self.workspace._root_path, self.workspace
            )
