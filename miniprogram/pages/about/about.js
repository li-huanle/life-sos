const { meta } = require('../../utils/content')

Page({
  data: {
    commit: (meta.upstream_commit || '').slice(0, 7),
    syncedAt: (meta.synced_at || '').slice(0, 10),
    repo: meta.source_repo
  },

  copyRepo() {
    wx.setClipboardData({ data: this.data.repo })
  }
})
