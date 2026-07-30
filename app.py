from datetime import datetime
import os
import json
import base64
import sys

from dotenv import load_dotenv
from openai import OpenAI

import gspread
from google.oauth2.service_account import Credentials
from flask import Flask, request, jsonify
from flask_cors import CORS

# =====================================================
# Load Environment Variables
# =====================================================

load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# =====================================================
# Google Sheets Authentication
# =====================================================

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

creds = Credentials.from_service_account_file(
    "serviceaccount.json",
    scopes=SCOPES
)

gc = gspread.authorize(creds)

sheet = gc.open("Business Cards").sheet1

# =====================================================
# Flask Application Setup
# =====================================================

app = Flask(__name__)
CORS(app)

# Ensure uploads directory exists
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def process_card_extraction(image_source):
    # Prepare Image
    if image_source.startswith(("http://", "https://")):
        image_input = image_source
    else:
        with open(image_source, "rb") as image_file:
            image_base64 = base64.b64encode(image_file.read()).decode("utf-8")
            image_input = f"data:image/png;base64,{image_base64}"

    # Ask GPT
    response = client.responses.create(
        model="gpt-4o-mini",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": """
First, analyze the image to determine whether it is actually a business card or not.

Return ONLY valid JSON matching this schema:

{
    "is_business_card": true,
    "name": null,
    "designation": null,
    "company": null,
    "phone": [],
    "email": [],
    "website": [],
    "address": null
}

Rules:
1. If the image is not a business card (e.g. it is a landscape, person, random object, or different document), set "is_business_card" to false, and leave all other fields as null or [].
2. If it is a business card, set "is_business_card" to true, and extract all visible information.
3. Return ONLY raw JSON. Do NOT wrap JSON inside ```json.
4. If a single value is missing use null.
5. Extract ALL phone numbers, email addresses, and websites.
"""
                    },
                    {
                        "type": "input_image",
                        "image_url": image_input
                    }
                ]
            }
        ]
    )

    # Parse JSON
    text = response.output_text.strip()

    # Remove markdown if GPT returns it
    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    card = json.loads(text)

    # Check if the image is a business card
    if not card.get("is_business_card", True):
        raise ValueError("The uploaded image does not appear to be a business card. Please upload a valid business card.")

    return card

@app.route('/api/extract', methods=['POST'])
def extract_card():
    try:
        temp_file_path = None
        image_source = None

        # Check if file is uploaded
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                # Save file securely
                filename = "temp_uploaded_card.png"
                temp_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(temp_file_path)
                image_source = temp_file_path

        # If no file uploaded, check for image_url
        if not image_source:
            data = request.get_json(silent=True) or {}
            image_url = data.get('image_url') or request.form.get('image_url')
            if image_url:
                image_source = image_url

        if not image_source:
            return jsonify({"error": "No image file or image URL provided"}), 400

        # Process card extraction
        result = process_card_extraction(image_source)

        # Clean up temp file if it was created
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as e:
                print(f"Error removing temp file: {e}")

        return jsonify(result)

    except ValueError as ve:
        print(f"Validation error: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        print(f"Error processing card: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/submit', methods=['POST'])
def submit_card():
    try:
        card = request.get_json()
        if not card:
            return jsonify({"error": "No data provided"}), 400
            
        # Convert Lists to Strings
        phone_list = card.get("phone") or []
        email_list = card.get("email") or []
        website_list = card.get("website") or []
        
        phones = ", ".join(phone_list) if isinstance(phone_list, list) else phone_list
        emails = ", ".join(email_list) if isinstance(email_list, list) else email_list
        websites = ", ".join(website_list) if isinstance(website_list, list) else website_list
        
        new_row_check = [
            card.get("name") or "",
            card.get("designation") or "",
            card.get("company") or "",
            phones,
            emails,
            websites,
            card.get("address") or ""
        ]
        
        # Check for duplicates (excluding the timestamp column)
        all_rows = sheet.get_all_values()
        for row in all_rows:
            sheet_row_check = [val for val in row[:7]]
            while len(sheet_row_check) < 7:
                sheet_row_check.append("")
            
            # Case insensitive comparison after stripping whitespace
            if [str(x).strip().lower() for x in sheet_row_check] == [str(x).strip().lower() for x in new_row_check]:
                return jsonify({"error": "This business card has already been extracted."}), 409

        # Generate timestamp
        time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Append to Sheets
        sheet.append_row([
            card.get("name") or "",
            card.get("designation") or "",
            card.get("company") or "",
            phones,
            emails,
            websites,
            card.get("address") or "",
            time_str
        ])
        
        return jsonify({"message": "Successfully added to Google Sheets!"})
        
    except Exception as e:
        print(f"Error submitting card: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # If run with run-cli argument, process default image
    if len(sys.argv) > 1 and sys.argv[1] == "run-cli":
        IMAGE_SOURCE = "https://img.elegantflyer.com/templates/preview/free-business-card-set-73923.jpg"
        print(f"Running extraction on default image: {IMAGE_SOURCE}")
        res = process_card_extraction(IMAGE_SOURCE)
        print("Result:", res)
        print("\n✅ Successfully Added to Google Sheets!")
    else:
        app.run(host="0.0.0.0", port=5000, debug=True)
