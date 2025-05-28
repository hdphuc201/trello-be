import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const { LIMIT_COMMON_FILE_SIZE } = require('~/utils/validators')

// Gộp chung storage logic lại trong 1 config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath

    if (file.fieldname === 'cover') {
      uploadPath = path.resolve('uploads/cards')
    }
    if (file.fieldname === 'avatar') {
      uploadPath = path.resolve('uploads/avatar')
    }
    if (file.fieldname === 'fileAttach') {
      uploadPath = path.resolve('uploads/attachs')
    }

    //Kiểm tra xem thư mục đó có tồn tại trên ổ đĩa hay chưa.
    //Trả về true nếu tồn tại, false nếu không.
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}-${file.originalname}`)
  }
})

export const uploadFiles = multer({
  storage,
  limits: LIMIT_COMMON_FILE_SIZE
}).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'fileAttach', maxCount: 10 },
  { name: 'avatar', maxCount: 1 }
])
