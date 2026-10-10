const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// scene 最长 32 个字符，这里只放条目 id（如 19-4）
exports.main = async ({ scene, page }) => {
  const res = await cloud.openapi.wxacode.getUnlimited({
    scene,
    page,
    checkPath: false,
    width: 280
  })
  return { base64: res.buffer.toString('base64') }
}
