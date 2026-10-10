# 出事了先做什么（life-sos）

基于《高性价比人生指南》（[HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter)，CC BY 4.0）的微信小程序。把"出了事怎么办"的建议按场景和先后顺序排成清单。

## 目录

```
scenes.config.json        场景 → 条目映射（改场景只改这里）
tools/build_data.py       把 htlb-dataset 裁成 miniprogram/data/content.js
tools/scenes.lock.json    锁定每个 id 对应的标题，防止上游编号漂移
miniprogram/              小程序本体（原生）
cloudfunctions/getWxacode 生成带条目 id 的小程序码，供海报使用
.github/workflows/sync.yml 每天同步上游，编号漂移时 CI 失败
```

## 更新内容

```bash
curl -fsSL -o _upstream_data/htlb.json https://raw.githubusercontent.com/sin0317/htlb-dataset/main/data/htlb.json
python3 -I tools/build_data.py _upstream_data/htlb.json
```

改了 `scenes.config.json` 或上游标题变了，核对无误后加 `--update-lock`。

## 跑起来

1. 微信开发者工具 → 导入项目 → 选本目录，AppID 先用测试号
2. 海报里的小程序码需要开通云开发：在 `miniprogram/app.js` 填环境 ID，右键 `cloudfunctions/getWxacode` 上传并部署。不开也能用，海报会改成文字提示
3. 保存海报到相册要在后台填《用户隐私保护指引》（写入相册）

## 上线前

- [ ] 注册小程序，确认个人主体可选的服务类目；`medical: true` 的场景视审核结果开关
- [ ] 小程序备案
- [ ] 向上游 `衍生项目.md` 提 PR（写明出处和许可）
