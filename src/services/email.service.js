const { verifyEmailSecret } = require("@/config/jwt");
const transporter = require("@/config/nodemailer");
const jwtUtils = require("@/utils/jwt");

class EmailService {
  async sendVerificationEmail(user) {
    const token = jwtUtils.sign(
      {
        sub: user.id,
        email: user.email,
      },
      verifyEmailSecret,
      { expiresIn: "2h" },
    );
    const verifyLink = `${process.env.FRONTEND_URL}?token=${token}`;
    const info = await transporter.sendMail({
      from: `"Trung" <${process.env.MY_MAIL}>`,
      to: user.email,
      subject: "Verify your Gmail account ",
      html: `
        <h2>Thank you registered</h2>
        <p>Please click the button below to verify your account (the link is valid for 2 hours).
        <a href="${verifyLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify account</a>
      `,
    });
    return info;
  }

  async sendPasswordChangeEmail({ email, changeAt }) {
    const info = await transporter.sendMail({
      from: `Center Support "<${process.env.GOOGLE_APP_USER}>"`,
      to: email,
      subject: "Notification change password",
      html: `
        <h2>Your password changed</h2>
        <p>Your account password was changed at ${changeAt}</p>
      `,
    });
    return info;
  }

  async sendBackupReport(email, subject, { fileName, driveLink }) {
    const info = await transporter.sendMail({
      from: `"Trung" <${process.env.MY_MAIL}>`,
      to: email,
      subject,
      html: `
      <h1>Backup thành công</h1>
      <p>File: ${fileName}</p>
      <p>Link Drive: <a href="${driveLink}">${driveLink}</a></p>
    `,
    });
    return info;
  }
}

module.exports = new EmailService();
