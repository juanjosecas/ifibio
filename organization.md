---
title: Institucional
nav_order: 1
description: "Organigrama interactivo del IFIBIO con integrantes actuales, exintegrantes y estados en revisión."
page_vendor_script: https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js
page_script: /assets/js/organization.js
permalink: /organization.html
---

# Organigrama institucional
{: .fs-8 }

Explore la estructura del IFIBIO y despliegue cada sector, laboratorio o grupo para consultar sus integrantes. <span id="data-status" class="label label-blue">Cargando datos…</span>
{: .fs-5 .fw-300 }

<div class="ifibio-app organization-app">

<div class="org-legend" aria-label="Referencia de estados">
  <span class="org-status current"><i></i>Integrante actual</span>
  <span class="org-status conflict"><i></i>Estado en revisión</span>
  <span class="org-status former"><i></i>Exintegrante</span>
</div>

<div class="org-toolbar">
  <label><span>Buscar persona, sector o grupo</span><input id="org-search" type="search" placeholder="Nombre, laboratorio, subgrupo…" autocomplete="off"></label>
  <label class="org-toggle"><input id="org-show-former" type="checkbox" checked>Mostrar exintegrantes</label>
  <button id="org-expand-all" class="button ghost" type="button">Desplegar todo</button>
</div>

<p id="org-summary" class="org-summary" aria-live="polite"></p>

<details class="org-tree-root" open>
  <summary>
    <span class="org-node-mark" aria-hidden="true">IF</span>
    <span><strong>IFIBIO Houssay</strong><small>Instituto de Fisiología y Biofísica Bernardo Houssay · UBA–CONICET</small></span>
  </summary>
  <div id="org-tree" class="org-tree-children"></div>
</details>

<aside class="panel org-method-note">
  <span class="section-tag">FUENTE DE DATOS</span>
  <p>El organigrama se genera directamente desde la hoja <strong>Organigrama</strong> del archivo Excel incluido en el repositorio. Los cambios confirmados en ese archivo se reflejan automáticamente al volver a publicarse el sitio.</p>
  <p><strong>Actual</strong> indica que la persona figura en una página oficial vigente. <strong>Exintegrante</strong> indica que figura en la página oficial de exintegrantes. Si aparece en ambas, el estado queda señalado para revisión.</p>
  <p id="org-source-note" class="hint"></p>
</aside>

</div>
