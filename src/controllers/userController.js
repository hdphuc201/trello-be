import { StatusCodes } from 'http-status-codes'

import { userService } from '~/services/userService'

const register = async (req, res, next) => {
  try {
    const createUser = await userService.register(req.body)
    return res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}
const verifyAccount = async (req, res, next) => {
  try {
    const verify = await userService.verifyAccount(req.body)
    return res.status(StatusCodes.CREATED).json(verify)
  } catch (error) {
    next(error)
  }
}
export const userController = {
  register,
  login,
  verifyAccount
}
