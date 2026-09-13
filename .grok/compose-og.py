#!/usr/bin/env python3
"""Composite GST Desk lockup onto the editorial still-life and raster brand marks."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path("/workspace")
GROK = ROOT / ".grok"
ART = Path("/workspace/artifacts/imagine_images/ed9f20fc-21ad-4a3c-942f-bdc8937c6381.jpg")

INK = (26, 31, 28, 255)  # #1A1F1C
GREEN = (15, 92, 76, 255)  # #0F5C4C
PAPER = (244, 240, 230, 255)  # #F4F0E6
SHADOW = (26, 31, 28, 72)

SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"


def cover_crop(im: Image.Image, tw: int, th: int) -> Image.Image:
    w, h = im.size
    scale = max(tw / w, th / h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


def tracked_width(font: ImageFont.FreeTypeFont, text: str, tracking: float) -> float:
    if not text:
        return 0.0
    return float(font.getlength(text)) + tracking * (len(text) - 1)


def draw_tracked(draw: ImageDraw.ImageDraw, text: str, font, fill, cx: float, y: float, tracking: float):
    x = cx - tracked_width(font, text, tracking) / 2
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill, anchor="lt")
        x += font.getlength(ch) + tracking


def compose_card() -> Image.Image:
    bg = cover_crop(Image.open(ART).convert("RGB"), 1200, 630)

    # Soft paper veil in the lockup zone so type stays editorial, not busy.
    veil = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    vd.rounded_rectangle((210, 175, 990, 455), radius=18, fill=(244, 240, 230, 168))
    veil = veil.filter(ImageFilter.GaussianBlur(12))
    bg = Image.alpha_composite(bg.convert("RGBA"), veil)

    title_font = ImageFont.truetype(SERIF, 108)
    tag_font = ImageFont.truetype(SANS, 20)
    title = "GST DESK"
    tag = "FIX NIC E-INVOICE ERRORS"
    title_track = 6
    tag_track = 11

    title_w = tracked_width(title_font, title, title_track)
    tag_w = tracked_width(tag_font, tag, tag_track)
    title_bbox = title_font.getbbox(title)
    title_h = title_bbox[3] - title_bbox[1]
    tag_bbox = tag_font.getbbox(tag)
    tag_h = tag_bbox[3] - tag_bbox[1]
    rule_w = 72
    gap_title_rule = 22
    gap_rule_tag = 20
    rule_h = 2
    block_h = title_h + gap_title_rule + rule_h + gap_rule_tag + tag_h
    cx = 600
    y0 = (630 - block_h) / 2 - 6  # optical center, slightly high

    print(
        f"title_w={title_w:.0f} tag_w={tag_w:.0f} block_h={block_h:.0f} y0={y0:.0f}"
    )

    shadow = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    draw_tracked(sd, title, title_font, SHADOW, cx + 1, y0 + 3, title_track)
    draw_tracked(
        sd,
        tag,
        tag_font,
        SHADOW,
        cx + 1,
        y0 + title_h + gap_title_rule + rule_h + gap_rule_tag + 2,
        tag_track,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(3))
    bg = Image.alpha_composite(bg, shadow)

    type_layer = Image.new("RGBA", (1200, 630), (0, 0, 0, 0))
    td = ImageDraw.Draw(type_layer)
    draw_tracked(td, title, title_font, INK, cx, y0, title_track)
    rule_y = y0 + title_h + gap_title_rule
    td.rectangle(
        (cx - rule_w / 2, rule_y, cx + rule_w / 2, rule_y + rule_h),
        fill=GREEN,
    )
    draw_tracked(
        td,
        tag,
        tag_font,
        GREEN,
        cx,
        y0 + title_h + gap_title_rule + rule_h + gap_rule_tag,
        tag_track,
    )
    bg = Image.alpha_composite(bg, type_layer)
    return bg.convert("RGB")


def write_favicon_svg(path: Path) -> None:
    # Bold geometric G: ring with a 3-o'clock mouth, crossbar, and short spur.
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0F5C4C"/>
  <path fill="#F4F0E6" fill-rule="evenodd" d="M16 6.2c5.55 0 9.8 3.85 9.8 9.8 0 .35-.02.7-.05 1.04h-3.55c.2-3.55-2.15-6.04-6.2-6.04-3.85 0-6.35 2.7-6.35 7 0 4.3 2.5 7 6.35 7 4.05 0 6.4-2.5 6.2-6.04h3.55c.03.34.05.69.05 1.04 0 5.95-4.25 9.8-9.8 9.8S6.2 21.95 6.2 16 10.45 6.2 16 6.2z"/>
  <path fill="#F4F0E6" d="M15.2 14.85h9.35v3.15h-5.85V21.4h-3.5z"/>
</svg>
"""
    path.write_text(svg, encoding="utf-8")


def raster_mark(size: int) -> Image.Image:
    """Flat G mark matching favicon.svg, for logo.png and read-back checks."""
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Scale from 32 viewBox
    s = size / 32
    r = 7 * s
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=r, fill=(15, 92, 76, 255))

    def P(x, y):
        return (x * s, y * s)

    # Outer disk
    d.ellipse([P(6.2, 6.2), P(25.8, 25.8)], fill=(244, 240, 230, 255))
    # Inner hole
    d.ellipse([P(9.75, 9.75), P(22.25, 22.25)], fill=(15, 92, 76, 255))
    # Mouth cut at 3 o'clock
    d.rectangle([P(20.2, 14.85), P(27.2, 18.0)], fill=(15, 92, 76, 255))
    # Crossbar + spur
    d.rectangle([P(15.2, 14.85), P(24.55, 18.0)], fill=(244, 240, 230, 255))
    d.rectangle([P(21.2, 14.85), P(24.55, 21.4)], fill=(244, 240, 230, 255))
    return im


def main() -> None:
    GROK.mkdir(parents=True, exist_ok=True)
    card = compose_card()
    raw = GROK / "og-card-raw.png"
    card.save(raw, "PNG")
    print("wrote", raw, card.size)

    write_favicon_svg(GROK / "favicon.svg.tmp")
    print("wrote favicon svg")

    mark = raster_mark(256)
    mark.convert("RGB").save(GROK / "logo.png.tmp", "PNG")
    print("wrote logo")

    for px in (16, 32, 64):
        raster_mark(px).save(GROK / f"favicon-{px}.png")
        print("raster", px)

    site = """{
  "title": "GST Desk",
  "card": "custom",
  "description": "Fix NIC e-invoice and IRN errors for Indian CAs."
}
"""
    (GROK / "site.json.tmp").write_text(site, encoding="utf-8")
    print("wrote site.json.tmp")


if __name__ == "__main__":
    main()
