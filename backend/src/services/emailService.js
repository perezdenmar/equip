import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS, // App password
  },
});

export const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"EQUIP Support" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your EQUIP Login OTP',
    text: `Your One-Time Password (OTP) for logging into EQUIP is: ${otp}. This code expires in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Welcome to EQUIP!</h2>
        <p>Your One-Time Password (OTP) for logging in is:</p>
        <h3 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h3>
        <p>This code expires in 5 minutes. Do not share this with anyone.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendContactEmail = async ({ name, email, subject, message }) => {
  const mailOptions = {
    from: `"EQUIP Website Contact" <${process.env.GMAIL_USER}>`,
    to: 'quantumgroupph@gmail.com',
    replyTo: email,
    subject: `[Contact Form] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #f97316; margin-bottom: 20px;">New Contact Form Submission</h2>
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
        </div>
        <h3 style="color: #374151; margin-bottom: 15px;">Message:</h3>
        <div style="background: #ffffff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px; white-space: pre-wrap;">${message}</div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
