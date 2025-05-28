
import { StatusCodes } from 'http-status-codes'

import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'
import { WHITELIST_DOMAINS } from '~/utils/constants'

export const corsOptions = {
  origin: function (origin, callback) {
    // nếu môi trường là local dev thì cho qua luôn
    // Update mới: Ở video số 75 trong chuỗi MERN Stack PRO khi chúng ta deploy dự án lên một Server Production thì sẽ sửa lại đoạn này thêm một chút nữa để phù hợp với từng môi trường production hoặc dev nhé.
    // Học với mình thì các bạn cứ yên tâm về sự chỉn chu chuẩn chỉnh nhé :D
    if (env.BUILD_MODE === "dev") {
      return callback(null, true)
    }
    if (!origin) return callback(null, true)

    if (WHITELIST_DOMAINS.includes(origin)) return callback(null, true)

    // Cuối cùng nếu domain không được chấp nhận thì trả về lỗi
    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by our CORS Policy.`))
  },

  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,
  credentials: true
}
