// 收藏和打勾只存在本机，不做登录
const FAV_KEY = 'favorites'
const DONE_KEY = 'done'

function read(key) {
  return wx.getStorageSync(key) || {}
}

function isFavorite(id) {
  return !!read(FAV_KEY)[id]
}

function toggleFavorite(id) {
  const favs = read(FAV_KEY)
  if (favs[id]) delete favs[id]
  else favs[id] = Date.now()
  wx.setStorageSync(FAV_KEY, favs)
  return !!favs[id]
}

function listFavorites() {
  const favs = read(FAV_KEY)
  return Object.keys(favs).sort((a, b) => favs[b] - favs[a])
}

// 打勾按场景分开存：同一条在不同场景里可能处境不同
function getDone(sceneKey) {
  return read(DONE_KEY)[sceneKey] || {}
}

function toggleDone(sceneKey, id) {
  const all = read(DONE_KEY)
  const done = all[sceneKey] || {}
  if (done[id]) delete done[id]
  else done[id] = true
  all[sceneKey] = done
  wx.setStorageSync(DONE_KEY, all)
  return done
}

function resetDone(sceneKey) {
  const all = read(DONE_KEY)
  delete all[sceneKey]
  wx.setStorageSync(DONE_KEY, all)
}

module.exports = { isFavorite, toggleFavorite, listFavorites, getDone, toggleDone, resetDone }
