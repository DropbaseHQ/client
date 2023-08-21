# Python LSP Server

## Installation

The following commands must be executed in the root project directory (the `dropbase` directory, not the `python-lsp-server` directory).
```
python3 -m venv .venv
source ./.venv/bin/activate
pip install -r ./python-lsp-server/requirements.txt
```


## Run

Once again from the root project directory:
```
python3 -m pylsp --ws --port [port]
```

Replace `[port]` with your port. In client `.env` add the line `VITE_PYTHON_LSP_SERVER=ws://localhost:[port]`, where `[port]` is your port.


## Docker

Alternatively, you can use the Docker image (same context as the root directory) or the Docker Compose configuration. This will not watch or reload edits.
