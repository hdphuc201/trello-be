const { StatusCodes } = require('http-status-codes')
const multer = require('multer')
const { default: ApiError } = require('~/utils/ApiError')
const { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } = require('~/utils/validators')

const customFileFilter = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const error = 'File type is invalid, Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error), null)
  } else {
    callback(null, true)
  }
}

const upload = multer({
  fileFilter: customFileFilter,
  limits: {
    fileSize: LIMIT_COMMON_FILE_SIZE
  }
})

export const multerUploadMiddleware = { upload }
