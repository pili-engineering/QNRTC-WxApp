import { checkPermission } from './common/utils'

App({
  roomName: undefined,
  appid: 'd8lk7l4ed',
  userId: undefined,
  roomToken: undefined,
  url: 'wss://rtmpgate.cloudvdn.com/',
  globalData: {
    isIPX: false,
    session: null
  },
  onLaunch() {
    this.checkIsIPhoneX()
    checkPermission()
  },
  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },
  checkIsIPhoneX() {
    const self = this
    wx.getSystemInfo({
      success: (res) => {
        if (res.model.search('iPhone X') !== -1) {
          self.globalData.isIPX = true
        }
      }
    })
  },
})
