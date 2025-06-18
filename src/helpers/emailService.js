import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_PASS
  }
})

export const sendVerifyEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Phúc Dev" <${env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlContent
  }

  await transporter.sendMail(mailOptions)
}
