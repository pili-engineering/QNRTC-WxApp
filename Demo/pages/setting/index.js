import { verifyUserId } from '../../common/utils'

Page({
  data: {
    appid: '',
    userId: '',
    url: '',
  },
  onUserIdInput: function(e) {
    this.setData({ userId: e.detail.value })
  },
  onAppidInput: function(e) {
    this.setData({ appid: e.detail.value })
  },
  onUrlInput: function(e) {
    this.setData({ url: e.detail.value })
  },
  onSubmit() {
    const app = getApp()
    const value = this.data
    if (value.appid) {
      app.appid = value.appid
    }

    if (value.url) {
      app.url = value.url
    }

    if (verifyUserId(value.userId)) {
      wx.setStorageSync('userId', value.userId)
    } else {
      wx.showToast({
        title: '用户名最少 3 个字符，并且只能包含字母、数字或下划线',
        icon: 'none',
        duration: 2000,
        fail: data => console.log('fail', data)
      })
      return
    }

    wx.navigateBack({ delta: 1 })
  },
})
