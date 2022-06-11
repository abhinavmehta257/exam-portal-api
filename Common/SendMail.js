const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    },
    // here it goes
    tls: { rejectUnauthorized: false },
});


async function sendEmail(to, subject, message) {
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        html: message
    });
}

async function sendOTP(to, otp) {
    const subject = "Your OTP for Email Verification";
    await sendEmail(
        to,
        subject,
        `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${subject}</title>
          </head>
          <body>
            <p>To authenticate, please use the following One Time Password (OTP):</p>
        
            <h2>${otp}</h2>
        
            <p>
              Don't share this OTP with anyone. Our customer service team will never ask
              you for your password, OTP, credit card, or banking info.
            </p>
            <p>We hope to see you again soon.</p>
          </body>
        </html>
        `
    )
}


module.exports = {
    sendEmail,
    sendOTP
}
