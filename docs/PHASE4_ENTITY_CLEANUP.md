# Phase 4 canonical entity cleanup

## Canonical record

| Field | Canonical value |
|---|---|
| Person | Jeff Honforloco |
| Business | Jeff Honforloco Photography |
| Website | https://jeffhonforlocophotos.com/ |
| Public email | info@jeffhonforlocophotos.com |
| Public phone | +1-646-379-4237 |
| Base | Providence, Rhode Island, United States |
| Street address | Not published until the founder confirms a customer-facing address |

## Stable structured-data IDs

- Business: `https://jeffhonforlocophotos.com/#business`
- Founder: `https://jeffhonforlocophotos.com/#person`
- Website: `https://jeffhonforlocophotos.com/#website`
- Page: canonical URL plus `#webpage`
- Service: service URL plus `#service`

Google recommends supplying useful, applicable organization facts and avoiding fields that do not apply; a street address is therefore intentionally omitted until verified ([Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)).

## Owned-property cleanup completed

- Removed the unused `SEOHead` component that contained a fake phone number, New York address, fabricated review totals and unsupported client/location claims.
- Removed destination landing pages containing unsupported statements about travel history, Fashion Week, celebrities, clients and location-specific work.
- Replaced the stale Wisdom Avenue record and unsupported experience totals in the public content JSON.
- Connected all service-page providers to the canonical business entity.
- Expanded the published offer catalog to match actual site services.

## External cleanup queue

These items require account ownership or publisher contact and were not changed in code:

1. LinkedIn result using “Didit360,” `info@tarvico.com` and a Delaware phone number.
2. WeddingMapper record using “Didit360Photography,” 60 Wisdom Avenue and an old Rhode Island phone.
3. VerView record using 60 Wisdom Avenue.
4. Any Google Business Profile, Bing Places, Apple Business Connect, Yelp, Facebook or directory listing that does not match the canonical record.

For each listing, record: URL, login owner, old value, requested value, submission date, evidence supplied and resolution date. Do not create duplicate profiles to work around an inaccessible listing.

## Guardrails

- Never add a review count, award, client, publication, venue, years-in-business claim or street address without documentary evidence.
- Keep social URLs only while they resolve to official profiles.
- Use one business name and one formatted phone everywhere.
- Remove redirected legacy URLs from sitemaps; retain self-referential canonicals on live pages ([Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)).
