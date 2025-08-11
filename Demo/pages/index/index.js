import { verifyRoomId, verifyUserId } from '../../common/utils'

Page({
  data: {
    userId: '',
    roomName: ''
  },
  onShow() {
    this.setData({ userId: wx.getStorageSync('userId') })
  },
  onUserIdInput(e) {
    this.setData({ userId: e.detail.value })
  },
  onRoomNameInput(e) {
    this.setData({ roomName: e.detail.value })
  },
  onSubmit(e) {
    console.log(e)
    const value = this.data
    const app = getApp()
    if (verifyRoomId(value.roomName)) {
      app.roomName = value.roomName
    } else {
      wx.showToast({
        title: '房间名最少 3 个字符，并且只能包含字母、数字或下划线',
        icon: 'none',
        duration: 2000,
        fail: data => console.log('fail', data)
      })
      return;
    }
    if (verifyUserId(value.userId)) {
      app.userId = value.userId
      wx.setStorageSync('userId', value.userId)
    } else {
      wx.showToast({
        title: '用户名最少 3 个字符，并且只能包含字母、数字或下划线',
        icon: 'none',
        duration: 2000,
        fail: data => console.log('fail', data)
      })
      return;
    }
    if (e.target.dataset.type === "chatting") {
      wx.navigateTo({
        url: `/pages/chat/index?appid=${app.appid}&room=${value.roomName}&userId=${value.userId}`,
      })
    } else if (e.target.dataset.type === "meeting") {
      wx.navigateTo({
        url: `/pages/room/index?appid=${app.appid}&room=${value.roomName}&userId=${value.userId}`,
      })
    }
  },
})
