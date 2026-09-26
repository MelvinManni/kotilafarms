/* @ds-bundle: {"format":4,"namespace":"Kotila","components":[{"name":"Icon"},{"name":"Button"},{"name":"IconButton"},{"name":"Tooltip"},{"name":"Field"},{"name":"TextInput"},{"name":"MoneyInput"},{"name":"Select"},{"name":"LinkedAmounts"},{"name":"Stepper"},{"name":"ChipGroup"},{"name":"Segmented"},{"name":"AttributionField"},{"name":"Checkbox"},{"name":"Tag"},{"name":"StatusChip"},{"name":"Figure"},{"name":"Delta"},{"name":"Money"},{"name":"Panel"},{"name":"Rows"},{"name":"LedgerTable"},{"name":"Notice"},{"name":"SyncStatus"},{"name":"Person"},{"name":"RoleBadge"},{"name":"AuditTrail"},{"name":"EmptyState"},{"name":"SideRail"},{"name":"TopBar"},{"name":"TabBar"},{"name":"Tabs"},{"name":"Sheet"},{"name":"GrowthChart"},{"name":"Sparkline"},{"name":"BarList"}]} */
/*
 * Kotila Farm Ledger — React components for the Kotila Farm internal tool.
 * Classic script: reads window.React, assigns window.Kotila. No imports, no network.
 * Every component renders plain elements with k-* classes from bundle.css.
 */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;
  var Fragment = React.Fragment;

  /* ---------- helpers ---------- */
  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(' ');
  }
  function group3(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function naira(n, opts) {
    if (n === null || n === undefined || n === '' || isNaN(Number(n))) return '—';
    var v = Math.round(Number(n));
    var s = '₦' + group3(Math.abs(v));
    if (v < 0) return '−' + s;
    if (opts && opts.sign && v > 0) return '+' + s;
    return s;
  }
  function pct(n, digits) {
    if (n === null || n === undefined || isNaN(Number(n))) return '—';
    var d = digits === undefined ? 1 : digits;
    return Number(n).toFixed(d) + '%';
  }
  function kg(n, digits) {
    if (n === null || n === undefined || isNaN(Number(n))) return '—';
    return Number(n).toFixed(digits === undefined ? 2 : digits) + ' kg';
  }
  function int(n) { if (n === null || n === undefined || isNaN(Number(n))) return '—'; return group3(Math.round(Number(n))); }
  function parseNum(s) { if (s === null || s === undefined) return NaN; var t = String(s).replace(/[^0-9.\-]/g, ''); return t === '' ? NaN : Number(t); }
  function initials(name) { return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (p) { return p[0].toUpperCase(); }).join(''); }
  function useControlled(value, defaultValue, onChange) {
    var st = useState(defaultValue);
    var controlled = value !== undefined;
    var cur = controlled ? value : st[0];
    function set(v) { if (!controlled) st[1](v); if (onChange) onChange(v); }
    return [cur, set];
  }
  var uid = 0;
  function useId(prefix) { var r = React.useRef(null); if (r.current === null) { uid += 1; r.current = (prefix || 'k') + '-' + uid; } return r.current; }

  /* ---------- Icon ---------- */
  var ICONS = {
    home: 'M3 11l9-8 9 8M5 10v10h14V10',
    sets: 'M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3zM3 10h18',
    log: 'M4 4h12l4 4v12H4zM8 12h8M8 16h5',
    feed: 'M6 3h12l-1 18H7zM6.5 9h11',
    weight: 'M4 20h16M6 20l2-12h8l2 12M12 3a2 2 0 1 1 0 4a2 2 0 1 1 0-4',
    health: 'M12 21s-8-4.5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6.5-8 11-8 11zM12 9v6M9 12h6',
    sales: 'M3 7h18v12H3zM3 11h18M16 15h2',
    expenses: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
    finance: 'M3 21h18M5 21V10l7-6 7 6v11M10 21v-6h4v6',
    reports: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    settings: 'M12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6M4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4',
    search: 'M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14M20 20l-3.5-3.5',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    check: 'M20 6L9 17l-5-5',
    x: 'M18 6L6 18M6 6l12 12',
    'chevron-right': 'M9 6l6 6-6 6',
    'chevron-left': 'M15 6l-6 6 6 6',
    'chevron-down': 'M6 9l6 6 6-6',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6',
    'wifi-off': 'M2 2l20 20M8.5 16.4a6 6 0 0 1 7 0M5 12.9a11 11 0 0 1 5.2-2.8M16.7 10.7A11 11 0 0 1 19 12.5M12 19.5a0.5 0.5 0 1 1 0 1a0.5 0.5 0 1 1 0-1',
    sync: 'M21 12a9 9 0 1 1-3-6.7M21 4v5h-5',
    alert: 'M12 3l10 18H2zM12 10v5M12 18v0.5',
    info: 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18M12 11v6M12 7.5v0.5',
    clock: 'M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18M12 7v5l3 2',
    history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2',
    user: 'M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8M4 21a8 8 0 0 1 16 0',
    users: 'M9 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8M2 21a7 7 0 0 1 14 0M16 4.5a4 4 0 0 1 0 7M18 14a6 6 0 0 1 4 7',
    calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
    'calendar-x': 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4M10 14l4 4M14 14l-4 4',
    receipt: 'M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2zM9 8h6M9 12h6M9 16h3',
    camera: 'M4 7h3l2-3h6l2 3h3v13H4zM12 10a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7',
    download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
    filter: 'M3 5h18l-7 8v6l-4 2v-8z',
    'arrow-up': 'M12 19V5M6 11l6-6 6 6',
    'arrow-down': 'M12 5v14M6 13l6 6 6-6',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
    water: 'M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z',
    temp: 'M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0zM12 9v7',
    truck: 'M2 6h11v10H2zM13 10h5l3 3v3h-8M6 19a2 2 0 1 1 0-4a2 2 0 1 1 0 4M17 19a2 2 0 1 1 0-4a2 2 0 1 1 0 4',
    bag: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2',
    syringe: 'M18 2l4 4M20 4l-9 9M14 7l3 3M7 12l5 5-3 3H6v-3zM2 22l4-4',
    scale: 'M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0zM8 21h8',
    compare: 'M8 3v18M16 3v18M3 8h5M16 16h5M3 16h5M16 8h5',
    note: 'M5 4h14v16H5zM9 9h6M9 13h6M9 17h3',
    naira: 'M7 20V4l10 16V4M4 10h16M4 14h16',
    more: 'M5 12h0.5M12 12h0.5M19 12h0.5'
  };
  function Icon(props) {
    var d = ICONS[props.name] || ICONS.info;
    var size = props.size || 20;
    return h('svg', {
      className: cx('k-icon', props.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: props.color || 'currentColor', strokeWidth: props.strokeWidth || 2, strokeLinecap: 'round', strokeLinejoin: 'round',
      'aria-hidden': props.label ? undefined : 'true', role: props.label ? 'img' : undefined, 'aria-label': props.label, style: props.style
    }, h('path', { d: d }));
  }
  Icon.names = Object.keys(ICONS);

  /* ---------- Tooltip ---------- */
  function Tooltip(props) {
    return h('span', { className: cx('k-tip', props.placement === 'below' && 'k-tip--below', props.open && 'k-tip--open', props.className), style: props.style },
      props.children,
      h('span', { className: 'k-tip__bubble', role: 'tooltip' }, props.label));
  }

  /* ---------- Buttons ---------- */
  function Button(props) {
    var variant = props.variant || 'secondary';
    var cls = cx('k-btn', 'k-btn--' + variant, props.size === 'lg' && 'k-btn--lg', props.size === 'xl' && 'k-btn--xl', props.full && 'k-btn--full', props.className);
    var kids = [props.icon ? h(Icon, { key: 'i', name: props.icon, size: props.size === 'xl' ? 22 : 18, strokeWidth: 2.4 }) : null, props.children];
    if (props.href) return h('a', { className: cls, href: props.href, style: props.style, 'aria-disabled': props.disabled ? 'true' : undefined, onClick: props.onClick }, kids);
    return h('button', { type: props.type || 'button', className: cls, disabled: props.disabled, onClick: props.onClick, style: props.style, title: props.title }, kids);
  }
  function IconButton(props) {
    var btn = h('button', {
      type: 'button', className: cx('k-iconbtn', props.variant === 'ghost' && 'k-iconbtn--ghost', props.size === 'lg' && 'k-iconbtn--lg', props.className),
      'aria-label': props.label, onClick: props.onClick, disabled: props.disabled, style: props.style
    }, h(Icon, { name: props.icon, size: props.size === 'lg' ? 24 : 20 }));
    return h(Tooltip, { label: props.tooltip || props.label, placement: props.tooltipPlacement, open: props.tooltipOpen }, btn);
  }

  /* ---------- Fields ---------- */
  function Field(props) {
    return h('div', { className: cx('k-field', props.className), style: props.style },
      (props.label || props.aside) ? h('div', { className: 'k-field__top' },
        h('label', { className: 'k-field__label', htmlFor: props.htmlFor }, props.label,
          props.required ? h('span', { className: 'k-field__req', 'aria-hidden': 'true' }, ' *') : null,
          props.optional ? h('span', { className: 'k-field__opt' }, 'optional') : null),
        props.aside || null) : null,
      props.children,
      props.error ? h('div', { className: 'k-field__error', role: 'alert' }, h(Icon, { name: 'alert', size: 16 }), props.error)
        : (props.hint ? h('div', { className: 'k-field__hint' }, props.hint) : null));
  }
  function TextInput(props) {
    var id = useId('in');
    var fid = props.id || id;
    var common = {
      id: fid, className: cx('k-input', props.multiline && 'k-input--area', props.error && 'k-input--error'),
      placeholder: props.placeholder, readOnly: props.readOnly, type: props.multiline ? undefined : (props.type || 'text'),
      value: props.value, defaultValue: props.defaultValue, inputMode: props.inputMode, autoComplete: props.autoComplete,
      onChange: props.onChange ? function (e) { props.onChange(e.target.value); } : undefined,
      'aria-invalid': props.error ? 'true' : undefined, required: props.required
    };
    var el = props.multiline ? h('textarea', common) : h('input', common);
    if (props.suffix) el = h('div', { className: 'k-affix k-affix--post' }, el, h('span', { className: 'k-affix__post' }, props.suffix));
    return h(Field, { label: props.label, hint: props.hint, error: props.error, required: props.required, optional: props.optional, htmlFor: fid, aside: props.aside, style: props.style }, el);
  }
  function MoneyInput(props) {
    var id = useId('money');
    var fid = props.id || id;
    var st = useState(props.value !== undefined ? props.value : props.defaultValue);
    var val = props.value !== undefined ? props.value : st[0];
    var shown = (val === null || val === undefined || val === '' || isNaN(Number(val))) ? '' : group3(Math.round(Number(val)));
    return h(Field, { label: props.label, hint: props.hint, error: props.error, required: props.required, htmlFor: fid, aside: props.aside, style: props.style },
      h('div', { className: 'k-affix k-affix--pre' },
        h('span', { className: 'k-affix__pre' }, '₦'),
        h('input', {
          id: fid, className: cx('k-input', props.error && 'k-input--error'), inputMode: 'numeric', value: shown, placeholder: props.placeholder || '0', readOnly: props.readOnly,
          onChange: function (e) { var n = parseNum(e.target.value); var v = isNaN(n) ? null : n; if (props.value === undefined) st[1](v); if (props.onChange) props.onChange(v); }
        }),
        props.calculated ? h('span', { className: 'k-affix__calc' }, 'calculated') : null));
  }
  function Select(props) {
    var id = useId('sel');
    var fid = props.id || id;
    var opts = (props.options || []).map(function (o) { var v = typeof o === 'string' ? { value: o, label: o } : o; return h('option', { key: v.value, value: v.value }, v.label); });
    if (props.placeholder) opts.unshift(h('option', { key: '__p', value: '', disabled: true }, props.placeholder));
    return h(Field, { label: props.label, hint: props.hint, error: props.error, required: props.required, optional: props.optional, htmlFor: fid, style: props.style },
      h('select', { id: fid, className: cx('k-input', 'k-select', props.error && 'k-input--error'), value: props.value, defaultValue: props.value === undefined ? (props.defaultValue !== undefined ? props.defaultValue : (props.placeholder ? '' : undefined)) : undefined, onChange: props.onChange ? function (e) { props.onChange(e.target.value); } : undefined }, opts));
  }
  function Checkbox(props) {
    return h('label', { className: 'k-check', style: props.style },
      h('input', { type: 'checkbox', checked: props.checked, defaultChecked: props.defaultChecked, onChange: props.onChange ? function (e) { props.onChange(e.target.checked); } : undefined }),
      h('span', null, props.label));
  }

  /* LinkedAmounts: quantity × unit price = total. Type any two, the third is calculated. None can be left blank. */
  function LinkedAmounts(props) {
    var init = { q: props.defaultQuantity, u: props.defaultUnitPrice, t: props.defaultTotal };
    if (init.q != null && init.u != null && init.t == null) init.t = init.q * init.u;
    var st = useState({ q: init.q, u: init.u, t: init.t, last: ['q', 'u'] });
    var s = st[0];
    function upd(field, v) {
      var n = Object.assign({}, s);
      n[field] = v;
      var last = [field].concat(s.last.filter(function (f) { return f !== field; })).slice(0, 2);
      n.last = last;
      var calc = ['q', 'u', 't'].filter(function (f) { return last.indexOf(f) < 0; })[0];
      if (calc === 't' && n.q != null && n.u != null) n.t = n.q * n.u;
      if (calc === 'u' && n.q && n.t != null) n.u = n.t / n.q;
      if (calc === 'q' && n.u && n.t != null) n.q = n.t / n.u;
      st[1](n);
      if (props.onChange) props.onChange({ quantity: n.q, unitPrice: n.u, total: n.t });
    }
    var calcField = ['q', 'u', 't'].filter(function (f) { return s.last.indexOf(f) < 0; })[0];
    var qid = useId('qty');
    return h('div', { className: cx('k-linked', props.stacked && 'k-linked--stack'), style: props.style },
      h(Field, { label: props.quantityLabel || 'Quantity', required: true, htmlFor: qid },
        h('div', { className: 'k-affix k-affix--post' },
          h('input', { id: qid, className: 'k-input', inputMode: 'decimal', value: s.q == null ? '' : group3(Math.round(s.q * 100) / 100), onChange: function (e) { var n = parseNum(e.target.value); upd('q', isNaN(n) ? null : n); } }),
          calcField === 'q' ? h('span', { className: 'k-affix__calc' }, 'calculated') : (props.quantityUnit ? h('span', { className: 'k-affix__post' }, props.quantityUnit) : null))),
      h(MoneyInput, { label: props.unitLabel || 'Price each', required: true, value: s.u == null ? null : Math.round(s.u), calculated: calcField === 'u', onChange: function (v) { upd('u', v); } }),
      h(MoneyInput, { label: props.totalLabel || 'Total', required: true, value: s.t == null ? null : Math.round(s.t), calculated: calcField === 't', onChange: function (v) { upd('t', v); } }),
      h('div', { className: 'k-linked__note' }, props.note || 'Fill any two. The third is worked out, so none can be left blank.'));
  }

  /* ---------- Stepper ---------- */
  function Stepper(props) {
    var min = props.min === undefined ? 0 : props.min;
    var step = props.step || 1;
    var c = useControlled(props.value, props.defaultValue === undefined ? 0 : props.defaultValue, props.onChange);
    var v = c[0];
    var id = useId('step');
    var alert = props.alertAbove !== undefined && v > props.alertAbove;
    return h('div', { className: cx('k-stepper', props.size === 'md' && 'k-stepper--md', alert && 'k-stepper--alert'), style: props.style },
      props.label ? h('div', { className: 'k-field__top' }, h('span', { className: 'k-field__label', id: id }, props.label), props.aside || null) : null,
      h('div', { className: 'k-stepper__row', role: 'group', 'aria-labelledby': props.label ? id : undefined },
        h('button', { type: 'button', className: 'k-stepper__btn', 'aria-label': 'Decrease ' + (props.label || ''), disabled: v <= min, onClick: function () { c[1](Math.max(min, v - step)); } }, h(Icon, { name: 'minus', size: 28, strokeWidth: 2.6 })),
        h('output', { className: 'k-stepper__value', 'aria-live': 'polite' }, int(v), props.unit ? h('span', { className: 'k-stepper__unit' }, props.unit) : null),
        h('button', { type: 'button', className: 'k-stepper__btn k-stepper__btn--plus', 'aria-label': 'Increase ' + (props.label || ''), disabled: props.max !== undefined && v >= props.max, onClick: function () { c[1](props.max !== undefined ? Math.min(props.max, v + step) : v + step); } }, h(Icon, { name: 'plus', size: 28, strokeWidth: 2.6 }))),
      props.hint ? h('div', { className: 'k-field__hint' }, props.hint) : null);
  }

  /* ---------- Choice ---------- */
  function norm(o) { return typeof o === 'string' ? { value: o, label: o } : o; }
  function ChipGroup(props) {
    var multi = props.multiple !== false;
    var c = useControlled(props.value, props.defaultValue !== undefined ? props.defaultValue : (multi ? [] : null), props.onChange);
    var cur = c[0];
    function isOn(v) { return multi ? (cur || []).indexOf(v) >= 0 : cur === v; }
    function toggle(v) {
      if (multi) { var arr = (cur || []).slice(); var i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); c[1](arr); }
      else c[1](cur === v && props.allowNone !== false ? null : v);
    }
    var id = useId('chips');
    return h('div', { className: 'k-field', style: props.style },
      props.label ? h('div', { className: 'k-field__top' }, h('span', { className: 'k-field__label', id: id }, props.label, props.optional ? h('span', { className: 'k-field__opt' }, 'optional') : null), props.aside || null) : null,
      h('div', { className: 'k-chips', role: 'group', 'aria-labelledby': props.label ? id : undefined },
        (props.options || []).map(function (o) {
          var opt = norm(o);
          return h('button', { key: opt.value, type: 'button', className: cx('k-chip', props.size === 'sm' && 'k-chip--sm'), 'aria-pressed': isOn(opt.value) ? 'true' : 'false', onClick: function () { toggle(opt.value); } },
            isOn(opt.value) ? h(Icon, { name: 'check', size: 16, strokeWidth: 2.8 }) : null, opt.label);
        })),
      props.hint ? h('div', { className: 'k-field__hint' }, props.hint) : null);
  }
  function Segmented(props) {
    var c = useControlled(props.value, props.defaultValue, props.onChange);
    var id = useId('seg');
    return h('div', { className: 'k-field', style: props.style },
      props.label ? h('span', { className: 'k-field__label', id: id }, props.label, props.optional ? h('span', { className: 'k-field__opt' }, 'optional') : null) : null,
      h('div', { className: 'k-seg', role: 'radiogroup', 'aria-labelledby': props.label ? id : undefined },
        (props.options || []).map(function (o) {
          var opt = norm(o);
          return h('button', { key: opt.value, type: 'button', role: 'radio', className: 'k-seg__opt', 'aria-checked': c[0] === opt.value ? 'true' : 'false', onClick: function () { c[1](opt.value); } }, opt.label);
        })));
  }
  /* AttributionField: every naira out belongs to a Set or to farm overhead. No blank. */
  function AttributionField(props) {
    var c = useControlled(props.value, props.defaultValue, props.onChange);
    var id = useId('attr');
    var sets = props.sets || [];
    var missing = props.showError && !c[0];
    return h('div', { className: cx('k-attr', missing && 'k-attr--error'), style: props.style },
      h('div', { className: 'k-field__top' },
        h('span', { className: 'k-field__label', id: id }, props.label || 'Which Set is this for?', h('span', { className: 'k-field__req', 'aria-hidden': 'true' }, ' *')),
        h(Tooltip, { label: 'Every expense belongs to one Set, or to the farm as a whole. This is what makes profit per Set real.' },
          h('span', { tabIndex: 0, 'aria-label': 'Why this is required', style: { display: 'inline-flex', color: 'var(--ink-muted)' } }, h(Icon, { name: 'info', size: 18 })))),
      h('div', { className: 'k-attr__opts', role: 'radiogroup', 'aria-labelledby': id, 'aria-required': 'true' },
        sets.map(function (s) {
          return h('button', { key: s.id, type: 'button', role: 'radio', className: 'k-attr__opt', 'aria-checked': c[0] === s.id ? 'true' : 'false', onClick: function () { c[1](s.id); } },
            h('strong', null, s.label), s.meta ? h('span', null, s.meta) : null);
        }),
        h('button', { type: 'button', role: 'radio', className: 'k-attr__opt k-attr__opt--overhead', 'aria-checked': c[0] === 'overhead' ? 'true' : 'false', onClick: function () { c[1]('overhead'); } },
          h('strong', null, 'Farm overhead'), h('span', null, props.overheadHint || 'Shared by all Sets'))),
      missing ? h('div', { className: 'k-field__error', role: 'alert' }, h(Icon, { name: 'alert', size: 16 }), 'Choose a Set or farm overhead before saving.') : null);
  }

  /* ---------- Display ---------- */
  function Tag(props) {
    return h('span', { className: cx('k-tag', 'k-tag--' + (props.tone || 'neutral'), props.className), title: props.title, style: props.style },
      props.dot ? h('span', { className: 'k-tag__dot' }) : null, props.children);
  }
  var STATUS = { brooding: ['warning', 'Brooding'], growing: ['success', 'Growing'], selling: ['deep', 'Selling'], closed: ['closed', 'Closed'] };
  function StatusChip(props) {
    var s = STATUS[props.status] || STATUS.growing;
    return h(Tag, { tone: s[0], title: props.title }, s[1] + (props.day !== undefined ? ' · day ' + props.day : ''));
  }
  function Delta(props) {
    var dir = props.direction || 'up';
    var tone = props.tone || (props.goodWhen ? (props.goodWhen === dir ? 'good' : 'bad') : 'bad');
    var arrow = dir === 'up' ? '▲' : (dir === 'down' ? '▼' : '–');
    var el = h('span', { className: cx('k-delta', 'k-delta--' + (dir === 'flat' ? 'flat' : tone)) }, arrow + ' ' + props.children);
    return props.tooltip ? h(Tooltip, { label: props.tooltip }, h('span', { tabIndex: 0 }, el)) : el;
  }
  function Figure(props) {
    return h('div', { className: cx('k-fig', props.size && 'k-fig--' + props.size, props.tone && 'k-fig--' + props.tone, props.className), style: props.style },
      props.label ? h('span', { className: 'k-fig__label' }, props.label) : null,
      h('strong', { className: 'k-fig__value' }, props.value),
      (props.sub || props.delta) ? h('span', { className: 'k-fig__sub' }, props.delta || null, props.sub || null) : null);
  }
  function Money(props) { return h('span', { className: cx('k-num', props.className), style: props.style }, naira(props.value, { sign: props.sign })); }

  function Panel(props) {
    var action = props.action;
    if (action && action.label) action = h('a', { className: 'k-panel__action', href: action.href || '#', onClick: action.onClick }, action.label);
    return h('section', { className: cx('k-panel', props.variant && 'k-panel--' + props.variant, props.flush && 'k-panel--flush', props.className), 'aria-label': props.ariaLabel || (typeof props.title === 'string' ? props.title : undefined), style: props.style },
      (props.title || action) ? h('div', { className: 'k-panel__head' },
        h('div', { className: 'k-panel__titles' },
          props.title ? h(props.headline ? 'h2' : 'h2', { className: props.headline ? 'k-title-lg' : 'k-title' }, props.title) : null,
          props.subtitle ? h('p', { className: 'k-panel__sub' }, props.subtitle) : null),
        action || null) : null,
      props.children);
  }
  function Rows(props) {
    return h('div', { className: 'k-rows', style: props.style },
      (props.items || []).map(function (r, i) {
        return h('div', { key: i, className: cx('k-row', r.total && 'k-row--total') },
          h('span', { className: 'k-row__label' }, r.label, r.sub ? h('span', { className: 'k-caption', style: { display: 'block' } }, r.sub) : null),
          h('span', { className: 'k-row__value', style: r.tone === 'alert' ? { color: 'var(--alert)' } : (r.tone === 'owed' ? { color: '#7a4b00' } : undefined) }, r.value));
      }));
  }
  /* LedgerTable cells: a string/number, or {value, sub, tone:'alert'|'owed'|'muted', figure:true, tag:{tone,label}, status, delta:{direction,label}} */
  function renderCell(c) {
    if (c === null || c === undefined) return '';
    if (typeof c !== 'object' || React.isValidElement(c)) return c;
    var val = c.value;
    if (c.tag) val = h(Tag, { tone: c.tag.tone }, c.tag.label);
    if (c.status) val = h(StatusChip, { status: c.status, day: c.day });
    return h('div', { className: 'k-cell' },
      c.tag || c.status ? val : h('span', { className: cx('k-cell__v', c.figure && 'k-cell__v--fig', c.tone && 'k-cell__v--' + c.tone) }, val),
      c.delta ? h('span', null, h(Delta, { direction: c.delta.direction, tone: c.delta.tone }, c.delta.label)) : null,
      c.sub ? h('span', { className: 'k-cell__s' }, c.sub) : null);
  }
  function LedgerTable(props) {
    var cols = props.columns || [];
    return h('div', { className: 'k-table-wrap', style: props.style },
      h('table', { className: cx('k-table', props.dense && 'k-table--dense') },
        props.caption ? h('caption', { className: 'k-sr' }, props.caption) : null,
        h('thead', null, h('tr', null, cols.map(function (c) { return h('th', { key: c.key, scope: 'col', className: c.align ? 'k-al-' + c.align : undefined, style: c.width ? { width: c.width } : undefined }, c.label); }))),
        h('tbody', null, (props.rows || []).map(function (r, i) {
          return h('tr', { key: r.id || i, className: props.onRowClick || r.href ? 'k-table__click' : undefined, onClick: props.onRowClick ? function () { props.onRowClick(r); } : undefined },
            cols.map(function (c) { return h('td', { key: c.key, className: c.align ? 'k-al-' + c.align : undefined }, renderCell(r[c.key])); }));
        })),
        props.footer ? h('tfoot', null, h('tr', null, cols.map(function (c) { return h('td', { key: c.key, className: c.align ? 'k-al-' + c.align : undefined }, renderCell(props.footer[c.key])); }))) : null));
  }
  var NOTICE_ICON = { warning: 'alert', alert: 'alert', success: 'check', owed: 'naira', neutral: 'info', offline: 'wifi-off', missed: 'calendar-x' };
  function Notice(props) {
    var tone = props.tone || 'neutral';
    var action = props.action;
    if (action && action.label) action = h(Button, { variant: action.variant || (tone === 'owed' ? 'owed' : 'secondary'), onClick: action.onClick, href: action.href }, action.label);
    return h('div', { className: cx('k-notice', 'k-notice--' + tone, props.compact && 'k-notice--compact', props.className), role: props.role || (tone === 'alert' ? 'alert' : 'status'), style: props.style },
      h('span', { className: 'k-notice__icon' }, h(Icon, { name: props.icon || NOTICE_ICON[tone] || 'info', size: props.compact ? 16 : 20, strokeWidth: 2.2 })),
      h('div', { className: 'k-notice__body' },
        props.title ? h('strong', { className: 'k-notice__title' }, props.title) : null,
        props.children ? h('div', { className: 'k-notice__text' }, props.children) : null),
      action ? h('div', { className: 'k-notice__action' }, action) : null);
  }
  function SyncStatus(props) {
    var state = props.state || 'synced';
    var n = props.pending || 0;
    var text = {
      synced: 'All synced' + (props.lastSynced ? ' · ' + props.lastSynced : ''),
      syncing: 'Sending ' + n + (n === 1 ? ' entry' : ' entries') + '…',
      offline: 'Offline' + (n ? ' · ' + n + ' waiting' : ''),
      conflict: n + (n === 1 ? ' entry needs' : ' entries need') + ' a look'
    }[state];
    var tip = props.tooltip || {
      synced: 'Every entry on this device has reached the farm records.',
      syncing: 'Entries saved on this device are being sent now.',
      offline: 'No signal. Keep working: entries are saved on this device and send by themselves when signal returns.',
      conflict: 'Someone changed the same record while you were offline. Open it to choose which version to keep.'
    }[state];
    var icon = state === 'syncing' ? h(Icon, { name: 'sync', size: 16, className: 'k-spin' }) : (state === 'synced' && props.variant === 'block' ? h(Icon, { name: 'check', size: 16, strokeWidth: 2.6 }) : h('span', { className: 'k-sync__dot' }));
    var el = h('button', { type: 'button', className: cx('k-sync', 'k-sync--' + state, props.variant === 'block' && 'k-sync--block'), 'aria-label': text + '. ' + tip, onClick: props.onClick }, icon, h('span', null, text));
    return h(Tooltip, { label: tip, placement: props.tooltipPlacement, open: props.tooltipOpen, style: props.variant === 'block' ? { display: 'flex' } : undefined }, el);
  }
  var ROLE_LABEL = { owner: 'Owner', manager: 'Manager', recorder: 'Recorder' };
  function RoleBadge(props) { return h('span', { className: cx('k-role', 'k-role--' + (props.role || 'recorder')) }, ROLE_LABEL[props.role] || props.role); }
  function Person(props) {
    return h('div', { className: 'k-person', style: props.style },
      h('span', { className: cx('k-avatar', props.size && 'k-avatar--' + props.size), 'aria-hidden': 'true' }, initials(props.name)),
      (props.hideText ? null : h('span', { className: 'k-person__text' },
        h('span', { className: 'k-person__name' }, props.name),
        (props.meta || props.role) ? h('span', { className: 'k-person__meta' }, props.meta || ROLE_LABEL[props.role] || props.role) : null)));
  }
  function AuditTrail(props) {
    return h('ol', { className: 'k-audit', style: props.style },
      (props.entries || []).map(function (e, i) {
        return h('li', { key: i, className: 'k-audit__item' },
          h('span', { className: 'k-avatar k-avatar--sm', 'aria-hidden': 'true' }, initials(e.who)),
          h('div', null,
            h('div', { className: 'k-audit__what' },
              h('strong', null, e.who), ' ', e.action || 'changed', e.field ? [' ', h('strong', { key: 'f' }, e.field)] : null,
              (e.from !== undefined) ? [' from ', h('span', { key: 'a', className: 'k-audit__was' }, String(e.from)), ' to ', h('span', { key: 'b', className: 'k-audit__now' }, String(e.to))] : null),
            h('div', { className: 'k-audit__when' }, [e.when, e.role ? ROLE_LABEL[e.role] || e.role : null, e.device].filter(Boolean).join(' · ')),
            e.note ? h('div', { className: 'k-audit__note' }, '“' + e.note + '”') : null));
      }));
  }
  function EmptyState(props) {
    var action = props.action;
    if (action && action.label) action = h(Button, { variant: 'primary', icon: action.icon || 'plus', onClick: action.onClick, href: action.href }, action.label);
    return h('div', { className: 'k-empty', style: props.style },
      h('span', { className: 'k-empty__icon' }, h(Icon, { name: props.icon || 'note', size: 24 })),
      h('h3', { className: 'k-empty__title' }, props.title),
      props.children ? h('p', { className: 'k-empty__body' }, props.children) : null,
      action || null);
  }

  /* ---------- Navigation ---------- */
  var DEFAULT_NAV = [
    { id: 'today', label: 'Today', icon: 'home' }, { id: 'sets', label: 'Sets', icon: 'sets' }, { id: 'log', label: 'Daily log', icon: 'log' },
    { id: 'feed', label: 'Feed', icon: 'feed' }, { id: 'weights', label: 'Weights', icon: 'weight' }, { id: 'health', label: 'Health', icon: 'health' },
    { id: 'sales', label: 'Sales', icon: 'sales' }, { id: 'expenses', label: 'Expenses', icon: 'expenses' }, { id: 'finance', label: 'Finance', icon: 'finance', roles: ['owner'] },
    { id: 'reports', label: 'Reports', icon: 'reports' }
  ];
  function Wordmark(props) { return h('span', { className: 'k-wordmark', style: props.style }, 'Kotila ', h('span', null, 'Farms')); }
  function SideRail(props) {
    var role = props.user && props.user.role;
    var items = (props.items || DEFAULT_NAV).filter(function (it) { return !it.roles || !role || it.roles.indexOf(role) >= 0; });
    var badges = props.badges || {};
    return h('nav', { className: 'k-rail', 'aria-label': 'Main', style: props.style },
      h('div', { className: 'k-rail__brand' }, props.logoSrc ? h('img', { src: props.logoSrc, alt: '' }) : null, h(Wordmark)),
      h('div', { className: 'k-rail__nav' }, items.map(function (it) {
        var b = badges[it.id];
        return h('a', { key: it.id, href: it.href || '#', className: 'k-rail__item', 'aria-current': props.active === it.id ? 'page' : undefined },
          h(Icon, { name: it.icon }), it.label,
          b ? h('span', { className: 'k-rail__badge', title: typeof b === 'object' ? b.title : undefined }, typeof b === 'object' ? b.count : b) : null);
      })),
      h('div', { className: 'k-rail__foot' },
        props.sync ? h(SyncStatus, Object.assign({ variant: 'block' }, props.sync)) : null,
        h('a', { href: '#', className: 'k-rail__item', 'aria-current': props.active === 'settings' ? 'page' : undefined }, h(Icon, { name: 'settings' }), 'Settings'),
        props.user ? h('div', { className: 'k-rail__user' }, h(Person, { name: props.user.name, role: props.user.role })) : null));
  }
  function TopBar(props) {
    return h('header', { className: 'k-topbar', style: props.style },
      props.back ? h(IconButton, { icon: 'chevron-left', label: props.back, variant: 'ghost', tooltipPlacement: 'below' }) : (props.logoSrc ? h('img', { src: props.logoSrc, alt: 'Kotila Farms' }) : null),
      h('span', { className: 'k-topbar__title' }, props.title || ''),
      props.sync ? h(SyncStatus, Object.assign({ tooltipPlacement: 'below' }, props.sync)) : null,
      props.user ? h(Tooltip, { label: props.user.name + ' · ' + (ROLE_LABEL[props.user.role] || ''), placement: 'below' },
        h('button', { type: 'button', className: 'k-avatar', style: { width: 44, height: 44, border: 0, cursor: 'pointer' }, 'aria-label': 'Account: ' + props.user.name }, initials(props.user.name))) : null);
  }
  var RECORDER_TABS = [{ id: 'today', label: 'Today', icon: 'home' }, { id: 'log', label: 'Log', icon: 'log' }, { id: 'weigh', label: 'Weigh', icon: 'weight' }, { id: 'history', label: 'History', icon: 'clock' }];
  function TabBar(props) {
    return h('nav', { className: 'k-tabbar', 'aria-label': 'Main', style: props.style },
      (props.items || RECORDER_TABS).map(function (it) {
        if (it.primary) return h('a', { key: it.id, href: it.href || '#', className: 'k-tabbar__item k-tabbar__item--primary', 'aria-label': it.label }, h('span', { className: 'k-tabbar__plus' }, h(Icon, { name: it.icon || 'plus', size: 24, strokeWidth: 2.6 })));
        return h('a', { key: it.id, href: it.href || '#', className: 'k-tabbar__item', 'aria-current': props.active === it.id ? 'page' : undefined }, h(Icon, { name: it.icon, size: 22 }), it.label);
      }));
  }
  function Tabs(props) {
    return h('div', { className: 'k-tabs', role: 'tablist', style: props.style },
      (props.items || []).map(function (it) {
        var t = norm(it);
        return h('button', { key: t.value || t.id, type: 'button', role: 'tab', className: 'k-tabs__item', 'aria-selected': props.active === (t.value || t.id) ? 'true' : 'false', onClick: props.onChange ? function () { props.onChange(t.value || t.id); } : undefined },
          t.label, t.count !== undefined ? h('span', { className: 'k-tabs__count' }, t.count) : null);
      }));
  }

  /* ---------- Sheet / modal (glass) ---------- */
  function Sheet(props) {
    var tid = useId('sheet');
    if (props.open === false) return null;
    return h('div', { className: cx('k-overlay', props.variant === 'sheet' && 'k-overlay--sheet', props.fixed && 'k-overlay--fixed'), onClick: props.onClose ? function (e) { if (e.target === e.currentTarget) props.onClose(); } : undefined, style: props.style },
      h('div', { className: cx('k-modal', props.wide && 'k-modal--wide'), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid },
        props.variant === 'sheet' ? h('span', { className: 'k-modal__grab', 'aria-hidden': 'true' }) : null,
        h('div', { className: 'k-modal__head' },
          h('div', null, h('h2', { className: 'k-title-lg', id: tid }, props.title), props.description ? h('p', { className: 'k-modal__desc' }, props.description) : null),
          h(IconButton, { icon: 'x', label: 'Close', variant: 'ghost', onClick: props.onClose, tooltipPlacement: 'below' })),
        h('div', { className: 'k-modal__body' }, props.children),
        props.footer ? h('div', { className: 'k-modal__foot' }, props.footer) : null));
  }

  /* ---------- Charts ---------- */
  function smoothPath(pts) {
    if (!pts.length) return '';
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 2] || pts[i - 1], p1 = pts[i - 1], p2 = pts[i], p3 = pts[i + 1] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }
  function interp(curve, day) {
    for (var i = 1; i < curve.length; i++) {
      if (day <= curve[i].day) { var a = curve[i - 1], b = curve[i]; return a.kg + (b.kg - a.kg) * (day - a.day) / (b.day - a.day); }
    }
    return curve[curve.length - 1].kg;
  }
  var DEFAULT_STANDARD = [{ day: 0, kg: 0.042 }, { day: 7, kg: 0.19 }, { day: 14, kg: 0.48 }, { day: 21, kg: 0.93 }, { day: 24, kg: 1.15 }, { day: 28, kg: 1.5 }, { day: 35, kg: 2.2 }, { day: 42, kg: 2.85 }];
  /* GrowthChart: the product's one bold element. Actual samples vs breed standard, ±5% band, today marker, projection, late zone. */
  function GrowthChart(props) {
    var W = 940, H = 346, X0 = 48, Y0 = 16, PW = 860, PH = 300;
    var maxDay = props.maxDay || 42, maxKg = props.maxKg || 3;
    var std = props.standard || DEFAULT_STANDARD;
    var samples = props.samples || [];
    var deep = props.theme !== 'light';
    var col = deep ? { grid: 'rgba(255,255,255,0.09)', axis: 'rgba(255,255,255,0.28)', label: '#b9d3a6', text: '#ffffff', ground: '#16300c', zone: 'rgba(255,255,255,0.045)', actual: '#8be55c', gap: '#ffb38a', gapSub: '#ffd9c4' }
      : { grid: '#eef2ea', axis: '#c9d3c1', label: '#4e5948', text: '#10180b', ground: '#ffffff', zone: '#f4f7f1', actual: '#3d7a12', gap: '#b4400b', gapSub: '#8a3108' };
    function x(d) { return X0 + d / maxDay * PW; }
    function y(k) { return Y0 + PH - (k / maxKg) * PH; }
    var hi = std.map(function (p) { return [x(p.day), y(p.kg * 1.05)]; });
    var lo = std.map(function (p) { return [x(p.day), y(p.kg * 0.95)]; }).reverse();
    var band = smoothPath(hi) + ' L' + smoothPath(lo).slice(1) + ' Z';
    var stdPath = smoothPath(std.map(function (p) { return [x(p.day), y(p.kg)]; }));
    var pts = [{ day: 0, kg: std[0].kg }].concat(samples);
    var actPath = smoothPath(pts.map(function (p) { return [x(p.day), y(p.kg)]; }));
    var last = samples[samples.length - 1];
    var prev = samples[samples.length - 2];
    var kids = [];
    var lateFrom = props.lateFrom === undefined ? 28 : props.lateFrom;
    if (lateFrom !== null) {
      kids.push(h('rect', { key: 'late', x: x(lateFrom), y: Y0, width: x(maxDay) - x(lateFrom), height: PH, fill: col.zone }));
      kids.push(h('text', { key: 'latet', x: x(lateFrom) + 10, y: Y0 + 20, fontSize: 12, fill: col.label }, 'Hard to recover after day ' + lateFrom));
    }
    for (var k = 0; k <= maxKg; k += 0.5) kids.push(h('line', { key: 'g' + k, x1: X0, x2: X0 + PW, y1: y(k), y2: y(k), stroke: k === 0 ? col.axis : col.grid, strokeWidth: 1 }));
    for (var k2 = 0; k2 <= maxKg; k2 += 1) kids.push(h('text', { key: 'yl' + k2, x: X0 - 8, y: y(k2) + 4, fontSize: 12, fill: col.label, textAnchor: 'end' }, k2 === maxKg ? k2.toFixed(1) + ' kg' : (k2 === 0 ? '0' : k2.toFixed(1))));
    for (var d = 0; d <= maxDay; d += 7) kids.push(h('text', { key: 'xl' + d, x: x(d), y: H - 8, fontSize: 12, fill: col.label, textAnchor: 'middle' }, d === 0 ? 'Day 0' : String(d)));
    kids.push(h('path', { key: 'band', d: band, fill: 'rgba(249,201,48,' + (deep ? 0.14 : 0.22) + ')' }));
    kids.push(h('path', { key: 'std', d: stdPath, fill: 'none', stroke: deep ? '#f9c930' : '#c99a00', strokeWidth: 2.5, strokeDasharray: '7 6' }));
    if (props.today !== undefined) {
      kids.push(h('line', { key: 'today', x1: x(props.today), x2: x(props.today), y1: Y0, y2: Y0 + PH, stroke: deep ? 'rgba(255,255,255,0.4)' : '#6b7564', strokeWidth: 1, strokeDasharray: '3 4' }));
      kids.push(h('text', { key: 'todayt', x: x(props.today) - 8, y: Y0 + 20, fontSize: 12, fontWeight: 700, fill: col.text, textAnchor: 'end' }, 'Today · day ' + props.today));
    }
    if (last && prev && props.projectTo) {
      var adg = (last.kg - prev.kg) / (last.day - prev.day);
      var pk = last.kg + adg * (props.projectTo - last.day);
      var sk = interp(std, props.projectTo);
      var gap = Math.round((pk / sk - 1) * 100);
      kids.push(h('line', { key: 'proj', x1: x(last.day), y1: y(last.kg), x2: x(props.projectTo), y2: y(pk), stroke: col.actual, strokeWidth: 3, strokeDasharray: '1 8', strokeLinecap: 'round' }));
      kids.push(h('line', { key: 'gap', x1: x(props.projectTo), x2: x(props.projectTo), y1: y(sk) + 4, y2: y(pk) - 5, stroke: col.gap, strokeWidth: 2 }));
      kids.push(h('circle', { key: 'sp', cx: x(props.projectTo), cy: y(sk), r: 5, fill: '#f9c930' }));
      kids.push(h('circle', { key: 'pp', cx: x(props.projectTo), cy: y(pk), r: 6, fill: col.ground, stroke: col.actual, strokeWidth: 2.5, strokeDasharray: '3 3' }));
      var tx = x(props.projectTo) + 13, anchor = 'start';
      if (tx > W - 150) { tx = x(props.projectTo) - 13; anchor = 'end'; }
      kids.push(h('text', { key: 'pt1', x: tx, y: (y(sk) + y(pk)) / 2 - 2, fontSize: 13, fontWeight: 700, fill: col.gap, textAnchor: anchor }, 'At this rate: ' + pk.toFixed(2) + ' kg by day ' + props.projectTo));
      kids.push(h('text', { key: 'pt2', x: tx, y: (y(sk) + y(pk)) / 2 + 16, fontSize: 12, fill: col.gapSub, textAnchor: anchor }, Math.abs(gap) + '% ' + (gap < 0 ? 'under' : 'over') + ' the ' + sk.toFixed(2) + ' kg standard'));
    }
    kids.push(h('path', { key: 'act', d: actPath, fill: 'none', stroke: col.actual, strokeWidth: 3.5, strokeLinecap: 'round' }));
    samples.forEach(function (s, i) {
      var isLast = i === samples.length - 1;
      kids.push(h('circle', { key: 's' + i, cx: x(s.day), cy: y(s.kg), r: isLast ? 8 : 5.5, fill: isLast ? col.actual : col.ground, stroke: isLast ? col.ground : col.actual, strokeWidth: 3 }, h('title', null, 'Day ' + s.day + ': ' + s.kg.toFixed(2) + ' kg')));
    });
    if (last && props.callout !== false) {
      var sd = interp(std, last.day);
      var g = (last.kg / sd - 1) * 100;
      var bx = x(last.day) + 13, by = y(last.kg) + 11;
      if (bx + 180 > W) bx = x(last.day) - 193;
      kids.push(h('g', { key: 'callout' },
        h('rect', { x: bx, y: by, width: 180, height: 56, rx: 12, fill: deep ? '#ffffff' : '#10180b' }),
        h('text', { x: bx + 14, y: by + 23, fontSize: 14, fontWeight: 800, fill: deep ? '#10180b' : '#ffffff' }, last.kg.toFixed(2) + ' kg · day ' + last.day),
        h('text', { x: bx + 14, y: by + 43, fontSize: 12, fill: deep ? '#4e5948' : '#cfe3bf' }, 'Standard ' + sd.toFixed(2) + ' kg · ' + (g < 0 ? '−' : '+') + Math.abs(g).toFixed(1) + '%')));
    }
    var label = props.ariaLabel || ('Average weight by day of age against the breed standard.' + (last ? ' Latest: ' + last.kg.toFixed(2) + ' kg at day ' + last.day + '.' : ''));
    return h('svg', { className: 'k-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': label, style: props.style }, kids);
  }
  function Sparkline(props) {
    var v = props.values || [];
    var w = props.width || 120, hgt = props.height || 56, pad = 6;
    if (v.length < 2) return null;
    var mn = Math.min.apply(null, v), mx = Math.max.apply(null, v), rng = mx - mn || 1;
    var pts = v.map(function (n, i) { return [pad + i * (w - pad * 2) / (v.length - 1), pad + (hgt - pad * 2) * (1 - (n - mn) / rng)]; });
    var line = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var lastP = pts[pts.length - 1];
    var area = 'M' + pts[0][0] + ' ' + (hgt - 2) + ' L' + line.replace(/ /g, ' L') + ' L' + lastP[0] + ' ' + (hgt - 2) + ' Z';
    var stroke = props.tone === 'alert' ? '#b4400b' : '#3d7a12';
    return h('svg', { width: w, height: hgt, viewBox: '0 0 ' + w + ' ' + hgt, role: 'img', 'aria-label': props.label || 'Trend', style: props.style },
      h('path', { d: area, fill: stroke, opacity: 0.08 }),
      h('polyline', { points: line, fill: 'none', stroke: '#3d7a12', strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }),
      h('circle', { cx: lastP[0], cy: lastP[1], r: 4.5, fill: props.endTone === 'alert' || props.tone === 'alert' ? '#b4400b' : '#3d7a12' }));
  }
  /* BarList: horizontal bars for a breakdown (expenses by category). One hue; the top bar can be emphasised. */
  function BarList(props) {
    var items = props.items || [];
    var total = items.reduce(function (a, b) { return a + (b.value || 0); }, 0) || 1;
    var mx = Math.max.apply(null, items.map(function (i) { return i.value || 0; }).concat([1]));
    return h('div', { style: Object.assign({ display: 'flex', flexDirection: 'column', gap: 12 }, props.style || {}) },
      items.map(function (it, i) {
        var share = (it.value / total) * 100;
        return h('div', { key: i, style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '4px 12px', alignItems: 'baseline' } },
          h('span', { className: 'k-body', style: { color: 'var(--ink-2)' } }, it.label),
          h('span', { className: 'k-figure-sm' }, props.format === 'plain' ? it.value : naira(it.value), h('span', { className: 'k-caption', style: { marginLeft: 8, fontWeight: 600 } }, share.toFixed(0) + '%')),
          h('div', { style: { gridColumn: '1 / -1', height: 10, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' } },
            h('div', { style: { width: (it.value / mx * 100) + '%', height: '100%', borderRadius: 999, background: i === 0 && props.emphasizeFirst !== false ? 'var(--green-600)' : '#9fc97f' } })));
      }));
  }

  var Kotila = {
    Icon: Icon, Button: Button, IconButton: IconButton, Tooltip: Tooltip,
    Field: Field, TextInput: TextInput, MoneyInput: MoneyInput, Select: Select, LinkedAmounts: LinkedAmounts, Stepper: Stepper,
    ChipGroup: ChipGroup, Segmented: Segmented, AttributionField: AttributionField, Checkbox: Checkbox,
    Tag: Tag, StatusChip: StatusChip, Figure: Figure, Delta: Delta, Money: Money, Panel: Panel, Rows: Rows, LedgerTable: LedgerTable,
    Notice: Notice, SyncStatus: SyncStatus, Person: Person, RoleBadge: RoleBadge, AuditTrail: AuditTrail, EmptyState: EmptyState,
    SideRail: SideRail, TopBar: TopBar, TabBar: TabBar, Tabs: Tabs, Wordmark: Wordmark, Sheet: Sheet,
    GrowthChart: GrowthChart, Sparkline: Sparkline, BarList: BarList,
    format: { naira: naira, pct: pct, kg: kg, int: int },
    standardCurve: DEFAULT_STANDARD
  };
  window.Kotila = Object.assign(window.Kotila || {}, Kotila);
})();
