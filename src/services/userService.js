import bcrypt from 'bcryptjs'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
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
    return pickUser(getNewUser)
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

export const userService = {
  createNew
}
