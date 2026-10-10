const content = require('../../utils/content')

const W = 750
const PAD = 60
const ACCENT = '#c2410c'

// 按像素宽度逐字折行，canvas 没有自动换行
function wrap(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth) {
      lines.push(line)
      line = ch
    } else {
      line += ch
    }
  }
  if (line) lines.push(line)
  return lines
}

// 通过云函数拿小程序码，没开云开发就返回 null，海报改用文字提示
async function fetchWxacodePath(id) {
  if (!wx.cloud) return null
  try {
    const { result } = await wx.cloud.callFunction({
      name: 'getWxacode',
      data: { scene: id, page: 'pages/item/item' }
    })
    if (!result || !result.base64) return null
    const path = `${wx.env.USER_DATA_PATH}/wxacode-${id}.png`
    wx.getFileSystemManager().writeFileSync(path, result.base64, 'base64')
    return path
  } catch (err) {
    console.warn('小程序码获取失败', err)
    return null
  }
}

function loadImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const img = canvas.createImage()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

Page({
  data: { height: 1000, ready: false },

  async onLoad(query) {
    this.item = content.getItem(query.id)
    if (!this.item) return
    wx.showLoading({ title: '生成中' })
    try {
      await this.draw()
      this.setData({ ready: true })
    } finally {
      wx.hideLoading()
    }
  },

  getCanvas() {
    return new Promise(resolve => {
      wx.createSelectorQuery().select('#poster').fields({ node: true, size: true }).exec(res => resolve(res[0].node))
    })
  },

  async draw() {
    const item = this.item
    const canvas = await this.getCanvas()
    const ctx = canvas.getContext('2d')
    const dpr = wx.getWindowInfo().pixelRatio
    const textWidth = W - PAD * 2

    // 先量好各段文字行数，再定画布高度
    ctx.font = 'bold 44px sans-serif'
    const titleLines = wrap(ctx, item.title, textWidth)
    ctx.font = '30px sans-serif'
    const plainLines = wrap(ctx, item.plain, textWidth)
    const height = 140 + titleLines.length * 62 + 40 + plainLines.length * 48 + 300

    this.setData({ height })
    canvas.width = W * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, height)
    ctx.fillStyle = ACCENT
    ctx.fillRect(0, 0, W, 12)

    let y = 100
    ctx.fillStyle = ACCENT
    ctx.font = '26px sans-serif'
    ctx.fillText(`证据等级 ${item.evidence} · 性价比${item.ratio}`, PAD, y)

    y += 70
    ctx.fillStyle = '#1f1f1f'
    ctx.font = 'bold 44px sans-serif'
    titleLines.forEach(l => { ctx.fillText(l, PAD, y); y += 62 })

    y += 30
    ctx.fillStyle = '#444444'
    ctx.font = '30px sans-serif'
    plainLines.forEach(l => { ctx.fillText(l, PAD, y); y += 48 })

    // 底部：出处 + 小程序码
    const footerTop = height - 220
    ctx.fillStyle = '#ebebe8'
    ctx.fillRect(PAD, footerTop, textWidth, 2)
    ctx.fillStyle = '#8a8a8a'
    ctx.font = '22px sans-serif'
    ctx.fillText(`出自《高性价比人生指南》第 ${item.section} 节`, PAD, footerTop + 60)
    ctx.fillText('作者 eternity4719 · CC BY 4.0 · 经改编', PAD, footerTop + 96)
    ctx.fillStyle = '#1f1f1f'
    ctx.font = 'bold 26px sans-serif'
    ctx.fillText('遇事不慌清单', PAD, footerTop + 150)

    const codePath = await fetchWxacodePath(item.id)
    if (codePath) {
      const img = await loadImage(canvas, codePath)
      ctx.drawImage(img, W - PAD - 160, footerTop + 30, 160, 160)
    } else {
      ctx.fillStyle = '#8a8a8a'
      ctx.font = '22px sans-serif'
      ctx.fillText('微信里搜「遇事不慌清单」', PAD, footerTop + 186)
    }
    this.canvas = canvas
  },

  save() {
    wx.canvasToTempFilePath({
      canvas: this.canvas,
      success: ({ tempFilePath }) => {
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => wx.showToast({ title: '已保存到相册' }),
          fail: () => wx.showToast({ title: '没有相册权限', icon: 'none' })
        })
      }
    })
  }
})
