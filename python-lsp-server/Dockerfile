FROM python:3.10-slim-buster

# Install basic packages
RUN apt-get update -y && apt-get install libffi-dev libmagic1 git -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /project

# Install python libraries
RUN pip3 install --no-cache-dir --upgrade 'python-lsp-server[websockets]' python-lsp-ruff

ADD ./server/ server/

ADD ./python-lsp-server/ python-lsp-server/
RUN pip3 install -e python-lsp-server

# EXPOSE $API_PORT_NUM

CMD python3 -m pylsp --ws --port 8000
