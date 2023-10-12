## Launch server

From root:
```
uvicorn worker_proxy_server.main:app --reload --host 0.0.0.0 --port 8000
python worker_proxy_server/frps.py
```
