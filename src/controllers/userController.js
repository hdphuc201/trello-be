import { StatusCodes } from 'http-status-codes'

import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    const createUser = await userService.createNew(req.body)
    return res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew
}
