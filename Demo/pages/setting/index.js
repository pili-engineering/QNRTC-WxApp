import { verifyUserId } from '../../common/utils'

// eslint-disable-next-line no-undef
const app = getApp()
Page({
  data: {
    appid: '',
    userId: '',
    url: '',
    islog: false
  },
  onShow() {
    const islog = app.islog
    this.setData({ islog })
  },
  onSwitchLog(e) {
    this.setData({ islog: e.detail.value })
  },
  onUserIdInput(e) {
    this.setData({ userId: e.detail.value })
  },
  onAppidInput(e) {
    this.setData({ appid: e.detail.value })
  },
  onUrlInput(e) {
    this.setData({ url: e.detail.value })
  },
  onSubmit() {
    const value = this.data
    if (value.appid) {
      app.appid = value.appid
    }

    if (value.url) {
      app.url = value.url
    }

    app.islog = value.islog

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
