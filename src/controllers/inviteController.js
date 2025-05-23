import { StatusCodes } from 'http-status-codes'

import { inviteService } from '~/services/inviteService'

const inviteUserToBoard = async (req, res, next) => {
  try {
    const inviterId = req.user._id
    const result = await inviteService.inviteUserToBoard(req.body, inviterId )
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const inviteController = {
  inviteUserToBoard
}
