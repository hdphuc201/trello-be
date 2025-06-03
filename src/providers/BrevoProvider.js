const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (emailData, customObject, htmlConent) => {
  try {
    // khởi tạo SendSmtpEmail
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    // tài khoản gửi mail phải là email đã tạo trên Brevo (hdphuc201@gmail.com)
    sendSmtpEmail.sender = {
      email: env.ADMIN_EMAIL_ADDRESS,
      name: env.ADMIN_EMAIL_NAME
    }
    // Những tài khoản nhận Email
    // 'to' phải là 1 Array vì Brevo hỗ trợ gửi mail đến nhiều tài khoản cùng lúc
    sendSmtpEmail.to = [{ email: emailData }]
    sendSmtpEmail.subject = customObject
    sendSmtpEmail.htmlContent = htmlConent

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)
    return response
  } catch (error) {
    throw error
  }
}

export const BrevoProvider = {
  sendEmail
}
