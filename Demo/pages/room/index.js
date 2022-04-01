import { verifyRoomId, verifyUserId, debounce } from "../../common/utils";
import { getToken } from "../../common/api";
import QNRTC, { QNLocalTrack } from "qnwxapp-rtc";

const app = getApp();
Page({
  data: {
    rtmpUrl: "",
    chatModal: false,
    mergeModal: false,
    directLiveStatus: false,
    token: "",
    playerId: "",
    client: null,
    pushContext: null,
    mic: true,
    volume: true,
    camera: true,
    beauty: 0,
    whiteness: 0,
    mirror: false,
    audioRevebList: ["关闭", "KTV", "小房间", "大会堂", "低沉", "洪亮", "金属声", "磁性"], 
    audioReveb: 0,
    filterList: [
    {
      zh: "标准",
      en: "standard",
    },
    {
      zh: "粉嫩",
      en: "pink",
    },
    {
      zh: "怀旧",
      en: "nostalgia",
    },
    {
      zh: "蓝调",
      en: "blues",
    },
    {
      zh: "浪漫",
      en: "romantic",
    },
    {
      zh: "清凉",
      en: "cool",
    },
    {
      zh: "清新",
      en: "fresher",
    },
    {
      zh: "日系",
      en: "solor",
    },
    {
      zh: "唯美",
      en: "aestheticism",
    },
    {
      zh: "美白",
      en: "whitening",
    },
    {
      zh: "樱红",
      en: "cerisered",
    }],
    filter: 0,
    filterResult: "standard",
    publishPath: undefined,
    subscribeList: [],
    remoteTracks: [],
    userList: [],
    messageList: [],
    isShowToast: false,
    modelType: "",
    model: false
  },
  onLoad(query) {
    console.log(query);
    const appid = query.appid || app.appid;
    const userid = query.userId || wx.getStorageSync("userId");
    const room = query.room;
    this.pushContext = wx.createLivePusherContext();
    this.setData({ pushContext: this.pushContext });
    wx.showToast({
      title: "加入房间中",
      icon: "loading",
      mask: true,
      fail: (data) => console.log("fail", data),
    });
    if (app.roomToken) {
      this.initRoomWithToken(app.roomToken);
      return;
    }
    if (!verifyUserId(userid)) {
      wx.redirectTo({
        url: "/pages/index/index",
        success: () => {
          wx.hideToast({
            fail: () => {
              console.log("消息隐藏失败");
            },
          });
          wx.showToast({
            title: "用户名最少 3 个字符，并且只能包含字母、数字或下划线",
            icon: "none",
            duration: 2000,
            fail: (data) => console.log("fail", data),
          });
        },
      });
      return;
    }
    if (!verifyRoomId(room)) {
      wx.redirectTo({
        url: "/pages/index/index",
        success: () => {
          wx.hideToast({
            fail: () => {
              console.log("消息隐藏失败");
            },
          });
          wx.showToast({
            title: "房间名最少 3 个字符，并且只能包含字母、数字或下划线",
            icon: "none",
            duration: 2000,
            fail: (data) => console.log("fail", data),
          });
        },
      });
      return;
    }
    this.appid = appid;
    this.roomName = room;
    this.userid = userid;
    this.setData({ playerId: userid });
    this.initRoom(appid, room, userid, app.url);
  },
  onShow() {
    // 保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true,
      fail: () => console.log("保持常亮状态失败"),
    });
    console.log("onShow" + Date.now().valueOf());
    // onShow 中直接调用 play 无效
  },

  livePusherError(e) {
    if (Number(e.code) < 0) {
      wx.showToast({
        title: "发布失败",
        fail: (data) => console.log("fail", data),
      });
    }
    console.error("live-pusher error:", e.detail.code, e.detail.errMsg);
  },
  livePlayerError(e) {
    console.error("live-player error:", e.detail.code, e.detail.errMsg);
  },
  async joinRoom(roomToken, url) {
    this.setData({
      userList: [],
      remoteTracks: [],
      messageList: [],
      subscribeList: []
    })
    const client = QNRTC.createClient();
    app.globalData.client = client;
    this.handleEvent(client);
    await client.join(roomToken, "测试");
    this.setData({
      client,
      rtmpUrl: `rtmp://pili-publish.qnsdk.com/sdk-live/${client.appId}_${client.roomName}_${client.userId}_test`,
    });
    client.publish((status, data) => {
      console.log("callback: publish - 发布后回调",status, data);
      if (status === "READY") {
        this.setData({
          publishPath: data.url,
        });
      } else if (status === "COMPLATED") {
        console.log("local-track-add", data.tracks);
        const remoteTracks = [...data.tracks];
        remoteTracks.forEach(item => {
          item.isLocal = true;
          item.h = 100;
          item.w = 100;
          item.x = 0;
          item.y = 0;
          item.z = 0;
          item.stretchMode = 0;
        })
        this.setData({
          remoteTracks: [...this.data.remoteTracks, ...remoteTracks],
        });
      }
    });
  },
  leaveRoom() {
    const { client } = this.data;
    console.log("leaveRoom`s client:", client);
    client.leave()
  },
  onHide() {
    wx.setKeepScreenOn({
      keepScreenOn: false,
      fail: () => console.log("保持常亮状态失败"),
    });
    console.log("onHide");
  },
  onUnload() {
    console.log("onUnload");
    this.leaveRoom();
  },
  toggleMic() {
    this.setData({ mic: !this.data.mic });
    const { client } = this.data;
    const mic = this.data.mic;
    const index = client.localTracks.findIndex((item) => item.isAudio() && item.isLocal);
    if (index >= 0) {
      client.localTracks[index].setMuted(!mic);
    }
  },
  toggleVolume() {
    this.setData({ volume: !this.data.volume });
  },
  toggleCamera() {
    this.setData({ camera: !this.data.camera });
    const { client } = this.data;
    const camera = this.data.camera;
    const index = client.localTracks.findIndex((item) => item.isVideo() && item.isLocal);
    if (index >= 0) {
      client.localTracks[index].setMuted(!mic);
    }
  },
  closeModel() {
    this.setData({
      model: false,
      modelType: ""
    })
  },
  openBeauty() {
    this.setData({
      model: true,
      modelType: "beauty"
    })
  },
  toggleBeauty(event) {
    this.setData({ beauty: event.detail.value });
  },
  openWhiteness() {
    this.setData({
      model: true,
      modelType: "whiteness"
    })
  },
  toggleWhiteness(event) {
    this.setData({ whiteness: event.detail.value });
  },
  toggleMirror() {
    this.setData({
      mirror: !this.data.mirror
    })
  },
  toggleAudioReveb(event) {
    this.setData({
      audioReveb: event.detail.value
    })
  },
  toggleFilter(event) {
    this.setData({
      filter: event.detail.value,
      filterResult: this.data.filterList[event.detail.value].en
    })
  },
  // 离开房间
  onPhoneTab() {
    // leave room
    this.leaveRoom();
    wx.navigateBack({ delta: 1 });
  },
  // 切换摄像头
  switchCamera() {
    const { pushContext } = this.data;
    if (pushContext) {
      pushContext.switchCamera();
    }
  },

  initRoom(appid, room, userid, url) {
    console.log("url:", url);
    return getToken(appid, room, userid).then((token) => {
      const app = getApp();
      app.url = url;
      return this.joinRoom(token, url);
    });
  },
  initRoomWithToken(roomToken, url) {
    return this.joinRoom(roomToken, url);
  },
  handleStartDirectLiveStreaming: debounce(async function () {
    if(this.data.directLiveStatus) {
      this.handleCloseDirectLiveStreaming();
      return;
    }
    const { client } = this.data;
    if (client === null) {
      wx.showToast({
        title: "client未初始化",
        icon: "none",
        duration: 500,
      });
      return false;
    }
    try {
      await client.startDirectLiveStreaming({
        videoTrack: this.data.remoteTracks.find((item) => item.isVideo() && item.isLocal),
        audioTrack: this.data.remoteTracks.find((item) => item.isAudio() && item.isLocal),
        streamID: "default",
        url: this.data.rtmpUrl,
      });
      wx.showToast({
        title: "创建单路转推成功",
        icon: "none",
        duration: 500,
      });
      this.setData({
        directLiveStatus: true,
      });
    } catch (e) {
      console.log(e);
      wx.showToast({
        title: e.message,
        icon: "none",
        duration: 500,
      });
    }
  }),
  handleCloseDirectLiveStreaming: debounce(async function () {
    const { client } = this.data;
    if (client === null) {
      wx.showToast({
        title: "client未初始化",
        icon: "none",
        duration: 500,
      });
      return false;
    }
    try {
      const result = await client.stopDirectLiveStreaming("default");
      this.setData({
        directLiveStatus: false,
      });
      wx.showToast({
        title: "停止单路转推成功",
        icon: "none",
        duration: 500,
      });
    } catch (e) {
      console.log(e);
      wx.showToast({
        title: e.message,
        icon: "none",
        duration: 500,
      });
    }
  }),
  handleEvent(client) {
    client.on("user-joined", (user, userData) => {
      console.log("event: user-joined - 用户加入房间", user, userData);
      this.setData({
        userList: [...this.data.userList, { playerid: user }],
      });
    });
    client.on("user-left", (user) => {
      console.log("event: user-left - 用户离开房间", user);
      this.setData({
        subscribeList: this.data.subscribeList.filter((v) => v.userID !== user),
        userList: this.data.userList.filter((v) => v.playerid !== user),
      });
      console.log("user-leave`subscribeList:", this.data.subscribeList);
    });
    client.on("user-published", async (user, tracks) => {
      console.log("event: user-published - 用户发布", user, tracks);
      if (user === this.data.playerId) {
        return false;
      }
      let remoteTracks = [...tracks]
      remoteTracks.forEach(item => {
        item.h = 100;
        item.w = 100;
        item.x = 0;
        item.y = 0;
        item.z = 0;
        item.stretchMode = 0;
        item.on("mute-state-changed", () => {
          this.setData({
            subscribeList: this.data.subscribeList
          })
        })
      })
      this.setData({ remoteTracks: [...this.data.remoteTracks, ...remoteTracks] });
      if (this.data.subscribeList.find((item) => item.userID === user)) {
        return false;
      }
      let config = {};
      let videoTrackIndex = remoteTracks.findIndex((item) => item.isVideo());
      let audioTrackIndex = remoteTracks.findIndex((item) => item.isAudio());
      if (videoTrackIndex >= 0) {
        config.videoTrack = remoteTracks[videoTrackIndex];
      }
      if (audioTrackIndex >= 0) {
        config.audioTrack = remoteTracks[audioTrackIndex];
      }
      const url = await client.subscribe(config);
      this.setData({
        subscribeList: [
          ...this.data.subscribeList,
          {
            url,
            key: user + Math.random().toString(36).slice(-8),
            userID: user,
            audioTrack: remoteTracks[audioTrackIndex],
            videoTrack: remoteTracks[videoTrackIndex]
          },
        ],
      });
    });
    client.on("user-unpublished", (user, tracks) => {
      console.log("event: user-unpublished - 用户取消发布", user, tracks);
      const { remoteTracks, subscribeList } = this.data;
      for (const track of tracks) {
        const idx = remoteTracks.findIndex(
          (item) => item.trackID === track.trackID
        );
        if (idx !== -1) {
          remoteTracks.splice(idx, 1);
        }
        subscribeList.map((ele, index) => {
          if (ele.url.indexOf(track.trackID) !== -1) {
            return subscribeList.splice(index, 1);
          }
        });
      }
      this.setData({ remoteTracks, subscribeList });
    });
    client.on("connection-state-changed", (state, info) => {
      console.log("event: connection-state-changed - 用户连接状态发生改变", state, info);
      if (state === "DISCONNECTED" && info.reason === "ERROR") {
        this.reconnect();
      }
    });
    client.on("message-received", (message) => {
      console.log("event: message-received - 用户接收消息", message);
      this.setData({
        messageList: [...this.data.messageList, message],
      });
    });
  },
  handlePusherStateChange(e) {
    QNRTC.updatePusherStateChange(e);
    console.log("pusher state", e.detail.code, e.detail.message);
  },
  handlerPusherNetStatus(e) {
    QNRTC.updatePusherNetStatus(e);
    console.log(
      "pusher net status",
      "videoBitrate: ",
      e.detail.info.videoBitrate,
      "audioBitrate: ",
      e.detail.info.audioBitrate
    );
  },
  handlePlayerStateChange(e) {
    QNRTC.updatePlayerStateChange(e);
    console.log("player state", e.detail.code, e.detail.message);
  },
  handlePlayerNetStatus(e) {
    QNRTC.updatePlayerNetStatus(e);
    console.log(
      "player net status",
      "videoBitrate: ",
      e.detail.info,
      "audioBitrate: ",
      e.detail.info.audioBitrate
    );
  },
  handleOpenMergeList() {
    this.setData({
      mergeModal: true,
    });
  },
  handleCloseMergeList() {
    this.setData({
      mergeModal: false,
    });
  },
  handleOpenChat() {
    this.setData({
      chatModal: true,
    });
  },
  handleCloseChat() {
    this.setData({
      chatModal: false,
    });
  },
  handleInitRemoteTrack() {
    this.setData({
      remoteTracks: this.data.remoteTracks,
    });
  },
  reconnect() {
    console.log("尝试重连中...");
    wx.showToast({
      title: "尝试重连中...",
      icon: "loading",
      mask: true,
      fail: (data) => console.log("fail", data),
    });
    this.setData({
      publishPath: "",
      subscribeList: [],
    });
    const { pushContext } = this.data;
    if (pushContext) {
      pushContext.stop();
    }
    this.reconnectTimer = setTimeout(() => {
      const app = getApp();
      if (app.roomToken) {
        this.initRoomWithToken(app.roomToken, app.url)
          .then(() => {
            wx.hideToast({
              fail: () => {
                console.log("消息隐藏失败");
              },
            });
          })
          .catch((e) => {
            console.log(`reconnect failed: ${e}`);
            return this.reconnect();
          });
      } else if (this.appid && this.roomName && this.userid) {
        this.initRoom(this.appid, this.roomName, this.userid, app.url)
          .then(() => {
            wx.hideToast({
              fail: () => {
                console.log("消息隐藏失败");
              },
            });
          })
          .catch((e) => {
            console.log(`reconnect failed: ${e}`);
            return this.reconnect();
          });
      } else {
        wx.reLaunch({
          url: "/pages/index/index",
          success: () => {
            wx.showToast({
              title: "加入房间失败",
              icon: "none",
              fail: (data) => console.log("fail", data),
            });
          },
        });
      }
    }, 1000);
  },
});
