/* Interactive IFIBIO organization chart. Data is versioned in assets/data/organization.json. */
(async function () {
  const statusEl = $('data-status');
  const unitsEl = $('org-units');
  const searchEl = $('org-search');
  const showFormerEl = $('org-show-former');
  const summaryEl = $('org-summary');
  const sourceNoteEl = $('org-source-note');
  const expandAllEl = $('org-expand-all');
  const organizationPath = `${BASEURL}/assets/data/organization.json`;
  const statusLabel = { current: 'Current', conflict: 'Conflicting record', former: 'Former' };

  let data;
  let allExpanded = false;

  function memberCard(member) {
    const profile = member.profile_url
      ? `<a class="org-profile" href="${esc(member.profile_url)}" target="_blank" rel="noopener">CONICET profile ↗</a>`
      : '';
    const secondary = member.area || member.subgroup;
    return `<article class="org-person ${member.status}">
      <div class="org-person-head"><strong>${esc(member.name)}</strong><span class="org-badge ${member.status}">${statusLabel[member.status]}</span></div>
      ${member.role ? `<p>${esc(member.role)}</p>` : ''}
      ${secondary ? `<small>${esc(secondary)}</small>` : ''}
      ${member.note ? `<small class="org-warning">${esc(member.note)}</small>` : ''}
      ${profile}
    </article>`;
  }

  function subgroupBlocks(members) {
    const groups = new Map();
    members.forEach(member => {
      const key = member.area || member.subgroup || 'General / not specified';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(member);
    });
    return [...groups.entries()].map(([name, rows]) => `<section class="org-subgroup">
      <h4>${esc(name)} <span>${rows.length}</span></h4>
      <div class="org-people">${rows.map(memberCard).join('')}</div>
    </section>`).join('');
  }

  function unitCard(unit, query, showFormer) {
    const q = query.toLowerCase();
    const unitMatches = `${unit.name} ${unit.leader || ''}`.toLowerCase().includes(q);
    const members = unit.members.filter(member => {
      if (!showFormer && member.status === 'former') return false;
      if (!q || unitMatches) return true;
      return `${member.name} ${member.role} ${member.subgroup} ${member.area}`.toLowerCase().includes(q);
    });
    if (q && !unitMatches && !members.length) return '';

    const current = members.filter(m => m.status === 'current');
    const conflict = members.filter(m => m.status === 'conflict');
    const former = members.filter(m => m.status === 'former');
    const leader = unit.leader ? `<p class="org-leader"><span>Lead</span><strong>${esc(unit.leader)}</strong></p>` : '';
    const formerSection = former.length ? `<section class="org-member-section former-section"><h3>Former members <span>${former.length}</span></h3>${subgroupBlocks(former)}</section>` : '';
    const conflictSection = conflict.length ? `<section class="org-member-section conflict-section"><h3>Conflicting official records <span>${conflict.length}</span></h3>${subgroupBlocks(conflict)}</section>` : '';
    const currentSection = current.length ? `<section class="org-member-section"><h3>Current members <span>${current.length}</span></h3>${subgroupBlocks(current)}</section>` : '<p class="empty-state">No current members match this filter.</p>';

    return `<details class="org-unit" data-unit="${esc(unit.id)}" ${q || allExpanded ? 'open' : ''}>
      <summary>
        <div><span class="section-tag">${unit.kind === 'laboratory' ? 'LABORATORY' : unit.kind === 'research_group' ? 'RESEARCH GROUP' : unit.kind === 'support' ? 'TECHNICAL SUPPORT' : 'MANAGEMENT'}</span><h2>${esc(unit.name)}</h2>${leader}</div>
        <div class="org-counts"><span class="current">${unit.counts.current} current</span>${unit.counts.conflict ? `<span class="conflict">${unit.counts.conflict} conflict</span>` : ''}${unit.counts.former ? `<span class="former">${unit.counts.former} former</span>` : ''}<i aria-hidden="true"></i></div>
      </summary>
      <div class="org-unit-body">${currentSection}${conflictSection}${formerSection}<a class="org-unit-link" href="${esc(unit.url)}" target="_blank" rel="noopener">Official IFIBIO page ↗</a></div>
    </details>`;
  }

  function render() {
    const query = searchEl.value.trim();
    const showFormer = showFormerEl.checked;
    const cards = data.units.map(unit => unitCard(unit, query, showFormer)).filter(Boolean);
    unitsEl.innerHTML = cards.join('') || '<div class="panel empty-state">No matching people or groups.</div>';
    const visibleMembers = data.units.flatMap(unit => unit.members).filter(member => showFormer || member.status !== 'former').filter(member => {
      if (!query) return true;
      const unit = data.units.find(u => u.members.includes(member));
      return `${unit?.name || ''} ${member.name} ${member.role} ${member.subgroup} ${member.area}`.toLowerCase().includes(query.toLowerCase());
    });
    const counts = { current: 0, conflict: 0, former: 0 };
    visibleMembers.forEach(member => counts[member.status]++);
    summaryEl.textContent = `${cards.length} units · ${counts.current} current · ${counts.conflict} conflicting${showFormer ? ` · ${counts.former} former` : ''}`;
  }

  try {
    data = await loadJSON(organizationPath);
    const totals = data.units.reduce((acc, unit) => {
      Object.keys(acc).forEach(key => { acc[key] += unit.counts[key] || 0; });
      return acc;
    }, { current: 0, conflict: 0, former: 0 });
    statusEl.textContent = `Updated ${data.verified_on}`;
    statusEl.className = 'label label-green';
    sourceNoteEl.textContent = `Verified ${data.verified_on}. ${data.scope_note}`;
    render();
    searchEl.addEventListener('input', render);
    showFormerEl.addEventListener('change', render);
    expandAllEl.addEventListener('click', () => {
      allExpanded = !allExpanded;
      document.querySelectorAll('.org-unit').forEach(unit => { unit.open = allExpanded; });
      expandAllEl.textContent = allExpanded ? 'Collapse all' : 'Expand all';
    });
    console.info('Organization loaded', totals);
  } catch (error) {
    console.error(error);
    statusEl.textContent = 'Data unavailable';
    statusEl.className = 'label label-red';
    unitsEl.innerHTML = '<div class="panel empty-state">The organization data could not be loaded.</div>';
  }
})();

