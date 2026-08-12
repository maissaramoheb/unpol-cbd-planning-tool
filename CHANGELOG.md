# Changelog

All notable changes to the UNPOL Capacity-Building & Development (CBD) Planning Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Added
- Added explicit traceability fields linking each configured CBD intervention to a capacity problem, planning objective, lead and supporting actors, manual implementation phase, milestone, evidence, and indicators.
- Added manual `NOW` / `NEXT` / `LATER` groupings in Priority & Sequencing and focused quality-control cautions for missing high-priority planning links.
- Included the traceability chain in professional print, Word, and Markdown outputs, and populated it in the fictional CARANA demonstration.

### Changed
- Reframed the 5×6 matrix as **CBD Key Areas × Cross-Cutting Analytical Lenses**, a prototype analytical structure rather than a formal UN taxonomy.
- Replaced circular priority scoring inputs with independent Impact, Urgency, Mandate Relevance, Feasibility, Stakeholder Support, and Implementation Risk ratings; Evidence Confidence remains a separate caution.
- Aligned the visible seven-step workflow and prevented the dashboard Continue action from skipping Priority & Sequencing.
- Replaced the default personal analyst identity with `Participant / Team`.
- Tightened storage, offline, scoring, and reference-alignment claims across documentation and exports.
- Legacy browser workspaces and JSON files remain accepted. Missing traceability fields are normalized to empty values, invalid actor references are safely cleared, and no implementation phase is inferred.

## [0.3.1] - 2026-06-16
### Added
- **Disclaimer Updates**: Enhanced context-specific warning notes regarding client-side data privacy boundaries.
- **UI/UX Polish**: Standardized color hierarchies across advisory and capacity development grids.

## [0.3.0] - 2026-06-15
### Added
- **Stakeholder Decision-Support Quadrants**: Interactive assessment grids evaluating stakeholder reform posture and operational influence.
- **Baseline Mission Profiles**: Preloaded templates matching peacekeeping mandates, special political missions, and rule-of-law advisory missions.

## [0.2.0] - 2026-05-10
### Added
- **Integrated Dashboard**: Real-time summary of PESTEL-S indicators, prioritized sequencing timelines, and stakeholder ratios.
- **Stakeholder Mapping**: Visual sorting of enablers, blockers, spoilers, and neutral actors.
- **Evidence Notes**: Added context notes fields to support citation-backed analysis in PESTEL-S and CBD matrices.
- **Quality Control Warnings**: Real-time warnings prompting planners on empty sections, formatting outliers, or unsequenced tasks.
- **Export Brief Improvements**: Optimized print layout preview and structured Markdown export options.
