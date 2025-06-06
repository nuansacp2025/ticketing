from dotenv import load_dotenv

load_dotenv()

import os
API_CREDS_INTERNAL_USE_ONLY = os.getenv("API_CREDS_INTERNAL_USE_ONLY")

from flask import Flask, request
app = Flask(__name__)

from .scripts.mailgun.mailer import send_email

@app.route("/api/python")
def hello_world():
    return {
        "success": True,
        "message": "Hello, World!"
    }

@app.route("/api/email/sendSeatConfirmation", methods=["POST"])
def send_seat_confirmation():
    # TODO: IMPORTANT! Need to check if this bypass is secure or not
    if request.headers["X-Internal-API-Credentials"] != API_CREDS_INTERNAL_USE_ONLY:
        return {"success": False, "message": "Unauthorized"}, 401

    try:
        data = request.get_json()
        print(data)
        email = data.get("email")
        ticket_code = data.get("ticketCode")
        seats = data.get("seats", [])

        assert isinstance(email, str)
        assert isinstance(ticket_code, str)
        assert isinstance(seats, list)
    except Exception as e:
        print(repr(e))
        return { "success": False, "message": "Fields `email`, `ticketCode`, and `seats` required" }, 400

    email_res = send_email(
        to_email=email,
        subject="NUANSA 2025 Seat Confirmation",
        template_name="seat_confirmation.html",
        context={
            "ticket_code": ticket_code,
            "share_link": "https://tickets.nuansacp.org/share",
            "seat_num": ", ".join(seats),
        }
    )
    
    # TODO: error handling
    # Expected response:
    #   status: 200 OK
    #   content (example): b'{"id":"<...@mail.nuansacp.org>","message":"Queued. Thank you."}\n'

    return { "success": True }, 200

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)
