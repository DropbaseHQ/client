FROM python:3.10-slim-buster

# Install basic packages
RUN apt-get update -y && apt-get install libffi-dev libmagic1 git -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /project

ADD ./server/ server/

# Possible caching optimization, split installable requirements into seperate requirements folder (i.e. creating seperate layers).
# Then install requirements which require the source after we copy the source. For now, we group everything together.
ADD ./python-lsp-server/ python-lsp-server/
RUN pip3 install --no-cache-dir --upgrade -r python-lsp-server/requirements.txt

# EXPOSE $API_PORT_NUM

CMD python3 -m pylsp --ws --port 8000
