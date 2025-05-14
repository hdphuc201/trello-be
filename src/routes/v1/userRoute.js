import express from 'express'

import { userController } from '~/controllers/userController'
import { userValidation } from '~/validations/userValidation'

const Router = express.Router()

Router.route('/login').post( userValidation.login, userController.login)
Router.route('/register').post( userValidation.register, userController.register)
Router.route('/verify').put( userValidation.verifyAccount, userController.verifyAccount)

export const userRoute = Router
