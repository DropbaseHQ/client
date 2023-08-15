FROM python:3.10-slim-buster

# Install basic packages
RUN apt-get update -y && apt-get install libffi-dev libmagic1 git -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /project

# Install python libraries
COPY requirements.txt requirements.txt

RUN pip3 install --no-cache-dir --upgrade -r requirements.txt

ADD . server/.


EXPOSE 8000

# CMD uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
CMD uvicorn server.main:app --host 0.0.0.0 --port 8000
