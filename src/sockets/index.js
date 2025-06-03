// map để lưu các user đang tham gia theo từng board

import { boardMembers } from './socketMapping'

// board
export const handleSockerBoard = (socket) => {
  socket.on('invite_to_board', (invitation) => {
    socket.broadcast.emit('invite_to_board', invitation)
  })

  socket.on('user_join_board', ({ boardId, user }) => {
    if (!boardId || !user?._id) return

    socket.join(boardId)

    // Lấy danh sách hiện tại (nếu có), thêm user nếu chưa có
    const members = boardMembers.get(boardId) || []
    const isAlreadyIn = members.some((member) => member._id === user._id)
    if (!isAlreadyIn) {
      members.push(user)
      boardMembers.set(boardId, members)
    }

    // console.log('👥 Current members:', members.map((m) => m.email))

    // Gửi event 'user_join_board' cho tất cả người trong room, bao gồm cả người vừa join
    socket.to(boardId).emit('user_join_board', { boardId, user })
    // socket.emit('user_join_board', user) // gửi lại chính client vừa join
    // Gửi danh sách thành viên cho người mới join (nếu muốn đồng bộ UI sidebar)
    socket.emit('current_board_members', { boardId, members })
  })

  socket.on('user_leave_board', ({ boardId, user }) => {
    if (!boardId || !user?._id) return

    socket.leave(boardId)

    // Xóa khỏi danh sách
    const members = boardMembers.get(boardId) || []
    const newMembers = members.filter((m) => m._id !== user._id)
    boardMembers.set(boardId, newMembers)

    // console.log(`🚪 [${user.email}] left board ${boardId}`)

    // Gửi thông báo rời đi cho các client khác
    socket.to(boardId).emit('user_leave_board', user)
  })

  socket.on('request_join_board', ({ newRequest, user }) => {
    const boardId = newRequest?.boardJoinRequest?.boardId
    socket.join(boardId)

    const members = boardMembers.get(boardId) || []
    const isAlreadyIn = members.some((member) => member._id === user?._id)
    if (!isAlreadyIn) {
      members.push(user)
      boardMembers.set(boardId, members)
    }
    // Gửi event 'receive_join_request' cho tất cả người trong room, bao gồm cả người vừa join
    socket.to(boardId).emit('receive_join_request', newRequest)
    socket.emit('receive_join_request', newRequest) // gửi lại chính client vừa join

    // Gửi danh sách thành viên cho người mới join (nếu muốn đồng bộ UI sidebar)
    socket.emit('current_board_members', { boardId: boardId, members })
  })

  socket.on('response_join_request', (res) => {
    socket.broadcast.emit('response_join_request', res)
  })
}

// column
export const handleSocketColumn = (socket) => {
  socket.on('create_column', (column) => {
    if (!column) return
    socket.join(column.boardId)
    socket.to(column.boardId).emit('create_column', column)
  })

  socket.on('update_column', (boardId) => {
    if (!boardId) return
    // socket.broadcast.emit('update_column', boardId)
    socket.to(boardId).emit('update_column', boardId)
  })

  socket.on('delete_column', (boardId) => {
    if (!boardId) return
    socket.join(boardId)
    socket.broadcast.emit('delete_column', boardId)
  })
}

// card
export const handleSocketCard = (socket) => {
  socket.on('create_card', (boardId) => {
    if (!boardId) return
    socket.join(boardId)
    socket.to(boardId).emit('create_card', boardId)
  })

  socket.on('update_card', (boardId) => {
    if (!boardId) return
    socket.join(boardId)
    socket.to(boardId).emit('update_card', boardId)
    // socket.broadcast.emit('update_card', card)
  })

  socket.on('update_activeCard', (updateCard) => {
    if (!updateCard) return
    socket.to(updateCard.boardId).emit('update_activeCard', updateCard)
  })

  socket.on('delete_card', (boardId) => {
    if (!boardId) return
    socket.join(boardId)
    // socket.broadcast.emit('delete_card', boardId)
    socket.to(boardId).emit('delete_card', boardId)
  })
}
