const { scenes } = require('../../utils/content')
const storage = require('../../utils/storage')

Page({
  data: { scenes: [] },

  onShow() {
    // 每次回到首页刷新进度
    this.setData({
      scenes: scenes.map(s => {
        const total = s.steps.reduce((n, st) => n + st.ids.length, 0)
        const done = Object.keys(storage.getDone(s.key)).length
        return { ...s, total, done }
      })
    })
  },

  openScene(e) {
    wx.navigateTo({ url: `/pages/scene/scene?key=${e.currentTarget.dataset.key}` })
  },

  openSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  onShareAppMessage() {
    return { title: '出事了先做什么：被裁、被骗、家人去世，照着清单一步步办', path: '/pages/index/index' }
  }
})
