
const app = getApp()
Component({
  options: {
    addGlobalClass: true
  },
  properties: {
    show: {
      type: Boolean,
      value: true,
      height: 'auto'
    },
    height: {
      type: String,
      value: '800rpx'
    },
    userList: {
      type: Array,
      value: []
    },
    messageList: {
      type: Array,
      value: []
    }
  },
  data: {
    isIPX: app.globalData.isIPX,
    selectUser: '',
    content: ''
  },
  methods: {
    handleCloseModal() {
      this.triggerEvent('close')
    },
    onUserChange({ detail }) {
      this.setData({
        selectUser: this.properties.userList[~~detail.value].playerid
      })
    },
    onContentChange({ detail }) {
      this.setData({
        content: detail.value
      })
    },
    handleSubmitMessage() {
      app.globalData.client.sendMessage("test",this.data.content,this.data.selectUser ? [{userID: this.data.selectUser}] : [])
    }
  },
})
