---
title: Organigrama septiembre 2026
nav_order: 1.1
description: "Nómina y borrador de organigrama a partir de las planillas de septiembre de 2026."
page_script: /assets/js/organization-september.js
permalink: /organization-september.html
---

<link rel="stylesheet" href="{{ '/assets/css/organization-september.css' | relative_url }}">

# Organigrama septiembre 2026

Explore la información de las nuevas planillas y prepare un borrador de asignaciones. Los estados contradictorios aparecen como **En revisión**; una fila administrativa sin confirmación de vigencia aparece como **Sin confirmar**.

<div class="ifibio-app roster-app">
  <p id="roster-status" aria-live="polite">Cargando nómina…</p>
  <div class="org-toolbar">
    <label><span>Buscar persona, correo o unidad</span><input id="roster-search" type="search" autocomplete="off"></label>
    <label><span>Estado</span><select id="roster-state"><option value="">Todos</option><option>Actual</option><option>Exintegrante</option><option>En revisión</option><option>Sin confirmar</option></select></label>
    <label><span>Unidad del borrador</span><select id="roster-unit"><option value="">Todas</option></select></label>
  </div>
  <div class="roster-actions">
    <label><input id="roster-edit" type="checkbox"> Editar unidad y estado</label>
    <button id="roster-export" type="button">Exportar borrador CSV</button>
    <button id="roster-reset" type="button">Restaurar asignaciones iniciales</button>
  </div>
  <p class="hint">Los cambios del borrador se guardan en este navegador. El CSV incluye la nómina completa, aunque haya filtros activos. La evidencia original se conserva en cada ficha.</p>
  <p id="roster-summary" aria-live="polite"></p>
  <div id="roster-tree"></div>
  <aside class="panel">
    <h2>Fuentes y criterios</h2>
    <p>Planilla Ifibio-Houssay de septiembre de 2026 y tablas por categoría de Integrantes_IFIBIO_Houssay. Se conserva también la tabla de Fisiopatogenia, que informa una baja explícita. Los correos son los consignados en la planilla administrativa.</p>
    <ul id="roster-notes"></ul>
    <p>La hoja Organigrama sobrescrita y las copias antiguas de resúmenes no definen las asignaciones de esta vista. La falta de una persona en estas fuentes no demuestra que sea exintegrante.</p>
  </aside>
</div>
