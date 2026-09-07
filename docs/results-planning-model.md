# Stage 7 shared Results Plan (Preview)

Each configured `customCells[key]` owns its optional `resultsPlan` (schemaVersion 1).
Deleting the cell removes its plan. The project version remains v0.6.0 during this Preview sprint.

## Canonical fields

- Objective: `planningObjective`; Change Logic THEN and outcome indicator links resolve to this field using the cell key.
- Intervention package: `individual`, `organizational`, `environment`; activities link by intervention level and store only additional detail.
- Accountable lead/support, phase and priority milestone remain the Stage 5 fields. Activities have explicitly separate implementing actors and optional granular timing.
- Indicators: the existing `indicators` array becomes structured records, with one statement per indicator. Stage 5, Stage 7, Markdown, print and DOCX read this same array. Rich measurement data is not added to the existing brief.
- Risk: `risks` remains the shared priority risk/conditions text. `resultsPlan.riskManagement` adds mitigation, actor and review notes for that text.

## Records and structural links

Outputs and activities have stable IDs and persisted OUT/ACT references. Other records have stable IDs; display order is not identity. IDs are scoped to a priority and record type. Cross-priority dependencies carry both the priority key and activity ID.

Evidence / PESTEL-S / stakeholder / profile references → SWOT → Strategic Option → CBD cell → shared objective → outputs → activities → indicators → implementation dependencies/resources/actors.

The existing diagnostic and synthesis links are unchanged. New output/activity/indicator links describe the analyst's planning relationships, not causal proof. Change Logic IF references intervention levels and/or activities; THEN reuses the objective; BECAUSE stores rationale; PROVIDED THAT references assumptions.

## Legacy and integrity behavior

Legacy indicator strings retain their exact text, order, duplicates, whitespace and empty entries. Deterministic IDs derive from cell key and original position, avoiding collisions with existing structured IDs. Once normalized, IDs persist through edits and reordering. New UI records use UUIDs.

Legacy cells do not acquire a populated Results Plan. Measurement defaults are empty/unassigned. No baseline, target, resources, assumption, dependency, ownership or sustainability judgement is inferred.

The importer validates record shapes, enum values and duplicate IDs before accepting a payload. Invalid payloads fail atomically. Unsupported Results Plan schema versions are rejected. Existing browser persistence and JSON entry points remain unchanged.

Normalization clears missing actor, output, activity, assumption, resource and dependency references while retaining planning statements. A removed counterpart resets ownership status to Not yet assessed; a lost dependency target resets its status to Not assessed. Cleanup runs on load/import and live cell/stakeholder updates, across all priorities.

## Future outputs

A future Logframe can join the shared objective, outputs, indicators and assumptions by priority/record IDs. An M&E matrix can project the same indicators' baseline, target, verification, frequency, actor and disaggregation fields. A workplan can join activities to canonical interventions, output IDs, implementing/support actors, activity timing (or shared priority timing), dependencies and resources. No copied data or additional export controls are introduced here.

Completeness means Recorded / Partially recorded / Not recorded; it does not validate quality, ownership or sustainability. Cautions are grouped per priority, optional and non-blocking. Dependencies do not drive automatic scheduling, and resources contain no costing or budget calculations.
