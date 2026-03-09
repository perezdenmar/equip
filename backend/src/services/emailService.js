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

export const sendEnrollmentStatusEmail = async (to, { studentName, courseTitle, status }) => {
  const isApproved = status === 'APPROVED';
  const subject = isApproved
    ? `Congratulations! Your enrollment for ${courseTitle} is approved`
    : `Update regarding your enrollment for ${courseTitle}`;

  const mailOptions = {
    from: `"EQUIP Admissions" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'}; margin-bottom: 20px;">
          Enrollment ${isApproved ? 'Approved' : 'Status Update'}
        </h2>
        <p>Hi ${studentName},</p>
        <p>
          ${isApproved
        ? `We are pleased to inform you that your enrollment request for <strong>${courseTitle}</strong> has been <strong>APPROVED</strong>! Welcome to the program.`
        : `Thank you for your interest in <strong>${courseTitle}</strong>. After careful review, we regret to inform you that your enrollment request has been <strong>REJECTED</strong> at this time.`}
        </p>
        
        ${isApproved ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <p style="margin: 0; color: #166534;">You can now access your course materials and track your progress through your dashboard.</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
            <a href="https://equipdigos.com/dashboard" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
        </div>
        ` : ''}
        
        <p style="margin-top: 30px; font-size: 0.875rem; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Best regards,<br>
          The EQUIP Team
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendReferralEmail = async (to, { referrerName, referralCode }) => {
  const mailOptions = {
    from: `"EQUIP Rewards" <${process.env.GMAIL_USER}>`,
    to,
    subject: `${referrerName} invited you to join EQUIP!`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #f97316; margin-bottom: 20px;">You're Invited!</h2>
        <p>Hi there,</p>
        <p>Your friend <strong>${referrerName}</strong> thinks you'd love using <strong>EQUIP</strong> to boost your skills and career.</p>
        <div style="background: #fff7ed; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffedd5; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #9a3412; font-weight: bold;">Unlock 50 points when you join!</p>
            <a href="https://equipdigos.com/login?ref=${referralCode}" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="font-size: 0.875rem; color: #6b7280;">
          EQUIP helps you find courses, get certified, and track your professional progress.
        </p>
        <p style="margin-top: 30px; font-size: 0.875rem; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Best regards,<br>
          The EQUIP Team
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendAdminStaffNotificationEmail = async ({ recipients, subject, body }) => {
  if (!recipients || recipients.length === 0) return;

  const mailOptions = {
    from: `"EQUIP Alerts" <${process.env.GMAIL_USER}>`,
    to: recipients.join(','),
    subject,
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #f97316; margin-bottom: 20px;">EQUIP System Alert</h2>
        ${body}
        <p style="margin-top: 30px; font-size: 0.875rem; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Best regards,<br>
          EQUIP Automation System
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
};
