import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
import { slugify } from '~/utils/formatters'

const create = async (userId, reqBody) => {
  try {
    // xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.create(userId, newBoard)

    // lấy bản ghi board sau khi gọi ( tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý logic khác vs các collection khác tùy đặc thù dự án...
    // Bắn Email, notification về cho admin khi có 1 cái board mới được tạo...

    // trả kết quả về trong Service, luôn phải có return
    return getNewBoard
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async (userId, reqQuery) => {
  try {
    // Lấy page và itemsPerPage, nếu không có thì dùng giá trị mặc định
    let page = reqQuery.page ? +reqQuery.page : DEFAULT_PAGE
    let itemsPerPage = reqQuery.itemsPerPage ? +reqQuery.itemsPerPage : DEFAULT_ITEMS_PER_PAGE

    // Truyền toàn bộ reqQuery xuống tầng model để xử lý các trường hợp lọc nâng cao (ví dụ q[title])
    const boards = await boardModel.getAll(userId, { ...reqQuery, page, itemsPerPage })
    return boards
  } catch (error) {
    throw new Error(error)
  }
}
const getDetails = async (userId, boardId, accessRole) => {
  try {
    // 1. Kiểm tra xem board có tồn tại không
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    // 2. Kiểm tra quyền truy cập
    if (board.type === 'private') {
      // Với board private, phải kiểm tra user có trong thành viên hoặc là owner
      const boardDetail = await boardModel.getDetails(userId, boardId)
      const user = await userModel.findOneById(userId)

      const owner = boardDetail.owners[0]._id.toString() === user._id.toString()
      const members = boardDetail.memberIds.map((item) => item.toString()).includes(user._id.toString())

      if (!owner && !members) {
        if (!accessRole) {
          throw new ApiError(StatusCodes.FORBIDDEN, 'This is private board')
        }
      }

      // Tiếp tục xử lý dữ liệu
      const resBoard = cloneDeep(boardDetail)

      resBoard.columns.forEach((column) => {
        column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
      })

      delete resBoard.cards

      return resBoard
    } else {
      // Với board public, không cần kiểm tra quyền
      const boardDetail = await boardModel.getDetails(userId, boardId)

      // Trường hợp user chưa từng tương tác với board này (chưa có trong bảng userBoards), cũng cho xem
      if (!boardDetail) {
        // Có thể tạo bản ghi mặc định ở đây nếu muốn tự động thêm user
        // hoặc chỉ lấy board basic info
        const publicBoard = await boardModel.getDetails(null, boardId) // Hoặc hàm riêng để lấy public board
        if (!publicBoard) {
          throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
        }

        const resBoard = cloneDeep(publicBoard)

        resBoard.columns.forEach((column) => {
          column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
        })

        delete resBoard.cards

        return resBoard
      }

      const resBoard = cloneDeep(boardDetail)

      resBoard.columns.forEach((column) => {
        column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
      })

      delete resBoard.cards

      return resBoard
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to get board details')
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    // gọi cho tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const updatedBoard = await boardModel.update(boardId, updateData)

    // trả kết quả về trong Service, luôn phải có return
    return updatedBoard
  } catch (error) {
    throw new Error(error)
  }
}
const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (hiểu bản chất là xóa đi _id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updateAt: Date.now()
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (hiểu bản chất là thêm _id của Card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updateAt: Date.now()
    })
    // B3: Cập nhật lại trường columnId mới của cái card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return {
      updateResult: 'Successfully'
    }
    // eslint-disable-next-line no-unreachable
  } catch (error) {
    throw new Error(error)
  }
}

const deleteBoard = async (boardId) => {
  try {
    if (!boardId) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'BoardId not found')
    }
    const res = await boardModel.deleteBoard(boardId)

    return res
  } catch (error) {
    throw new Error(error)
  }
}
export const boardService = {
  getAll,
  create,
  getDetails,
  update,
  deleteBoard,
  moveCardToDifferentColumn
}
