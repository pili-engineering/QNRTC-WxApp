import { RoomSession } from 'pili-rtc-wxapp'
import { verifyRoomId, verifyUserId } from '../../common/utils'
import { getToken } from '../../common/api'

Page({
  data: {
    token: '',
    playerId: '',
    session: null,
    pushContext: null,
    mic: true,
    volume: true,
    camera: true,
    beauty: 0,
    publishPath: undefined,
    subscribeList: [],
    remoteTracks: [],
    debug: false,
    isShowToast: false,
    createMergeJob: {
      id: null,
      w: 480,
      h: 320,
      stretchMode: 'aspectFill',
      publishUrl: 'rtmp://123.59.184.113:1935/jztest11/merge_test_job?domain=pili-publish.jztest11.test.cloudvdn.com',
      subscribeUrl: 'rtmp://123.59.184.113:1935/jztest11/merge_test_job?domain=pili-live-rtmp.jztest11.test.cloudvdn.com'
    },
    updateMergeTracks: {
      id: null,
      trackid: '4444444',
      x: 100,
      y: 0,
      z: 0,
      w: 240,
      h: 160,
      stretchMode: 'aspectFill'
    },
    stopMerge: {
      id: null
    },
    sendMessage: {
      userid: '',
      text: 'haha'
    },
    merge: {
      trackid: null,
      step: 'createMergeJob',
      stepOptions: ['createMergeJob', 'updateMergeTracks', 'stopMerge'],
      stretchModeOptions: ['aspectFill', 'aspectFit', 'scaleToFit']
    }
  },
  onLoad(query) {
    console.log(query)
    const app = getApp()
    const appid = query.appid || app.appid
    const userid = query.userId || wx.getStorageSync('userId')
    const room = query.room
    this.pushContext = wx.createLivePusherContext()
    this.setData({ pushContext: this.pushContext })
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
          wx.hideToast({
            fail: () => {
              console.log('消息隐藏失败')
            }
          })
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
          wx.hideToast({
            fail: () =>{
              console.log('消息隐藏失败')
            }
          })
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
    this.setData({ playerId: userid })
    this.initRoom(appid, room, userid, app.url)
  },
  onShow() {
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
      fail: () => {console.log('保持常亮状态失败')}
    })
    console.log('onShow' + Date.now().valueOf())
    // onShow 中直接调用 play 无效
  },
  toggleDebug() {
    this.setData({ debug: !this.data.debug })
  },
  handleMergeOptionsChange(e) {
    const name = e.target.dataset.name
    const merge = this.data.merge
    merge.step = name
    this.setData({ merge })
  },
  handleMergeInput(group, key, value) {
    const mergeData = this.data[group]
    mergeData[key] = value
    this.setData({ [group]: mergeData })
    console.log('merge input:', group, key, value)
  },
  handleCreateMergeJobInput(e) {
    const name = e.target.dataset.key
    const type = e.target.dataset.type
    const value = type === 'number' ? Number(e.detail.value) : e.detail.value
    this.handleMergeInput('createMergeJob', name, value)
  },
  handleCreateMergeJobStretchMode(e) {
    const idx = e.detail.value
    const value = this.data.merge.stretchModeOptions[idx]
    this.handleMergeInput('createMergeJob', 'stretchMode', value)
  },
  handleUpdateMergeTracksInput(e) {
    const name = e.target.dataset.key
    const type = e.target.dataset.type
    const value = type === 'number' ? Number(e.detail.value) : e.detail.value
    this.handleMergeInput('updateMergeTracks', name, value)
  },
  handleUpdateMergeTracksIdChange(e) {
    const idx = e.detail.value
    const value = this.data.remoteTracks[idx]
    this.handleMergeInput('updateMergeTracks', 'trackid', value)
  },
  handleUpdateMergeJobStretchMode(e) {
    const idx = e.detail.value
    const value = this.data.merge.stretchModeOptions[idx]
    this.handleMergeInput('updateMergeTracks', 'stretchMode', value)
  },
  handleStopMergeInput(e) {
    const name = e.target.dataset.key
    const type = e.target.dataset.type
    const value = type === 'number' ? Number(e.detail.value) : e.detail.value
    this.handleMergeInput('stopMerge', name, value)
  },
  handleSendMessageInput(e) {
    const name = e.target.dataset.key
    const value = e.detail.value
    this.handleMergeInput('sendMessage', name, value)
  },
  createMergeJob() {
    const createMergeJob = this.data.createMergeJob
    const session = this.data.session
    if (createMergeJob.id == null) {
      return
    }
    session.createMergeJob(createMergeJob.id, createMergeJob)
  },
  addMergeTracks() {
    const { updateMergeTracks, session } = this.data
    if (updateMergeTracks.id == null) {
      return
    }
    const allTracks = []
    allTracks.push(Object.assign({}, updateMergeTracks, { trackid: updateMergeTracks.trackid }))
    // const tracks = (session.tracks || []).concat(session.localTracks)
    // const allTracks = tracks.map((track, idx) => {
    //   return Object.assign({}, updateMergeTracks, { trackid: track.trackid, y: updateMergeTracks.y + 150 * idx })
    // })
    console.log('allTracks', allTracks)
    session.addMergeTracks(allTracks, updateMergeTracks.id)
  },
  removeMergeTracks() {
    const { updateMergeTracks, session } = this.data
    if (updateMergeTracks.id == null) {
      return
    }
    session.removeMergeTracks([updateMergeTracks], updateMergeTracks.id)
  },
  stopMerge() {
    const { stopMerge, session } = this.data
    if (stopMerge.id == null) {
      return
    }
    session.stopMerge(stopMerge.id)
  },
  sendMessage() {
    const { sendMessage, session } = this.data
    if (sendMessage.userid == null) {
      return
    }
    session.sendMessage([sendMessage.userid], sendMessage.text)
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
  joinRoom(roomToken, url) {
    let session
    if (url) {
      session = new RoomSession({
        server: url,
      })
    } else {
      session = new RoomSession()
    }
    this.handleEvent(session)
    this.setData({ session })
    const starttime = Date.now().valueOf()
    console.log(`[${starttime}] joinRoomWithToken: ${roomToken}`)
    session.joinRoomWithToken(roomToken, '2199999')
      .then(() => {
        console.log('进入房间成功')
        const endtime = Date.now().valueOf()
        console.log(`[${endtime}] +${endtime - starttime}ms joinRoom success`)
        const path = session.publish()
        console.log('pubpath: ' + path)
        const remoteTracks = (session.tracks || []).map(track => track.trackid)
        this.setData({
          publishPath: path,
          remoteTracks
        }, () => {
          this.startPush()
        })
        console.log('session:', session)
        session.users
          .filter(v => v.playerid !== session.userId)
          .forEach(v => {
            this.subscribe(v.playerid)
          })
          wx.hideToast({
            fail: () => {
              console.log('消息隐藏失败')
            }
          })
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
    const { session } = this.data
    console.log('leaveRoom`s session:',session)
    return session.leaveRoom({ code: 0 })
  },
  // subscribe(playerid) {
  //   const { subscribeList, session } = this.data
  //   console.log('session:',session)
  //   if (subscribeList.length === 9) {
  //     return wx.showToast({ title: '最多订阅9个', icon: 'none' })
  //   }
  //   const path = session.subscribe(playerid)
  //   console.log('subpath: ' + path)
  //   if (path) {
  //     const sub = subscribeList.filter(v => v.key !== playerid)
  //     sub.push({
  //       url: path,
  //       key: playerid,
  //     })
  //     this.setData({
  //       subscribeList: sub,
  //     }, () => {
  //       console.log('subscribeList:', this.data.subscribeList)
  //     })
  //   }
  // },
  subscribe(playerid) {
    const { subscribeList, session } = this.data
    console.log('session:', session)
    const addressList = session.getSubscribeAddressList(playerid)
    console.log('AddressList: ', addressList)
    if (addressList) {
      if (subscribeList.length + addressList.length > 9) {
        return wx.showToast({ title: '最多订阅9条流', icon: 'none' })
      }
      const sub = subscribeList.filter(v => v.userid !== playerid)
      const urlList = []
      addressList.map(((item, index)=> {
        urlList.push(Object.assign({}, item, {
          key:playerid + Math.random().toString(36).slice(-8),
          userid:playerid
        }))
      }))
      urlList.forEach(e => {
        sub.push(e)
      })
      this.setData({
        subscribeList: sub,
      }, () => {
        console.log('subscribeList:', this.data.subscribeList)
      })
    }
  },
  startPush() {
  },
  onHide() {
    wx.setKeepScreenOn({
      keepScreenOn: false,
      fail: () => {console.log('保持常亮状态失败')}
    })
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
    this.leaveRoom()
    wx.navigateBack({ delta: 1 })
  },
  switchCamera() {
    const { pushContext } = this.data
    if (pushContext) {
      pushContext.switchCamera()
    }
  },

  initRoom(appid, room, userid, url) {
    console.log('url:', url)
    return getToken(appid, room, userid)
      .then(token => {
        const app = getApp()
        app.url = url
        return this.joinRoom(token, url)
      })
  },
  initRoomWithToken(roomToken, url) {
    return this.joinRoom(roomToken, url)
  },
  handleEvent(session) {
    session.on('track-add', (tracks) => {
      console.log('track-add', tracks)
      const remoteTracks = this.data.remoteTracks
      const set = {}
      for (const track of tracks) {
        remoteTracks.push(track.trackid)
        // 每个 playerid 只订阅一次
        if (!set[track.playerid]) {
          set[track.playerid] = true
          this.subscribe(track.playerid)
        }
      }
      this.setData({ remoteTracks })
    })
    session.on('track-remove', (tracks) => {
      console.log('track-remove', tracks)
      const {remoteTracks, subscribeList} = this.data
      for (const track of tracks) {
        const idx = remoteTracks.indexOf(track.trackid)
        if (idx !== -1) {
          remoteTracks.splice(idx, 1)
        }
        subscribeList.map((ele, index) => {
          if (ele.url.indexOf(track.trackid) !== -1) {
            return subscribeList.splice(index, 1)
          }
        })
      }
      this.setData({ remoteTracks, subscribeList })
      console.log('track-remove-data', this.data)
    })
    session.on('user-leave', (user) => {
      console.log('user-leave', user)
      console.log('leave subscribeList', this.data.subscribeList)
      this.setData({
        subscribeList: this.data.subscribeList.filter(v => v.userid !== user.playerid),
      })
      console.log('user-leave`subscribeList:', this.data.subscribeList)
    })
    session.on('user-join', (user) => {
      console.log('user-join', user)
    })
    session.on('local-track-add', (tracks) => {
      const remoteTracks = this.data.remoteTracks
      console.log('local-track-add', tracks)
      for (const track of tracks) {
        remoteTracks.push(track.trackid)
        // 每个 playerid 只订阅一次
      }
      this.setData({ remoteTracks })
    })
    session.on('local-track-remove', (tracks) => {
      const remoteTracks = this.data.remoteTracks
      console.log('local-track-remove', tracks)
      for (const track of tracks) {
        const idx = remoteTracks.indexOf(track.trackid)
        if (idx !== -1) {
          remoteTracks.splice(idx, 1)
        }
      }
      this.setData({ remoteTracks })
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
      wx.hideToast({
        fail: () => {
          console.log('消息隐藏失败')
        }
      })
    })
  },
  reconnect() {
    console.log('尝试重连中...')
    wx.showToast({
      title: '尝试重连中...',
      icon: 'loading',
      mask: true,
    })
    this.leaveRoom()
    this.setData({
      publishPath: '',
      subscribeList: [],
    })
    const { pushContext } = this.data
    if (pushContext) {
      pushContext.stop()
    }
    this.reconnectTimer = setTimeout(() => {
      const app = getApp()
      if (app.roomToken) {
        this.initRoomWithToken(app.roomToken, app.url).then(() => {
          wx.hideToast({
            fail: () => {
              console.log('消息隐藏失败')
            }
          })
        }).catch(e => {
          console.log(`reconnect failed: ${e}`)
          return this.reconnect()
        })
      } else if (this.appid && this.roomName && this.userid) {
        this.initRoom(this.appid, this.roomName, this.userid, app.url).then(() => {
          wx.hideToast({
            fail: () => {
              console.log('消息隐藏失败')
            }
          })
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
  }
})
