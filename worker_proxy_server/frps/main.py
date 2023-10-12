import subprocess
import tempfile
from pathlib import Path
from jinja2 import Environment, FileSystemLoader


FRPS_DIR = Path(__file__).parent.absolute()
TEMPLATES_DIR = FRPS_DIR.joinpath("templates/")
FRPS_FILE = FRPS_DIR.joinpath("frps")


templates_env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))
frps_config_template = templates_env.get_template("frps.toml")

with tempfile.NamedTemporaryFile("w") as frps_config_file:
    config_str = frps_config_template.render(
        bindPort=7000,
    )
    frps_config_file.write(config_str)
    frps_config_file.flush()
    subprocess.run([FRPS_FILE, "-c", frps_config_file.name])
