uvicorn worker_proxy_server.server.main:app --reload --host 0.0.0.0 --port 7001 & \
python worker_proxy_server/frps/main.py && \
fg
