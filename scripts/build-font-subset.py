#!/usr/bin/env python3
"""Rebuild and verify the self-hosted Zibai Serif WOFF2 subset."""

from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path
import string

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ModuleNotFoundError as exc:
    raise SystemExit(
        "缺少 fonttools WOFF 支援；請先安裝 scripts/requirements-font-subset.txt"
    ) from exc


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/fonts/zibai-serif-medium.woff2"
INVENTORY = ROOT / "public/fonts/zibai-serif-glyphs.txt"
EXPECTED_SOURCE_SHA256 = "da0a79ee44322329dd9ff87d2cc878dc897c5180195e3f9b6cd4c8569781e887"
SOURCE_GLOBS = ("src/**/*.ts", "src/**/*.tsx")
SOURCE_FILES = (ROOT / "index.html", ROOT / "vite.config.ts")
# Decorative ✦／⚑ are intentionally left to symbol fallback because this Noto source lacks them.
EXTRA_SYMBOLS = "·…—–→←↑↓✓⚠×≠±℃°／（）「」『』【】《》〈〉，。！？：；、"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def is_cjk(character: str) -> bool:
    codepoint = ord(character)
    return (
        0x3400 <= codepoint <= 0x4DBF
        or 0x4E00 <= codepoint <= 0x9FFF
        or 0xF900 <= codepoint <= 0xFAFF
    )


def is_subset_character(character: str) -> bool:
    codepoint = ord(character)
    return (
        (character in string.printable and not character.isspace())
        or is_cjk(character)
        or 0x3000 <= codepoint <= 0x303F
        or 0xFF00 <= codepoint <= 0xFFEF
        or character in EXTRA_SYMBOLS
    )


def scanned_files() -> list[Path]:
    files = {path for pattern in SOURCE_GLOBS for path in ROOT.glob(pattern)}
    files.update(path for path in SOURCE_FILES if path.exists())
    return sorted(files)


def typescript_string_literals(source: str) -> str:
    """Collect literal contents while skipping line/block comments."""
    result: list[str] = []
    index = 0
    quote: str | None = None
    while index < len(source):
        character = source[index]
        following = source[index + 1] if index + 1 < len(source) else ""
        if quote is not None:
            if character == "\\":
                index += 2
                continue
            if character == quote:
                quote = None
            else:
                result.append(character)
            index += 1
            continue
        if character == "/" and following == "/":
            index = source.find("\n", index + 2)
            if index == -1:
                break
            continue
        if character == "/" and following == "*":
            index = source.find("*/", index + 2)
            if index == -1:
                break
            index += 2
            continue
        if character in ("'", '"', "`"):
            quote = character
        index += 1
    return "".join(result)


def required_characters() -> tuple[set[str], list[Path]]:
    files = scanned_files()
    characters = set(string.ascii_letters + string.digits + string.punctuation + EXTRA_SYMBOLS)
    for path in files:
        source = path.read_text(encoding="utf-8")
        renderable_text = source if path.suffix == ".html" else typescript_string_literals(source)
        characters.update(
            character
            for character in renderable_text
            if is_subset_character(character)
        )
    return characters, files


def display_characters(characters: set[str]) -> str:
    return "".join(sorted(characters, key=ord))


def verify_font(font_path: Path, required: set[str]) -> None:
    font = TTFont(font_path)
    cmap = font.getBestCmap() or {}
    missing = {character for character in required if ord(character) not in cmap}
    if missing:
        raise SystemExit(
            f"字體缺少 {len(missing)} 個 UI 字元：{display_characters(missing)}"
        )
    print(
        f"coverage OK：{len(required)} 個 UI 字元；"
        f"cmap {len(cmap)}；glyphs {len(font.getGlyphOrder())}"
    )


def build_font(source: Path, output: Path, inventory: Path) -> None:
    actual_source_hash = sha256(source)
    if actual_source_hash != EXPECTED_SOURCE_SHA256:
        raise SystemExit(
            "原始 OTF SHA-256 不符；拒絕用不同字體覆寫現有品牌 subset。\n"
            f"expected {EXPECTED_SOURCE_SHA256}\nactual   {actual_source_hash}"
        )

    required, files = required_characters()
    font = TTFont(source, recalcTimestamp=False)
    source_cmap = font.getBestCmap() or {}
    missing_from_source = {
        character for character in required if ord(character) not in source_cmap
    }
    if missing_from_source:
        raise SystemExit(
            f"Noto Serif source 缺少 {len(missing_from_source)} 個 UI 字元："
            f"{display_characters(missing_from_source)}"
        )

    options = subset.Options()
    # The UI is horizontal Traditional Chinese. Keeping every vertical/locale GSUB variant
    # multiplies a 1,000-character subset into thousands of unused glyphs.
    options.layout_features = []
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.name_legacy = True
    options.notdef_glyph = True
    options.notdef_outline = True
    options.recommended_glyphs = True
    options.recalc_average_width = True
    options.recalc_max_context = True
    options.canonical_order = True

    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=sorted(ord(character) for character in required))
    subsetter.subset(font)
    font.flavor = "woff2"
    output.parent.mkdir(parents=True, exist_ok=True)
    font.save(output, reorderTables=True)

    inventory.write_text(
        "# Generated by scripts/build-font-subset.py; do not edit by hand.\n"
        f"# Scanned files: {len(files)}\n"
        f"# UI characters: {len(required)}\n"
        f"{display_characters(required)}\n",
        encoding="utf-8",
    )
    verify_font(output, required)
    print(f"source SHA-256：{actual_source_hash}")
    print(f"WOFF2 SHA-256：{sha256(output)}")
    print(f"output：{output.relative_to(ROOT)}（{output.stat().st_size} bytes）")
    print(f"inventory：{inventory.relative_to(ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        default=Path(os.environ["ZIBAI_FONT_SOURCE"]) if "ZIBAI_FONT_SOURCE" in os.environ else None,
        help="NotoSerifCJKtc-Medium.otf path (or set ZIBAI_FONT_SOURCE)",
    )
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--inventory", type=Path, default=INVENTORY)
    parser.add_argument("--check", action="store_true", help="verify current WOFF2 coverage only")
    args = parser.parse_args()

    required, _ = required_characters()
    if args.check:
        verify_font(args.output, required)
        return
    if args.source is None:
        parser.error("請以 --source 或 ZIBAI_FONT_SOURCE 指定原始 OTF")
    build_font(args.source.resolve(), args.output.resolve(), args.inventory.resolve())


if __name__ == "__main__":
    main()
