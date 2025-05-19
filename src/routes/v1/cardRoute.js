

import express from 'express'

import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { cardValidation } from '~/validations/cardValidation'

const Router = express.Router()

Router.route('/').post(authMiddleware.isAuthrization, cardValidation.create, cardController.create)
Router.route('/:id').put(authMiddleware.isAuthrization, cardValidation.update, cardController.update)

export const cardRoute = Router
