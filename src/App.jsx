import { useState } from 'react';
import { Library } from './components/Library';
import { Activity } from './components/Activity';
import { answered, conversation, reviseAnswer } from './data/conversation';
import './App.css';

export default function App() {
  const [view, setView] = useState('workspace');
  const [answers, setAnswers] = useState({});
  const [currentId, setCurrentId] = useState('learners');
  const [context, setContext] = useState('');
  const [reflection, setReflection] = useState('');
  const path = conversation(answers);
  const index = Math.max(0, path.findIndex(node => node.id === currentId));
  const node = path[index];

  function update(id, value) {
    if (JSON.stringify(answers[id]) === JSON.stringify(value)) return;
    setAnswers(previous => reviseAnswer(previous, id, value));
    if (id !== 'transfer') setReflection('');
  }
  function updateContext(value) {
    setContext(value);
    setAnswers(previous => previous.learners ? { learners: previous.learners } : {});
    setReflection('');
  }
  function goToPhase(phase) {
    const target = path.find(item => item.phase === phase);
    if (target) setCurrentId(target.id);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={event => { event.preventDefault(); setView('workspace'); }}>
          <span className="logo">T✦</span><span>TheoryLab<small>THE ID THINKING PARTNER</small></span>
        </a>
        <div className="nav-label">YOUR LEARNING SPACE</div>
        <nav aria-label="Main navigation">
          <button className={view === 'workspace' ? 'active' : ''} onClick={() => setView('workspace')}>◈ <span>Thinking workspace</span></button>
          <button className={view === 'library' ? 'active' : ''} onClick={() => setView('library')}>▤ <span>Theory & model library</span><b>6</b></button>
        </nav>
        <div className="sidebar-note"><span>✧</span><h3>Good design starts<br />with good questions.</h3><p>Make connections. Challenge assumptions. Build your design reasoning.</p></div>
        <div className="session">● A space to practice<small>Session only · refresh clears your work</small></div>
      </aside>
      <div className="main-shell">
        <header>Learning studio <span>/</span><strong>{view === 'workspace' ? 'Thinking workspace' : 'Starter library'}</strong><div className="student">GRADUATE LEARNING <b>ID</b></div></header>
        <main>
          <div className="eyebrow">A LITTLE THEORY. A LOT OF POSSIBILITY.</div>
          <h1>{view === 'workspace' ? 'Turn a real problem into thoughtful design.' : 'Ideas for your design toolkit.'}</h1>
          <p className="intro">{view === 'workspace' ? 'Let’s work through your challenge, one question at a time. Explore possibilities, question assumptions, and choose a direction worth testing.' : 'A starter library to help you distinguish explanations of learning from processes for designing instruction.'}</p>
          {view === 'library' ? (
            <><Library /><button className="primary" onClick={() => setView('workspace')}>Return to your conversation →</button></>
          ) : (
            <>
              <div className="journey" aria-label="Conversation phases">
                {['Frame your problem', 'Explore possibilities', 'Reflect & test'].map((title, phase) => {
                  const targetIndex = path.findIndex(item => item.phase === phase);
                  const available = path.slice(0, targetIndex).every(item => answered(item, answers));
                  return <button key={title} className={node.phase === phase ? 'current' : ''} disabled={!available} aria-current={node.phase === phase ? 'step' : undefined} onClick={() => goToPhase(phase)}><b>{phase + 1}</b><span><small>PHASE 0{phase + 1}</small>{title}</span><span className="arrow">→</span></button>;
                })}
              </div>
              <div className="workspace">
                <Activity key={node.id} node={node} path={path} index={index} answers={answers} update={update} navigate={setCurrentId} context={context} updateContext={updateContext} reflection={reflection} setReflection={setReflection} openLibrary={() => setView('library')} />
                <aside className="companion">
                  <div className="spark">✦</div><div className="eyebrow">YOUR THINKING COMPANION</div>
                  <h2>The problem comes first.<br />The framework follows.</h2>
                  <p>A learning theory helps explain <em>how people learn</em>. A design model helps structure <em>how you design instruction</em>.</p>
                  <div className="tip">↗ <span>Sometimes you need both. Sometimes the next move is to change conditions or gather evidence.</span></div>
                  <button className="text-button" onClick={() => setView('library')}>Explore the starter library →</button>
                  <div className="honesty">Scripted, rule-based guidance.<br />No live AI or automated grading.</div>
                </aside>
              </div>
              <div className="bottom-note">◎ <p><strong>Practice the thinking behind the design.</strong> Multiple approaches can be defensible. Uncertainty is a starting point for investigation.</p></div>
            </>
          )}
          <footer>TheoryLab · A thinking partner, not an answer key.<span>LEARN. CONNECT. APPLY.</span></footer>
        </main>
      </div>
    </div>
  );
}
