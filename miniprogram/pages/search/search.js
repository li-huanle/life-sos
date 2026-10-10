const content = require('../../utils/content')

Page({
  data: { keyword: '', results: [], searched: false },

  onInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword, results: content.search(keyword), searched: !!keyword.trim() })
  },

  openItem(e) {
    wx.navigateTo({ url: `/pages/item/item?id=${e.currentTarget.dataset.id}` })
  }
})
