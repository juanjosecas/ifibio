const TOP_AUTHOR_COLORS=[
'#ff6b6b','#f59e0b','#facc15','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6',
'#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#fb7185','#fdba74','#fde047','#bef264',
'#6ee7b7','#67e8f9','#93c5fd','#c4b5fd','#f0abfc'
];

let networkEnhancementsReady=false;
let top25Ids=new Set();

function injectNetworkEnhancementStyles(){
  if(document.getElementById('network-enhancement-styles'))return;
  const style=document.createElement('style');
  style.id='network-enhancement-styles';
  style.textContent=`
    .top-authors-panel{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
    .top-authors-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;color:var(--muted);font-size:.76rem}
    .top-authors-head b{color:var(--text);font-size:.78rem}.top-authors-head small{color:var(--accent);font-weight:600;margin-left:5px}
    .top-authors-list{display:flex;gap:7px;overflow-x:auto;padding:3px 2px 8px;scrollbar-width:thin}
    .top-author-chip{flex:0 0 auto;display:grid;grid-template-columns:9px auto minmax(90px,auto) auto;align-items:center;gap:6px;border:1px solid var(--line);background:rgba(255,255,255,.025);color:var(--text);border-radius:999px;padding:7px 9px;cursor:pointer;transition:.16s ease}
    .top-author-chip:hover{transform:translateY(-1px);background:rgba(125,211,252,.075);border-color:rgba(125,211,252,.2)}
    .top-author-chip i{width:9px;height:9px;border-radius:50%;box-shadow:0 0 12px currentColor}.top-author-chip span{color:var(--muted);font-size:.68rem}.top-author-chip b{font-size:.72rem;font-weight:650;white-space:nowrap}.top-author-chip em{font-style:normal;color:var(--accent);font-size:.68rem}
    .top25-toggle span{color:#dbeafe}
    #cy{background:radial-gradient(circle at 50% 45%,rgba(30,64,175,.12),transparent 36%),linear-gradient(180deg,rgba(4,10,22,.15),rgba(4,10,22,.45))}
    @media(max-width:760px){.top-authors-head{align-items:flex-start;flex-direction:column}.top-author-chip{grid-template-columns:8px auto minmax(76px,auto) auto}}
  `;
  document.head.appendChild(style);
}

function enhanceNetworkUI(){
  if(networkEnhancementsReady||!document.getElementById('view-network'))return;
  const toggleRow=document.querySelector('#view-network .toggle-row');
  if(toggleRow){
    const label=document.createElement('label');
    label.className='toggle top25-toggle';
    label.innerHTML='<input id="highlight-top25" type="checkbox" checked><span>Highlight top 25 authors</span>';
    toggleRow.insertBefore(label,document.getElementById('network-counts'));
  }
  const controlPanel=document.querySelector('#view-network .control-panel');
  if(controlPanel){
    const block=document.createElement('div');
    block.className='top-authors-panel';
    block.innerHTML='<div class="top-authors-head"><span><b>Top 25 authors</b> <small id="top25-metric-label"></small></span><span class="hint">click an author to focus</span></div><div id="top-authors-list" class="top-authors-list"></div>';
    controlPanel.appendChild(block);
  }
  document.getElementById('highlight-top25')?.addEventListener('change',applyTopAuthorHighlighting);
  networkEnhancementsReady=true;
}

function rankTopAuthors(){
  if(!state?.cy)return [];
  const ranked=state.cy.nodes().map(n=>({node:n,value:authorMetricValue(n)})).sort((a,b)=>b.value-a.value||b.node.degree()-a.node.degree()).slice(0,25);
  top25Ids=new Set(ranked.map(x=>x.node.id()));
  ranked.forEach((x,i)=>{x.node.data('topRank',i+1);x.node.data('topColor',TOP_AUTHOR_COLORS[i]);});
  return ranked;
}

function renderTopAuthors(ranked){
  const holder=document.getElementById('top-authors-list');
  if(!holder)return;
  const metric=document.getElementById('top25-metric-label');
  if(metric)metric.textContent=`by ${state.authorMetricLabel}`;
  holder.innerHTML=ranked.map((x,i)=>`<button class="top-author-chip" data-id="${esc(x.node.id())}"><i style="background:${TOP_AUTHOR_COLORS[i]}"></i><span>#${i+1}</span><b>${esc(x.node.data('label'))}</b><em>${x.value}</em></button>`).join('');
  holder.querySelectorAll('.top-author-chip').forEach(btn=>btn.addEventListener('click',()=>{
    const node=state.cy.getElementById(btn.dataset.id);if(!node?.length)return;
    state.cy.animate({center:{eles:node},zoom:Math.max(state.cy.zoom(),1.35)},{duration:350});
    inspectAuthor(node);
  }));
}

function improveEdgeRendering(){
  if(!state?.cy)return;
  const maxWeight=Math.max(1,...state.cy.edges().map(e=>Number(e.data('weight')||1)));
  state.cy.style()
    .selector('edge').style({'curve-style':'bezier','line-color':'#64748b','opacity':0.30,'width':`mapData(weight,1,${maxWeight},0.65,5.2)`,'z-index':1})
    .selector('node').style({'z-index':10})
    .selector('.selected-neighborhood').style({'opacity':0.98})
    .selector('edge.selected-neighborhood').style({'line-color':'#e2e8f0','opacity':0.82,'width':`mapData(weight,1,${maxWeight},1.4,7)`,'z-index':8})
    .selector('.selected-node').style({'background-color':'#f8fafc','border-color':'#fbbf24','border-width':4,'z-index':20})
    .update();
}

function applyTopAuthorHighlighting(){
  if(!state?.cy)return;
  const on=document.getElementById('highlight-top25')?.checked!==false;
  const ranked=rankTopAuthors();
  state.cy.batch(()=>{
    state.cy.nodes().removeClass('top-author');
    state.cy.nodes().forEach(n=>{
      if(top25Ids.has(n.id())){
        n.addClass('top-author');
        if(on){
          n.style({'background-color':n.data('topColor'),'border-color':'rgba(255,255,255,.85)','border-width':2.2});
          if(n.visible())n.style('label',`#${n.data('topRank')} ${n.data('label')}`);
        }else n.style({'background-color':'#7dd3fc','border-color':'#08101f','border-width':1});
      }else n.style({'background-color':'#7dd3fc','border-color':'#08101f','border-width':1});
    });
  });
  renderTopAuthors(ranked);
}

function installNetworkEnhancements(){
  injectNetworkEnhancementStyles();
  enhanceNetworkUI();
  if(typeof loadNetwork==='function'){
    const originalLoad=loadNetwork;
    loadNetwork=async function(){await originalLoad();improveEdgeRendering();applyTopAuthorHighlighting();};
  }
  if(typeof applyNetworkFilters==='function'){
    const originalFilter=applyNetworkFilters;
    applyNetworkFilters=function(){originalFilter();applyTopAuthorHighlighting();};
  }
  const timer=setInterval(()=>{if(state?.cy){clearInterval(timer);improveEdgeRendering();applyTopAuthorHighlighting();}},250);
}

installNetworkEnhancements();
