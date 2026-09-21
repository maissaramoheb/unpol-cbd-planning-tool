# PESTEL-S interdependency Preview review

## Scope and methodology

The optional Stage 2 workspace records directed relationships between the existing seven PESTEL-S finding records. It does not introduce multiple findings per dimension, numerical cross-impact scores, causal prediction, automatic SWOT classification, or automatic CBD priorities. Reverse directions and multiple relationships in one direction remain distinct. The map shows counts only; its diagonal is not applicable.

Effect on CBD and planning significance are separate qualitative judgements. Source-finding evidence, target-finding evidence, and explicitly selected relationship evidence remain separate. Missing relationship evidence does not invalidate professional judgement.

Key-insight selection and inclusion in the main brief are separate, explicit decisions. No more than five active valid key insights can be selected for the main brief. There is no automatic top-five selection. Missing findings preserve the relationship text and selection flags for repair, but remove eligibility for the map, Stage 4 source picker and main brief. Invalid SWOT source references are removed without deleting written SWOT analysis or strategic options.

Stage 4 exposes valid relationships as optional source candidates, key insights first. The existing SWOT → strategic option → CBD priority links remain the planning chain. Planning Brief HTML/print, Word and Markdown share one relationship projection: concise selected insights in the main brief and a complete supporting register in Annex E. The map is not exported.

CARANA adds four explicitly fictional interpretations of existing findings, two explicitly selected for the main brief. No relationship-specific evidence is implied merely because its underlying findings have evidence. Existing CARANA planning content and Stage 7 content are unchanged. Legacy files without relationships load with an empty collection.

## Future one-page management output readiness (not implemented)

| Future element | Existing canonical source | Remaining human decision |
| --- | --- | --- |
| Problem | CBD priority capacity problem | Choose executive focus |
| Evidence | Evidence notes and linked analytical sources | Assess sufficiency and currency |
| Ownership | Lead/support actors and Results Plan ownership | Confirm authority and commitment |
| Priority gaps | CBD priority capacity problems | Select decision-relevant gaps |
| Selected interventions | Individual, organizational and enabling-environment interventions | Explicit executive selection is not yet a stored decision |
| Expected result | Planning objective and outputs | Validate ambition and measurability |
| Risks | Priority risks, Results Plan risk management and assumptions | Determine material risks |
| Immediate next steps | NOW-phase activities, milestones and dependencies | Agree order and readiness; NOW does not mean approved or ready |

No new executive-output fields, report redesign, Problem Tree, scoring changes, Logframe, M&E Matrix or Workplan changes were introduced.

## Scoped security repair

Direct dependency Next.js 16.2.9 was in the affected range of critical advisories GHSA-p293-qw3h-jr36 and GHSA-2xp9-vwfh-vxw4 (reported together under one critical package). Next.js 16.3.3 is the supported patched 16.x release. The second advisory concerns image optimization via the sharp/libheif chain; the first concerns Windows-hosted execution. Package applicability is not evidence of exploitation of this deployment.

Only Next.js was changed in the dependency declarations, from 16.2.9 to 16.3.3. Its lockfile dependency closure was updated with npm's package-lock-only operation; unrelated direct dependencies and application version 0.7.0 were retained. No force audit fix, major migration, codemod or compatibility changes were required. Cross-Impact implementation files were unchanged during the security repair.

Primary references:

- https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36
- https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4
- https://github.com/vercel/next.js/releases/tag/v16.3.3

## Local validation — 21 September 2026

- Clean installation, lint, TypeScript validation, all 74 tests, Next.js 16.3.3 production build and whitespace checks passed.
- Final npm audit: 0 critical, 4 high, 2 moderate. Audit exits 1 because remaining non-critical advisories exist; these unrelated repairs are outside the authorized scope.
- Browser: blank start, CARANA replacement confirmation, seven stages, relationship creation, reverse directions, map filtering, explicit Stage 4 → strategic option → priority linkage, missing-finding warning, relinking, deletion confirmation, reload persistence, two-confirmation reset, actual JSON/Word downloads, valid JSON restore and invalid-file rejection preserving the workspace were exercised.
- Keyboard Enter opens the optional workspace with correct expanded/control attributes. No page-level horizontal overflow at widths 390, 768, 1024, 1280 and 1440. Desktop count grid and mobile direction list were visually inspected. No browser errors were recorded in the tested session.
- The real Word generator produced a 14-page CARANA brief; all pages were rendered and visually inspected. Actual browser print output produced 15 pages, all visually inspected, including selected insights and full register. Browser automation used its default Letter PDF output; application print CSS remains A4. No clipping or overlapping text was observed. Existing pagination was not redesigned.
- Existing Logframe, M&E Matrix and Workplan regression tests remained passing; their browser views were opened. No claim of a new output redesign is made.

This is local validation evidence, not a Production release approval. Branch commit and Preview identity must be verified separately at handoff. Main and Production remain outside this sprint.
