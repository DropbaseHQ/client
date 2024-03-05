from requests import Session


AMPLEMARKET_BASE_URL = "https://app.amplemarket.com/api/v1/inbound_smart_action_webhooks/018de6f1-35c8-7f04-b97a-018a08216ede/"


class AmplemarketSession(Session):
    base_url = None

    def __init__(self):
        super().__init__()
        self.base_url = AMPLEMARKET_BASE_URL

    def request(self, method, url, *args, **kwargs):
        url = self.base_url + url
        return super().request(method, url, *args, **kwargs)


class AmplemarketController:
    amplemarket_session: AmplemarketSession = None

    def __init__(self):
        self.amplemarket_session = AmplemarketSession()

    def add_lead(self, email: str, first: str, last: str, company: str):
        print("HERE")
        url = "add_lead"
        payload = {
            "email": email,
            "first_name": first,
            "last_name": last,
            "company_name": company,
        }

        return self.amplemarket_session.post(url, json=payload)


amplemarket_controller = AmplemarketController()
