from flask import Flask
app = Flask(__name__)

import os
import csv
from time import time_ns
from scripts.getfile.extract_file import extract_file

@app.route("/api/python")
def hello_world():
    # Test if Vercel allows creating/writing/reading files
    folder_name = f"attachments_{time_ns()}"
    if not os.path.exists(folder_name):
        os.makedirs(folder_name, mode=0o777)
    folder_path = os.path.abspath(folder_name)
    files = extract_file(os.path.abspath(folder_path))

    rows = []
    for file in files:
        with open(file, "r") as f:
            content = csv.reader(f)
            for row in content:
                rows.append(",".join(row))

    return {
        "success": True,
        "message": "\n".join(rows),
    }

if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)
