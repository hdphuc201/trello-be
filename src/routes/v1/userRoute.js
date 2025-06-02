import express from 'express'

import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { uploadFiles } from '~/middlewares/multerUploadMiddleware'
import { userValidation } from '~/validations/userValidation'

const Router = express.Router()

Router.route('/login').post(userValidation.login, userController.login)
Router.route('/login-google').post(userValidation.loginGoogle, userController.loginGoogle)
Router.route('/register').post(userValidation.register, userController.register)
Router.route('/verify').put(userValidation.verifyAccount, userController.verifyAccount)

Router.route('/logout').delete(userController.logout)
Router.route('/refresh-token').get(userController.refreshToken)

Router.route('/update').put(authMiddleware.authentication, uploadFiles, userValidation.update, userController.update)

export const userRoute = Router
