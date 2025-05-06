import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import { userModel } from '~/models/userModel'
import { BrevoProvider } from '~/providers/BrevoProvider'
import ApiError from '~/utils/ApiError'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNew = async (reqBody) => {
  const { password, email } = reqBody
  try {
    const existUser = await userModel.findOneByEmail(email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
    }
    //  tạo mảng lưu vào database
    // hdphuc201@gmail.com => ['hdphuc201', 'gmail.com'] => hdphuc201
    const emailParts = email.split('@')[0]
    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = {
      ...reqBody,
      password: passwordHash,
      username: emailParts,
      displayName: emailParts,
      verifyToken: uuidv4()
    }

    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // gửi mail xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customObject = 'Trello: Please verify your email before using our service. '

    // console.log removed to avoid unexpected console statement
    const htmlConent = `
    <h1>Welcome to our service!</h1>
    <p>Click to verify: ${verificationLink}</p>
  `
    await BrevoProvider.sendEmail(getNewUser.email, customObject, htmlConent)
    return pickUser(getNewUser)
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const userService = {
  createNew
}
