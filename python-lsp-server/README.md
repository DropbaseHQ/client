# Python LSP Server

## Installation
```
python3 -m venv .venv
source ./.venv/bin/activate
pip install 'python-lsp-server[websockets]'
pip install -e .
```

## Run
```
python3 -m pylsp --ws --port [port]
```
Replace `[port]` with your port. In client `.env` add the line `VITE_PYTHON_LSP_SERVER=ws://localhost:[port]`, where `[port]` is your port.
