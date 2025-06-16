from dotenv import load_dotenv

load_dotenv()

import os
API_CREDS_INTERNAL_USE_ONLY = os.getenv("API_CREDS_INTERNAL_USE_ONLY")
CRON_SECRET = os.getenv("CRON_SECRET")

from flask import Flask, request
app = Flask(__name__)

import aiohttp
import asyncio
from .scripts.mailgun.mailer import send_seat_confirmation
from .scripts.processing import TicketPDFGenerator
from .scripts.db.db import db

@app.route("/api/python")
def hello_world():
    auth_header = request.headers.get("authorization")
    if auth_header != f"Bearer {CRON_SECRET}":
        return {"success": False, "message": "Unauthorized"}, 401
    
    return {
        "success": True,
        "message": "Hello, World!"
    }

@app.route("/api/email/sendSeatConfirmation", methods=["POST"])
async def handle_seat_confirmation():
    # TODO: IMPORTANT! Need to check if this bypass is secure or not
    if request.headers["X-Internal-API-Credentials"] != API_CREDS_INTERNAL_USE_ONLY:
        return {"success": False, "message": "Unauthorized"}, 401

    try:
        data = request.get_json()
        ticket_code = data.get("ticketCode")
        assert isinstance(ticket_code, str)
    except Exception as e:
        return { "success": False, "message": "Field `ticketCode` required" }, 400

    # TODO: this should be in scripts/db/db.py instead
    ticket_snap = db.collection("tickets").where("code", "==", ticket_code).get()
    assert len(ticket_snap) == 1  # if this is raised then something is seriously wrong
    ticket_ref = ticket_snap[0].reference
    pdf_generator = TicketPDFGenerator()

    try:
        async with aiohttp.ClientSession() as session:
            await send_seat_confirmation(session, ticket_ref, pdf_generator)
        return { "success": True }, 200
    except Exception as e:
        return { "success": False, "message": str(e) }, 502

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)