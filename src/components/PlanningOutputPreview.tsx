import type { PlanningOutput } from '../lib/planningOutputs';

export function PlanningOutputPreview({ model }: { model: PlanningOutput }) {
  return <article className="planning-output" aria-label={`${model.title} read-only preview`}>
    <h1>{model.title}</h1>
    <p className="font-semibold">{model.status}</p><p>{model.context}</p>
    {model.metadata.map((text, i) => <p key={i} className="output-meta">{text}</p>)}
    <p className="output-meta">Application version: {model.version}</p>
    <p className="output-meta">{model.notice}</p>
    {model.sections.map((section, i) => <section key={i}>
      <h2>{section.title}</h2>
      {section.notes.map((note, n) => <p key={n}>{note}</p>)}
      {section.tables.map((table, t) => <div key={t} className="output-table-block">
        <h3 id={`output-table-${i}-${t}`}>{table.title}</h3>
        <div className="output-table-scroll" role="region" aria-labelledby={`output-table-${i}-${t}`} tabIndex={0}>
          <table><colgroup>{table.widths.map((width, c) => <col key={c} style={{ width: `${width}%` }} />)}</colgroup>
            <thead><tr>{table.columns.map((column, c) => <th scope="col" key={c}>{column}</th>)}</tr></thead>
            <tbody>{table.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>)}
    </section>)}
  </article>;
}
