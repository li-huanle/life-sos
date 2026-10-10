App({
  onLaunch() {
    // 接云开发后填环境 ID，用于生成小程序码；没开通时海报退化为文字提示
    if (wx.cloud) {
      wx.cloud.init({ env: '', traceUser: false })
    }
  }
})
