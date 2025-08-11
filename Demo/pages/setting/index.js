import { verifyUserId } from '../../common/utils'
import QNRTC from "qnwxapp-rtc"

Page({
  data: {
    appid: '',
    userId: '',
    url: '',
  },
  onLoad() {
    const app = getApp()
    this.setData({
      appid: app.appid ? app.appid : '',
      url: QNRTC.signalingUrl || '',
      userId: wx.getStorageSync('userId') ? wx.getStorageSync('userId') : ''
    })
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
    const app = getApp();

    let { appid = '', userId = '', url = '' } = this.data;

    appid = appid.trim();
    userId = userId.trim();
    url = url.trim();

    if (!verifyUserId(userId)) {
      wx.showToast({
        title: '用户名最少 3 个字符，并且只能包含字母、数字或下划线',
        icon: 'none',
        duration: 2000,
        fail: data => console.log('fail', data)
      });
      return;
    }

    if (!appid) {
      wx.showToast({
        title: '请输入appid',
        icon: 'none',
        duration: 2000,
        fail: data => console.log('fail', data)
      });
      return;
    }

    if (!url) {
      wx.showToast({
        title: '请输入信令地址',
        icon: 'none',
        duration: 2000,
        fail: data => console.log('fail', data)
      });
      return;
    }
    wx.setStorageSync('userId',  userId);

    app.appid = appid;

    QNRTC.signalingUrl = url;

    wx.navigateBack({ delta: 1 });
  },
})
