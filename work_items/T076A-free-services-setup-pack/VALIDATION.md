# T076A — Validation

```bash
npm ci
npm run validate:automation-runtime
npm run build:automation-runtime-manifest
npm run runtime:services:check
npm run validate:runtime-services-readiness
npm run validate:runtime-db-health
npm run runtime:db:health
npm run validate:data
npm run generate:exports
npm run build:custom-domain
npm run verify:dist
git diff --check
find scripts ops src -name "*.mjs" -o -name "*.js" | xargs -I{} node --check {}
```

Security:

```bash
git grep -n "nazzarkoartem@gmail.com\|nazarko.law@gmail.com" -- ':!.local/*' || true
grep -R "SUPABASE_SERVICE_ROLE_KEY=.*[A-Za-z0-9]" . --exclude-dir=node_modules --exclude-dir=.git --exclude=".env*.example" || true
grep -R "CLOUDFLARE_API_TOKEN=.*[A-Za-z0-9]" . --exclude-dir=node_modules --exclude-dir=.git --exclude=".env*.example" || true
git check-ignore -v .env.runtime.local .env.cloudflare.local 2>/dev/null || true
```

Expected: all gates false; no secrets/emails in tracked files; readiness validator passes without credentials.
