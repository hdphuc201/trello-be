import { OAuth2Client } from 'google-auth-library'
import { StatusCodes } from 'http-status-codes'
import { x } from 'joi'
import ms from 'ms'
import { v4 as uuidv4 } from 'uuid'

import { env } from '~/config/environment'
import { userModel } from '~/models/userModel'
import { jwtService } from '~/providers/JwtProdiver'
import { userService } from '~/services/userService'
import ApiError from '~/utils/ApiError'

const register = async (req, res, next) => {
  try {
    const createUser = await userService.register(req.body)
    return res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const response = await userService.login(req.body)
    const { token, ...rest } = response
    const newResponse = env.COOKIE_MODE ? rest : response

    if (env.COOKIE_MODE) {
      res.cookie('refreshToken', token.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
      })

      res.cookie('accessToken', token.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
      })
    } else {
      res.clearCookie('refreshToken')
      res.clearCookie('accessToken')
    }

    return res.status(StatusCodes.OK).json(newResponse)
  } catch (error) {
    next(error)
  }
}

const loginGoogle = async (req, res, next) => {
  const { token } = req.body
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)

  try {
    if (!token) throw new ApiError(StatusCodes.NOT_FOUND, 'Token is not valid')

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID
    })

    const { sub, name, email, picture } = ticket.getPayload()

    const existUser = await userModel.findOneByEmail(email)
    let user
    if (existUser) {
      // Nếu đã có user thì dùng user đó
      user = existUser
    } else {
      // Nếu chưa có thì tạo mới
      const newUser = {
        googleId: sub,
        email: email,
        username: name,
        displayName: name,
        avatar: picture,
        verifyToken: uuidv4()
      }

      user = await userModel.createNew(newUser)
    }

    const accessToken = jwtService.generateAccessToken(user)
    const refreshToken = jwtService.generateRefreshToken(user)

    if (env.COOKIE_MODE) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: ms('14 days')
      })

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: ms('14 days')
      })
    } else {
      user.token = {
        accessToken,
        refreshToken
      }

      res.clearCookie('refreshToken')
      res.clearCookie('accessToken')
    }
    // const getNewUser = await userModel.findOneById(user.insertedId)
    user.isActive = true
    return res.status(StatusCodes.OK).json(user)
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const verify = await userService.verifyAccount(req.body)
    return res.status(StatusCodes.CREATED).json(verify)
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken')
    res.clearCookie('accessToken')
    return res.status(StatusCodes.OK).json({ loggeOut: true })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = env.MODE_COOKIE ? req.cookies?.refreshToken : req.body.token
    const accessToken = await userService.refreshToken(refreshToken)

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: ms('14 days')
    })

    return res.status(StatusCodes.OK).json(accessToken)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const userId = req.user._id
    let userAvatar

    if (req.files?.avatar?.[0]) {
      const file = req.files?.avatar?.[0]
      userAvatar = {
        filename: file.filename,
        originalname: file.originalname
      }
    }

    const updateUser = await userService.update(userId, userAvatar, req.body)
    return res.status(StatusCodes.OK).json(updateUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  register,
  login,
  loginGoogle,
  logout,
  verifyAccount,
  refreshToken,
  update
}
