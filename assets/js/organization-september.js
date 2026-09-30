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
  // Use one category per person; preserve other source categories in the evidence.
  function composition(person) {
    const master = person.records.find(r => ['INVESTIGADORES', 'BECARIOS', 'CPA', 'ADMINISTRATIVOS'].includes(r.sheet) && r.category);
    const record = master || person.records.find(r => r.category) || person.records[0];
    const category = normalize(record.category);
    const sheet = normalize(record.sheet);
    let group = 'Sin clasificar', role = 'Cargo sin informar';
    if (sheet === 'investigadores' || /cic conicet|investigador|^(adjunt|independiente|principal|asistente|superior)/.test(category)) {
      group = 'Investigación';
      role = ['superior', 'principal', 'independiente', 'adjunt', 'asistente'].find(r => category.includes(r)) || 'Investigación UBA / otra';
      if (role === 'adjunt') role = 'Adjunto/a';
    } else if (sheet === 'administrativos' || /administrativ/.test(category)) {
      group = 'Administración'; role = category.includes('conicet') ? 'Administración CONICET' : category.includes('uba') ? 'Administración UBA' : 'Administración sin organismo';
    } else if (sheet === 'cpa' || sheet === 'personal de apoyo' || /cpa|personal de apoyo|tecnic/.test(category)) {
      group = 'Personal de apoyo';
      const level = ['principal', 'asociado', 'adjunt', 'asistente', 'asisitente'].find(r => category.includes(r));
      const type = /profesional/.test(category) ? 'Profesional' : /tecnic/.test(category) ? 'Técnico/a' : 'Apoyo';
      role = type + (level ? ' ' + level.replace('asisitente', 'asistente').replace('adjunt', 'adjunto/a') : ' sin nivel informado');
    } else if (sheet === 'becarios' || /becari|beca|doctoral/.test(category)) {
      group = 'Becas'; role = /postdoc/.test(category) ? 'Posdoctoral' : /finaliza/.test(category) ? 'Doctoral de finalización' : /doctor/.test(category) ? 'Doctoral' : /estimulo|estudiante/.test(category) ? 'Estímulo / estudiante' : 'Otra beca';
    } else if (/pasante|pasan del/.test(category)) {
      group = 'Tesistas y pasantes'; role = /medicina/.test(category) ? 'Practicantado de Medicina' : 'Pasantía';
    } else if (/tesista|estudiante de doctorado/.test(category) || sheet === 'tesistas y pasantes') {
      group = 'Tesistas y pasantes'; role = /maestr/.test(category) ? 'Tesis de maestría' : /doctor/.test(category) ? 'Tesis doctoral' : /grado|licenciatura/.test(category) ? 'Tesis de grado' : 'Tesis / formación sin nivel';
    }
    role = role.charAt(0).toUpperCase() + role.slice(1);
    return { group, role, category: record.category };
  }
  function charts(visible) {
    if (typeof Plotly === 'undefined') {
      $('roster-chart-notes').textContent = 'No se pudo cargar la biblioteca de gráficos.';
      return;
    }
    const rows = visible.map(person => ({ ...composition(person), ...effective(person) }));
    const colors = { 'Investigación': '#476b9e', 'Personal de apoyo': '#639c83', 'Administración': '#aa7aaf', 'Becas': '#d6a343', 'Tesistas y pasantes': '#5ca5b5', 'Sin clasificar': '#929aa6' };
    const count = key => {
      const counts = new Map();
      rows.forEach(row => counts.set(row[key], (counts.get(row[key]) || 0) + 1));
      return [...counts].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0], 'es'));
    };
    const layout = (title, size) => ({
      title: { text: title, x: 0.03, font: { size: 17 } },
      height: Math.max(300, size * 30 + 110), autosize: true,
      margin: { l: 210, r: 35, t: 55, b: 55 }, paper_bgcolor: '#fff', plot_bgcolor: '#fff',
      font: { family: 'Inter, system-ui, sans-serif', color: '#334155' },
      xaxis: { title: { text: 'Fichas' }, rangemode: 'tozero', dtick: 1 },
      yaxis: { automargin: true, type: 'category' },
      annotations: rows.length ? [] : [{ text: 'Sin coincidencias', x: 0.5, y: 0.5, xref: 'paper', yref: 'paper', showarrow: false }]
    });
    const config = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['select2d', 'lasso2d'], toImageButtonOptions: { format: 'png', scale: 2 } };
    [['groups', 'group', 'Grupos'], ['roles', 'role', 'Tipos de cargo / formación'], ['states', 'status', 'Estados']].forEach(([id, key, title]) => {
      const values = count(key);
      Plotly.react('roster-chart-' + id, [{ type: 'bar', orientation: 'h', y: values.map(r => r[0]), x: values.map(r => r[1]),
        text: values.map(r => String(r[1])), textposition: 'auto',
        marker: { color: values.map(r => colors[r[0]] || '#476b9e') },
        hovertemplate: '%{y}: %{x} fichas<extra></extra>' }], layout(title, values.length), config);
    });
    const units = count('unit').map(r => r[0]);
    const groups = Object.keys(colors).filter(group => rows.some(row => row.group === group));
    Plotly.react('roster-chart-units', groups.map(group => ({
      name: group, type: 'bar', orientation: 'h', y: units,
      x: units.map(unit => rows.filter(row => row.unit === unit && row.group === group).length),
      marker: { color: colors[group] }, hovertemplate: '%{y}<br>' + group + ': %{x} fichas<extra></extra>'
    })), { ...layout('Unidades de trabajo por grupo', units.length), barmode: 'stack', margin: { l: 260, r: 35, t: 55, b: 110 }, legend: { orientation: 'h', y: -0.12 } }, config);
    $('roster-chart-notes').textContent = 'Grupo y cargo se toman de la tabla por categoría del archivo nuevo cuando existe; en los demás casos, de la categoría administrativa. Las variantes se agrupan sin inferir jerarquías ni vigencia. ' + rows.filter(row => row.group === 'Sin clasificar').length + ' fichas sin grupo identificable.';
  }
  function render() {
    const query = normalize($('roster-search').value.trim());
    const state = $('roster-state').value, unit = $('roster-unit').value;
    const visible = people.filter(person => {
      const row = effective(person);
      return (!state || row.status === state) && (!unit || row.unit === unit) && (!query || normalize(`${person.name} ${person.emails.join(' ')} ${row.unit} ${person.records.map(r => `${r.name} ${r.category} ${r.unit} ${r.supervisor}`).join(' ')}`).includes(query));
    });
    charts(visible);
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
