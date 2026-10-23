# TheoryLab: The ID Thinking Partner

Iteration 2: a guided conversation for instructional design graduate students. The existing purple palette, typography, sidebar, branding, layout, and six-entry library are preserved. The activity now emphasizes selectable responses and hypothesis testing instead of required writing.

## Run locally in Chrome

From the TheoryLab folder, run `npm run dev`, then open the URL Vite prints. Refreshing clears this session's responses.

If npm is not on this machine's PATH, use the installed Node executable directly:

```powershell
& 'C:\Program Files\nodejs\node.exe' node_modules/vite/bin/vite.js --host 127.0.0.1
```

Open the printed URL in Chrome. Vite may choose another port if 5173 is already in use.

## Conversation behavior

- One main question at a time, answered primarily through native radio cards and checkboxes. Continue is explicit; selecting a response does not unexpectedly move focus or advance.
- No typing is required to complete any route. Personal context, summary editing, and a brief reflection are optional.
- Knowledge, application, motivation, environment, and uncertain hypotheses produce distinct evidence questions.
- Uncertainty opens a diagnostic question; learners can remain uncertain and plan observation without a penalty.
- Learning support and mixed responses open guided theory/model exploration. Theory, model, both, and unsure lead to different follow-up questions.
- Workplace-change and evidence-gathering responses skip theory/model selection and instead develop a concrete next action. Training is not assumed necessary.
- Coaching challenges assumptions, including choosing training after identifying a performance barrier. Learners can retain and test a hypothesis rather than being forced to accept a prescribed answer.
- The problem summary is assembled from selections, explicitly provisional, and editable. A collapsed recap carries it into later questions.
- All six theories/models remain available, with inline comparison prompts and the existing full library. Learners can combine ideas or defer choosing them.
- Selectable rationale and evidence questions connect choices to authentic performance. There is no correctness score or automatic evaluation of reasoning.
- Back, phase navigation, and Explore an alternative support revision. Changing an earlier answer clears dependent answers and reflection, with this behavior disclosed in the interface. Navigating back without changing an answer preserves later responses.
- Guidance is scripted and rule-based, with no external APIs, live AI, authentication, database, or persistent storage.

## Architecture

- `src/App.jsx`: existing application shell, session state, phase navigation, and library/workspace switching. State remains above both views so library visits preserve the conversation.
- `src/data/conversation.js`: pure functions define the branch-dependent question sequence, response labels, coaching, summary generation, completion checks, and invalidation of downstream answers. Add or review instructional branches here.
- `src/components/Activity.jsx`: accessible response cards, explicit navigation, optional editors, theory/model exploration, recap, and final direction summary. Focus moves to the new question heading; radio groups retain native arrow-key behavior.
- `src/components/Library.jsx` and `src/data/library.js`: preserved starter library and content.
- `src/App.css`: existing visual styles plus conversation-specific controls using the same palette, borders, spacing, and responsive layout.
- `tests/conversation.test.js`: Node's built-in test runner checks gap-specific branches, uncertain diagnoses, non-training routes, lens branching, summary generation, and safe revision. It also traverses 20 gap/response combinations using selections only.

## Verification

```powershell
npm run build
npm run lint
npm test
```

Build, ESLint, and 11 automated tests pass. No new packages were added. The scripts were run with the installed Node executable directly because npm is not on the current shell PATH.

The browser tool timed out connecting to the local Vite server, so rendered interaction, screen-reader behavior, and responsive visual verification remain unverified. Automated tests verify the conversation rules, not the quality of learner reasoning or the rendered browser experience.

## Chrome functional walkthrough

1. Try Continue with no selection. Confirm a short validation message appears. Complete a route with no text entry at all.
2. Try each initial gap. Confirm the evidence question changes. Choose I'm not sure, then resolve to a gap or remain uncertain.
3. Choose a barrier followed by learning support. Confirm coaching questions whether instruction would change the barrier without blocking agency.
4. Choose workplace change, then repeat with gather evidence. Confirm these paths ask different action questions and do not require selecting a theory/model.
5. On learning support, compare theory-only, model-only, both, and unsure. Confirm follow-up questions differ. Try combining theories, combining a theory/model, and deferring the choice.
6. Review the assembled summary. Edit it, revisit it without changes, and restore the generated wording. Confirm later choices persist when the wording is unchanged and reset when changed.
7. Visit the library mid-conversation, filter entries, expand an application, and return. Confirm responses and current question remain.
8. Add an optional brief reflection, complete the evidence question, and confirm the reflection appears in the final summary.
9. Explore an alternative. Change the gap or response type and confirm incompatible old answers do not survive into the new summary.
10. Keyboard-only: use Tab/Shift+Tab, arrow keys within radio groups, Space for selections/disclosures, and Enter for Continue. Check focus visibility, new-question focus, validation announcements, and all navigation controls.
11. In Chrome DevTools, inspect 390 px, 768 px, and desktop widths, including zoom at 200%. Confirm readable cards, no horizontal overflow, and reachable navigation. Check with a screen reader as well.

## Next learner-testing tasks

Use authentic challenges and ask learners to think aloud; avoid explaining the intended path before they try it.

1. Observe whether learners distinguish symptoms, learning needs, motivation explanations, and workplace barriers. Ask what evidence would change their classification.
2. Compare a novice, a learner with theory coursework, and an experienced practitioner. Watch whether scaffolding helps uncertainty without steering toward a predetermined theory.
3. Give a case that does not need training. Check whether learners recognize and can justify a workplace or investigation response.
4. Ask two learners to defend different theoretical approaches to the same problem. Check whether their activities and evidence plans support those rationales, rather than merely repeating the card wording.
5. Check whether summary language captures the authentic problem, whether edits are easy, and whether clearing dependent choices after revisions is understandable.
6. Assess whether the number and wording of questions feel conversational. Record hesitation, backtracking, unnecessary reading, and when optional text is used.
7. After a delay, ask learners to analyze a new case. Look for transfer of the theory/model distinction and evidence-seeking habits.

This remains a formative prototype. The quality of its coaching, cognitive workload, accessibility, and transfer benefits require learner and instructor review; automated branch tests do not establish those outcomes.

## Deploy to GitHub Pages without Git CLI

The target is https://andreajege85-dev.github.io/theorylab/. Vite's `base` is `/theorylab/`, so production asset URLs include this repository prefix. Local development and preview also use `/theorylab/`; open the URL Vite prints.

The workflow at `.github/workflows/deploy.yml` runs on commits to `main`, including commits made through GitHub's website, and can also be started manually. It uses Node.js 24 and `npm ci`, runs tests and ESLint, builds `dist`, then deploys that build to GitHub Pages only after those checks succeed. Official GitHub actions are pinned to commit hashes for reproducibility.

### Files to upload

If your repository already contains the current TheoryLab source, upload these updated/new files at these exact repository paths:

- `vite.config.js` (updated base path)
- `.github/workflows/deploy.yml` (new workflow; keep both folder levels)
- `README.md` (updated instructions)

If the repository is empty or only contains an earlier compiled website, also upload the current source folders `src/`, `public/`, and `tests/`, plus `package.json`, `package-lock.json`, `index.html`, `eslint.config.js`, and `.gitignore`. Preserve their structure directly at the repository root; do not put them inside an extra `theorylab/` folder. Existing repository files do not need to be deleted.

`node_modules/`, `dist/`, `theorylab-netlify.zip`, and `theorylab-source.zip` are not needed for this workflow. GitHub builds from the source and lockfile. The existing ZIP files are left unchanged.

### Upload and enable deployment

1. Open https://github.com/andreajege85-dev/theorylab and select the `main` branch. This workflow assumes `main`; if your publishing branch has another name, adjust `on.push.branches` in the workflow.
2. Choose **Add file → Upload files**. Drag the required ordinary files and source folders from this project onto the upload area, then commit the upload to `main` (or merge your upload branch into `main`).
3. To reliably create the workflow's nested path through the website, choose **Add file → Create new file**, enter `.github/workflows/deploy.yml` as the filename, paste the entire contents of the local workflow, and commit it to `main`. If that workflow already exists, edit it in place instead. Upload the ordinary source files before adding the workflow so its first build has everything it needs.
4. Go to **Settings → Pages → Build and deployment**, and set **Source** to **GitHub Actions**. This project uses a workflow rather than publishing a branch's root or `docs` folder.
5. Open **Actions → Deploy TheoryLab to GitHub Pages** and choose **Run workflow** on `main`. If an automatic run failed before Pages was enabled, rerun it now. GitHub Actions must be enabled for the repository.
6. Wait for both `build` and `deploy` to turn green. Open https://andreajege85-dev.github.io/theorylab/ and check the dashboard, library, and conversation navigation.

The upload only prepares the deployment; the site is not live until the GitHub workflow completes successfully. No Git CLI installation is needed. The app's visual design and learning activities are unchanged.

References: [Vite's GitHub Pages guide](https://vite.dev/guide/static-deploy.html), [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), and [uploading files through GitHub's website](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).
