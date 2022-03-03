
export const verifyUserId = str => str && /^[a-zA-Z0-9_-]{3,50}$/.test(str)

export const verifyRoomId = str => str && /^[a-zA-Z0-9_-]{3,64}$/.test(str)

export const checkPermission = () => {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.record']) {
        wx.authorize({
          scope: 'scope.record',
          success() {
            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
          },
          fail: () => {
            wx.showModal({
              title: '缺少录音权限',
              content: '请前往设置打开小程序设置',
              confirmText: '前往设置',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting({
                    success(res) {
                      console.log(res.authSetting)
                      checkPermission()
                    }
                  })
                }
              },
            })
          }
        })
      }

      if (!res.authSetting['scope.camera']) {
        wx.authorize({
          scope: 'scope.camera',
          success() {
            // 用户已经同意小程序使用摄像头功能，后续调用 wx.startRecord 接口不会弹窗询问
          },
          fail: () => {
            wx.showModal({
              title: '缺少摄像头权限',
              content: '请前往设置打开小程序设置',
              confirmText: '前往设置',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  wx.openSetting({
                    success(res) {
                      console.log(res.authSetting)
                      checkPermission()
                    }
                  })
                }
              },
            })
          }
        })
      }
      wx.getSystemInfo({
        success(res) {
          const cameraAuthorized = res.cameraAuthorized
          const microphoneAuthorized = res.microphoneAuthorized
          console.log('摄像头权限:' + cameraAuthorized)
          console.log('麦克风权限:' + microphoneAuthorized)
          // cameraAuthorized & microphoneAuthorized 在 小程序 lib 2.6.0 开始支持
          if (cameraAuthorized === false || microphoneAuthorized === false) {
            wx.showModal({
              title: '缺少权限',
              content: '请前往系统设置打开微信的摄像头和麦克风权限',
              confirmText: '知道了',
              showCancel: false,
              success: (res) => {
                if (res.confirm) {
                  checkPermission()
                }
              },
            })
          }
        }
      })
    }
  })
}

function isObject(obj) {
  return typeof obj === 'object' && obj != null
}

export const deepClone = (source, hash = new WeakMap()) => {
  if (!isObject(source)) return source
  if (hash.has(source)) return hash.get(source)
  const target = Array.isArray(source) ? [] : {}
  hash.set(source, target)
  // eslint-disable-next-line no-restricted-syntax
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = deepClone(source[key], hash)
    }
  }
  return target
}

export const debounce = (func, wait, immediate) => {
  let timeout
  let result
  const debounced = function () {
    const context = this
    const args = arguments
    if (timeout) clearTimeout(timeout)

    const later = function () {
      timeout = null
      if (!immediate) result = func.apply(context, args)
    }
    const callNow = immediate && !timeout
    timeout = setTimeout(later, wait)
    if (callNow) result = func.apply(this, args)
    return result
  }
  debounced.cancel = function () {
    clearTimeout(timeout)
    timeout = null
  }
  return debounced
}
