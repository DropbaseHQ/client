## Launch server

```
uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

## Alembic

update alembic:

```
cd server
alembic revision --autogenerate -m ""
alembic upgrade head
alembic downgrade revision
```

## Pre-commit

install:

```
pre-commit install
```

after updating precommit file, readd and reinstall

```
git add .pre-commit-config.yaml
pre-commit install
```

dry run:

```
pre-commit run --all-files
```

## Pytest

run all tests:

```
coverage run -m pytest -s
```

<i>-s for print statements</i>

get coverage report
```
coverage report
```

run specific test:

```
pytest server/tests/test_components.py -s
```

make sure to install dev requirements

```
pip install -r requirements-dev.txt
```

https://fastapi.tiangolo.com/tutorial/testing/
