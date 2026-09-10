---
title: Organization
nav_order: 2.5
description: "Interactive IFIBIO organization chart with current members, former members and unresolved status conflicts."
page_script: /assets/js/organization.js
permalink: /organization.html
---

# IFIBIO organization
{: .fs-8 }

Laboratories, research groups and institutional support areas. Select a unit to inspect its members. Status is based on the current personnel pages and the official former-members page. <span id="data-status" class="label label-blue">Loading data…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app organization-app">

<div class="org-legend" aria-label="Member status legend">
  <span class="org-status current"><i></i>Current</span>
  <span class="org-status conflict"><i></i>Conflicting official records</span>
  <span class="org-status former"><i></i>Former</span>
</div>

<section class="org-root" aria-labelledby="org-root-title">
  <span class="section-tag">INSTITUTE</span>
  <h2 id="org-root-title">IFIBIO Houssay</h2>
  <p>UBA–CONICET · Instituto de Fisiología y Biofísica Bernardo Houssay</p>
</section>

<div class="org-toolbar">
  <label><span>Find a person or group</span><input id="org-search" type="search" placeholder="Name, laboratory, subgroup…" autocomplete="off"></label>
  <label class="org-toggle"><input id="org-show-former" type="checkbox" checked>Show former members</label>
  <button id="org-expand-all" class="button ghost" type="button">Expand all</button>
</div>

<p id="org-summary" class="org-summary" aria-live="polite"></p>
<div id="org-units" class="org-grid"></div>

<aside class="panel org-method-note">
  <span class="section-tag">STATUS CRITERION</span>
  <p><strong>Current</strong> means that the person appears on an official current personnel page. <strong>Former</strong> means that the person appears on the official former-members page. When both occur, the record remains amber and is not resolved automatically.</p>
  <p id="org-source-note" class="hint"></p>
</aside>

</div>

