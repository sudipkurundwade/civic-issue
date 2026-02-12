import sgMail from '@sendgrid/mail';

// Set API Key from environment variables
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    // Only warn if we are trying to send, but good to log startup warning if critical
    console.warn("Warning: SENDGRID_API_KEY is not set.");
}

export const sendWelcomeEmail = async ({ to, name, email, password, role, creatorName, creatorEmail, creatorRole, creatorRegion }) => {
    try {
        if (!process.env.SENDGRID_API_KEY) {
            console.warn('SendGrid API Key missing. Skipping email sending.');
            console.log(`[MOCK EMAIL] To: ${to}, Password: ${password}`);
            return;
        }

        const roleName = role.replace('_', ' ').toUpperCase();

        let creatorInfo = `${creatorName} (${creatorEmail}) - ${creatorRole.replace('_', ' ').toUpperCase()}`;
        if (creatorRegion) {
            creatorInfo += ` from ${creatorRegion}`;
        }

        const fromEmail = process.env.EMAIL_FROM;
        if (!fromEmail) {
            console.error('EMAIL_FROM environment variable is not set. SendGrid requires a verified sender.');
            return;
        }

        const msg = {
            to,
            from: fromEmail, // Must match a verified sender in SendGrid
            subject: `Welcome to Civic Issue Reporter - Your ${roleName} Account`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been created by <strong>${creatorInfo}</strong>.</p>
          
          <h3>Account Details</h3>
          <ul>
            <li><strong>Role:</strong> ${roleName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          
          <p>Please login and change your password immediately.</p>
          
          <p>Best regards,<br>Civic Issue Team</p>
        </div>
      `,
        };

        const info = await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        if (error.response) {
            console.error(error.response.body);
        }
    }
};
