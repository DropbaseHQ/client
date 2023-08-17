import glob
import os

from pylsp.workspace import Document


# Generate __init__.py for fetchers/ directory
def generate_fetcher_module(document: Document):
    files = glob.glob("*.py", root_dir=os.path.join(document._workspace._root_path, "fetchers"))
    modules = [file[:-3] for file in files if not file == "__init__.py"]
    imports = [f"from .{module} import *" for module in modules]
    return "\n".join(imports)
