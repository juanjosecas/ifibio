/* Independent public roster and local draft; source evidence is read-only. */
(async function () {
  const storageKey = 'ifibio-roster-september-2026-v1';
  const states = ['Actual', 'Exintegrante', 'En revisión', 'Sin confirmar'];
  const tree = $('roster-tree');
  let people = [], units = [], draft = {};
  function normalize(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function effective(person) { return { ...person, ...draft[person.name] }; }
  function options(values, selected) { return values.map(value => `<option ${value === selected ? 'selected' : ''}>${esc(value)}</option>`).join(''); }
  function card(person) {
    const row = effective(person);
    const categories = [...new Set(person.records.map(record => record.category).filter(Boolean))];
    const mail = person.emails.map(address => `<a href="mailto:${esc(address)}">${esc(address)}</a>`).join('<br>');
    const evidence = person.records.map(record => `<tr><td>${esc(record.source)}<br>${esc(record.sheet)} · fila ${record.row}</td><td>${esc(record.name)}<br>${esc(record.category)}</td><td>${esc(record.unit || 'Sin unidad')}<br>${esc(record.supervisor ? `Responsable: ${record.supervisor}` : '')}</td><td>${esc(record.status)}</td></tr>`).join('');
    return `<article class="roster-person" data-state="${esc(row.status)}"><h3>${esc(person.name)}</h3><p class="roster-state">${esc(row.status)}${draft[person.name] ? ' · decisión del borrador' : ''}</p><p>${esc(categories.join(' / ') || 'Categoría sin informar')}</p><p>${mail || 'Correo no informado'}</p>
      ${$('roster-edit').checked ? `<div class="roster-editor"><label>Unidad<select data-person="${esc(person.name)}" data-field="unit">${options(units, row.unit)}</select></label><label>Estado<select data-person="${esc(person.name)}" data-field="status">${options(states, row.status)}</select></label></div>` : ''}
      <details><summary>Ver evidencia (${person.records.length} registros)</summary><div class="roster-evidence"><table><thead><tr><th>Fuente</th><th>Nombre y categoría</th><th>Asignación</th><th>Estado en la fuente</th></tr></thead><tbody>${evidence}</tbody></table></div></details></article>`;
  }
  function render() {
    const query = normalize($('roster-search').value.trim());
    const state = $('roster-state').value, unit = $('roster-unit').value;
    const visible = people.filter(person => {
      const row = effective(person);
      return (!state || row.status === state) && (!unit || row.unit === unit) && (!query || normalize(`${person.name} ${person.emails.join(' ')} ${row.unit} ${person.records.map(r => `${r.name} ${r.category} ${r.unit} ${r.supervisor}`).join(' ')}`).includes(query));
    });
    const grouped = new Map();
    visible.forEach(person => { const unit = effective(person).unit; if (!grouped.has(unit)) grouped.set(unit, []); grouped.get(unit).push(person); });
    tree.innerHTML = [...grouped].sort(([a], [b]) => a.localeCompare(b, 'es')).map(([unit, members]) => `<details class="roster-unit" ${query || $('roster-edit').checked ? 'open' : ''}><summary>${esc(unit)} · ${members.length} personas</summary><div class="roster-people">${members.map(card).join('')}</div></details>`).join('') || '<p>No hay coincidencias.</p>';
    $('roster-summary').textContent = `${visible.length} de ${people.length} personas · ${states.map(state => `${visible.filter(person => effective(person).status === state).length} ${state.toLowerCase()}`).join(' · ')}`;
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(draft)); }
    catch { $('roster-status').textContent = 'No se pudo guardar el borrador en este navegador. Exporte el CSV para conservar los cambios.'; }
  }
  function exportCSV() {
    // Prevent spreadsheet formulas when user-selected strings are exported.
    const cell = value => { let string = String(value); if (/^[=+@-]/.test(string)) string = `'${string}`; return `"${string.replace(/"/g, '""')}"`; };
    const rows = [['Nombre', 'Unidad', 'Estado', 'Categorías informadas', 'Correos'], ...people.map(person => { const row = effective(person); return [person.name, row.unit, row.status, [...new Set(person.records.map(r => r.category).filter(Boolean))].join(' / '), person.emails.join('; ')]; })];
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'organigrama-septiembre-2026.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  try {
    const data = await loadJSON(`${BASEURL}/assets/data/roster-september-2026.json`);
    people = data.people;
    units = [...new Set([...data.catalog, ...people.map(person => person.unit)])].sort((a, b) => a.localeCompare(b, 'es'));
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (saved && typeof saved === 'object') people.forEach(person => {
        const row = saved[person.name];
        if (row && units.includes(row.unit) && states.includes(row.status)) draft[person.name] = { unit: row.unit, status: row.status };
      });
    } catch { /* A corrupt or unavailable local draft does not block the roster. */ }
    $('roster-unit').innerHTML += options(units, '');
    $('roster-notes').innerHTML = data.notes.map(note => `<li>${esc(note)}</li>`).join('');
    $('roster-status').textContent = `${data.source_period} · ${data.catalog.length} unidades en el catálogo · ${people.filter(p => p.emails.length).length} personas con correo`;
    ['roster-search', 'roster-state', 'roster-unit', 'roster-edit'].forEach(id => $(id).addEventListener(id === 'roster-search' ? 'input' : 'change', render));
    tree.addEventListener('change', event => {
      const target = event.target;
      if (!target.dataset.person || !['unit', 'status'].includes(target.dataset.field)) return;
      const person = people.find(person => person.name === target.dataset.person);
      if (!person) return;
      const row = effective(person);
      draft[person.name] = { unit: row.unit, status: row.status, [target.dataset.field]: target.value };
      save(); render();
    });
    $('roster-export').addEventListener('click', exportCSV);
    $('roster-reset').addEventListener('click', () => { if (confirm('¿Restaurar todas las asignaciones iniciales y descartar el borrador local?')) { draft = {}; save(); render(); } });
    render();
  } catch (error) { $('roster-status').textContent = 'No se pudo cargar la nómina.'; tree.textContent = error.message; }
})();
