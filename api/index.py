from dotenv import load_dotenv

load_dotenv()

import os
API_CREDS_INTERNAL_USE_ONLY = os.getenv("API_CREDS_INTERNAL_USE_ONLY")

from flask import Flask, request
app = Flask(__name__)

import aiohttp
import asyncio
from .scripts.mailgun.mailer import send_email
from .scripts.processing import TicketPDFGenerator

@app.route("/api/python")
def hello_world():
    return {
        "success": True,
        "message": "Hello, World!"
    }

@app.route("/api/email/sendSeatConfirmation", methods=["POST"])
async def send_seat_confirmation():
    # TODO: IMPORTANT! Need to check if this bypass is secure or not
    if request.headers["X-Internal-API-Credentials"] != API_CREDS_INTERNAL_USE_ONLY:
        return {"success": False, "message": "Unauthorized"}, 401

    try:
        data = request.get_json()
        print(data)
        profile = data.get("profile")
        email = profile.get("email")
        ticket_code = profile.get("ticketCode")
        seats = data.get("seats")

        assert isinstance(email, str)
        assert isinstance(ticket_code, str)
        assert isinstance(seats, list)
        for seat in seats:
            assert isinstance(seat, dict)
            assert "label" in seat and "category" in seat
    except Exception as e:
        print(repr(e))
        return { "success": False, "message": "Fields `email`, `ticketCode`, and `seats` required" }, 400

    pdfGen = TicketPDFGenerator()
    attachments = pdfGen.generate_pdfs_from_seats([(s["label"], s["category"]) for s in seats])
    attachments = [(fname, bytes_io.getbuffer()) for fname, bytes_io in attachments]
    try:
        async with aiohttp.ClientSession() as session:
            email_res = await send_email(
                session=session,
                to_email=email,
                subject="NUANSA 2025 Seat Confirmation",
                template_name="seat_confirmation.html",
                context={
                    "ticket_code": ticket_code,
                    "share_link": "https://tickets.nuansacp.org/share",
                    "seat_num": ", ".join(f"{s['label']} ({s['category']})" for s in seats),
                },
                attachments=attachments,
            )
        print(email_res)  # expect this to be 200 always
        return { "success": True }, 200
    except Exception as e:
        print(repr(e))
        return { "success": False, "message": str(e) }, 502

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)
