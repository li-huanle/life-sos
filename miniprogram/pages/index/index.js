const content = require('../../utils/content')
const storage = require('../../utils/storage')

const MODE_KEY = 'homeMode'

Page({
  data: { mode: 'category', groups: [] },

  onLoad() {
    this.setData({ mode: wx.getStorageSync(MODE_KEY) || 'category' })
  },

  onShow() {
    // 每次回到首页刷新进度
    this.render()
  },

  render() {
    const groups = content.getGroups(this.data.mode).map(g => ({
      ...g,
      scenes: g.scenes.map(key => {
        const s = content.getScene(key)
        const total = s.steps.reduce((n, st) => n + st.ids.length, 0)
        const done = Object.keys(storage.getDone(key)).length
        return { key, icon: s.icon, title: s.title, subtitle: s.subtitle, total, done }
      })
    }))
    this.setData({ groups })
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    if (mode === this.data.mode) return
    wx.setStorageSync(MODE_KEY, mode)
    this.setData({ mode }, () => this.render())
  },

  openScene(e) {
    wx.navigateTo({ url: `/pages/scene/scene?key=${e.currentTarget.dataset.key}` })
  },

  openSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  onShareAppMessage() {
    return { title: '遇事不慌清单：被裁、被骗、家人去世，照着清单一步步办', path: '/pages/index/index' }
  }
})
