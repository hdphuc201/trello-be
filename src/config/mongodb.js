/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment'

// Khởi tạo một đối tượng trelloDatabaseInstance ban đầu bằng null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null

// Khởi tạo một đối tượng mongoClientInstance để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  // Lưu ý: cái serverApi có từ phiên bản mongoDb 5.0.0 trở lên, có thể không cần dùng nó, còn nếu dùng nó thì chúng ta
  // sẽ chỉ định 1 cái Stable API version của MongoDB
  // Đọc thêm ở đây https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// kết nối tới database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance ở trên của chúng ta
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// đóng kết nối tới database khi cần
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}

// func GET_DB này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB
// để chúng ta sử dụng nhiều nơi khác nhau trong code
// Lưu ý phải đảm bảo chỉ luôn gọi cái GET_DB này sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database first')
  return trelloDatabaseInstance
}
