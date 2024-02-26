import requests


from sqlalchemy.orm import Session
from server.credentials import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
from server.utils.helper import raise_http_exception

from urllib.parse import parse_qs


class GithubController:

    def verify_github_auth_code(self, auth_code: str):
        response = requests.post(
            "https://github.com/login/oauth/access_token",
            {
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": auth_code,
                "accept": "json",
            },
        )
        access_token = parse_qs(response.text).get("access_token")[0]
        scopes = parse_qs(response.text).get("scope")
        if not access_token:
            raise_http_exception(400, "Invalid access token")
        if "user:email" not in scopes:
            raise_http_exception(400, "User email not found")

        return access_token

    def get_user_info(self, access_token: str):
        response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"},
        )
        return response.json()

    def get_user_emails(self, access_token: str):
        response = requests.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"token {access_token}"},
        )
        return response.json()

    def get_user_primary_email(self, access_token: str):
        emails = self.get_user_emails(access_token)
        for email in emails:
            if email.get("primary"):
                return email.get("email")
        return None
