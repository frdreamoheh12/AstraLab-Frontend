# AstraLab

A complete local Minecraft marketplace application: React 19, Express 5, Node 24, SQLite, and private filesystem storage. The supplied official logo and the three supplied creator avatars are used unchanged. The supplied logo is a nontransparent JPEG; its galaxy background is blended into the interface with CSS.

## Run

```sh
npm ci
npm run dev
```

Open **http://localhost:3000**. The marketplace initially contains no products, reviews, sales, or activity. The three supplied featured creator profiles have zero products. No public demo administrator or role-switching shortcut exists.

### Create the first administrator

Set `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in your **server environment**, then run:

```sh
npm run admin
```

The password must be at least 12 characters. The command does not elevate existing accounts. Sign in to this account normally, then use `/admin/users` to assign creator roles. Every role change requires confirmation.

## Build and production

```sh
npm run build
APP_ORIGIN=https://your-domain.example NODE_ENV=production npm start
```

Node **24 or later** is required for `node:sqlite`. Terminate HTTPS at a reverse proxy. Production sessions have Secure, HttpOnly and SameSite=Lax cookies. Set `APP_ORIGIN` to the exact public origin. When using a trusted reverse proxy, set `TRUST_PROXY` to its trusted hop count or network; do not expose a proxy-trusting backend directly to the internet.

A Dockerfile and compose file are included. Mount a durable volume at `/app/data` and back up the SQLite database and private files together. This implementation targets a single application instance. Multi-instance hosting requires a shared database and private object storage adapter; SQLite WAL and local disk are not shared between hosts.

## Roles and security

The reusable permission definitions are in `server/permissions.js`. All backend routes authorize callers independently of UI navigation.

- `USER`: account features, downloads, purchases, wishlist and eligible reviews. No uploads.
- `FREE_DROPPER`: create and manage their own free resources only. Price is forced to zero. Paid API requests, sales and revenue are rejected.
- `PAID_DROPPER`: create free and paid resources and access their own analytics, sales and revenue.
- `ADMIN`: user and dropper management, moderation, categories, orders, reviews, reports, settings and audit logs.

Accounts always register as USER. Submitted products default to `PENDING_REVIEW`. Uploaded changes return a published product to review. Admins cannot approve a product without a resource file. When moderation is explicitly disabled and automatic publishing enabled, complete uploaded submissions can publish automatically.

Private product files are stored outside `public` and `dist`. A paid download requires a purchase linked to a `PAID` order. Payment amount, currency, signature and capture status are checked server-side. Webhooks are verified over the raw request body and are idempotent. A processed full refund revokes download access. Admin refund requests use the actual provider; there is no UI or endpoint that marks an unpaid order as paid.

Uploads validate role, ownership, kind, allowed extensions, size and file signatures. Images are limited to JPEG, PNG and WebP; SVG and HTML uploads are not allowed. ZIP/JAR entries are never extracted or executed. The application does not claim to scan archive contents for malware; add a scanning service and a quarantine-to-review step before operating a large public marketplace.

Passwords use bcrypt with cost 12. Session tokens are random, hashed in the database and never returned by the API. Cross-origin and cross-site mutations are rejected. Authentication and uploads have rate and size limits. Password resets expire after one hour and invalidate other sessions. OAuth account linking by email is deliberately disabled to avoid account takeover.

## Real service configuration

Use the names in `.env.example` as documentation; set values in the server environment or deployment secret store. `npm` scripts do not automatically read `.env` files. Never use `VITE_` variables for secrets.

### Razorpay

Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Add `/api/payments/webhook` to the provider dashboard and subscribe to `payment.captured`, `payment.failed` and `refund.processed`. Enable international/USD payments in your provider account, or adapt currency formatting and verification together to your supported currency. Use provider test credentials first. Real-provider settlement has not been tested without your credentials; the verification path is covered with isolated provider fixtures.

The checkout uses Razorpay's hosted script. The public key ID is allowed in the browser; provider secrets stay exclusively on the backend. Payments are unavailable until configured.

### Google and Discord

Set the corresponding server-only `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`. Register callback URLs:

- `https://your-domain.example/api/auth/oauth/google/callback`
- `https://your-domain.example/api/auth/oauth/discord/callback`

State cookies prevent OAuth request forgery. Verified provider emails are required. Without credentials the UI reports that the provider is unavailable, rather than pretending sign-in succeeded.

### Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` for password recovery. Requests without configured email return a clear unavailable state. Contact/support submissions already persist in the database and appear under Admin Reports. Admins can reply through account notifications.

Official Discord/GitHub URLs were not supplied. Community links lead to an honest availability page and are not invented external URLs. Legal pages describe implemented behavior; have the platform operator review them for their jurisdiction before public launch.

## Verification

```sh
npm test
npx playwright install chromium
node tests/browser-check.mjs
npm run build
```

The integration suite uses an isolated temporary database and tests authentication, forbidden role combinations, ownership, moderation, upload validation, private files, verified purchases, refunds, reviews, wishlist, search, support, notifications, audit logs and session revocation. The browser suite uses a separate temporary application, verifies requested widths (1920, 1440, 1280, 1024, 768, 480, 375), account creation, global search, mobile navigation, user and creator dashboards, role-specific editor behavior, all admin pages, product review and detail tabs. Test fixture products and accounts never enter the real application database.

## Structure

- `src/components`: reusable navigation, dialogs, marketplace cards, filters, empty/loading/error states and dashboard layouts.
- `src/pages`: catalog, product detail, authors, authentication, user/creator/admin workflows and information pages.
- `src/api.js`: API client and cancellable loading state hook.
- `server/db.js`: persistent schema, category defaults and supplied creator data.
- `server/app.js`: authorized API, uploads, payment adapter and moderation.
- `server/auth.js`: password and session utilities.
- `tests`: security integration and browser workflow checks.

Settings, categories, products, accounts and activity all come from API/database records. There is no frontend marketplace seed logic or fabricated ratings.

## Deployment status

This workspace did not contain the required Sites starter/publishing helpers, so this deliverable is a verified runnable local application, not a claimed hosted Site. No production deployment URL has been created. Deploy the application with Node 24 and durable storage; configure live external providers before opening purchases and recovery to real users.
