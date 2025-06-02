import express from 'express'

import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { uploadFiles } from '~/middlewares/multerUploadMiddleware'
import { cardValidation } from '~/validations/cardValidation'

const Router = express.Router()

Router.route('/create').post(authMiddleware.authentication, cardValidation.create, cardController.create)
Router.route('/template').post(authMiddleware.authentication, cardController.create)
Router.route('/update/:id').put(
  authMiddleware.authentication,
  cardValidation.update,
  uploadFiles,
  cardController.update
)
Router.route('/delete/:id').put(authMiddleware.authentication, cardController.deleteCard)
export const cardRoute = Router
