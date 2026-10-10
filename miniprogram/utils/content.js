const data = require('../data/content.js')

const scenes = data.scenes
const items = data.items

function getScene(key) {
  return scenes.find(s => s.key === key)
}

function getItem(id) {
  return items[id]
}

// 在已打包的条目里做简单全文匹配；全书搜索留到接云端数据之后
function search(keyword) {
  const kw = (keyword || '').trim()
  if (!kw) return []
  return Object.values(items).filter(it =>
    [it.title, it.plain, it.cost_text, it.note].some(t => t && t.includes(kw))
  )
}

// 首页两种分组：categories 按场景类型，stages 按人生阶段
function getGroups(mode) {
  return mode === 'stage' ? data.stages : data.categories
}

module.exports = { meta: data.meta, scenes, getScene, getItem, getGroups, search }
