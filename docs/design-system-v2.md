# Design System V2 — audit and implementation specification

Baseline: latest remote main `c4820e8`, v0.10.0. Isolated branch: `feature/design-system-v2`. The original Documents/Github checkout is clean on main at `247fa24` and is not modified. The older OneDrive v0.8.0 checkout is not the implementation source.

## Phase A: read-only product audit

Inspected root layout, global and print styles, AppShell, Header, ModuleTabs, Dashboard, all seven stages, shared controls, evidence editor, CBD matrix/grid/list/details, Explorer map/list/detail/compare/dialogs, Professional Outputs and document previews. Existing architecture: client-side canonical project state in AppShell, pure domain/output libraries, React/Tailwind controls, Lucide icons, existing dialog focus hook. No theme engine exists.

783 hard-coded structural/status color matches across 27 TSX files (536 matching lines). Classification:

| Category | Findings | Treatment |
| --- | --- | --- |
| A: theme safe | `bg-surface-*`, `text-text-*`, `border-border-*`; much of stages 1–3 and Dashboard | Retain and extend tokens |
| B: structural | 71 `bg-white`, slate labels/dividers, blue selection/link treatments, fixed dark Header/Explorer chrome; `body` hard-coded text | Migrate application UI to semantic utilities; independently design dark values |
| C: meaning | review cautions, confidence, stakeholder posture, PESTEL dimension accents, matrix heuristics/training badges | Retain labels/icons and distinctions; theme status tones for contrast, keep map colors intentionally explicit |
| D: document | `.professional-report`, `.report-page`, `.executive-brief`, `.planning-output`, print utilities | Keep document CSS/content light, establish a local light token boundary and force light print tokens |

Specific defects: grid uses undefined `surface-card`, `text-default`, `institutional` tokens; modal height can exceed short viewports; broad transition-all remains in dialogs; range ratings and selected buttons assume pale blue; headers/footers carry fixed dark colors; focus offsets assume white; semantic form errors lack aria-invalid; workflow hides its horizontal scrollbar; matrix labels do not stick during horizontal navigation. Dashboard gives warnings and workflow links late/equal visual weight. Theme must not subscribe through or mutate AppShell project data.

## Visual North Star and reference rationale

Audience: analysts and facilitators conducting evidence-aware institutional planning. Character: calm, precise, readable, compact. Signature: a compact command bar, numbered analytical navigation, a mission summary with operational diagnostics, and strong separation of reference guidance from analyst judgement. No decorative gradients, glow, glass panels, giant cards, or methodology changes.

References consulted (principles, no copied layouts): [shadcn composition/theming](https://ui.shadcn.com/docs/dark-mode/next) for semantic control states and predictable theme choice; [Mobbin](https://mobbin.com) for workflow/navigation hierarchy (public overview only, no authenticated screen library); [Layers](https://layers.to/explore) for composition (limited publicly extractable content); [Animista](https://animista.net) for restrained timing/easing; [Godly / Recent](https://recent.design/?ref=godly) for typographic discipline; [Aceternity](https://ui.aceternity.com) and [Skiper](https://skiper-ui.com) for selective interaction refinement. No reference dependencies installed. 10X has no unambiguous supplied reference and is not claimed as studied.

## Token and component specification

Four levels: cool canvas; primary work surface; subtle reference/support surface; elevated overlay. Light retains institutional navy actions, white analytical surfaces, cool gray boundaries. Dark uses deep slate canvas, differentiated cool surfaces, near-white body text, accessible gray metadata, blue actions, and restrained status backgrounds. Actions use separate foreground/link tokens so button fills and text links both maintain contrast.

Required families: canvas; surface base/raised/subtle/hover/active/overlay; primary/secondary/muted/disabled/inverse text; subtle/default/strong borders; primary/hover/active, secondary/hover, danger/hover actions; focus; success/warning/danger/info foreground/background; subtle/raised/overlay shadows. Additional status borders and analytical accent tokens support existing distinctions. Document containers rebind every color/elevation token to light locally; print rebinds light at the root regardless of preference.

Typography: existing system sans; page 24–28px/1.2, section 16–18px/1.35, subsection/control 12–14px, body 14px/1.6, helpers 12px/1.5, metadata 11–12px. Monospace tabular numerals only for stage/score metadata. Spacing: 4px base; control 36px (40px touch minimum on coarse pointers); section gaps 20–24px; panel 16–20px. Radius 4/6/8px; overlays 12px. Motion: color/focus/opacity/transform only, 150–180ms ease-out; no theme color animation; reduced motion suppresses transitions/animation.

Theme preference: exactly light/dark/system under `unpol-cbd-theme`. A synchronous head script resolves preference before paint and sets html[data-theme], html[data-theme-preference], color-scheme. React uses an external UI-only store and stable server snapshot; only the theme control subscribes. System listens to media changes; explicit selections ignore them; blocked storage remains usable in memory. Cross-tab preference events synchronize. No project/export/schema changes.

Responsive rules: Header remains compact, theme icons retain fixed width; stage navigation scrolls and exposes active stage; master/detail turns into stacked selection/editing; tables retain readable minimum widths and named keyboard-scrollable regions; matrix uses its existing mobile list; dialogs constrain to dynamic viewport height. Verify widths 1440, 1280, 1024, 768, 390 in both themes.

## Sequential delivery and verification

A audit/spec → B theme/root/tests → C primitives → D command/navigation/overview → E stages 1–3 → F stages 4–7/matrix → G Explorer/output chrome → H responsive/accessibility/motion/QA. Type-check before each phase and after each major phase. Final lint/types/tests/build/diff check, preserved domain/output files, screenshot matrix, keyboard/dialog/print checks, clean committed feature branch, Preview only. Version remains 0.10.0. Visual owner approval remains pending until owner reviews rendered evidence; engineering pass does not substitute for it.
