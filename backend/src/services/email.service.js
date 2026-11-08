
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", info.messageId);

        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error("Email sending failed:", error.message);

        return {
            success: false,
            error: error.message,
        };
    }
};


const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log("Gmail SMTP connection successful!");
        return true;
    } catch (error) {
        console.error("Gmail SMTP connection failed:", error.message);
        return false;
    }
};


module.exports = {
    sendEmail,
    verifyEmailConnection
};
