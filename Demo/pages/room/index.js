import { RoomSession } from 'pili-rtc-wxapp'
import { verifyRoomId, verifyUserId } from '../../common/utils';
import { getToken } from '../../common/api';

Page({
  data: {
    token: '',
    mic: true,
    volume: true,
    camera: true,
    beauty: 0,
    publishPath: undefined,
    subscribeList: [],
    debug: false,
  },
  onLoad(query) {
    console.log(query)
    const app = getApp()
    const appid = query.appid || app.appid
    const userid = query.userId || wx.getStorageSync('userId')
    const room = query.room
    this.pushContext = wx.createLivePusherContext()
    wx.showToast({
      title: '加入房间中',
      icon: 'loading',
      mask: true,
    })
    if (app.roomToken) {
      this.initRoomWithToken(app.roomToken)
      return
    }
    if (!verifyUserId(userid)) {
      wx.redirectTo({
        url: '/pages/index/index',
        success: () => {
          wx.hideToast()
          wx.showToast({
            title: '用户名最少 3 个字符，并且只能包含字母、数字或下划线',
            icon: 'none',
            duration: 2000
          })
        }
      })
      return;
    }
    if (!verifyRoomId(room)) {
      wx.redirectTo({
        url: '/pages/index/index',
        success: () => {
          wx.hideToast()
          wx.showToast({
            title: '房间名最少 3 个字符，并且只能包含字母、数字或下划线',
            icon: 'none',
            duration: 2000
          })
        }
      })
      return;
    }
    this.appid = appid
    this.roomName = room
    this.userid = userid
    this.initRoom(appid, room, userid, app.url)
  },
  onShow() {
    // 保持屏幕常亮
    wx.setKeepScreenOn({ keepScreenOn: true });
    console.log('onShow' + Date.now().valueOf())
    // onShow 中直接调用 play 无效
    wx.nextTick(() => {
      for (const {key} of this.data.subscribeList) {
        const ctx = wx.createLivePlayerContext(key)
        if (ctx) {
          ctx.play()
        }
      }
    })
  },
  toggleDebug() {
    this.setData({ debug: !this.data.debug })
  },
  pushStateChange(e) {
    let code;
    if (e.detail) {
      code = e.detail.code;
    } else {
      code = e;
    }
    // console.log('live-pusher state change: ', code)
    // switch (code) {
    //   case 1002:
    //     {
    //       console.log('推流成功')
    //       break
    //     }
    //   case -1301:
    //     {
    //       console.error('打开摄像头失败: ', code)
    //       this.leaveRoom()
    //       break
    //     }
    //   case -1302:
    //     {
    //       console.error('打开麦克风失败: ', code)
    //       this.leaveRoom()
    //       break
    //     }
    //   case -1307:
    //     {
    //       console.error('推流连接断开: ', code);
    //       this.leaveRoom()
    //       break
    //     }
    //   case 5000:
    //     {
    //       console.log('收到5000: ', code)
    //       // 收到5000就退房
    //       this.leaveRoom()
    //       break
    //     }
    //   case 1018:
    //     {
    //       console.log('进房成功', code);
    //       break
    //     }
    //   case 1019:
    //     {
    //       console.log('退出房间', code)
    //       this.leaveRoom()
    //       break
    //     }
    //   case 1020:
    //     {
    //       console.log('成员列表', code)
    //       break
    //     }
    //   case 1021:
    //     {
    //       console.log('网络类型发生变化，需要重新进房', code)
    //       //先退出房间
    //       this.leaveRoom()
    //       break
    //     }
    //   case 2007:
    //     {
    //       console.log('视频播放loading: ', code)
    //       break
    //     };
    //   case 2004:
    //     {
    //       console.log('视频播放开始: ', code)
    //       break
    //     };
    //   default:
    //     {
    //     }
    // }
    // if (Number(e.detail.code) === -1307) {
    //   // this.startPush()
    //   console.error('live-pusher state change:', e.detail.code)
    // } else {
    //   console.debug('live-pusher state change:', e.detail.code)
    // }
  },
  livePusherError(e) {
    if (Number(e.code) < 0) {
      wx.showToast({ title: '发布失败' })
    }
    console.error('live-pusher error:', e.detail.code, e.detail.errMsg)
  },
  livePlayerError(e) {
    console.error('live-player error:', e.detail.code, e.detail.errMsg)
  },
  joinRoom(roomToken) {
    const starttime = Date.now().valueOf()
    console.log(`[${starttime}] joinRoomWithToken: ${roomToken}`)
    return this.session.joinRoomWithToken(roomToken)
      .then(() => {
        const endtime = Date.now().valueOf()
        console.log(`[${endtime}] +${endtime - starttime}ms joinRoom success`)
        const path = this.session.publish()
        console.log('pubpath: ' + path)
        this.setData({
          publishPath: path,
        }, () => {
          this.startPush()
        })
        this.session.users
          .filter(v => v.playerid !== this.session.userId)
          .forEach(v => {
            this.subscribe(v.playerid)
          })
        wx.hideToast()
      })
      .catch(err => {
        console.log('加入房间失败', err)
        wx.reLaunch({
          url: '/pages/index/index',
          success: () => {
            wx.showToast({
              title: '加入房间失败',
              icon: 'none',
            })
          }
        })
      })
  },
  leaveRoom() {
    if (this.session) {
      return this.session.leaveRoom()
    }
  },
  subscribe(playerid) {
    if(this.data.subscribeList.length === 9) {
      return wx.showToast({title: '最多订阅9个', icon: 'none'})
    }
    const path = this.session.subscribe(playerid)
    console.log('subpath: ' + path)
    if (path) {
      const sub = this.data.subscribeList.filter(v => v.key !== playerid)
      sub.push({
          url: path,
          key: playerid,
        })
      this.setData({
        subscribeList: sub,
      }, () => {
        const ctx = wx.createLivePlayerContext(playerid)
        if (ctx) {
          ctx.play()
        }
      })
    }
  },
  startPush() {
    this.pushContext.start({
      success: () => {
        console.log('push success')
      },
      fail: () => {
        wx.showToast({
          title: '推流开始失败', 
          icon: 'none',
        })
      },
    })
  },
  onHide() {
    wx.setKeepScreenOn({ keepScreenOn: false });
    console.log('onHide')
  },
  onUnload() {
    console.log('onUnload')
    this.leaveRoom()
  },
  toggleMic() {
    this.setData({ mic: !this.data.mic })
  },
  toggleVolume() {
    this.setData({ volume: !this.data.volume })
  },
  toggleCamera() {
    this.setData({ camera: !this.data.camera })
  },
  toggleBeauty() {
    this.setData({ beauty: this.data.beauty ? 0 : 9 })
  },
  onPhoneTab() {
    // leave room
    wx.navigateBack({ delta: 1 })
  },
  switchCamera() {
    this.pushContext.switchCamera()
  },

  initRoom(appid, room, userid, url) {
    let session
    if (url) {
      session = new RoomSession({
        server: url,
      })
    } else {
      session = new RoomSession()
    }
    this.handleEvent(session)
    this.session = session
    return getToken(appid, room, userid)
      .then(token => {
        const app = getApp()
        app.url = url
        return this.joinRoom(token)
      })
  },
  initRoomWithToken(roomToken, url) {
    let session
    if (url) {
      session = new RoomSession({
        server: url,
      })
    } else {
      session = new RoomSession()
    }
    this.handleEvent(session)
    this.session = session
    return this.joinRoom(roomToken)
  },
  handleEvent(session) {
    session.on('track-add', (tracks) => {
      console.log('track-add', tracks)
      const set = {}
      for (const track of tracks) {
        // 每个 playerid 只订阅一次
        if (!set[track.playerid]) {
          set[track.playerid] = true
          this.subscribe(track.playerid)
        }
      }
    })
    session.on('track-remove', (tracks) => {
      console.log('track-remove', tracks)
      this.setData({
        subscribeList: this.data.subscribeList
          .filter(v => !tracks.reduce((accumulator, currentValue) =>
            accumulator && v.url.includes(currentValue.trackid), true)),
      })
    })
    session.on('user-leave', (user) => {
      console.log('user-leave', user)
      this.setData({
        subscribeList: this.data.subscribeList.filter(v => v.key !== user.playerid),
      })
    })
    session.on('user-join', (user) => {
      console.log('user-join', user)
    })
    session.on('disconnect', (res) => {
      let title = '已离开房间'
      if (res.code === 10006) {
        title = '被踢出房间'
      }
      wx.reLaunch({
        url: '/pages/index/index',
        success: () => {
          wx.showToast({
            title,
            icon: 'none',
          })
        },
      })
    })
    session.on('error', (res) => {
      console.log('session error', res)
      this.reconnect()
    })
    session.on('reconnecting', () => {
      console.log('尝试重连中...')
      wx.showToast({
        title: '尝试重连中...',
        icon: 'loading',
        mask: true,
      })
    })
    session.on('reconnected', () => {
      this.startPush()
      for (const track of this.data.subscribeList) {
        const ctx = wx.createLivePlayerContext(track.key)
        if (ctx) {
          ctx.play()
        }
      }
      wx.hideToast()
    })
  },
  reconnect() {
    console.log('尝试重连中...')
    wx.showToast({
      title: '尝试重连中...',
      icon: 'loading',
      mask: true,
    })
    this.session && this.session.leaveRoom()
    this.setData({
      publishPath: '',
      subscribeList: [],
    })
    this.pushContext.stop()
    this.reconnectTimer = setTimeout(() => {
      const app = getApp()
      if (app.roomToken) {
        this.initRoomWithToken(app.roomToken, app.url).then(() => {
          wx.hideToast()
        }).catch(e => {
          console.log(`reconnect failed: ${e}`)
          return this.reconnect()
        })
      } else if (this.appid && this.roomName && this.userid) {
        this.initRoom(this.appid, this.roomName, this.userid, app.url).then(() => {
          wx.hideToast()
        }).catch(e => {
          console.log(`reconnect failed: ${e}`)
          return this.reconnect()
        })
      } else {
        wx.reLaunch({
          url: '/pages/index/index',
          success: () => {
            wx.showToast({
              title: '加入房间失败',
              icon: 'none',
            })
          }
        })
      }
    }, 1000)
  },
})
