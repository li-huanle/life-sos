const content = require('../../utils/content')
const storage = require('../../utils/storage')

Page({
  data: { list: [] },

  onShow() {
    // 上游删掉的条目在这里静默跳过
    this.setData({ list: storage.listFavorites().map(id => content.getItem(id)).filter(Boolean) })
  },

  openItem(e) {
    wx.navigateTo({ url: `/pages/item/item?id=${e.currentTarget.dataset.id}` })
  }
})
