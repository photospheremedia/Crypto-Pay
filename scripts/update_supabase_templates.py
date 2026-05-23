#!/usr/bin/env python3
"""Update Supabase email templates via Management API."""

import requests
import json
import os

PROJECT_REF = os.environ.get("SUPABASE_PROJECT_REF", "hwntncyiqaltzvlidscg")
API_KEY = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read_template(name):
    path = os.path.join(BASE_DIR, "supabase", "templates", f"{name}.html")
    with open(path, 'r') as f:
        return f.read().strip()

def main():
    # Read all templates
    templates = {
        'confirm': read_template('confirm'),
        'recovery': read_template('recovery'),
        'invite': read_template('invite'),
        'magic_link': read_template('magic_link'),
        'email_change': read_template('email_change'),
    }
    
    # Prepare payload
    payload = {
        "mailer_subjects_confirmation": "Confirm Your Crypto Pay Account",
        "mailer_subjects_recovery": "Reset Your Password - Crypto Pay",
        "mailer_subjects_invite": "You've Been Invited to Crypto Pay",
        "mailer_subjects_magic_link": "Your Login Link - Crypto Pay",
        "mailer_subjects_email_change": "Confirm Your New Email - Crypto Pay",
        "mailer_templates_confirmation_content": templates['confirm'],
        "mailer_templates_recovery_content": templates['recovery'],
        "mailer_templates_invite_content": templates['invite'],
        "mailer_templates_magic_link_content": templates['magic_link'],
        "mailer_templates_email_change_content": templates['email_change'],
    }
    
    # Update via API
    print("Updating Supabase email templates...")
    response = requests.patch(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )
    
    if response.ok:
        print("Email templates updated successfully!")
        result = response.json()
        print(f"  Confirmation: {result.get('mailer_subjects_confirmation')}")
        print(f"  Recovery: {result.get('mailer_subjects_recovery')}")
        print(f"  Invite: {result.get('mailer_subjects_invite')}")
        print(f"  Magic Link: {result.get('mailer_subjects_magic_link')}")
        print(f"  Email Change: {result.get('mailer_subjects_email_change')}")
        print(f"\nSMTP Config:")
        print(f"  Host: {result.get('smtp_host')}")
        print(f"  Port: {result.get('smtp_port')}")
        print(f"  Sender: {result.get('smtp_sender_name')}")
        print(f"  Admin Email: {result.get('smtp_admin_email')}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    main()
