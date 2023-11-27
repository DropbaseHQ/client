import datetime
from requests import Session
from server.credentials import LOOPS_API_KEY

LOOPS_BASE_URL = "https://app.loops.so/api/v1"


class LoopsSession(Session):
    base_url = None

    def __init__(self):
        super().__init__()
        self.base_url = LOOPS_BASE_URL
        self.api_key = LOOPS_API_KEY
        self.headers.update({"Authorization": f"Bearer {self.api_key}"})

    def request(self, method, url, *args, **kwargs):
        url = self.base_url + url
        return super().request(method, url, *args, **kwargs)


def get_current_time():
    return datetime.datetime.now().strftime("%m/%d/%Y %I:%M %p")


class LoopsController:
    loops_session: LoopsSession = None

    def __init__(self):
        self.loops_session = LoopsSession()

    def add_user(self, user_email: str, name: str, user_id: str):
        url = "/contacts/create"
        payload = {
            "email": user_email,
            "firstName": name,
            # "lastName": name,
            "userGroup": "HN Launch",
            "source": "Signup from app registration",
            # "source": "testing",
            "createdAt": get_current_time(),
            "subscribed": True,
            "userId": user_id,
        }

        return self.loops_session.post(url, json=payload)


loops_controller = LoopsController()
