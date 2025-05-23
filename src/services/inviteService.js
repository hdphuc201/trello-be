import { StatusCodes } from 'http-status-codes'

import { boardModel } from '~/models/boardModel'
import { inviteModel } from '~/models/inviteModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { BOARD_INVITATION_STATUS, INVITATION_TYPES } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const inviteUserToBoard = async (reqBody, inviterId) => {
  const { inviteeEmail, boardId } = reqBody
  // 1. Người gửi lời mời: là người đang request, nên chúng ta tìm theo id lấy từ token
  const inviter = await userModel.findOneById(inviterId)

  // 2. Người được mời: gửi email từ phía FE
  const invitee = await userModel.findOneByEmail(inviteeEmail)

  // 3. Tìm board mà người đó gửi lời mời vào
  const board = await boardModel.findOneById(boardId)

  // Nếu không tồn tại 1 trong 3 thì chúng ta thẳng tay reject
  if (!invitee || !inviter || !board) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
  }

  // Tạo data cần thiết để lưu vào trong DB
  // gồm các thứ như là: loại type, boardInvitation, status để test xem Model validate ok chưa.
  const newInvitationData = {
    inviterId,
    inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại ở hàm create
    type: INVITATION_TYPES.BOARD_INVITATION,
    boardInvitation: {
      boardId: board._id.toString(),
      status: BOARD_INVITATION_STATUS.PENDING // default status
    }
  }
  // Gọi sang Model để lưu vào DB
  const createdInvitation = await inviteModel.createNewBoardInvitation(newInvitationData)
  const getInvitation = await inviteModel.findOneById(createdInvitation.insertedId.toString())

  // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luôn board, inviter, invitee cho FE thoải mái xử lý.
  const resInvitation = {
    ...getInvitation,
    board,
    inviter: pickUser(inviter),
    invitee: pickUser(invitee)
  }

  return resInvitation
}

export const inviteService = {
  inviteUserToBoard
}
