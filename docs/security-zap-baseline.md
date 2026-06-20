# OWASP ZAP Baseline Security Audit Note

This document summarizes the baseline security scan and subsequent header remediation performed on the **UNPOL Capacity-Building & Development (CBD) Integrated Planning Tool**.

---

## 📅 Audit Metadata

*   **Date of Scan**: June 20, 2026
*   **Target URL**: `https://unpol-cbd-planning-tool.vercel.app/`
*   **Tool Used**: OWASP ZAP Baseline Scan (via Docker `ghcr.io/zaproxy/zaproxy:stable`)

---

## 🔍 Initial Scan Summary

An initial security baseline scan was executed against the Vercel production deployment prior to remediation:
*   **Failed Rules**: 0
*   **Warnings**: 10
*   **Key Findings (Medium)**:
    *   Missing `Content Security Policy (CSP)` header (`[10038]`).
    *   Missing anti-clickjacking configuration (`X-Frame-Options` or CSP `frame-ancestors` / `[10020]`).

---

## 🛠️ Remediation Actions

To resolve the Medium-severity findings, custom HTTP response headers were defined globally in [next.config.ts](file:///Users/maissaraselim/Library/CloudStorage/OneDrive-Personal/Consultancy/unpol-cbd-planning-tool/next.config.ts):
1.  **`X-Content-Type-Options: nosniff`**: Prevents browsers from MIME-sniffing away from the declared Content-Type.
2.  **`X-Frame-Options: DENY`**: Protects the application against clickjacking attempts.
3.  **`Referrer-Policy: strict-origin-when-cross-origin`**: Restricts the amount of referrer data transmitted during cross-origin requests.
4.  **`Permissions-Policy`**: Sets default strict limits on browser features (camera, microphone, geolocation are blocked by default: `camera=(), microphone=(), geolocation=()`).
5.  **First-Pass `Content-Security-Policy`**: Implements basic origin-based source controls:
    ```http
    default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://va.vercel-scripts.com; frame-ancestors 'none'; upgrade-insecure-requests;
    ```

---

## 📈 Post-Remediation Scan Summary

A validation scan was performed after Vercel deployed the security headers:
*   **Remaining Medium Warnings**: 0 (Fully Resolved)
*   **Remaining Low/Info Warnings**: 7
*   **Key Remediation Success**: All four targeted baseline warnings (CSP, anti-clickjacking, X-Content-Type-Options, Permissions Policy) successfully moved to **PASS** status.

---

## 📋 Remaining Accepted Items

The following informational and low-level warnings have been reviewed and accepted:
*   **Cache-control Warnings**: Static Next.js bundle assets (`/_next/static/...`) are designed to be cached on the Edge and in user browsers to ensure load speed and optimize bandwidth.
*   **Cross-Origin-Embedder-Policy (COEP)**: Not added to avoid blocking external assets and script payloads.
*   **Modern Web Application**: Informational alert indicating the use of a script-based frontend framework (React/Next.js).
*   **CORS/Static Files**: Public configurations for standard crawl endpoints (`robots.txt` / `sitemap.xml`) are intentionally left open for search engine indexing.

---

## 🚀 Future Hardening

1.  **Refine CSP Directives**: Periodically review fallback policies and restrict wildcard permissions as the application features mature.
2.  **Nonce/Hash Strategy**: Transition the inline script policy (`'unsafe-inline'`) to a secure nonce-based or hash-based validation strategy in a custom Next.js middleware script.
3.  **Regular Scans**: Rerun the ZAP baseline script prior to tagging new releases to prevent regressions.
