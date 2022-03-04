import { checkPermission } from './common/utils'

App({
  roomName: undefined,
  appid: 'g2m0ya7w7',
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
