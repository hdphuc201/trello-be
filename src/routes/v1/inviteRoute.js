import express from 'express'

import { inviteController } from '~/controllers/inviteController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { inviteValidation } from '~/validations/inviteValidation'

const Router = express.Router()

Router.route('/board')
  .post(authMiddleware.authentication, inviteValidation.inviteUserToBoard, inviteController.inviteUserToBoard)

export const inviteRoute = Router
