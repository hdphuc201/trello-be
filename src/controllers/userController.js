import { StatusCodes } from 'http-status-codes'

import { userService } from '~/services/userService'

const createNew = async (req, res, next) => {
  try {
    console.log('req.body', req.body)
    const createUser = await userService.createNew(req.body)
    console.log('createUser', createUser)
    return res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew
}
