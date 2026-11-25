#!/usr/bin/env python3
"""单文件精读页的结构自检。

用法:
    python3 scripts/check_page.py index.html

检查项:
  - 标签闭合 / 嵌套错位
  - 重复 id，以及指向不存在锚点的站内链接
  - 小节、精读卡、词表行、语法卡、ruby 的数量
  - <html lang>、外链 rel=noopener、img alt

有问题时以非零状态退出，可直接接在生成流程后面。
"""
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}


class Checker(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []
        self.ids = {}
        self.anchors = []
        self.counts = Counter()
        self.sections = []
        self.external_links = 0
        self.html_lang = None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]

        if tag == "html":
            self.html_lang = a.get("lang")

        if a.get("id"):
            if a["id"] in self.ids:
                self.errors.append(f"重复 id #{a['id']}（第 {line} 行，首次在第 {self.ids[a['id']]} 行）")
            else:
                self.ids[a["id"]] = line

        if tag == "section" and a.get("id"):
            self.sections.append(a["id"])

        if tag == "a":
            href = a.get("href") or ""
            if href.startswith("#") and len(href) > 1:
                self.anchors.append((href[1:], line))
            if href.startswith(("http://", "https://")):
                self.external_links += 1
                rel = (a.get("rel") or "").lower()
                if a.get("target") == "_blank" and "noopener" not in rel:
                    self.errors.append(f"外链 target=_blank 缺 rel=noopener（第 {line} 行）：{href[:60]}")

        if tag == "img" and "alt" not in a:
            self.errors.append(f"img 缺 alt（第 {line} 行）")

        self.counts[tag] += 1
        if tag in VOID:
            return
        self.stack.append((tag, line))

    def handle_startendtag(self, tag, attrs):
        # 自闭合标签（含内联 SVG 的 <path/>、<circle/>）不进入栈，只计数
        a = dict(attrs)
        if a.get("id"):
            if a["id"] in self.ids:
                self.errors.append(f"重复 id #{a['id']}（第 {self.getpos()[0]} 行）")
            else:
                self.ids[a["id"]] = self.getpos()[0]
        self.counts[tag] += 1

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f"多余的 </{tag}>（第 {self.getpos()[0]} 行）")
            return
        if self.stack[-1][0] == tag:
            self.stack.pop()
            return
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                unclosed = [f"<{t}> 第 {ln} 行" for t, ln in self.stack[i + 1:]]
                self.errors.append(f"</{tag}> 提前闭合，未关闭：{'、'.join(unclosed)}")
                del self.stack[i:]
                return
        self.errors.append(f"孤立的 </{tag}>（第 {self.getpos()[0]} 行）")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2

    path = Path(sys.argv[1])
    src = path.read_text(encoding="utf-8")

    p = Checker()
    p.feed(src)

    for tag, line in p.stack:
        p.errors.append(f"未闭合 <{tag}>（第 {line} 行）")

    for anchor, line in p.anchors:
        if anchor not in p.ids:
            p.errors.append(f"锚点 #{anchor} 不存在（第 {line} 行）")

    if not p.html_lang:
        p.errors.append("<html> 缺少 lang 属性")

    # 统计
    drills = src.count('<details class="drill"')
    rubies = src.count("<ruby>")
    vocab = src.count("<tr data-pos=")
    grammar = src.count('class="g-card"')
    paras = src.count('class="para"')

    print(f"文件      {path}  ({len(src.encode()) / 1024:.1f} KB, {src.count(chr(10)) + 1} 行)")
    print(f"语言      {p.html_lang}")
    print(f"小节      {' → '.join(p.sections) if p.sections else '（无）'}")
    print(f"正文段落  {paras}")
    print(f"精读卡    {drills}")
    print(f"振假名    {rubies} 处")
    print(f"词表      {vocab} 行")
    print(f"语法卡    {grammar}")
    print(f"外链      {p.external_links}")

    if drills and paras and drills != paras:
        print(f"提示      段落 {paras} 与精读卡 {drills} 不相等，确认是否有意为之")

    if p.errors:
        print(f"\n发现 {len(p.errors)} 个问题：")
        for e in p.errors:
            print("  -", e)
        return 1

    print("\n结构检查通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
