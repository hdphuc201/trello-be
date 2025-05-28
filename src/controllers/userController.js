import { StatusCodes } from 'http-status-codes'
import ms from 'ms'

import { userService } from '~/services/userService'

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
    const result = await userService.login(req.body)

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: ms('14 days')
    })

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: ms('14 days')
    })

    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
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
    const refreshToken = req.cookies?.refreshToken
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

    console.log('userAvatar', userAvatar)
    const updateUser = await userService.update(userId, userAvatar, req.body)
    return res.status(StatusCodes.OK).json(updateUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  register,
  login,
  logout,
  verifyAccount,
  refreshToken,
  update
}
