# EuroPolytech Visa Desk — Portugal / Morocco

Private-use preparation assistant for the harmonised short-stay Schengen application.

## Verified template and language

- Reference: BLS Portugal Morocco French-language Schengen form supplied by EuroPolytech (version with **33 numbered questions**).
- Interface instructions are in French; **free-text applicant answers should be in English or Portuguese, using Latin characters**, in line with [BLS Schengen General document requirements](https://www.blsinternational.com/portugal/morocco/schengen-general.php). Copy names from the travel document without alteration.
- Fields 1–33, their associated subfields, visit dates, signature date, accommodation and funding are included. The official application reserves additional sections for administration.
- **The PDF this app exports is a structured preparation record, not a filled copy of the original BLS PDF**. It must not be submitted as a substitute for BLS's original. Original form needs manual signature, and BLS supporting documents, photos and appointment.

## Features

- Seven-step guided workflow and completion tracking.
- French instructions with English/Portuguese answer guidance.
- Cross-checks for passport and trip dates.
- PDF preparation copy and print.
- **Local AES-GCM encrypted draft**; select `Enregistrer un brouillon`, choose a **separate personal draft passphrase** (minimum 10 characters) and save.
- Recover local draft via `Reprendre un brouillon` and the personal passphrase.
- Export a portable encrypted JSON backup and import from another device, retaining its personal passphrase.
- Clearing the form deletes the locally saved draft; locking clears the in-memory form.

## Access and search engines

The public GitHub Pages build uses a client-side password gate. **This is not true server-side authentication**: people able to inspect the publicly served site or its GitHub source can bypass the client-side gate. Do **not** treat it as protection against a determined attacker. For production, put the application behind verified identity access control such as Cloudflare Access on a custom domain or use GitHub Enterprise private Pages where supported. Do not put any real applicant personal data in the repository.

The app includes `robots=noindex,nofollow,noarchive,nosnippet` for Google and Bing. This requests de-indexing but does not prevent a person with the URL accessing the public site; if already indexed, submit a removal request through a verified Google Search Console property.

## Data privacy and recovery

Applicant answers are never automatically sent to a server by the application. Client-side encryption uses PBKDF2-SHA256 (260,000 iterations) and AES-256-GCM with a random per-save salt and IV. Passwords are not persisted by the application. The personal draft passphrase cannot be recovered by EuroPolytech. A browser that clears local data will lose locally saved drafts unless the user exported a JSON backup.

The HTML site loads fonts and PDF-generation code from third-party CDNs, which may receive ordinary site-visit metadata (such as IP/referrer) but are not intentionally sent form contents.

## Deployment

GitHub Pages: `https://europolytech.github.io/admission-wizard/visa-schengen-portugal/`

Source: `visa-schengen-portugal/index.html` in this repository.

**Not affiliated with BLS International, the Portuguese government or a consulate.**
