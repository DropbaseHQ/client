from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from server import crud
from server.schemas.user import CreateUser, ReadUser
from server.utils.helper import raise_http_exception


def get_user(db: Session, user_email: str):
    try:
        user = crud.user.get_user_by_email(db, email=user_email)
        return ReadUser(
            id=user.id,
            name=user.name,
            email=user.email,
            trial_eligible=user.trial_eligible,
            active=user.active,
            date=user.date,
            customer_id=user.customer_id,
            subscription_id=user.subscription_id,
            status=user.status,
            plan=user.plan,
        )
    except Exception as e:
        print("error", e)
        raise_http_exception(status_code=404, message="User not found")
