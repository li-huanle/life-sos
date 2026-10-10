const content = require('../../utils/content')
const storage = require('../../utils/storage')

Page({
  data: { item: null, fav: false },

  onLoad(query) {
    // 扫小程序码进来时 id 在 scene 参数里
    const id = query.id || decodeURIComponent(query.scene || '')
    const item = content.getItem(id)
    if (!item) {
      wx.showToast({ title: '条目不存在', icon: 'none' })
      return
    }
    this.setData({ item, fav: storage.isFavorite(item.id) })
  },

  toggleFav() {
    const fav = storage.toggleFavorite(this.data.item.id)
    this.setData({ fav })
    wx.showToast({ title: fav ? '已收藏' : '已取消', icon: 'none' })
  },

  copySource(e) {
    wx.setClipboardData({ data: e.currentTarget.dataset.url })
  },

  makePoster() {
    wx.navigateTo({ url: `/pages/poster/poster?id=${this.data.item.id}` })
  },

  onShareAppMessage() {
    const { item } = this.data
    return { title: item.title, path: `/pages/item/item?id=${item.id}` }
  }
})
