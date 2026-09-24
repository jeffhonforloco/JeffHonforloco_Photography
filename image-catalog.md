# Image catalog — jeffhonforlocophotos.com (researched 2026-09-18)

Source: Cloudflare R2 bucket `jeffhonforloco-photography-media`, folder `portfolio/20260918/`
(the site's only media-storage folder; verified by hash dedupe: 25 downloadable
objects = 12 unique photographs + duplicates).

Working URL format (verified loading):
`https://api-jeffhonforloco-photography.ancient-sun-d712.workers.dev/api/v1/admin/media/file/portfolio%2F20260918%2F<KEY>.webp`
Note: the R2 key must be URL-encoded (`%2F`); literal slashes return 404.

## The 12 unique photographs (all wedding / engagement)

| # | Canonical key (= duplicate keys) | Depicts | Category |
|---|---|---|---|
| 1 | `ec21yjl9` (= `zpufag99`) | Wedding couple under stone gazebo ("REEVES" engraved), bride in lace gown, groom in white tux jacket, park setting | Wedding |
| 2 | `6qzacl09` (= `kteb3sx4`) | Close-up of ring exchange on bride's finger, bouquet visible | Wedding detail |
| 3 | `9d17f1t6` (= `l7v832ld`, `ps6iiwvg`, `rvxkdqqm`, `ynh4ytt3`) | Bride in white gown + fur-trimmed hooded cape holding bouquet, city skyline behind | Wedding / bridal |
| 4 | `7s55rhyt` | Marriage proposal: man kneeling with ring box, woman standing, rooftop terrace, city behind | Engagement |
| 5 | `eycy1rqb` (= `w51vn3ue`) | Wedding couple, bride seated on bench in gown, groom standing in tux, riverfront city skyline | Wedding |
| 6 | `fg7q29ti` (= `x9r4p9q0`) | Wedding couple seated together on bench, tux + gown, city skyline | Wedding |
| 7 | `n9njg55b` (= `zaeaowzb`) | Bride in lace gown + veil seated on pink chair by window (getting ready) | Wedding / bridal prep |
| 8 | `23kqme1b` (= `f4r0gjbo`) | Wedding couple embracing between gazebo columns | Wedding |
| 9 | `i5vfbpg4` (= `n3fl3735`) | Wedding couple on bridge, bride in gown + fur cape, groom in tux, downtown skyline | Wedding |
| 10 | `qk3sqgld` (= `r0tzoqpo`) | Black-and-white: formally dressed couple about to kiss in grand hotel lobby under chandelier | Engagement |
| 11 | `mv3soxsi` | Close-up of woman's hand wearing engagement ring | Engagement detail |
| 12 | `jouwcxvv` (= `ut80xyse`) | Laughing wedding couple under gazebo, golden sun flare | Wedding |

Dead key: `c6b59mrd.webp` (in R2 listing but returns 404; its orphan thumbnail
`c6b59mrd-thumb.webp` is the same photo as #3).

## Site sections (from sitemap.xml)

- `https://jeffhonforlocophotos.com/portfolios` and sub-galleries:
  `/portfolios/beauty`, `/portfolios/fashion`, `/portfolios/editorial`,
  `/portfolios/glamour`, `/portfolios/headshots`, `/portfolios/lifestyle`
- Service pages: `/providence-fashion-photographer`, `/providence-beauty-photographer`,
  `/rhode-island-editorial-photographer`, `/providence-wedding-photographer`,
  `/providence-engagement-photographer`, etc.

## Caveats

- The site is a JS-rendered SPA: text fetching returns only SEO fallback text, so
  the portfolio gallery pages' actual image lists could not be extracted this way.
- The R2 bucket (the site's media storage, which the website serves images from)
  contains ONLY the 12 wedding/engagement photos above. No fashion, beauty,
  editorial, city-only, or photography-education images exist there.
- Skylines visible in photos #3, #5, #6, #9 are Providence, RI — not NYC/LA/Miami.
