import { checkPermission } from "./common/utils";

App({
  roomName: undefined,
  appid: 'd8lk7l4ed',
  userId: undefined,
  roomToken: undefined,
  url: 'wss://rtmpgate.cloudvdn.com/',

  onLaunch: function () {
    checkPermission()
  },
})