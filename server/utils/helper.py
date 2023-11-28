from fastapi import HTTPException

from server.schemas.errors import LanguageErrorResponse


def create_error_details(message: str, error):
    return {"message": message, "error": error.__str__()}


def raise_http_exception(status_code: int, message: str, error=None):
    error_detail = create_error_details(message, error)
    raise HTTPException(status_code=status_code, detail=error_detail)


def raise_language_exception(data: LanguageErrorResponse):
    raise HTTPException(status_code=400, detail=data.dict())
