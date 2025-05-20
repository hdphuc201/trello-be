import { StatusCodes } from 'http-status-codes'
import jsonwebtoken from 'jsonwebtoken'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

const authentication = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (token not found)'))
  }

  jsonwebtoken.verify(clientAccessToken, env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      }
      return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'))
    }
    req.user = user
    next()
  })
}

export const authMiddleware = {
  authentication
}
