import os
import boto3
import json
from jinja2 import Environment, FileSystemLoader
from server.credentials import AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

REGION_NAME = "us-east-1"
DROPBASE_SUPPORT_EMAIL = "support@dropbase.io"

ses_client = boto3.client(
    "ses",
    region_name="us-east-1",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
)

current_directory = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
template_directory = os.path.join(current_directory, "emails", "emailTemplates")
env = Environment(loader=FileSystemLoader(template_directory))


def _get_email_args(email_name: str, email_params: dict):
    receiver_email = email_params.get("email")
    if receiver_email:
        del email_params["email"]

    folder_path = os.path.join(template_directory, email_name)

    if not os.path.isdir(folder_path):
        raise ValueError(f"Template folder '{email_name}' not found.")

    html_file_path = os.path.join(folder_path, f"{email_name}.html")
    if not os.path.isfile(html_file_path):
        raise ValueError(
            f"HTML template file '{email_name}.html' not found in folder '{email_name}'."
        )

    with open(html_file_path, "r") as file:
        template_string = file.read()
    template = env.from_string(template_string)
    html = template.render(email_params)

    json_file_path = os.path.join(folder_path, f"{email_name}.json")
    if not os.path.isfile(json_file_path):
        raise ValueError(
            f"JSON file '{email_name}.json' not found in folder '{email_name}'."
        )

    with open(json_file_path, "r") as json_file:
        json_data = json.load(json_file)

    subject = json_data.get("subject")
    loaded_subject = env.from_string(subject).render(email_params)
    text_part = json_data.get("text_part")
    loaded_text_part = env.from_string(text_part).render(email_params)

    return receiver_email, loaded_subject, html, loaded_text_part


CHARSET = "UTF-8"


def send_email(
    email_name: str, email_params: dict, sender_email: str = DROPBASE_SUPPORT_EMAIL
):
    receiver_email, subject, html, text_part = _get_email_args(email_name, email_params)
    response = ses_client.send_email(
        Destination={"ToAddresses": [receiver_email]},
        Message={
            "Body": {
                "Html": {
                    "Charset": CHARSET,
                    "Data": html,
                },
                "Text": {
                    "Charset": CHARSET,
                    "Data": text_part,
                },
            },
            "Subject": {
                "Charset": CHARSET,
                "Data": subject,
            },
        },
        Source=f"Dropbase Support <{sender_email}>",
        # ReplyToAddresses=[replyTo],
    )
    return response
