import { debounce } from "../../common/utils";

const app = getApp();
Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    show: {
      type: Boolean,
      value: true,
      height: "auto",
    },
    rtmpUrl: {
      type: String,
      value: "",
      observer(newVal) {
        this.setData({
          "mergeOption.publishUrl": newVal,
        });
      },
    },
    height: {
      type: String,
      value: "800rpx",
    },
    remoteTracks: {
      type: Array,
      value: [],
    }
  },
  data: {
    isIPX: app.globalData.isIPX,
    showBackground: true,
    // 0未创建 1已创建 2编辑中
    jobStatus: 0,
    stretchModeList: ["aspectFill", "aspectFit", "scaleToFit"],
    mergeOption: {
      publishUrl: "",
      id: "",
      stretchMode: 0,
      watermarks: [],
      background: {
        url: "http://pili-playback.qnsdk.com/ivs_background_1280x720.png",
        h: 480,
        w: 640,
        x: 0,
        y: 0,
      },
      audioOnly: false,
      kbps: 1000,
      fps: 25,
      maxRate: 1000,
      minRate: 1000,
      holdLastFrame: false,
      width: 640,
      height: 480,
    },
  },
  methods: {
    handleCloseModal() {
      this.triggerEvent("close");
    },
    onFormDataChange({ currentTarget, detail }) {
      this.setData({
        [currentTarget.dataset.key]: detail.value,
      });
    },
    onFormDataNumberChange({ currentTarget, detail }) {
      this.setData({
        [currentTarget.dataset.key]: detail.value * 1,
      });
    },
    onRemoteTrackNumberChange(e) {
      this.setData({
        [e.currentTarget.dataset.key]: e.detail.value * 1,
      });
      if (
        this.properties.remoteTracks[e.currentTarget.dataset.index].status === 1
      ) {
        this.handleAddMergeTracks(e);
      }
    },
    onRemoteTrackChange(e) {
      this.setData({
        [e.currentTarget.dataset.key]: e.detail.value,
      });
      if (
        this.properties.remoteTracks[e.currentTarget.dataset.index].status === 1
      ) {
        this.handleAddMergeTracks(e);
      }
    },
    handleAddBackground() {
      this.setData({
        showBackground: true,
      });
      wx.showToast({
        title: "添加成功",
        icon: "none",
        duration: 500,
      });
    },
    handleCloseBackground() {
      this.setData({
        "mergeOption.background": {
          url: "",
          h: 0,
          w: 0,
          x: 0,
          y: 0,
        },
        showBackground: false,
      });
      wx.showToast({
        title: "关闭成功",
        icon: "none",
        duration: 500,
      });
    },
    handleAddWatermark: debounce(
      function () {
        this.data.mergeOption.watermarks.push({
          url: "",
          h: 0,
          w: 0,
          x: 0,
          y: 0,
        });
        this.setData({
          "mergeOption.watermarks": this.data.mergeOption.watermarks,
        });
        wx.showToast({
          title: "添加成功",
          icon: "none",
          duration: 500,
        });
      },
      700,
      true
    ),
    handleCloseWatermarks(index) {
      this.data.mergeOption.watermarks.splice(index, 1);
      this.setData({
        "mergeOption.watermarks": this.data.mergeOption.watermarks,
      });
      wx.showToast({
        title: "关闭成功",
        icon: "none",
        duration: 500,
      });
    },
    handleCreateMergeJob: debounce(
      async function () {
        const mergeOption = this.data.mergeOption;
        const client = app.globalData.client;
        if (!mergeOption.id) {
          wx.showToast({
            title: "合流id不能为空",
            icon: "none",
            duration: 500,
          });
          return false;
        }
        if (client === null) {
          wx.showToast({
            title: "client未初始化",
            icon: "none",
            duration: 500,
          });
          return false;
        }
        const stretchMode = this.data.stretchModeList[mergeOption.stretchMode];
        const option = mergeOption;
        try {
          await client.startTranscodingLiveStreaming({
            streamID: mergeOption.id,
            ...option,
            renderMode: stretchMode,
          });
          wx.showToast({
            title:
              this.data.jobStatus === 0 ? "创建合流成功" : "编辑合流成功",
            icon: "none",
            duration: 500,
          });
          this.setData({
            jobStatus: 1,
          });
        } catch (e) {
          console.log(e);
          wx.showToast({
            title: this.data.jobStatus === 0 ? "创建合流失败" : "编辑合流失败",
            icon: "none",
            duration: 500,
          });
        }
      },
      700,
      true
    ),
    async handleAddMergeTracks({ currentTarget }) {
      const item = this.properties.remoteTracks[currentTarget.dataset.index];
      try {
        await app.globalData.client.setTranscodingLiveStreamingTracks(
          this.data.mergeOption.id,
          [
            {
              trackID: item._trackID,
              height: ~~item.h,
              width: ~~item.w,
              x: ~~item.x,
              y: ~~item.y,
              zOrder: ~~item.z,
              renderMode: this.data.stretchModeList[item.stretchMode],
            },
          ]
        );
        this.setData({
          [`remoteTracks[${currentTarget.dataset.index}].status`]: 1,
        });
      }catch(e) {
        wx.showToast({
          title: e.message,
          icon: "none",
          duration: 500,
        });
      }
    },
    async handleDeleteMergeTracks({ currentTarget }) {
      const item = this.properties.remoteTracks[currentTarget.dataset.index];
      try {
        await app.globalData.client.removeTranscodingLiveStreamingTracks(
          this.data.mergeOption.id,
          [
            {
              trackID: item._trackID,
              height: ~~item.h,
              width: ~~item.w,
              x: ~~item.x,
              y: ~~item.y,
              zOrder: ~~item.z,
              renderMode: this.data.stretchModeList[item.stretchMode],
            },
          ]
        );
        this.setData({
          [`remoteTracks[${currentTarget.dataset.index}].status`]: 0,
        });
      }catch(e) {
        wx.showToast({
          title: e.message,
          icon: "none",
          duration: 500,
        });
      }
    },
    handleEditMergeJob() {
      this.setData({
        jobStatus: 2,
      });
    },
    // 停止合流
    handleDeleteMergeJob: debounce(
      async function () {
        try {
          await app.globalData.client.stopTranscodingLiveStreaming(
            this.data.mergeOption.id
          );
          this.setData({
            jobStatus: 0,
          });
          wx.showToast({
            title: "关闭合流成功",
            icon: "none",
            duration: 500,
          });
          this.triggerEvent("initRemoteTrack");
        } catch(e) {
          wx.showToast({
            title: "关闭合流失败",
            icon: "none",
            duration: 500,
          });
        }
      },
      700,
      true
    ),
  },
});
