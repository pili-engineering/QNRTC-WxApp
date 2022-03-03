import { checkPermission } from './common/utils'

App({
  roomName: undefined,
  appid: 'g2m0ya7w7',
  islog: true,
  userId: undefined,
  roomToken: undefined,
  url: 'wss://rtmpgate.cloudvdn.com/',

  onLaunch() {
    checkPermission()
  },

  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  }
})
