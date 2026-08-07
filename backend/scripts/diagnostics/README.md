# Diagnostic Scripts

This folder contains one-off operational scripts used during development and debugging.

## Important

- These scripts are **NOT part of the application**.
- They are excluded from git via `.gitignore`.
- Do **not** import any of these from application code.
- Do **not** commit `.txt` log output files here.

## Scripts Reference

| Script | Purpose |
|---|---|
| `check_5432.js` / `check_5432_v2.js` | Test PostgreSQL connectivity on port 5432 |
| `check_5444.js` | Test PostgreSQL connectivity on mapped port 5444 |
| `check_db.js` / `check_db_full.js` | General database health checks |
| `check_all_data.js` | Inspect all table row counts |
| `check_all_schemas.js` | Inspect all schema structures |
| `check_ann.js` | Debug announcements data |
| `check_dev_data.js` | Inspect development seed data |
| `check_partners.js` | Inspect partners table |
| `check_r2h.js` | Debug referral-to-hire flow |
| `debug_db_complex.js` | Complex query debugging |
| `debug_imports.js` / `debug_imports_dynamic.js` | Module import tracing |
| `debugCertificate.js` | Certificate generation debugging |
| `verify_api.js` | Smoke test API endpoints |
| `apply_partner_schema.js` | One-time partner schema migration helper |
| `seed_report_test.js` | Seed test data for report testing |

## Usage

Run scripts directly from the `backend/` directory:

```bash
cd /volume2/DevProjects/AntiGravity/equip/backend
node scripts/diagnostics/check_db.js
```

Make sure your `.env` is loaded or prefix with env vars as needed.
