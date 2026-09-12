# Phase 4 search gap matrix

| Opportunity | Current state | Competitive gap | Action | Priority | Success signal |
|---|---|---|---|:---:|---|
| Canonical entity | Business schema existed only on home while service pages referenced it. | Fragmented machine identity. | Emit stable business, person, website and webpage IDs sitewide. | P0 | Valid graph; every provider ID resolves. |
| Legacy location URLs | Thin destination pages included claims not supported by supplied evidence. | Trust and index-quality risk. | Remove from sitemap/prerender and permanently redirect to the verified service hub. | P0 | URLs redirect; none remain in sitemap. |
| Stale public facts | Old Wisdom Avenue and unsupported volume claims were publicly shipped. | Conflicting NAP and credibility risk. | Replace with verified Providence-level identity and current public contacts. | P0 | One consistent identity across owned files. |
| AI crawler policy | Training bots were allowed despite a comment saying training was not granted. | Policy contradicted behavior. | Allow search/user retrieval; block separately identifiable training bots; document Google-Extended tradeoff. | P0 | Robots parser shows intended groups. |
| Service schema | Core services missing from the home catalog; service IDs absent. | Incomplete entity-service relationship. | Add wedding, engagement, Sweet 16/quinceañera and real estate; assign service/page IDs. | P0 | Schema checks and source inspection pass. |
| Sweet 16 AI journey | WebMCP knew the service but could not open its gallery through `explore_portfolio`. | Agent journey stopped early. | Add `sweet-16` as an existing-tool category; preserve all stable keys. | P1 | Tool opens the dedicated page. |
| Conversion close | Strong hero CTA but weak final booking close after FAQ. | Visitors reaching the bottom lacked a prominent next step. | Add a compact request-availability CTA using the existing booking route. | P1 | CTA present on all authority pages; attribution preserved. |
| Wedding authority | Dedicated page and real gallery exist. | Strong rivals have more reviews, venue features and current event stories. | Publish permissioned real weddings with venue/vendor facts and request reviews. | P1 | Growth in non-brand impressions and assisted inquiries. |
| Engagement authority | Dedicated page and real work exist. | Competitors publish location guides. | Create a firsthand Providence engagement-location guide only after founder supplies locations, access notes and images. | P1 | Guide impressions and engagement inquiries. |
| Headshot authority | Focused page and pricing exist. | Specialists own clearer corporate proof and reviews. | Add permissioned team case studies and outreach to Providence business partners. | P1 | Corporate-headshot leads and referring domains. |
| Real-estate authority | Service page is honest but lacks approved portfolio evidence. | Property specialists show extensive, focused work. | Add a gallery/case study only after approved images and facts are supplied. | P1 | Portfolio-backed property inquiries. |
| Local citations | Old Didit360/Wisdom Avenue records remain externally visible. | NAP conflicts weaken trust. | Claim/correct profiles; request removals or merges. | P1 | Reduced conflicting branded results. |
| Reviews | Site cannot create independent review authority. | Leaders show high third-party review volume. | Run a compliant post-delivery review request workflow. | P1 | Consistent new reviews and response rate. |
| Local links | Limited supplied evidence of venue/publication/partner links. | Competitors appear in venue/vendor ecosystems. | Earn links through real collaborations, features and memberships. | P2 | Relevant referring domains, not raw link count. |

## Query-to-page ownership

- “photographer in Providence / Rhode Island”: homepage and `/services`.
- Wedding: `/providence-wedding-photographer`.
- Engagement: `/providence-engagement-photographer`.
- Sweet 15, Sweet 16 and quinceañera: `/providence-sweet-16-quinceanera-photographer`.
- Headshots: `/providence-headshot-photographer`.
- Fashion: `/providence-fashion-photographer`.
- Beauty: `/providence-beauty-photographer`.
- Commercial: `/providence-commercial-photographer`.
- Editorial: `/rhode-island-editorial-photographer`.
- Property/Airbnb: `/providence-real-estate-photographer`.

Avoid creating multiple pages for near-identical queries unless each page has unique firsthand evidence and a distinct customer intent. Google notes that pages can be crawled without being selected when there is insufficient value or demand ([crawl troubleshooting](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)).
