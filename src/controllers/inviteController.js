import { StatusCodes } from 'http-status-codes'

import { inviteService } from '~/services/inviteService'

const getInvitationsForMe = async (req, res, next) => {
  try {
    const userId = req.user._id // ID của chính em, người đang đăng nhập (inviterId)
    const result = await inviteService.getInvitationsForInvitee(userId)
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { status } = req.body
    const { invitationId } = req.params
    const result = await inviteService.update(userId, status, invitationId)
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const deleteInvite = async (req, res, next) => {
  try {
    const userId = req.user._id
    const result = await inviteService.deleteInvite(userId)
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const inviteUserToBoard = async (req, res, next) => {
  try {
    const inviterId = req.user._id
    const result = await inviteService.inviteUserToBoard(req.body, inviterId)
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const inviteController = {
  getInvitationsForMe,
  update,
  deleteInvite,
  inviteUserToBoard
}
