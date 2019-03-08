import { verifyRoomId, verifyUserId } from '../../common/utils'

Page({
  data: {
    startPlay: false,
    userId: wx.getStorageSync('userId') || '',
    roomName: '',
    roomToken: '',
  },
  onShow() {
    this.setData({ userId: wx.getStorageSync('userId') })
  },
  onUserIdInput: function(e) {
    this.setData({ userId: e.detail.value })
  },
  onRoomNameInput: function(e) {
    this.setData({ roomName: e.detail.value })
  },
  onTokenInput: function(e) {
    this.setData({ roomToken: e.detail.value })
  },
  onSubmit: function() {
    const value = this.data
    console.log('submit', value)
    const app = getApp()
    app.roomToken = undefined
    if (value.roomToken) {
      app.roomToken = value.roomToken
      wx.navigateTo({
        url: `/pages/room/index`,
      })
    } else {
      if (verifyRoomId(value.roomName)) {
        app.roomName = value.roomName
      } else {
        wx.showToast({
          title: '房间名最少 3 个字符，并且只能包含字母、数字或下划线',
          icon: 'none',
          duration: 2000
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
          duration: 2000
        })
        return;
      }
      wx.navigateTo({
        url: `/pages/room/index?appid=${app.appid}&room=${value.roomName}&userId=${value.userId}`,
      })
    }
  },
})
