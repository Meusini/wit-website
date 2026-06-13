# Wit — Atelier (static reference site)

**Live:** https://meusini.github.io/wit-website/

The static design-reference site for **Wit**, a prêt-à-porter bridal label with boutiques in
Gent & Antwerpen. A complete multi-page front-end: homepage, shop/collection, product detail,
lookbook, shop-the-look, look detail, cart, a 3-step checkout, order confirmation,
journal + article, store locator, brand story, and customer-service pages (FAQ, shipping,
returns, size guide).

Plain HTML/CSS/JS, no build step. The cart and checkout use `localStorage`/`sessionStorage`
with seeded demo data — they are a **front-end behavior spec, not a payment backend**.

This is the **visual source of truth** for the brand. A production Shopify Online Store 2.0
theme implementing the same design (Liquid sections + JSON templates) is maintained separately.

- **Type / display:** Cormorant Garamond (serif headings), Jost (body), Courier Prime
  (mono labels) via Google Fonts, plus a local **BulgaryRose** `.otf` for the handwritten wordmark.
- **Custom element:** `bruiden.html` and `winkels.html` use an `<image-slot>` web component
  (defined in `image-slot.js`) to render their galleries.
- **Hosting:** GitHub Pages, served from `main` / root. `.nojekyll` disables Jekyll processing.
