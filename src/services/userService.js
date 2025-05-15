import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'
import { env } from '~/config/environment'

import { userModel } from '~/models/userModel'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { jwtService } from '~/providers/JwtProdiver'
import ApiError from '~/utils/ApiError'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const register = async (reqBody) => {
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
      email,
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

const login = async (reqBody) => {
  const { password, email } = reqBody
  try {
    const existUser = await userModel.findOneByEmail(email)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    if (!existUser.isActive) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Account not verified')

    const isPasswordValid = await bcrypt.compare(password, existUser.password)
    if (!isPasswordValid) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials')

    const accessToken = jwtService.generateAccessToken(existUser)
    const refreshToken = jwtService.generateRefreshToken()

    return {
      ...pickUser(existUser),
      accessToken,
      refreshToken
    }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const verifyAccount = async (reqBody) => {
  const { email, token } = reqBody
  try {
    const existUser = await userModel.findOneByEmail(email)

    if (existUser.isActive === true) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your account is already active!')

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')

    if (existUser.verifyToken !== token) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid verification token')

    // Set active to true and update the user in the database
    const updateUser = await userModel.update(existUser._id, { verifyToken: null, isActive: true })
    pickUser(updateUser)
    return { message: 'Account verified successfully' }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const refreshToken = async (refreshToken) => {
  try {
    const decoded = jwtService.verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET)
    return jwtService.generateAccessToken(decoded)
  } catch (error) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Refresh token expired, login again')
  }
}

export const userService = {
  register,
  login,
  verifyAccount,
  refreshToken
}
