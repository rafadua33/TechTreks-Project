"""
Email Service Module - Handles sending verification emails via Brevo

This module provides functionality to send transactional emails (verification codes)
to users during the registration process. It uses Brevo (formerly Sendinblue) as the
email service provider.

Key Functions:
- send_verification_email(): Sends a 4-digit code to user's email
"""

import os
import logging
from sib_api_v3_sdk import Configuration, ApiClient, TransactionalEmailsApi
from sib_api_v3_sdk.rest import ApiException

# Configure logging for debugging and monitoring email sends
logger = logging.getLogger(__name__)


def send_verification_email(to_email, code):
    """
    Send a 4-digit verification code to user's email via Brevo API
    
    This function sends a transactional email containing a verification code that
    the user must enter to complete their registration. The email is styled with
    the TechTreks branding.
    
    Args:
        to_email (str): Recipient's email address (e.g., student@nyu.edu)
        code (str): 4-digit verification code to include in email (e.g., "5738")
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    
    Raises:
        Logs ApiException if Brevo API call fails
    
    Environment Variables Required:
        BREVO_API_KEY: API key from Brevo account (stored in .env file)
    
    Example:
        >>> success = send_verification_email("student@nyu.edu", "5738")
        >>> if success:
        ...     print("Email sent!")
        ... else:
        ...     print("Email failed to send")
    """
    
    # Get API key from environment variables (loaded from .env file)
    api_key = os.environ.get('BREVO_API_KEY')
    if not api_key:
        logger.error("BREVO_API_KEY not found in environment variables")
        return False
    
    # Configure Brevo API client with authentication credentials
    configuration = Configuration()
    configuration.api_key['api-key'] = api_key
    
    # Create API client instance for sending transactional emails
    api_client = ApiClient(configuration)
    email_api = TransactionalEmailsApi(api_client)
    
    # Construct the email object with sender, recipient, subject, and HTML content
    # The HTML content is styled to match TechTreks branding with purple accents
    email_message = {
        "sender": {
            "email": "noreply@techtreks.com",
            "name": "TechTreks"
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": "TechTreks - Verify Your Email",
        "htmlContent": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }}
                    .header {{ text-align: center; margin-bottom: 30px; }}
                    .code-box {{ background-color: #000328; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0; }}
                    .code {{ font-size: 48px; font-weight: bold; color: #E0B0FF; letter-spacing: 10px; font-family: monospace; }}
                    .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="color: #000328;">Welcome to TechTreks!</h2>
                        <p style="color: #666;">Complete your registration to get started</p>
                    </div>
                    
                    <p>Hi there,</p>
                    <p>Thank you for signing up for TechTreks! To verify your email address and activate your account, please enter this code on the verification page:</p>
                    
                    <div class="code-box">
                        <div class="code">{code}</div>
                    </div>
                    
                    <p><strong>Code expires in 10 minutes</strong></p>
                    
                    <p style="color: #999; font-size: 14px;">If you didn't request this verification code, please ignore this email or contact support.</p>
                    
                    <div class="footer">
                        <p>© 2025 TechTreks. All rights reserved.</p>
                        <p>NYU Student Marketplace</p>
                    </div>
                </div>
            </body>
            </html>
        """
    }
    
    try:
        # Send the email via Brevo API
        # If successful, API returns response with message ID and status
        response = email_api.send_transac_email(email_message)
        logger.info(f"Verification email sent successfully to {to_email}")
        return True
    except ApiException as e:
        # Log any errors from the Brevo API (network issues, invalid email, etc.)
        logger.error(f"Failed to send verification email to {to_email}: {e}")
        return False
    except Exception as e:
        # Catch any other unexpected errors
        logger.error(f"Unexpected error sending email to {to_email}: {e}")
        return False
