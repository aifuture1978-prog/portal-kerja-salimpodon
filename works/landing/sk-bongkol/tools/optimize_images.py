"""Optimise generated PNG artwork into web-ready JPEGs + an OG share image."""
import os
from PIL import Image, ImageEnhance

BASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "img")

JOBS = [
    ("hero.png", "hero.jpg", 1920, 84),
    ("pitas.png", "pitas.jpg", 1920, 84),
    ("dewan.png", "dewan.jpg", 1600, 82),
    ("sukan.png", "sukan.jpg", 1600, 82),
    ("sejarah.png", "sejarah.jpg", 1000, 82),
    ("pustaka.png", "pustaka.jpg", 1000, 82),
]

for src, dst, width, quality in JOBS:
    path = os.path.join(BASE, src)
    if not os.path.exists(path):
        print("skip (missing):", src)
        continue
    im = Image.open(path).convert("RGB")
    if im.width > width:
        h = round(im.height * width / im.width)
        im = im.resize((width, h), Image.LANCZOS)
    im = ImageEnhance.Sharpness(im).enhance(1.05)
    out = os.path.join(BASE, dst)
    im.save(out, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"{dst}: {im.width}x{im.height}  {os.path.getsize(out)//1024} KB")

# 1200x630 Open Graph share card, cropped from the hero frame
hero = os.path.join(BASE, "hero.jpg")
if os.path.exists(hero):
    im = Image.open(hero).convert("RGB")
    target = 1200 / 630
    if im.width / im.height > target:
        w = round(im.height * target)
        im = im.crop(((im.width - w) // 2, 0, (im.width + w) // 2, im.height))
    else:
        h = round(im.width / target)
        top = round((im.height - h) * 0.35)
        im = im.crop((0, top, im.width, top + h))
    im = im.resize((1200, 630), Image.LANCZOS)
    out = os.path.join(BASE, "og-image.jpg")
    im.save(out, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"og-image.jpg: 1200x630  {os.path.getsize(out)//1024} KB")

print("done")
