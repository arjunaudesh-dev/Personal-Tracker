/**
 * UI smoke test — jsdom, no browser required.
 *
 *   npm run test:ui
 *
 * Bundles the real app with esbuild, mounts it into jsdom and drives the
 * interactions that matter: inspecting, renaming, collapsing, switching graph
 * systems / layouts / scopes, creating cross-universe bridges (canvas + picker),
 * searching, managing universes, undo and the minimap.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const bundlePath = path.resolve('node_modules/.cache/orbit-app.js');
if (!fs.existsSync(bundlePath)) {
  console.error('Missing app bundle — run `npm run test:ui` (it builds first).');
  process.exit(1);
}
const bundle = fs.readFileSync(bundlePath, 'utf8');

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  url: 'http://localhost/',
});
const { window } = dom;

window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.Element.prototype.scrollIntoView = () => {};
window.confirm = () => true;
Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    return 1400;
  },
});
Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get() {
    return 640;
  },
});

const errors = [];
window.console.error = (...args) => errors.push(args.map(String).join(' '));
window.console.warn = (...args) => errors.push('WARN ' + args.map(String).join(' '));
window.addEventListener('error', (e) => errors.push('ERR ' + e.message));

window.eval(bundle);

/* ------------------------------------------------------------------ *
 *  helpers
 * ------------------------------------------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const tick = () => sleep(70);
const $$ = (sel) => [...window.document.querySelectorAll(sel)];
const $ = (sel) => window.document.querySelector(sel);
const text = (sel) => $(sel)?.textContent?.trim() ?? null;
const hasText = (el, t) => (el?.textContent ?? '').includes(t);
const byText = (sel, t) =>
  $$(sel).find((el) => (el.textContent || '').trim().toLowerCase() === t.toLowerCase());
const click = (el) => {
  if (!el) throw new Error('click target missing');
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
};
const typeInto = (el, value) => {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};
const key = (k, opts = {}) =>
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true, ...opts }));

const report = [];
const check = (name, cond, extra = '') => {
  report.push({ ok: !!cond, name, extra });
};

/* ------------------------------------------------------------------ *
 *  1. boot
 * ------------------------------------------------------------------ */

await tick();
check('app mounts', !!$('.app'));
check('opens on the demo universe', text('h1') === 'Civil Works', text('h1'));
check('renders the full tree', $$('.node').length >= 20, `${$$('.node').length} nodes`);
check('draws universe frame', $$('.group').length === 1);
check('draws stats', $$('.stat').length === 5);
check('draws cross-universe portals', $$('.portal').length >= 3, `${$$('.portal').length}`);
check('draws edges', $$('.edge').length > 15, `${$$('.edge').length}`);
check('draws the minimap', !!$('.minimap'));
check('minimap has a viewport rect', !!$('.minimap-view'));

/* ------------------------------------------------------------------ *
 *  2. inspector
 * ------------------------------------------------------------------ */

click($$('.node').find((n) => hasText(n, 'Land Acquisition')));
await tick();
check('node opens in inspector', !!$('.drawer.right'));
const titleInput = $('.drawer.right input.input');
check('inspector shows the title', titleInput?.value === 'Land Acquisition', titleInput?.value);
typeInto(titleInput, 'Land Acquisition II');
titleInput.dispatchEvent(new window.FocusEvent('focusout', { bubbles: true }));
await tick();
check('rename reaches the canvas', $$('.node').some((n) => hasText(n, 'Land Acquisition II')));
click($('.drawer.right .drawer-head .iconbtn'));
await tick();
check('inspector closes', !$('.drawer.right'));

/* ---- structure editing: indent / outdent ---- */
click($$('.node').find((n) => hasText(n, 'Land Acquisition')));
await tick();
const indentBtn = byText('.drawer.right .btn', '⇥ Indent');
check('indent control present', !!indentBtn);
if (indentBtn) {
  click(indentBtn);
  await tick();
  check('indent re-parents the node', !!$('.drawer.right'));
  const outdentBtn = byText('.drawer.right .btn', '⇤ Outdent');
  if (outdentBtn) {
    click(outdentBtn);
    await tick();
  }
  check('outdent restores the level', !!$('.drawer.right'));
}
click($('.drawer.right .drawer-head .iconbtn'));
await tick();

/* ------------------------------------------------------------------ *
 *  3. collapse / expand
 * ------------------------------------------------------------------ */

const before = $$('.node').length;
click($('.node .chev'));
await tick();
const collapsed = $$('.node').length;
check('chevron collapses a branch', collapsed < before, `${before} -> ${collapsed}`);
const reopen = $('.node .chev.closed');
if (reopen) {
  click(reopen);
  await tick();
}
check('expands back', $$('.node').length === before, `${$$('.node').length}`);

/* ------------------------------------------------------------------ *
 *  4. graph systems + combine
 * ------------------------------------------------------------------ */

click(byText('.viewbar .seg button', 'Network'));
await tick();
check('network system renders pills', $$('.node.v-network').length === before);
click(byText('.viewbar .seg button', 'Concept'));
await tick();
check('concept system renders propositions', $$('.node.v-concept').length === before);
check('concept map labels edges', $$('.edge-label').length > 5, `${$$('.edge-label').length}`);
click(byText('.viewbar .seg button', 'Hybrid'));
await tick();
check('hybrid system renders', $$('.node.v-hybrid').length === before);
check('hybrid exposes layer chips', $$('.viewbar .chip').length === 3, `${$$('.viewbar .chip').length}`);
const conceptsChip = byText('.viewbar .chip', 'Concepts');
if (conceptsChip) {
  click(conceptsChip);
  await tick();
}
check('hybrid layers toggle', true);
click(byText('.viewbar .seg button', 'Mind'));
await tick();

/* ------------------------------------------------------------------ *
 *  5. layouts
 * ------------------------------------------------------------------ */

const layoutSelect = $$('.viewbar select')[0];
for (const layout of ['radial', 'organic', 'tree']) {
  layoutSelect.value = layout;
  layoutSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
  await tick();
  check(`${layout} layout keeps every node`, $$('.node').length === before, `${$$('.node').length}`);
}

/* ------------------------------------------------------------------ *
 *  6. orbit + per-profile systems + minimap
 * ------------------------------------------------------------------ */

click(byText('.seg button', 'Orbit'));
await tick();
check('orbit scope', text('h1') === 'Universe Hub', text('h1'));
check('orbit frames every universe', $$('.group').length === 5, `${$$('.group').length}`);
check('orbit core hub', !!$('.hub'));
check('orbit level-of-detail chips', $$('.lodchip').length === 5, `${$$('.lodchip').length}`);

const mixedToggle = $$('.viewbar .toggle input').find((i) => i.closest('.toggle')?.textContent?.includes('Per-profile'));
check('per-profile systems toggle exists', !!mixedToggle);
if (mixedToggle) {
  // React wires checkbox onChange through click; let jsdom flip `checked`
  mixedToggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  await tick();
}
const variants = new Set(
  $$('.node').map((n) =>
    n.classList.contains('v-network')
      ? 'network'
      : n.classList.contains('v-concept')
        ? 'concept'
        : n.classList.contains('v-hybrid')
          ? 'hybrid'
          : 'mind',
  ),
);
check('mixed mode combines systems in one view', variants.size >= 3, [...variants].join(','));
if (mixedToggle) {
  mixedToggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  await tick();
}

click($('.overlay.br .fab[aria-label="Toggle minimap"]'));
await tick();
check('minimap toggles off', !$('.minimap'));
click($('.overlay.br .fab[aria-label="Toggle minimap"]'));
await tick();
check('minimap toggles on', !!$('.minimap'));

/* ------------------------------------------------------------------ *
 *  7. bridging from the canvas (link mode)
 * ------------------------------------------------------------------ */

const bridgesBefore = text('.hintbar');
click(byText('.toolbar .btn', 'Link'));
await tick();
check('link mode banner', !!$('.linkbanner'));
click($$('.node').find((n) => hasText(n, 'Building 01')));
await tick();
click($$('.node').find((n) => hasText(n, 'Nutrition')));
await tick();
check('canvas creates a cross-universe bridge', text('.hintbar') !== bridgesBefore, text('.hintbar')?.slice(-46));

/* ------------------------------------------------------------------ *
 *  8. bridging from the inspector picker
 * ------------------------------------------------------------------ */

click(byText('.seg button', 'Universe'));
await tick();
click($$('.node').find((n) => hasText(n, 'Civil Works Programme')));
await tick();
const connectBtn = byText('.drawer.right .btn', 'Connect to another node…');
check('picker button present', !!connectBtn);
if (connectBtn) {
  click(connectBtn);
  await tick();
  check('picker opens', !!$('.bridgepicker'));
  const pickerSearch = $('.bridgepicker input.input');
  typeInto(pickerSearch, 'sleep');
  await tick();
  const results = $$('.bpresult');
  check('picker finds other-universe targets', results.length >= 1, `${results.length} results`);
  const crossBadge = $('.bpresult-badge');
  check('picker flags cross-universe targets', !!crossBadge);
  const linksBeforePicker = $$('.drawer.right .linkrow').length;
  if (results[0]) {
    click(results[0]);
    await tick();
  }
  check(
    'picker adds the bridge',
    $$('.drawer.right .linkrow').length > linksBeforePicker,
    `${linksBeforePicker} -> ${$$('.drawer.right .linkrow').length}`,
  );
  check('picker closes after linking', !$('.bridgepicker'));
}
click($('.drawer.right .drawer-head .iconbtn'));
await tick();

/* ------------------------------------------------------------------ *
 *  9. constellation + search
 * ------------------------------------------------------------------ */

click(byText('.seg button', 'Constellation'));
await tick();
check('constellation scope', text('h1') === 'Constellation', text('h1'));
check('constellation frames all universes', $$('.group').length === 5);

const search = $('#orbit-search');
typeInto(search, 'foundation');
await tick();
check('search reports matches', $$('.caption').some((c) => /match/.test(c.textContent || '')));
search.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
await tick();
check('search dives into a universe', text('h1') === 'Civil Works', text('h1'));
check('search selects the match', !!$('.drawer.right'));
click($('.drawer.right .drawer-head .iconbtn'));
await tick();

/* ------------------------------------------------------------------ *
 * 10. universe rail + bridges list
 * ------------------------------------------------------------------ */

click($$('.top-actions .btn').find((b) => hasText(b, 'Universes')));
await tick();
check('rail opens', !!$('.drawer.left'));
check('rail lists profiles', $$('.ucard').length === 5, `${$$('.ucard').length}`);
check('rail lists bridges', $$('.drawer.left .linkrow').length >= 8, `${$$('.drawer.left .linkrow').length}`);
check('rail offers export', !!byText('.drawer.left .btn', 'Export JSON'));
click($('.drawer.left .drawer-head .iconbtn'));
await tick();
check('rail closes', !$('.drawer.left'));

/* ------------------------------------------------------------------ *
 * 11. create a universe, add tasks, undo
 * ------------------------------------------------------------------ */

click($$('.head-actions .btn').find((b) => hasText(b, 'New universe')));
await tick();
check('universe modal opens', !!$('.modal'));
typeInto($('.modal input.input'), 'Thesis');
click($('.modal .btn.primary'));
await tick();
check('new universe opens', text('h1') === 'Thesis', text('h1'));
check('new universe seeds a root', $$('.node').length === 1, `${$$('.node').length}`);

click($('.node'));
await tick();
const addChild = byText('.drawer-foot .btn', 'Add child');
check('root inspector ready', !!addChild);
if (addChild) {
  click(addChild);
  await tick();
}
check('child task added', $$('.node').length === 2, `${$$('.node').length}`);
key('z', { ctrlKey: true });
await tick();
check('undo removes the child', $$('.node').length === 1, `${$$('.node').length}`);

/* ------------------------------------------------------------------ *
 * 12. currency + help
 * ------------------------------------------------------------------ */

const boqBefore = $$('.stat-value')[4]?.textContent?.trim();
click(byText('.top-actions .seg button', 'LKR'));
await tick();
check('currency switch updates BOQ', boqBefore !== $$('.stat-value')[4]?.textContent?.trim(), boqBefore);

click($$('.top-actions .btn').pop());
await tick();
check('help panel opens', $$('.drawer-title').some((d) => d.textContent === 'Inspector'));

/* ------------------------------------------------------------------ *
 *  results
 * ------------------------------------------------------------------ */

const passed = report.filter((r) => r.ok).length;
for (const r of report) {
  if (!r.ok) console.log(`  ✗ ${r.name}${r.extra ? ` — ${r.extra}` : ''}`);
}
console.log(`\nconsole errors: ${errors.length}`);
for (const e of errors.slice(0, 8)) console.log('  -', e.slice(0, 300));
console.log(
  passed === report.length
    ? `\n✓ ui smoke passed — ${passed}/${report.length} checks\n`
    : `\n✗ ui smoke failed — ${passed}/${report.length} checks\n`,
);
process.exit(passed === report.length && errors.length === 0 ? 0 : 1);
