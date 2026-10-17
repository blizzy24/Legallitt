# Re-export measurements

All coordinates below are native PNG pixels. Frame crop is established before mapping to the 390pt content width. No blanket scaling of tokens was applied. Text size uses the drawn glyph bounds and the existing font family; geometry uses solid-fill bounds (excluding antialias/shadow pixels).

| Block.token | Before pt | After pt | Delta pt | Evidence |
|---|---:|---:|---:|---|
| hcLanding.heroH | 221 | 220 | -1 | Hero y158–597, 440px |
| hcLanding.heroRadius | 14 | 12 | -2 | Corner tangent 24px |
| hcLanding.heroInsetTop | 20 | 19 | -1 | Art begins y196; frame y158 |
| hcLanding.h1Size | 25 | 28 | +3 | Heading glyph bounds and 700px line width |
| hcLanding.bodySize | 15 | 16 | +1 | 32px glyph bounds, two lines |
| hcLanding.gridCardH | 123 | 125 | +2 | First tile y1561–1810, 250px |
| hcLanding.tile | 34 | 36 | +2 | Icon tile y1589–1660, 72px |
| hcLanding.speedH | 159 | 160 | +1 | Card y3061–3380, 320px |
| hcLanding.barBtnH | 51 | 52 | +1 | Button y3635–3738, 104px |
| advCourtConfirmFiling.headTile | 38 | 40 | +2 | Disc y206–285, 80px |
| advCourtConfirmFiling.headTileGap | 14 | 12 | -2 | Disc right x192 to heading x216 |
| advCourtConfirmFiling.footerBtnH | 50 | 52 | +2 | Button y2926–3029, 104px |
| advCourtProcessFeeDone.docSquare | 40 | 32 | -8 | Receipt tile y3355–3418, 64px |

289 crop x40–819: 780px. Independently checked unchanged: outer padding40px/20pt, art inset56px/28pt, main button100px/50pt, tile padding28px/14pt, grid gap16px/8pt. The empty gradient between hero and benefits is an export artifact; it is not treated as a new product section.

415 crop x40–819: 780px. Independently checked unchanged: input y1026–1121 =96px/48pt, textarea y1886–2053 =168px/84pt, document tile80px/40pt, card spacing32px/16pt, checkbox48px/24pt. This export reproduces the existing 379 layout at higher resolution, including High Court wording.

422 crop x16–795: 780px. Independently checked unchanged: outer padding40px/20pt, heading field80px/40pt, amount field80px/40pt, preview padding32px/16pt, completed button104px/52pt, receipt panel and text measured separately from its smaller icon. 348 was not measured or modified: supplied file is a 1× duplicate of381.
