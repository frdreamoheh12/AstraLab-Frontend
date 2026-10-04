# AstraLab implementation plan

1. Build an independent React/Express application with SQLite persistence and private file storage. Keep products, downloads, reviews, sales and revenue empty until real activity exists. Use the supplied original logo and three supplied avatars.
2. Create a restrained cosmic interface: editorial hero, category browser, free/paid catalogs, product details, authors, accessible navigation and responsive dashboards.
3. Enforce reusable permissions on the backend: USER cannot upload; FREE_DROPPER can publish free resources only; PAID_DROPPER can submit both; ADMIN manages moderation, roles and platform settings. Default products to review. Ownership and published status are checked on every download.
4. Add secure local accounts, opaque HttpOnly sessions, input validation, same-origin mutation protection, private uploads, wishlist, verified reviews, notifications, audit logs and payment verification. Keep external providers disabled until real credentials are configured.
5. Test the role and purchase boundaries, authentication, moderation, uploads and rendering at all requested widths. Build a deployable application and document external-service requirements.

## Branding constraint
The supplied official logo is a JPEG with a galaxy background, not a transparent asset. Use that exact file without drawing or regenerating the mark. The unnamed purple avatar is assigned to Solentz.dev; the two named avatars retain their matching creators.

## Hosting constraint
The Sites skill is available, but its required setup and publishing scripts are absent in this execution workspace. Deliver and test a runnable local application; do not claim a production deployment without a verified deployment result.
