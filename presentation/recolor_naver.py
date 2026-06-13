#!/usr/bin/env python3
"""Recolor KOKKOK charts (teal/amber/red palette) into the NAVER palette:
single spring-green (#03C75A) + neutral greys + kept red for negatives.
Outputs <name>_nv.png alongside the originals. Operates in HSV per-pixel so
anti-aliased edges and tints recolor cleanly without category-color collisions.
"""
import colorsys, os
from PIL import Image
import numpy as np

ASSETS = os.path.join(os.path.dirname(__file__), "assets")
CHARTS = [
    "02_sentiment_by_app", "10_app_positioning_map", "11_app_competitive_analysis",
    "14_hw_positioning_map", "17_app_hw_linkage", "18_complaint_2layer",
    "19_laos_share_of_voice",
]

NAVER_GREEN_H = 146 / 360.0  # #03C75A hue


def remap(arr):
    rgb = arr[..., :3].astype(np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(-1); mn = rgb.min(-1); df = mx - mn
    v = mx
    s = np.where(mx == 0, 0, df / np.where(mx == 0, 1, mx))
    # hue
    h = np.zeros_like(mx)
    mask = df > 1e-6
    rc = (mx - r) / np.where(df == 0, 1, df)
    gc = (mx - g) / np.where(df == 0, 1, df)
    bc = (mx - b) / np.where(df == 0, 1, df)
    h = np.where((mx == r) & mask, bc - gc, h)
    h = np.where((mx == g) & mask, 2.0 + rc - bc, h)
    h = np.where((mx == b) & mask, 4.0 + gc - rc, h)
    h = (h / 6.0) % 1.0
    deg = h * 360.0

    sat = s.copy(); hue = h.copy()
    saturated = s > 0.18
    # teal/cyan/green family (120-210) -> NAVER green
    m_green = saturated & (deg >= 110) & (deg < 215)
    hue[m_green] = NAVER_GREEN_H
    # red family (<=18 or >=342) -> keep red, soften toward #EB5757
    m_red = saturated & ((deg <= 18) | (deg >= 342))
    hue[m_red] = 0.0
    sat[m_red] = np.clip(s[m_red], 0, 0.70)
    # everything else saturated (amber/orange/yellow/blue/purple) -> neutral grey
    m_grey = saturated & ~m_green & ~m_red
    sat[m_grey] = 0.0

    # back to rgb
    i = np.floor(hue * 6.0).astype(int)
    f = hue * 6.0 - i
    p = v * (1 - sat); q = v * (1 - f * sat); t = v * (1 - (1 - f) * sat)
    i = i % 6
    rr = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [v, q, p, p, t, v])
    gg = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [t, v, v, q, p, p])
    bb = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [p, p, t, v, v, q])
    out = arr.copy()
    out[..., 0] = np.clip(rr * 255, 0, 255)
    out[..., 1] = np.clip(gg * 255, 0, 255)
    out[..., 2] = np.clip(bb * 255, 0, 255)
    return out


for name in CHARTS:
    src = os.path.join(ASSETS, name + ".png")
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    out = remap(arr)
    Image.fromarray(out, "RGBA").save(os.path.join(ASSETS, name + "_nv.png"))
    print("wrote", name + "_nv.png")
