import assert from 'node:assert/strict';
import test from 'node:test';
import { answered, coaching, conversation, effectiveGap, problemSummary, reviseAnswer } from '../src/data/conversation.js';

test('each gap has a distinct evidence investigation, including uncertainty', () => {
  const titles = new Set();
  for (const gap of ['knowledge', 'application', 'motivation', 'barrier', 'unsure']) {
    const path = conversation({ gap });
    titles.add(path.find(node => node.id === 'evidence').title);
    assert.equal(path.some(node => node.id === 'probe'), gap === 'unsure');
    assert.ok(path.find(node => node.id === 'evidence').options.some(item => item.value === 'unsure'));
  }
  assert.equal(titles.size, 5);
});

test('uncertainty can resolve into any gap, or remain open without blocking progress', () => {
  for (const probe of ['knowledge', 'application', 'motivation', 'barrier', 'unsure']) {
    const answers = { gap: 'unsure', probe };
    assert.equal(effectiveGap(answers), probe);
    assert.equal(conversation(answers).find(node => node.id === 'evidence').title, conversation({ gap: probe }).find(node => node.id === 'evidence').title);
  }
});

test('workplace and investigate paths do not require a learning theory or model', () => {
  for (const response of ['workplace', 'investigate']) {
    const path = conversation({ gap: 'barrier', response });
    assert.ok(path.some(node => node.id === 'action'));
    assert.ok(!path.some(node => ['lens', 'approaches', 'mechanism', 'process'].includes(node.id)));
    assert.ok(path.some(node => node.id === 'transfer'));
  }
  assert.notEqual(conversation({ response: 'workplace' }).find(node => node.id === 'action').options[0].value, conversation({ response: 'investigate' }).find(node => node.id === 'action').options[0].value);
});

test('lens selection changes which exploration questions are asked', () => {
  for (const [lens, mechanism, process] of [['theory', true, false], ['model', false, true], ['both', true, true], ['unsure', true, true]]) {
    const ids = conversation({ response: 'learning', lens }).map(node => node.id);
    assert.equal(ids.includes('mechanism'), mechanism);
    assert.equal(ids.includes('process'), process);
    assert.ok(ids.includes('approaches'));
  }
});

test('revising a diagnosis removes stale evidence, summary, and approach choices', () => {
  const before = { learners: 'students', gap: 'knowledge', evidence: 'explain', response: 'learning', summary: 'Old framing', lens: 'theory', mechanism: 'organize', approaches: ['Cognitivism'], reason: 'gap', transfer: 'new' };
  const after = reviseAnswer(before, 'gap', 'barrier');
  assert.deepEqual(after, { learners: 'students', gap: 'barrier' });
  assert.equal(before.gap, 'knowledge');
});

test('changing an uncertain diagnosis discards the old probe and incompatible answers', () => {
  const after = reviseAnswer({ learners: 'newcomers', gap: 'unsure', probe: 'application', evidence: 'novel', response: 'both' }, 'gap', 'motivation');
  assert.deepEqual(after, { learners: 'newcomers', gap: 'motivation' });
});

test('summary uses selected evidence and context without claiming a confirmed cause', () => {
  const text = problemSummary({ learners: 'students', gap: 'unsure', probe: 'barrier', evidence: 'tools', response: 'workplace' }, 'Lab equipment is unavailable.');
  assert.match(text, /may face barriers/);
  assert.match(text, /missing tools/);
  assert.match(text, /performance conditions/);
  assert.match(text, /Lab equipment is unavailable/);
});

test('uncertainty and deferred theory choice are valid answers, with no writing requirement', () => {
  assert.equal(answered({ id: 'reason' }, { reason: 'unsure' }), true);
  assert.equal(answered({ id: 'approaches', kind: 'approaches' }, { approaches: ['defer'] }), true);
  assert.equal(answered({ id: 'approaches', kind: 'approaches' }, { approaches: [] }), false);
  assert.equal(answered({ id: 'gap' }, {}), false);
});

test('coaching questions training when the evidence points toward conditions', () => {
  assert.match(coaching({ id: 'response' }, { gap: 'barrier', response: 'learning' }), /how would instruction change the barrier/);
  assert.match(coaching({ id: 'response' }, { gap: 'motivation', evidence: 'conditions', response: 'learning' }), /barrier/);
});

test('revisiting an unchanged answer keeps later choices intact', () => {
  const answers = { gap: 'application', evidence: 'novel', response: 'learning', summary: 'Working framing', approaches: ['Constructivism'] };
  assert.equal(reviseAnswer(answers, 'summary', 'Working framing'), answers);
  assert.equal(reviseAnswer(answers, 'approaches', ['Constructivism']), answers);
});

test('every major route can reach completion using selections only', () => {
  for (const gap of ['knowledge', 'application', 'motivation', 'barrier', 'unsure']) {
    for (const response of ['learning', 'workplace', 'both', 'investigate']) {
      let answers = {};
      let currentId = 'learners';
      let completed = false;
      for (let turn = 0; turn < 20; turn++) {
        const path = conversation(answers);
        const index = path.findIndex(node => node.id === currentId);
        const node = path[index];
        if (node.kind === 'finish') { completed = true; break; }
        const value = node.id === 'gap' ? gap : node.id === 'response' ? response : node.kind === 'summary' ? problemSummary(answers) : node.kind === 'approaches' ? ['defer'] : node.options.at(-1).value;
        answers = reviseAnswer(answers, node.id, value);
        assert.equal(answered(node, answers), true, `${gap}/${response}/${node.id}`);
        const nextPath = conversation(answers);
        currentId = nextPath[nextPath.findIndex(item => item.id === currentId) + 1].id;
      }
      assert.equal(completed, true, `${gap}/${response}`);
    }
  }
});
