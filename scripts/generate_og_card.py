#!/usr/bin/env python3
"""
@file generate_og_card.py
@description Compose the 1200x630 Open Graph / Twitter social card for Ops Toolbox.
@author vintagedon
@license MIT
@see https://github.com/radioastronomyio/ops-toolbox

Renders the on-brand social card directly to a PNG using Pillow. The site uses a
`data-theme` dark surface (#0E1013) and an accent teal (#3d8f8f / HSL 180 40% 40%);
this card matches those tokens so a pasted link unfurls on-brand. The toolbox mark
mirrors public/logo.svg at a larger scale.

Run:  python3 scripts/generate_og_card.py
Out:  public/og.png  (1200x630 PNG)

Image generation by the model was not available in the runner, so the spec's
documented fallback ("rasterize a composed graphic to PNG at 1200x630") is used;
this script is the editable, reproducible source of the card.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# --- Canonical on-brand tokens (must match src/styles/design-tokens.css) ----------
WIDTH, HEIGHT = 1200, 630
BG = (14, 16, 19)            # #0E1013 — dark theme surface (data-theme="dark")
ACCENT = (61, 143, 143)      # #3d8f8f — site accent (HSL 180 40% 40%)
WHITE = (255, 255, 255)      # toolbox body / handle
TITLE = (244, 247, 248)      # near-white headline
TAGLINE = (160, 171, 177)    # muted secondary text
RULE = (61, 143, 143)        # accent rule
URL = (130, 141, 148)        # faint url text

FONT_DIR = Path("/usr/share/fonts/truetype/lato")
REPO_ROOT = Path(__file__).resolve().parent.parent
OUT = REPO_ROOT / "public" / "og.png"


def font(weight: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_DIR / f"Lato-{weight}.ttf"), size)


def draw_toolbox_mark(d: ImageDraw.ImageDraw, mx: int, my: int, s: float) -> None:
    """Draw the Ops Toolbox mark (accent tile + white body/handle/latch), scaled."""
    tile_rx = int(14 * s)
    d.rounded_rectangle([mx, my, mx + int(64 * s), my + int(64 * s)], radius=tile_rx, fill=ACCENT)
    # Handle
    d.rounded_rectangle(
        [mx + int(23 * s), my + int(17 * s), mx + int(41 * s), my + int(26 * s)],
        radius=int(3 * s), fill=WHITE,
    )
    # Body
    d.rounded_rectangle(
        [mx + int(12 * s), my + int(26 * s), mx + int(52 * s), my + int(49 * s)],
        radius=int(4 * s), fill=WHITE,
    )
    # Tray seam
    d.rectangle([mx + int(12 * s), my + int(35 * s), mx + int(52 * s), my + int(38.5 * s)], fill=ACCENT)
    # Center latch
    d.rounded_rectangle(
        [mx + int(29.5 * s), my + int(33.5 * s), mx + int(34.5 * s), my + int(40 * s)],
        radius=int(1.5 * s), fill=ACCENT,
    )


def main() -> int:
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    d = ImageDraw.Draw(img)

    # Left accent edge bar
    d.rectangle([0, 0, 14, HEIGHT], fill=ACCENT)

    # Toolbox mark (150px tile, vertically centered)
    mark_size = 150
    s = mark_size / 64.0
    mx = 96
    my = (HEIGHT - mark_size) // 2
    draw_toolbox_mark(d, mx, my, s)

    # Text block
    text_x = mx + mark_size + 56
    title_font = font("Black", 104)
    tagline_font = font("Regular", 40)
    badge_font = font("Semibold", 28)

    # Vertically center the two-line text block around the canvas center
    title_h = title_font.getbbox("Ops Toolbox")[3]
    tagline_h = tagline_font.getbbox("Tagline")[3]
    gap = 26
    block_h = title_h + gap + tagline_h
    block_top = (HEIGHT - block_h) // 2 - 18

    d.text((text_x, block_top), "Ops Toolbox", font=title_font, fill=TITLE)
    # Accent underline beneath the title
    tw = title_font.getlength("Ops Toolbox")
    d.rectangle(
        [text_x, block_top + title_h + 14, text_x + tw, block_top + title_h + 20],
        fill=RULE,
    )
    d.text(
        (text_x + 2, block_top + title_h + gap),
        "Client-side developer utilities for IT operations.",
        font=tagline_font, fill=TAGLINE,
    )

    # Badge line, lower-left
    badge = "24 tools   ·   100% in-browser   ·   air-gap friendly"
    d.text((text_x + 2, block_top + title_h + gap + tagline_h + 44), badge, font=badge_font, fill=ACCENT)

    # URL, lower-right
    url_font = font("Medium", 30)
    url_text = "opstoolbox.dev"
    uw = url_font.getlength(url_text)
    d.text((WIDTH - uw - 80, HEIGHT - 62), url_text, font=url_font, fill=URL)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, format="PNG", optimize=True)
    print(f"og card: wrote {OUT.relative_to(REPO_ROOT)} ({WIDTH}x{HEIGHT})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
