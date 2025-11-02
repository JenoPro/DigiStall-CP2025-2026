# Email Configuration Guide

## Current Status
- **Development Mode**: Emails are simulated and logged to console only
- **Production Mode**: Emails will be sent via SMTP

## How to Enable Actual Email Sending

### Option 1: Using Gmail (Recommended for Testing)

1. **Create Gmail App Password**
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to Security > 2-Step Verification (enable if not enabled)
   - Go to App Passwords: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it: "Naga Stall Management"
   - Click "Generate"
   - Copy the 16-character password

2. **Update .env File**
   ```properties
   # Change NODE_ENV to production or remove it
   NODE_ENV=production
   
   # Update SMTP settings
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-actual-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # Paste app password here
   FROM_EMAIL=your-actual-email@gmail.com
   FROM_NAME=Naga Stall Management System
   ```

3. **Restart Backend Server**
   ```bash
   cd Backend
   node server.js
   ```

### Option 2: Keep Development Mode (Current Setup)
If you want to keep testing without actual emails:
- Keep `NODE_ENV=development` in .env
- Check backend console for email simulation logs
- You'll see: `=== EMAIL SIMULATION ===` with full email content

## Email Templates
The system uses these email templates stored in the database:
- `welcome_employee` - Sent when new employee is created
- `password_reset` - Sent when password is reset

## Testing Email Functionality
After enabling production mode:
1. Create a new employee
2. Check the employee's inbox for welcome email
3. Email will contain:
   - Username (e.g., EMP1234)
   - Temporary password
   - Login instructions
   - Branch information

## Troubleshooting

### Email Not Sending
1. Check backend console for error messages
2. Verify SMTP credentials in .env
3. Make sure NODE_ENV is set to production
4. Check Gmail security settings
5. Ensure app password (not regular password) is used

### Gmail Blocking Emails
- Enable "Less secure app access" (not recommended)
- Use App Passwords instead (recommended)
- Check if 2-Factor Authentication is enabled

### Email Goes to Spam
- This is normal for development
- In production, use proper domain and SPF records
- Consider using SendGrid or similar service for production
