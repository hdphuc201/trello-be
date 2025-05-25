import express from 'express'

import { inviteController } from '~/controllers/inviteController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { inviteValidation } from '~/validations/inviteValidation'

const Router = express.Router()

// get notify by user
Router.route('/').get(
  authMiddleware.authentication,
  inviteController.getInvitationsForMe
)

Router.route('/board/:invitationId').put(
  authMiddleware.authentication,
  inviteController.update
)

Router.route('/:inviteeId').delete(
  authMiddleware.authentication,
  inviteController.deleteInvite
)



Router.route('/').post(
  authMiddleware.authentication,
  inviteValidation.inviteUserToBoard,
  inviteController.inviteUserToBoard
)

export const inviteRoute = Router
