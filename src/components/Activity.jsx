import { useEffect, useRef, useState } from 'react';
import { entries } from '../data/library';
import { answered, coaching, labelFor, mechanismPrompts, problemSummary } from '../data/conversation';

function ResponseCards({ node, value, onChange }) {
  return (
    <fieldset className="response-set">
      <legend className="sr-only">{node.title}</legend>
      <div className="response-cards">
        {node.options.map(item => (
          <label className="response-card" key={item.value}>
            <input type="radio" name={node.id} value={item.value} checked={value === item.value} onChange={() => onChange(item.value)} />
            <span><strong>{item.label}</strong>{item.detail && <small>{item.detail}</small>}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ApproachExplorer({ answers, update, openLibrary }) {
  const selected = answers.approaches || [];
  function toggle(value, checked) {
    const values = selected.filter(item => item !== 'defer');
    update('approaches', value === 'defer' ? (checked ? ['defer'] : []) : (checked ? [...values, value] : values.filter(item => item !== value)));
  }
  return (
    <>
      <div className="feedback exploration">
        <strong>Questions to carry into your choice</strong>
        {answers.mechanism && <p>{mechanismPrompts[answers.mechanism]}</p>}
        {answers.process && <p>{answers.process === 'align' ? 'Backward Design starts with results and acceptable evidence. How would that sequence help your situation?' : answers.process === 'investigate' ? 'ADDIE organizes analysis, design, development, implementation, and evaluation. What would you investigate and revisit?' : 'Compare ADDIE’s iterative phases with Backward Design’s focus on results and evidence. What job would each do?'}</p>}
        <p>These connections are possibilities, not recommendations or correct answers.</p>
      </div>
      <fieldset>
        <legend>Select ideas to investigate, or defer the choice</legend>
        <div className="approach-grid">
          {entries.map(item => (
            <div className="approach-option" key={item.name}>
              <label className="approach"><input type="checkbox" checked={selected.includes(item.name)} onChange={event => toggle(item.name, event.target.checked)} /><span>{item.name}<small>{item.type}</small></span></label>
              <details><summary>Consider this idea</summary><p>{item.description}</p><p>{item.question}</p></details>
            </div>
          ))}
        </div>
        <label className="choice defer"><input type="checkbox" checked={selected.includes('defer')} onChange={event => toggle('defer', event.target.checked)} /><span>I’m not ready to choose an idea yet<small>I will compare possibilities and gather evidence.</small></span></label>
      </fieldset>
      <button type="button" className="text-button" onClick={openLibrary}>Compare applications in the starter library →</button>
    </>
  );
}

function DirectionSummary({ answers, context, navigate, reflection }) {
  const choices = answers.approaches?.filter(item => item !== 'defer') || [];
  return (
    <div className="direction-summary">
      <div className="feedback success" role="status"><strong>✓ Working direction captured for this session</strong><p>No score or claim of a correct solution. Your next step is to test the reasoning.</p></div>
      <h3>Your problem</h3><p className="summary-copy">{answers.summary || problemSummary(answers, context)}</p>
      <button type="button" className="text-button" onClick={() => navigate('summary')}>Edit the problem summary →</button>
      <dl>
        <dt>Direction to explore</dt><dd>{labelFor(answers, 'response')}</dd>
        <dt>{answers.action ? 'Next action' : 'Ideas to investigate'}</dt><dd>{answers.action ? labelFor(answers, 'action') : choices.length ? choices.join(' + ') : 'Compare ideas before committing to an approach.'}</dd>
        <dt>Your rationale</dt><dd>{labelFor(answers, 'reason')}</dd>
        <dt>Evidence plan</dt><dd>{labelFor(answers, 'transfer')}</dd>
        {reflection.trim() && <><dt>Your brief reflection</dt><dd className="summary-copy">{reflection}</dd></>}
      </dl>
      <div className="feedback"><strong>Carry this into your context</strong><p>Try a small next move with learners or stakeholders. Look for evidence that challenges your explanation as well as evidence that supports it.</p></div>
    </div>
  );
}

export function Activity({ node, path, index, answers, update, navigate, context, updateContext, reflection, setReflection, openLibrary }) {
  const [error, setError] = useState('');
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const guidance = coaching(node, answers);
  const summary = answers.summary ?? problemSummary(answers, context);

  function next(event) {
    event.preventDefault();
    if (node.kind !== 'summary' && !answered(node, answers)) {
      setError(node.kind === 'approaches' ? 'Choose an idea to investigate, or choose to defer.' : 'Choose a response to continue. “I’m not sure” is welcome where offered.');
      return;
    }
    if (node.kind === 'summary') update('summary', summary.trim() || problemSummary(answers, context));
    navigate(path[index + 1].id);
  }

  return (
    <section className="activity conversation" aria-label="Guided conversation">
      <div className="card-heading"><span className="section-icon">{['✎', '⌕', '✧'][node.phase]}</span><span className="badge">SCRIPTED THINKING PARTNER</span></div>
      <div className="conversation-position">{node.kind === 'finish' ? 'A direction worth testing' : `Question ${index + 1} · ${['Frame the challenge', 'Explore possibilities', 'Reflect & test'][node.phase]}`}</div>
      <h2 ref={heading} tabIndex={-1}>{node.title}</h2>
      <p className="description">{node.description}</p>
      {node.kind === 'finish' ? (
        <>
          <DirectionSummary answers={answers} context={context} navigate={navigate} reflection={reflection} />
          <div className="form-actions"><button className="text-button" onClick={() => navigate(path[index - 1].id)}>← Revisit evidence plan</button><button className="primary" onClick={() => navigate('gap')}>Explore an alternative →</button></div>
          <p className="revision-note">Your answers remain until you change a selection. Changing an earlier answer clears dependent choices and reflection.</p>
        </>
      ) : (
        <form onSubmit={next}>
          {node.phase > 0 && <details className="recap">
            <summary>Your working framing & choices</summary>
            <p>{answers.summary || problemSummary(answers, context)}</p>
            <p><strong>Direction:</strong> {labelFor(answers, 'response')}</p>
            {answers.approaches && <p><strong>Ideas:</strong> {answers.approaches.filter(item => item !== 'defer').join(' + ') || 'Compare ideas before committing.'}</p>}
            {answers.action && <p><strong>Next action:</strong> {labelFor(answers, 'action')}</p>}
            <button type="button" className="text-button" onClick={() => navigate('summary')}>Revisit the framing →</button>
          </details>}
          {node.options && <ResponseCards node={node} value={answers[node.id]} onChange={value => { update(node.id, value); setError(''); }} />}
          {node.id === 'learners' && <details className="builder"><summary>Add your own circumstances <span>Optional</span></summary><label htmlFor="context">A real task, learner group, or constraint</label><textarea id="context" rows={3} value={context} onChange={event => updateContext(event.target.value)} placeholder="For example: Teaching assistants facilitating discussions in a large first-year course." /></details>}
          {node.kind === 'summary' && <><div className="summary-preview"><p className="summary-copy">{summary || problemSummary(answers, context)}</p></div><details className="builder"><summary>Edit this summary <span>Optional</span></summary><label htmlFor="summary">Your working problem summary</label><textarea id="summary" rows={5} value={summary} onChange={event => update('summary', event.target.value)} /><button type="button" className="text-button" onClick={() => update('summary', problemSummary(answers, context))}>Use summary from my choices</button></details><p className="revision-note">Keep it provisional. You can revisit the observations behind it.</p></>}
          {node.kind === 'approaches' && <ApproachExplorer answers={answers} update={update} openLibrary={openLibrary} />}
          {guidance && <div className="feedback" role="status"><strong>Coaching prompt · rule-based</strong><p>{guidance}</p></div>}
          {node.id === 'reason' && <details className="builder"><summary>Add a brief thought <span>Optional</span></summary><label htmlFor="reflection">A connection, concern, or alternative you want to remember</label><textarea id="reflection" rows={2} value={reflection} onChange={event => setReflection(event.target.value)} placeholder="A sentence or a few words is enough." /></details>}
          {error && <p className="error" role="alert">{error}</p>}
          <div className="form-actions"><span>{index > 0 ? <button type="button" className="text-button" onClick={() => navigate(path[index - 1].id)}>← Back</button> : 'No required typing.'}</span><button type="submit" className="primary">{node.kind === 'summary' ? 'Keep this framing' : node.id === 'transfer' ? 'See my direction' : 'Continue'} <span>→</span></button></div>
          <p className="revision-note">You can go back at any time. Changing an answer clears later choices so you can explore a consistent new path.</p>
        </form>
      )}
    </section>
  );
}
