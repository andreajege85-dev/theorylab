// Conversation rules are separate from rendering so paths can be reviewed and tested.
const option = (value, label, detail) => ({ value, label, detail });
export const gapOptions = [
  option('knowledge', 'They do not yet know or understand', 'Key ideas, information, or steps are unfamiliar.'),
  option('application', 'They know it, but struggle to use it', 'Performance breaks down during an authentic task.'),
  option('motivation', 'They can do it, but do not consistently engage', 'Relevance, confidence, incentives, or opportunity may matter.'),
  option('barrier', 'Something in the environment gets in the way', 'Tools, access, time, expectations, or workflow may block performance.'),
  option('unsure', "I’m not sure yet", 'Let’s look for evidence before naming the gap.'),
];
const evidence = {
  knowledge: { title: 'What would help you check the understanding gap?', options: [option('explain', 'Ask learners to explain or recall a key idea', 'Look for misconceptions rather than assuming a low score tells the whole story.'), option('example', 'Ask learners to distinguish examples from non-examples', 'See whether they recognize when an idea applies.')] },
  application: { title: 'Where does performance seem to break down?', options: [option('novel', 'A new situation differs from the practiced example', 'Investigate transfer, cues, and opportunities to practice.'), option('complex', 'The task has many unfamiliar steps at once', 'Observe where attention or working memory may become overloaded.'), option('feedback', 'Learners have had little practice or useful feedback', 'Check whether they have had a supported chance to perform.')] },
  motivation: { title: 'What might explain the inconsistent engagement?', options: [option('value', 'The purpose or relevance is unclear', 'Ask learners what makes the task worth doing.'), option('confidence', 'Learners hesitate or expect to fail', 'Check confidence, prior experiences, and available support.'), option('conditions', 'Time, incentives, or competing expectations interfere', 'A willingness issue may actually reflect workplace conditions.')] },
  barrier: { title: 'Which condition would you investigate first?', options: [option('tools', 'Missing tools, access, or accessible materials', 'Check whether people have what they need to perform.'), option('workflow', 'Time, workload, or conflicting expectations', 'Examine the conditions before prescribing instruction.'), option('standards', 'Unclear expectations or feedback from the organization', 'Clarify what successful performance means with stakeholders.')] },
  unsure: { title: 'What evidence could help distinguish the possible causes?', options: [option('observe', 'Observe a real task and ask learners what gets in the way', 'Compare what learners know with what conditions allow them to do.'), option('compare', 'Compare performance with and without support', 'Notice whether a worked example, tool, or clearer expectation changes performance.')] },
};
export function effectiveGap(answers) {
  return answers.gap === 'unsure' ? (answers.probe || 'unsure') : (answers.gap || 'unsure');
}
export function conversation(answers) {
  const gap = effectiveGap(answers);
  const workplace = answers.response === 'workplace' || answers.response === 'investigate';
  const nodes = [
    { id: 'learners', phase: 0, title: 'Who are you designing with in mind?', description: 'Start with people in a real situation. Choose the closest fit; you can add your own context if you want.', options: [option('students', 'Students in a course', 'A classroom, studio, lab, or online learning experience.'), option('newcomers', 'People new to a role or task', 'An onboarding, professional, or community setting.'), option('experienced', 'Experienced people facing a new challenge', 'A changed process, complex decision, or unfamiliar context.'), option('other', 'Another group / still exploring', 'Keep the context open while you investigate.')] },
    { id: 'gap', phase: 0, title: 'What are you noticing about the challenge?', description: 'Treat this as a working hypothesis, not a diagnosis. Several causes can coexist.', options: gapOptions },
  ];
  if (answers.gap === 'unsure') nodes.push({ id: 'probe', phase: 0, title: 'Which observation would best describe what you see?', description: 'If the evidence is not available yet, it is reasonable to stay uncertain.', options: [option('knowledge', 'They cannot explain the idea, even with time and support'), option('application', 'They explain it, but struggle during a real task'), option('motivation', 'They demonstrate the skill, but rarely choose to use it'), option('barrier', 'They perform when tools or conditions improve'), option('unsure', 'I have not observed enough to tell')] });
  nodes.push(
    { id: 'evidence', phase: 0, ...evidence[gap], description: 'Choose a clue to investigate. A selection is a plan for gathering evidence, not proof of a cause.', options: [...evidence[gap].options, option('unsure', "I’m not sure — start with observation", 'Ask learners to show a task and describe what helps or hinders them.')] },
    { id: 'response', phase: 0, title: 'What kind of response is worth exploring first?', description: gap === 'barrier' || answers.evidence === 'conditions' ? 'You have identified possible performance conditions. More training may leave those conditions unchanged.' : 'Use your evidence plan to decide what to explore. Instruction is one possibility, not the default.', options: [option('learning', 'Explore learning support', 'Consider practice, explanations, feedback, or other learning experiences.'), option('workplace', 'Explore a change to the conditions', 'Consider tools, access, expectations, workload, or workflow.'), option('both', 'Explore learning support and conditions together', 'Give each response a distinct job.'), option('investigate', 'Gather evidence before choosing a response', 'Keep alternative explanations open.')] },
    { id: 'summary', phase: 0, title: 'Does this capture your current understanding?', description: 'This is a working problem summary, assembled from your choices. Edit it or keep it as a starting point.', kind: 'summary' },
  );
  if (!workplace) {
    nodes.push({ id: 'lens', phase: 1, title: 'What kind of thinking would help you next?', description: 'A learning theory explains learning. A design model organizes design decisions. Neither is a diagnosis of the problem.', options: [option('theory', 'Understand how learning might happen', 'Explore a learning theory.'), option('model', 'Organize the design decisions', 'Explore an instructional design model.'), option('both', 'Connect learning explanations with design decisions', 'Explore a theory and a model for different purposes.'), option('unsure', "I’m not sure — explore both kinds of questions", 'Compare their contributions before choosing.')] });
    if (answers.lens !== 'model') nodes.push({ id: 'mechanism', phase: 1, title: 'What would you want a learning experience to support?', description: 'Choose the learning process you want to examine. Different theories may support a defensible design; these are prompts, not a matching quiz.', options: [option('practice', 'Observable practice with feedback'), option('organize', 'Organizing ideas and retrieving them later'), option('meaning', 'Interpreting authentic experiences with others'), option('load', 'Managing complexity for novices'), option('unsure', 'Compare possibilities before deciding')] });
    if (answers.lens !== 'theory') nodes.push({ id: 'process', phase: 1, title: 'Which design decision needs attention?', description: 'Think about what a process would help you decide, not just the name of a model.', options: [option('investigate', 'Investigating needs and iterating on a solution'), option('align', 'Aligning outcomes, evidence, and learning activities'), option('unsure', 'Both / I need to compare the processes')] });
    nodes.push({ id: 'approaches', phase: 1, kind: 'approaches', title: 'Which ideas would you like to try together?', description: 'Choose one or more ideas to investigate. All six remain available, even if they differ from your earlier lens. You can also defer the choice.' });
  } else {
    nodes.push({ id: 'action', phase: 1, title: answers.response === 'investigate' ? 'What would you do to learn more before intervening?' : 'What change would you explore with the people affected?', description: 'A non-training response is a valid design decision. Keep learners and stakeholders involved.', options: answers.response === 'investigate' ? [option('observe', 'Observe a task and interview learners'), option('compare', 'Compare performance under different conditions'), option('clarify', 'Clarify the desired performance with stakeholders'), option('unsure', 'Start by asking learners what gets in their way')] : [option('access', 'Improve access to tools or accessible resources'), option('workflow', 'Review workflow, time, or competing incentives'), option('expectations', 'Clarify expectations and performance feedback'), option('unsure', 'Investigate the barrier before proposing a change')] });
  }
  nodes.push(
    { id: 'reason', phase: 2, title: 'What makes this a reasonable next move?', description: 'Choose your strongest reason. You can add a brief explanation, but writing is optional.', options: workplace ? [option('conditions', 'It tests or addresses a condition instruction cannot fix alone'), option('evidence', 'It gathers evidence before committing resources'), option('alternative', 'It lets us compare explanations for the problem'), option('unsure', 'I still need to test whether this fits')] : [option('gap', 'It connects a learning process to the gap I identified'), option('alignment', 'It helps align the desired performance with evidence and practice'), option('context', 'It fits the learners and conditions in this situation'), option('unsure', 'It is a hypothesis I want to test, not a settled answer')] },
    { id: 'transfer', phase: 2, title: 'What would help you judge whether your next move works?', description: 'Choose an evidence plan tied to authentic performance. A positive reaction alone does not establish that learning or performance improved.', options: [option('task', 'Observe the intended performance on an authentic task'), option('new', 'Ask learners to apply what they learned in a new situation'), option('conditions', 'Compare performance before and after a condition changes'), option('unsure', 'First clarify the intended performance with learners and stakeholders')] },
    { id: 'finish', phase: 2, kind: 'finish', title: 'You have a working direction to test.', description: 'Your choices form a hypothesis, not a scored answer. Revisit a step or explore another path as your evidence changes.' },
  );
  return nodes;
}
export function reviseAnswer(answers, id, value) {
  if (JSON.stringify(answers[id]) === JSON.stringify(value)) return answers;
  const path = conversation(answers);
  const index = path.findIndex(node => node.id === id);
  if (index < 0) return answers;
  // Retain only answers up to this point. No stale answers survive a branch change.
  const retained = new Set(path.slice(0, index).map(node => node.id));
  return { ...Object.fromEntries(Object.entries(answers).filter(([key]) => retained.has(key))), [id]: value };
}
export function answered(node, answers) {
  if (node.kind === 'finish') return true;
  if (node.kind === 'summary') return Boolean(answers.summary?.trim());
  if (node.kind === 'approaches') return Array.isArray(answers.approaches) && answers.approaches.length > 0;
  return Boolean(answers[node.id]);
}
export function labelFor(answers, id) {
  const node = conversation(answers).find(item => item.id === id);
  return node?.options?.find(item => item.value === answers[id])?.label || '';
}
export function problemSummary(answers, context = '') {
  const people = { students: 'Students in a course', newcomers: 'People new to a role or task', experienced: 'Experienced people facing a new challenge', other: 'A learner group still to be specified' };
  const gaps = { knowledge: 'may need stronger knowledge or understanding', application: 'may need support applying what they know', motivation: 'show inconsistent engagement that needs investigation', barrier: 'may face barriers in their performance environment', unsure: 'face a challenge whose causes are not yet clear' };
  const response = { learning: 'explore learning support', workplace: 'explore changes to performance conditions', both: 'explore learning support and performance conditions together', investigate: 'gather evidence before choosing an intervention' };
  return `${people[answers.learners] || 'Learners'} ${gaps[effectiveGap(answers)]}. I will investigate: ${(labelFor(answers, 'evidence') || 'the available evidence').toLowerCase()}. My current direction is to ${response[answers.response] || 'investigate before deciding'}.${context.trim() ? ` Context: ${context.trim()}` : ''}`;
}
export function coaching(node, answers) {
  const value = answers[node.id];
  if (!value || node.kind) return '';
  if (node.id === 'gap' && value === 'unsure') return 'Uncertainty is useful here. Let’s distinguish what learners know from what their conditions allow them to do.';
  if (node.id === 'gap' && value === 'motivation') return 'Low engagement does not establish low motivation. Check relevance, confidence, opportunity, and incentives before attributing the cause to learners.';
  if (node.id === 'response') {
    if (value === 'learning' && (effectiveGap(answers) === 'barrier' || answers.evidence === 'conditions')) return 'Pause on this assumption: how would instruction change the barrier you identified? You can reconsider or carry this as a hypothesis to test.';
    if (value === 'workplace') return 'Changing conditions can be the appropriate response. A learning theory is not required to justify removing a performance barrier.';
    if (value === 'investigate') return 'Deferring a solution is defensible when evidence is thin. Choose a concrete way to distinguish competing explanations.';
    return 'Keep this provisional. What evidence would make you change your view about the role of learning support?';
  }
  if (node.id === 'mechanism') return 'Use this as a lens, not a prescription. Consider which learning process your activity would support and what the lens leaves unexplained.';
  if (node.id === 'process') return 'A process can organize your decisions; it does not by itself explain how learning happens.';
  if (node.id === 'transfer' && value === 'conditions' && answers.response === 'learning') return 'A change in conditions can affect performance independently of learning. Consider how you would distinguish those contributions.';
  if (value === 'unsure') return 'You can continue with a question to investigate. You do not need to claim certainty to make a thoughtful next move.';
  if (node.id === 'reason') return 'That is a starting rationale. Check whether your selected approach actually does this job, and name evidence that could challenge it.';
  return 'Keep the observation separate from the explanation. Your next evidence may support a different account.';
}
export const mechanismPrompts = {
  practice: 'How might cues, practice, consequences, and feedback shape observable performance? Compare Behaviorism with other accounts of learning.',
  organize: 'How might attention, prior knowledge, organization, and retrieval matter? Cognitivism offers one way to examine these processes.',
  meaning: 'How might learners interpret experiences, compare perspectives, and revise understanding? Constructivism offers one lens.',
  load: 'What processing is essential, and what could be reduced for novices? Cognitive Load Theory offers one lens on this question.',
  unsure: 'Compare explanations of observable behavior, mental processing, meaning-making, and working-memory limits. More than one may contribute.',
};
