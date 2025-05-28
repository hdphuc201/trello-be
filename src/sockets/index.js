// map để lưu các user đang tham gia theo từng board
const boardMembers = new Map() // Map<boardId, Array<user>>

export const inviteToBoard = (socket) => {
  socket.on('invite_to_board', (invitation) => {
    socket.broadcast.emit('invite_to_board', invitation)
  })
}

export const userJoinBoard = (socket) => {
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
    socket.to(boardId).emit('user_join_board', user)
    socket.emit('user_join_board', user) // gửi lại chính client vừa join

    // Gửi danh sách thành viên cho người mới join (nếu muốn đồng bộ UI sidebar)
    socket.emit('current_board_members', { boardId, members })
  })
}

export const userLeaveBoard = (socket) => {
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
}
