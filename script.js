
const rawData = {
  haaland: [2,2,3,6,9,10,11,14,15,15,17,18,18,20,21,21,21,22,25,25,25,26,26,27,27,28,30,32,33,34,35,35,36,36,36,38,38,39,42,43,44,44,44,45,47,47,49,50],
  cole:     [0,0,1,1,2,3,5,5,7,8,8,9,10,12,15,16,16,16,17,18,19,19,21,22,22,23,26,27,27,28,29,30,31,31,31,32,32,33,33,34,35,36,38,38,40,40,40,41,41,41,42,43,43,43,43,43,43,43,43,43,44,45,45,45,50],
  shearer:  [2,3,3,3,4,6,6,8,9,10,12,12,12,12,12,12,13,13,14,14,16,16,16,16,17,17,17,18,20,20,23,24,24,26,28,28,29,31,32,32,34,35,37,39,40,41,41,41,41,41,41,41,43,43,45,45,46,46,47,47,47,47,47,47,47,49,51],
  salah:    [0,0,1,1,2,2,2,2,2,2,2,2,2,3,3,4,4,5,6,6,6,7,7,9,11,12,14,14,15,15,16,17,17,19,20,20,21,23,24,25,26,26,26,30,31,32,33,33,33,33,35,36,36,36,37,37,37,38,38,39,39,40,41,41,44,44,45,46,47,47,48,50],
  kane:     [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,4,4,5,5,5,5,5,6,7,8,8,10,11,11,13,15,16,17,17,19,19,22,22,22,23,23,23,23,23,24,24,24,24,24,24,24,25,25,25,28,29,30,32,32,32,32,33,35,35,35,35,36,37,39,39,40,40,40,43,45,46,46,48,48,49,49,49,49,49,49,50],
};

// Clip each series at the first match where they reach 50, include [0,0] start
function clipAt50(arr) {
  const pts = [[0, 0]];
  for (let i = 0; i < arr.length; i++) {
    pts.push([i + 1, arr[i]]);
    if (arr[i] >= 50) break;
  }
  return pts;
}

const players = {
  cole:    { data: clipAt50(rawData.cole),    color: 'var(--cole)',    label: 'Cole',     matches: 65  },
  shearer: { data: clipAt50(rawData.shearer), color: 'var(--shearer)', label: 'Shearer',  matches: 67  },
  salah:   { data: clipAt50(rawData.salah),   color: 'var(--salah)',   label: 'Salah', matches: 72  },
  haaland: { data: clipAt50(rawData.haaland), color: 'var(--haaland)', label: 'Haaland',    matches: 48  },
  kane:    { data: clipAt50(rawData.kane),    color: 'var(--kane)',    label: 'Kane',    matches: 86  },
};

// ── CHART SETUP ────────────────────────────────────────────────────────────
const svg = d3.select('#chart');
const wrap = document.getElementById('chart-wrap');

let W, H, margin, iW, iH, x, y, g;

function initChart() {
  svg.selectAll('*').remove();

  W = wrap.clientWidth;
  H = wrap.clientHeight;
  margin = { top: 30, right: 80, bottom: 50, left: 48 };
  iW = W - margin.left - margin.right;
  iH = H - margin.top - margin.bottom;

  svg.attr('viewBox', `0 0 ${W} ${H}`);

  x = d3.scaleLinear().domain([0, 90]).range([0, iW]);
  y = d3.scaleLinear().domain([0, 54]).range([iH, 0]);

  g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // grid
  g.append('g').attr('class', 'grid-x')
    .selectAll('line')
    .data([25, 50, 75])
    .join('line').attr('class', 'grid-line')
    .attr('x1', d => x(d)).attr('x2', d => x(d))
    .attr('y1', 0).attr('y2', iH);

  g.append('g').attr('class', 'grid-y')
    .selectAll('line')
    .data([10, 20, 30, 40, 50])
    .join('line').attr('class', 'grid-line')
    .attr('x1', 0).attr('x2', iW)
    .attr('y1', d => y(d)).attr('y2', d => y(d));

  // axes
  const xAxis = g.append('g')
    .attr('transform', `translate(0,${iH})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10));
  xAxis.select('.domain').attr('class', 'axis-line');
  xAxis.selectAll('text').attr('class', 'tick-text');

  const yAxis = g.append('g')
    .call(d3.axisLeft(y).tickValues([10,20,30,40,50]).tickSize(0).tickPadding(10));
  yAxis.select('.domain').attr('class', 'axis-line');
  yAxis.selectAll('text').attr('class', 'tick-text');

  // axis labels
  g.append('text').attr('class', 'axis-label')
    .attr('x', iW / 2).attr('y', iH + 42)
    .attr('text-anchor', 'middle').text('Gespielte Partien');

  g.append('text').attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -iH / 2).attr('y', -38)
    .attr('text-anchor', 'middle').text('Tore (kumuliert)');

  // 50-goal threshold line
  g.append('line')
    .attr('x1', 0).attr('x2', iW)
    .attr('y1', y(50)).attr('y2', y(50))
    .attr('stroke', 'rgba(204,0,0,0.25)')  
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '6 4');

  g.append('text')
    .attr('x', 4).attr('y', y(50) - 6)
    .attr('fill', 'rgba(204,0,0,0.50)')  
    .attr('font-family', 'Impact, Arial Narrow, sans-serif')
    .attr('font-size', 10).attr('letter-spacing', '.12em')
    .text('50 TORE');

  // line + label elements per player
  const order = ['cole', 'shearer', 'salah', 'haaland', 'kane'];
  order.forEach(key => {
    g.append('path').attr('id', `line-${key}`).attr('class', 'goal-line')
      .attr('stroke', players[key].color).attr('d', 'M0,0').style('opacity', 0);
    g.append('circle').attr('id', `dot-${key}`).attr('class', 'end-dot')
      .attr('fill', players[key].color).style('opacity', 0);
    g.append('text').attr('id', `lbl-${key}`).attr('class', 'player-label')
      .attr('fill', players[key].color).style('opacity', 0);
    g.append('text').attr('id', `sub-${key}`).attr('class', 'goal-rate-label')
      .attr('fill', 'var(--muted)').style('opacity', 0);
  });
}

const lineGen = pts => d3.line()
  .x(pt => x(pt[0])).y(pt => y(pt[1]))
  .curve(d3.curveStep)(pts);

function showPlayer(key, animate = true) {
  const p = players[key];
  const last = p.data[p.data.length - 1];
  const pathEl = document.getElementById(`line-${key}`);

  d3.select(`#line-${key}`).attr('d', lineGen(p.data)).style('opacity', 1);

  if (animate) {
    const len = pathEl.getTotalLength();
    d3.select(`#line-${key}`)
      .attr('stroke-dasharray', `${len} ${len}`)
      .attr('stroke-dashoffset', len)
      .transition().duration(1400).ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', 0)
      .on('end', () => d3.select(`#line-${key}`).attr('stroke-dasharray', null).attr('stroke-dashoffset', null));
  }

  const lx = x(last[0]) + 8;
  const ly = y(last[1]);
  const delay = animate ? 1300 : 0;

  d3.select(`#dot-${key}`)
    .attr('cx', x(last[0])).attr('cy', y(last[1]))
    .style('opacity', 0)
    .transition().delay(delay).duration(300).style('opacity', 1);

  d3.select(`#lbl-${key}`)
    .attr('x', lx).attr('y', ly - 4).attr('font-size', 13)
    .text(p.label).style('opacity', 0)
    .transition().delay(delay).duration(400).style('opacity', 1);

  d3.select(`#sub-${key}`)
    .attr('x', lx).attr('y', ly + 12).attr('font-size', 10)
    .text(`${p.matches} Spiele`).style('opacity', 0)
    .transition().delay(delay).duration(400).style('opacity', 1);

  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) { legEl.style.display = 'flex'; }
  document.getElementById('legend').classList.add('visible');
}

function hidePlayer(key) {
  ['line','dot','lbl','sub'].forEach(t => d3.select(`#${t}-${key}`).style('opacity', 0));
  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) legEl.style.display = 'none';
}

// ── STEP STATE ────────────────────────────────────────────────────────────
let currentStep = -1;

const stateForStep = [
  ['cole'],                                  // 0
  ['cole', 'shearer'],                       // 1
  ['cole', 'shearer', 'salah'],            // 2
  ['cole', 'shearer', 'salah', 'kane'],   // 3
  ['cole', 'shearer', 'salah', 'kane', 'haaland'], // 4
  ['cole', 'shearer', 'salah', 'kane', 'haaland'], // 5
];

function applyStep(step, animate = true) {
  if (step === currentStep) return;
  currentStep = step;
  const desired = stateForStep[step] || [];
  const all = ['cole', 'shearer', 'salah', 'kane', 'haaland'];
  all.forEach(key => {
    const shouldShow = desired.includes(key);
    const isVisible = d3.select(`#line-${key}`).style('opacity') !== '0';
    if (shouldShow && !isVisible) showPlayer(key, animate);
    else if (!shouldShow && isVisible) hidePlayer(key);
  });
}

// ── OBSERVER ─────────────────────────────────────────────────────────────
function setupObserver() {
  const steps = document.querySelectorAll('.step');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) applyStep(+entry.target.dataset.step, true);
    });
  }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
  steps.forEach(s => obs.observe(s));
}

// ── INIT ──────────────────────────────────────────────────────────────────
initChart();
setupObserver();

window.addEventListener('resize', () => {
  const prev = currentStep;
  currentStep = -1;
  initChart();
  if (prev >= 0) applyStep(prev, false);
});