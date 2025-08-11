import { verifyRoomId, verifyUserId, debounce } from "../../common/utils";
import { getToken } from "../../common/api";
import QNRTC from "qnwxapp-rtc";

const app = getApp();
Page({
  data: {
    rtmpUrl: "",
    token: "",
    playerId: "",
    client: null,
    pushContext: null,
    mic: true,
    volume: true,
    publishPath: undefined,
    subscribeList: [],
    room: "",  
    appid: ""
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
    this.setData({ playerId: userid, room, appid });
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
      } else if (status === "COMPLETED") {
        console.log("local-track-add", data.tracks);
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
  onPhoneTab() {
    wx.navigateBack({ delta: 1 });
  },
  async initRoom(appid, room, userid, url) {
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
  handleEvent(client) {
    client.on("user-joined", (user, userData) => {
      console.log("event: user-joined - 用户加入房间", user, userData);
    });
    client.on("user-left", (user) => {
      console.log("event: user-left - 用户离开房间", user);
      this.setData({
        subscribeList: this.data.subscribeList.filter((v) => v.userID !== user),
      });
      console.log("user-leave`subscribeList:", this.data.subscribeList);
    });
    client.on("user-published", async (user, tracks) => {
      console.log("event: user-published - 用户发布", user, tracks);
      if (user === this.data.playerId) {
        return false;
      }
      tracks.forEach(item => {
        item.on("mute-state-changed", () => {
          console.log("这个有啥作用哦")
          this.setData({
            subscribeList: this.data.subscribeList
          })
        })
      })
      let config = {};
      let audioList = tracks.filter(item => item.isAudio());
      if(audioList.length) {
        config = {
          audioTrack: audioList[0]
        }
      }
      const url = await client.subscribe(config);
      console.log(url, 'testURL');
      this.setData({
        subscribeList: [
          ...this.data.subscribeList,
          {
            url,
            key: user + Math.random().toString(36).slice(-8),
            userID: user,
            audioTrack: config.audioTrack
          },
        ],
      });
    });
    client.on("user-unpublished", (user, tracks) => {
      console.log("event: user-unpublished - 用户取消发布", user, tracks);
      const { subscribeList } = this.data;
      for (const track of tracks) {
        subscribeList.map((ele, index) => {
          if (ele.url.indexOf(track.trackID) !== -1) {
            return subscribeList.splice(index, 1);
          }
        });
      }
      this.setData({ subscribeList });
    });
    client.on("connection-state-changed", (state, info) => {
      console.log("event: connection-state-changed - 用户连接状态发生改变", state, info);
      if (state === "DISCONNECTED" && info.reason === "ERROR") {
        this.reconnect();
      }
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
            if (pushContext) {
              pushContext.start();
            }
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
      } else if (this.data.appid && this.data.room && this.data.userid) {
        this.initRoom(this.data.appid, this.data.room, this.data.userid, app.url)
          .then(() => {
            if (pushContext) {
              pushContext.start();
            }
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
