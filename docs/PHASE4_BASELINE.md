# Phase 4 search and AI baseline

Audit date: 2026-09-11. Production site: <https://jeffhonforlocophotos.com/>.

## Executive baseline

The site entered Phase 4 with strong technical foundations: dedicated Providence/Rhode Island service pages, static HTML prerendering, responsive images, valid canonicals, one visible H1 on each authority page, an XML sitemap, `llms.txt`, and four WebMCP tools. Desktop Lighthouse had reached 100 in founder testing; mobile performance had reached 88 in the latest supplied test. Phase 4 therefore focuses on relevance, trust, entity consistency and qualified inquiry conversion—not a visual rebuild.

Founder-observed positions before this work were approximately #9 for “photographer in Providence,” #12 for “photographer in Rhode Island,” and visible but lower for “photographers in New England.” These are dated observations, not universal rankings: results vary by location, device, personalization and date.

## Query-family observations

| Query family | Baseline observation | Competitive implication |
|---|---|---|
| Photographer in Providence / Rhode Island | Jeff’s homepage and several dedicated service URLs were discoverable; directories also occupied many results. | Maintain technical eligibility and build independent local authority. |
| New England photographer | Search intent frequently skewed toward weddings and specialists with deep real-event content. | Publish firsthand regional work only when assets and facts are available. |
| Wedding / engagement | Jeff’s dedicated pages surfaced. The strongest competitors paired focused pages with reviews, venue stories and directories. | The pages are a base; review velocity, citations and real galleries are the next moat. |
| Sweet 16 / quinceañera | Jeff’s dedicated page surfaced, but a stale search snippet still reflected older placeholder content. | Request recrawl after deployment and monitor the indexed HTML/snippet. |
| Headshots | Exact-match specialists with simple service promises and transparent packages were prominent. | Continue emphasizing coaching, audience, deliverables and pricing. |
| Fashion / beauty / editorial | Jeff’s homepage and focused service pages appeared alongside marketplaces and specialist portfolios. | Strengthen the Jeff entity and earn editorial/citation links. |
| Real estate / Airbnb | Dedicated property specialists had stronger topical focus; Jeff’s page was less visible in the observed results. | Add only real property work and client evidence; do not manufacture proof. |
| Branded searches | Official pages appeared, but old Didit360/Wisdom Avenue references remained on third-party profiles. | Correct external identity records and consolidate one NAP. |

## Technical baseline and changes

- Baseline build, TypeScript and Phase 2 SEO verification passed.
- Baseline lint passed with 17 pre-existing warnings and no errors.
- Removed unsupported destination landing pages from the application, static generator and sitemap; permanent redirects now converge those URLs on `/services`.
- Removed an unused component containing fabricated phone, address, review and location data.
- Replaced stale public JSON claims with the verified Providence base, current public contact details and published services.
- Expanded the schema entity graph so every service `provider` resolves to the same `#business`, connected to `#person`, `#website` and page IDs.
- Preserved service-page prerendering, canonicals, responsive images and all four WebMCP stable keys.

## Measurement baseline

Record the following on deployment day and compare at days 30, 60 and 90:

1. Search Console impressions, clicks, average position and indexed-page count by query and landing page.
2. Google Business Profile calls, website clicks, direction requests, messages and discovery terms.
3. Qualified booking requests by landing page, service and attribution source.
4. Referring domains and corrected citation count.
5. Branded search results containing the correct name, domain, phone and Providence location.
6. AI referrals identified by supported referrers or UTM parameters; do not infer invisible citations.
7. Mobile p75 LCP, INP and CLS when field data becomes available; keep lab medians separately.

## Evidence standards

Search documentation says sitemaps identify important URLs and robots rules should not be used as a substitute for `noindex`; crawlers must access a page to read its meta directives ([Google Search technical SEO](https://developers.google.com/search/docs/fundamentals/get-started), [robots meta documentation](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)). Canonicals are self-referential on retained pages, and redirected URLs are removed from the sitemap in line with Google’s canonical and site-move guidance ([canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)).

No position, traffic or booking outcome is guaranteed. The implementation improves eligibility, clarity and conversion readiness; authority still depends on real reviews, citations, partnerships and published work.
