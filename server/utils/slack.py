import requests


def slack_sign_up(name: str, email: str):
    try:
        webhook_url = "https://hooks.slack.com/services/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"
        slack_data = {
            "text": f"New user signed up: {name} ({email})",
        }
        requests.post(webhook_url, json=slack_data)
    except Exception as e:
        print(e)
