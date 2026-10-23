import { useState } from 'react';
import { entries } from '../data/library';
export function Library() {
  const [filter, setFilter] = useState('All');
  return <section aria-label="Starter library">
<div className="library-heading">
<div className="eyebrow">STARTER LIBRARY · 6 ENTRIES</div>
<p>Learning theories explain learning; design models organize design. These summaries are starting points for deeper study.</p>
<div className="filters">{['All', 'Learning theory', 'Design model'].map(type => <button key={type} className={filter === type ? 'selected' : ''} aria-pressed={filter === type} onClick={() => setFilter(type)}>{type === 'All' ? 'All entries' : type === 'Learning theory' ? 'Theories' : 'Models'}</button>)}</div>
</div>
<div className="library-grid">{entries.filter(item => filter === 'All' || item.type === filter).map(item => <article className="library-card" key={item.name}>
<span className="badge">{item.type}</span>
<h2>{item.name}</h2>
<div className="cue">{item.cue}</div>
<p>{item.description}</p>
<details>
<summary>See an application</summary>
<p>{item.application}</p>
<p className="question">Ask yourself: {item.question}</p>
</details>
</article>)}</div>
</section>;
}
