from dotenv import load_dotenv

load_dotenv()

import os
API_CREDS_INTERNAL_USE_ONLY = os.getenv("API_CREDS_INTERNAL_USE_ONLY")
CRON_SECRET = os.getenv("CRON_SECRET")

from flask import Flask, request
app = Flask(__name__)

@app.route("/api/python")
def hello_world():
    auth_header = request.headers.get("authorization")
    if auth_header != f"Bearer {CRON_SECRET}":
        return {"success": False, "message": "Unauthorized"}, 401
    
    return {
        "success": True,
        "message": "Hello, World!"
    }

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)