
export const HOST = 'https://api-demo.qnsdk.com';

export const PREFIX = '/v1/rtc';

const getAppId = () => getApp().appid

export const API = {
  LIST_ROOM: () => `/rooms/app/${getAppId()}`,
  LIST_USERS: (appid, roomid) =>
    `${HOST}${PREFIX}/users/app/${appid || getAppId()}/room/${roomid}`,
  GET_APP_CONFIG: (appid) =>
    `${HOST}${PREFIX}/app/${appid || getAppId()}`,
  JOIN_ROOM_TOKEN: (roomid, userid, appid) =>
    `${HOST}${PREFIX}/token/app/${appid || getAppId()}/room/${roomid}/user/${userid}`,
  CREATE_ROOM_TOKEN: (roomid, userid, appid) =>
    `${HOST}${PREFIX}/token/admin/app/${appid || getAppId()}/room/${roomid}/user/${userid}`,
};

export const getToken = ( appid, roomid, userid ) => {
  return new Promise((resolve, reject) => {
    const api = userid === 'admin' ? API.CREATE_ROOM_TOKEN : API.JOIN_ROOM_TOKEN;
    // 此处服务器 URL 仅用于 Demo 测试！随时可能 修改/失效，请勿用于 App 线上环境！
    // 此处服务器 URL 仅用于 Demo 测试！随时可能 修改/失效，请勿用于 App 线上环境！
    // 此处服务器 URL 仅用于 Demo 测试！随时可能 修改/失效，请勿用于 App 线上环境！
    const requestURL = `${api(roomid, userid, appid)}?bundleId=demo-rtc.qnsdk.com`;
    wx.request({
      url:requestURL,
      success: (res) => {
        const code = res.statusCode;
        if (code >= 200 && code < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject,
    });
  })
}
