import logging

from ..python_lsp import PythonLSPServer as _PythonLSPServer
from .generate import GeneratedFile
from .state import generate_table_state
from .workspace import Workspace

log = logging.getLogger(__name__)


class PythonLSPServer(_PythonLSPServer):
    # Dropbase defined event (LSP notifcation is called "workspace/setTableSchema")
    # Writes the passed dataclass to dropbase/row.py
    def m_workspace__set_table_schema(self, dataclass: str = "", schema: dict = {}, **_kwargs):
        if self.workspace is not None:
            GeneratedFile[Workspace](
                path="dropbase/row.py",
                content_fn=lambda _: dataclass,
            ).write(self.workspace._root_path, self.workspace)

            GeneratedFile[Workspace](
                path="dropbase/state/table.py",
                content_fn=lambda _: generate_table_state(schema),
            ).write(self.workspace._root_path, self.workspace)
