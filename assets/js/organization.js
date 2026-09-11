/* Interactive IFIBIO organization tree. The repository Excel file is the only data source. */
(async function () {
  const statusEl = $('data-status');
  const treeEl = $('org-tree');
  const searchEl = $('org-search');
  const showFormerEl = $('org-show-former');
  const summaryEl = $('org-summary');
  const sourceNoteEl = $('org-source-note');
  const expandAllEl = $('org-expand-all');
  const workbookPath = `${BASEURL}/assets/data/Integrantes_IFIBIO_Houssay.xlsx`;
  const statusLabel = { current: 'Actual', conflict: 'Estado en revisión', former: 'Exintegrante' };
  const sectorOrder = ['Laboratorios', 'Grupos de investigación', 'Personal de Apoyo', 'Gestión institucional'];
  let records = [];
  let allExpanded = false;

  function normalizedStatus(value) {
    const text = String(value || '').trim().toLowerCase();
    if (text.startsWith('conflicto')) return 'conflict';
    if (text === 'exintegrante') return 'former';
    return 'current';
  }

  function countStatuses(rows) {
    return rows.reduce((counts, row) => {
      counts[row.status] += 1;
      return counts;
    }, { current: 0, conflict: 0, former: 0 });
  }

  function countBadges(rows) {
    const counts = countStatuses(rows);
    return `<span class="org-counts"><span class="current">${counts.current} actuales</span>${counts.conflict ? `<span class="conflict">${counts.conflict} en revisión</span>` : ''}${counts.former ? `<span class="former">${counts.former} exintegrantes</span>` : ''}</span>`;
  }

  function memberCard(member) {
    const detail = member.area || member.subgroup;
    return `<article class="org-person ${member.status}">
      <div class="org-person-head"><strong>${esc(member.name)}</strong><span class="org-badge ${member.status}">${statusLabel[member.status]}</span></div>
      ${member.role ? `<p>${esc(member.role)}</p>` : ''}
      ${detail ? `<small>${esc(detail)}</small>` : ''}
      ${member.note ? `<small class="org-warning">${esc(member.note)}</small>` : ''}
    </article>`;
  }

  function memberGroups(members) {
    const groups = new Map();
    members.forEach(member => {
      const label = member.area || member.subgroup || 'Sin subgrupo publicado';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(member);
    });
    return [...groups.entries()].map(([label, rows]) => `<section class="org-subgroup"><h5>${esc(label)} <span>${rows.length}</span></h5><div class="org-people">${rows.map(memberCard).join('')}</div></section>`).join('');
  }

  function memberSections(members) {
    const current = members.filter(member => member.status === 'current');
    const conflict = members.filter(member => member.status === 'conflict');
    const former = members.filter(member => member.status === 'former');
    return `${current.length ? `<section class="org-member-section"><h4>Integrantes actuales <span>${current.length}</span></h4>${memberGroups(current)}</section>` : ''}${conflict.length ? `<section class="org-member-section conflict-section"><h4>Estado en revisión <span>${conflict.length}</span></h4>${memberGroups(conflict)}</section>` : ''}${former.length ? `<section class="org-member-section former-section"><h4>Exintegrantes <span>${former.length}</span></h4>${memberGroups(former)}</section>` : ''}`;
  }

  function unitBranch(unit, forceOpen) {
    const lead = unit.leader ? `<small>Responsable: ${esc(unit.leader)}</small>` : '';
    const source = unit.url ? `<a class="org-unit-link" href="${esc(unit.url)}" target="_blank" rel="noopener">Página oficial del IFIBIO ↗</a>` : '';
    return `<details class="org-branch org-unit" ${forceOpen || allExpanded ? 'open' : ''}><summary><span class="org-node-mark" aria-hidden="true">${unit.type === 'Laboratorio' ? 'L' : 'G'}</span><span><strong>${esc(unit.name)}</strong>${lead}</span>${countBadges(unit.members)}</summary><div class="org-branch-body">${memberSections(unit.members)}${source}</div></details>`;
  }

  function sectorBranch(sector, forceOpen) {
    const directSector = sector.name === 'Personal de Apoyo' || sector.name === 'Gestión institucional';
    const content = directSector ? memberSections(sector.members) : `<div class="org-tree-children">${sector.units.map(unit => unitBranch(unit, forceOpen)).join('')}</div>`;
    const mark = sector.name === 'Laboratorios' ? 'L' : sector.name === 'Grupos de investigación' ? 'G' : sector.name === 'Personal de Apoyo' ? 'PA' : 'GI';
    return `<details class="org-branch org-sector" ${forceOpen || allExpanded ? 'open' : ''}><summary><span class="org-node-mark" aria-hidden="true">${mark}</span><span><strong>${esc(sector.name)}</strong><small>${directSector ? 'Desplegar integrantes' : `${sector.units.length} unidades`}</small></span>${countBadges(sector.members)}</summary><div class="org-branch-body">${content}</div></details>`;
  }

  function hierarchy(query, showFormer) {
    const q = query.toLocaleLowerCase('es');
    const filtered = records.filter(row => {
      if (!showFormer && row.status === 'former') return false;
      if (!q) return true;
      return `${row.sector} ${row.unit} ${row.name} ${row.role} ${row.subgroup} ${row.area}`.toLocaleLowerCase('es').includes(q);
    });
    return sectorOrder.map(sectorName => {
      const sectorRows = filtered.filter(row => row.sector === sectorName);
      if (!sectorRows.length) return null;
      const unitNames = [...new Set(sectorRows.map(row => row.unit))];
      return {
        name: sectorName,
        members: sectorRows,
        units: unitNames.map(name => {
          const members = sectorRows.filter(row => row.unit === name);
          return { name, type: members[0].unitType, leader: members[0].leader, url: members[0].unitUrl, members };
        }),
      };
    }).filter(Boolean);
  }

  function render() {
    const query = searchEl.value.trim();
    const sectors = hierarchy(query, showFormerEl.checked);
    treeEl.innerHTML = sectors.map(sector => sectorBranch(sector, Boolean(query))).join('') || '<div class="panel empty-state">No se encontraron coincidencias.</div>';
    const visible = sectors.flatMap(sector => sector.members);
    const counts = countStatuses(visible);
    summaryEl.textContent = `${sectors.length} sectores · ${counts.current} actuales · ${counts.conflict} en revisión${showFormerEl.checked ? ` · ${counts.former} exintegrantes` : ''}`;
  }

  try {
    if (typeof XLSX === 'undefined') throw new Error('No se pudo cargar el lector de Excel.');
    const response = await fetch(workbookPath, { cache: 'no-store' });
    if (!response.ok) throw new Error(`No se pudo leer el Excel (${response.status}).`);
    const workbook = XLSX.read(await response.arrayBuffer(), { type: 'array', cellDates: true });
    const sheet = workbook.Sheets.Organigrama;
    if (!sheet) throw new Error('El Excel no contiene la hoja Organigrama.');
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
    records = rows.filter(row => row.Nombre && row.Sector && row.Unidad).map(row => ({
      sector: String(row.Sector).trim(), unitId: String(row['ID de unidad'] || '').trim(), unit: String(row.Unidad).trim(), unitType: String(row['Tipo de unidad'] || '').trim(), leader: String(row.Responsable || '').trim(), name: String(row.Nombre).trim(), status: normalizedStatus(row.Estado), role: String(row['Rol / categoría'] || '').trim(), subgroup: String(row['Subgrupo / línea'] || '').trim(), area: String(row['Área técnica'] || '').trim(), note: String(row.Observaciones || '').trim(), unitUrl: String(row['Página oficial de la unidad'] || '').trim(), verified: String(row['Fecha de verificación'] || '').trim(),
    }));
    if (!records.length) throw new Error('La hoja Organigrama no contiene registros válidos.');
    const verified = records.map(row => row.verified).filter(Boolean).sort().at(-1) || 'sin fecha';
    statusEl.textContent = `Excel actualizado: ${verified}`;
    statusEl.className = 'label label-green';
    sourceNoteEl.textContent = `${records.length} asignaciones leídas desde Integrantes_IFIBIO_Houssay.xlsx.`;
    render();
    searchEl.addEventListener('input', render);
    showFormerEl.addEventListener('change', render);
    expandAllEl.addEventListener('click', () => {
      allExpanded = !allExpanded;
      document.querySelectorAll('.org-tree-root, .org-branch').forEach(branch => { branch.open = allExpanded; });
      expandAllEl.textContent = allExpanded ? 'Contraer todo' : 'Desplegar todo';
    });
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Datos no disponibles';
    statusEl.className = 'label label-red';
    treeEl.innerHTML = `<div class="panel empty-state">${esc(error.message || 'No se pudo cargar el organigrama.')}</div>`;
  }
})();
