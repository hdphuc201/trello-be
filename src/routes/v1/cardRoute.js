

import express from 'express'

import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMeddleware'
import { cardValidation } from '~/validations/cardValidation'

const Router = express.Router()

Router.route('/').post(authMiddleware.isAuthrization, cardValidation.createNew, cardController.createNew)

export const cardRoute = Router
