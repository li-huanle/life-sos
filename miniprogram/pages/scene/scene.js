const content = require('../../utils/content')
const storage = require('../../utils/storage')

Page({
  data: { scene: null, steps: [], done: {}, doneCount: 0, total: 0 },

  onLoad(query) {
    const scene = content.getScene(query.key)
    if (!scene) {
      wx.showToast({ title: '场景不存在', icon: 'none' })
      return
    }
    wx.setNavigationBarTitle({ title: scene.title })
    const steps = scene.steps.map(st => ({
      stage: st.stage,
      items: st.ids.map(id => content.getItem(id)).filter(Boolean)
    }))
    const total = steps.reduce((n, st) => n + st.items.length, 0)
    this.setData({ scene, steps, total })
  },

  onShow() {
    if (!this.data.scene) return
    this.refreshDone(storage.getDone(this.data.scene.key))
  },

  refreshDone(done) {
    this.setData({ done, doneCount: Object.keys(done).length })
  },

  toggle(e) {
    this.refreshDone(storage.toggleDone(this.data.scene.key, e.currentTarget.dataset.id))
  },

  openItem(e) {
    wx.navigateTo({ url: `/pages/item/item?id=${e.currentTarget.dataset.id}` })
  },

  reset() {
    wx.showModal({
      title: '清空打勾？',
      success: res => {
        if (!res.confirm) return
        storage.resetDone(this.data.scene.key)
        this.refreshDone({})
      }
    })
  },

  onShareAppMessage() {
    const { scene } = this.data
    return {
      title: `${scene.title}，先做这几件事`,
      path: `/pages/scene/scene?key=${scene.key}`
    }
  }
})
