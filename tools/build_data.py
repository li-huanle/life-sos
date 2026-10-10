"""把 htlb-dataset 的 htlb.json 按 scenes.config.json 裁剪成小程序可用的 content.js。

用法：
  python3 -I tools/build_data.py <htlb.json> [--check]

上游条目编号会随正文增删而变化，所以每次构建都和 tools/scenes.lock.json 里记下的
标题对账：id 对应的标题变了就报错，避免同一个 id 悄悄指向另一条建议。
确认改动无误后加 --update-lock 重写锁文件。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "scenes.config.json"
LOCK = ROOT / "tools" / "scenes.lock.json"
OUT = ROOT / "miniprogram" / "data" / "content.js"

KEEP_FIELDS = [
    "id", "section", "section_title", "title", "ratio", "evidence", "disputed",
    "cost_text", "plain", "benefit_text", "note", "sources",
]
MD_LINK = re.compile(r"\[([^\]]+)\]\([^)]*\)")


def clean(text):
    # 小程序里不渲染 Markdown，链接只保留文字
    return MD_LINK.sub(r"\1", text or "").strip()


def main(argv):
    if not argv or argv[0].startswith("--"):
        sys.exit(__doc__)
    src = Path(argv[0])
    check_only = "--check" in argv
    update_lock = "--update-lock" in argv

    dataset = json.loads(src.read_text(encoding="utf-8"))
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    items_by_id = {i["id"]: i for i in dataset["items"]}
    lock = json.loads(LOCK.read_text(encoding="utf-8")) if LOCK.exists() else {}

    errors, used, scenes = [], {}, []
    for scene in config["scenes"]:
        if not scene.get("enabled", True):
            continue
        steps = []
        for step in scene["steps"]:
            for iid in step["ids"]:
                item = items_by_id.get(iid)
                if item is None:
                    errors.append(f"[{scene['key']}] 上游已没有条目 {iid}")
                    continue
                if not update_lock and iid in lock and lock[iid] != item["title"]:
                    errors.append(
                        f"[{scene['key']}] {iid} 标题变了：\n    锁定：{lock[iid]}\n    现在：{item['title']}"
                    )
                used[iid] = item
            steps.append({"stage": step["stage"], "ids": step["ids"]})
        scenes.append({k: scene[k] for k in ("key", "title", "subtitle", "icon", "medical")} | {"steps": steps})

    new_ids = sorted(set(used) - set(lock), key=lambda s: tuple(map(int, s.split("-"))))
    if new_ids and not update_lock:
        errors.append("这些 id 还没锁定标题，核对后用 --update-lock：" + ", ".join(new_ids))

    if errors:
        print("\n".join(errors), file=sys.stderr)
        sys.exit(1)

    items = {}
    for iid, item in used.items():
        kept = {k: item.get(k) for k in KEEP_FIELDS}
        for k in ("cost_text", "plain", "benefit_text", "note"):
            kept[k] = clean(kept[k])
        items[iid] = kept

    payload = {
        "meta": {
            "upstream_commit": dataset["meta"].get("upstream_commit"),
            "synced_at": dataset["meta"].get("synced_at"),
            "source_repo": dataset["meta"].get("source_repo"),
        },
        "scenes": scenes,
        "items": items,
    }
    print(f"{len(scenes)} 个场景，{len(items)} 条，上游 {payload['meta']['upstream_commit'][:7]}")

    if check_only:
        return
    if update_lock:
        LOCK.write_text(
            json.dumps({i: used[i]["title"] for i in sorted(used, key=lambda s: tuple(map(int, s.split("-"))))},
                       ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
        print(f"已更新 {LOCK.relative_to(ROOT)}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "// 由 tools/build_data.py 生成，不要手改\nmodule.exports = "
        + json.dumps(payload, ensure_ascii=False, indent=1) + "\n",
        encoding="utf-8",
    )
    print(f"已写入 {OUT.relative_to(ROOT)}（{OUT.stat().st_size // 1024} KB）")


if __name__ == "__main__":
    main(sys.argv[1:])
