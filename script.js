const F_BODY      = 'var(--font-body)';
const F_CONDENSED = 'var(--font-condensed)';
const F_HEADLINE  = 'var(--font-headline)';

// ── SHARED DATA ───────────────────────────────────────────────────────────
const rawData = {
  haaland:  [2,2,3,6,9,10,11,14,15,15,17,18,18,20,21,21,21,22,25,25,25,26,26,27,27,28,30,32,33,34,35,35,36,36,36,38,38,39,42,43,44,44,44,45,47,47,49,50],
  cole:     [0,0,1,1,2,3,5,5,7,8,8,9,10,12,15,16,16,16,17,18,19,19,21,22,22,23,26,27,27,28,29,30,31,31,31,32,32,33,33,34,35,36,38,38,40,40,40,41,41,41,42,43,43,43,43,43,43,43,43,43,44,45,45,45,50],
  shearer:  [2,3,3,3,4,6,6,8,9,10,12,12,12,12,12,12,13,13,14,14,16,16,16,16,17,17,17,18,20,20,23,24,24,26,28,28,29,31,32,32,34,35,37,39,40,41,41,41,41,41,41,41,43,43,45,45,46,46,47,47,47,47,47,47,47,49,51],
  salah:    [0,0,1,1,2,2,2,2,2,2,2,2,2,3,3,4,4,5,6,6,6,7,7,9,11,12,14,14,15,15,16,17,17,19,20,20,21,23,24,25,26,26,26,30,31,32,33,33,33,33,35,36,36,36,37,37,37,38,38,39,39,40,41,41,44,44,45,46,47,47,48,50],
  kane:     [0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,4,4,5,5,5,5,5,6,7,8,8,10,11,11,13,15,16,17,17,19,19,22,22,22,23,23,23,23,23,24,24,24,24,24,24,24,25,25,25,28,29,30,32,32,32,32,33,35,35,35,35,36,37,39,39,40,40,40,43,45,46,46,48,48,49,49,49,49,49,49,50],
};

function clipAt50(arr) {
  const pts = [[0, 0]];
  for (let i = 0; i < arr.length; i++) {
    pts.push([i + 1, arr[i]]);
    if (arr[i] >= 50) break;
  }
  return pts;
}

function goalsPerMatch(cumulative) {
  const sorted = [...cumulative].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const g of sorted) { out.push(g - prev); prev = g; }
  return out;
}

function meanOf(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

const players = {
  cole:    { data: clipAt50(rawData.cole),    color: 'var(--cole)',    label: 'Cole',    matches: 65 },
  shearer: { data: clipAt50(rawData.shearer), color: 'var(--shearer)', label: 'Shearer', matches: 67 },
  salah:   { data: clipAt50(rawData.salah),   color: 'var(--salah)',   label: 'Salah',   matches: 72 },
  haaland: { data: clipAt50(rawData.haaland), color: 'var(--haaland)', label: 'Haaland', matches: 48 },
  kane:    { data: clipAt50(rawData.kane),    color: 'var(--kane)',    label: 'Kane',     matches: 86 },
};


// ── CUMULATIVE GOALS CHART ────────────────────────────────────────────────

const svg  = d3.select('#chart');
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

  g.append('g').attr('class', 'grid-x')
    .selectAll('line').data([25, 50, 75]).join('line').attr('class', 'grid-line')
    .attr('x1', d => x(d)).attr('x2', d => x(d)).attr('y1', 0).attr('y2', iH);
  g.append('g').attr('class', 'grid-y')
    .selectAll('line').data([10, 20, 30, 40, 50]).join('line').attr('class', 'grid-line')
    .attr('x1', 0).attr('x2', iW).attr('y1', d => y(d)).attr('y2', d => y(d));

  const xAxis = g.append('g').attr('transform', `translate(0,${iH})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10));
  xAxis.select('.domain').attr('class', 'axis-line');
  xAxis.selectAll('text').attr('class', 'tick-text');

  const yAxis = g.append('g')
    .call(d3.axisLeft(y).tickValues([10,20,30,40,50]).tickSize(0).tickPadding(10));
  yAxis.select('.domain').attr('class', 'axis-line');
  yAxis.selectAll('text').attr('class', 'tick-text');

  g.append('text').attr('class', 'axis-label')
    .attr('x', iW / 2).attr('y', iH + 42).attr('text-anchor', 'middle')
    .text('Gespielte Partien');
  g.append('text').attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)').attr('x', -iH / 2).attr('y', -38)
    .attr('text-anchor', 'middle').text('Tore (kumuliert)');

  g.append('line')
    .attr('x1', 0).attr('x2', iW).attr('y1', y(50)).attr('y2', y(50))
    .attr('stroke', 'rgba(204,0,0,0.25)').attr('stroke-width', 1).attr('stroke-dasharray', '6 4');
  g.append('text').attr('x', 4).attr('y', y(50) - 6)
    .attr('fill', 'rgba(204,0,0,0.50)').attr('font-family', 'Impact, Arial Narrow, sans-serif')
    .attr('font-size', 10).attr('letter-spacing', '.12em').text('50 TORE');

  ['cole','shearer','salah','kane','haaland'].forEach(key => {
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

const lineGen = pts => d3.line().x(pt => x(pt[0])).y(pt => y(pt[1])).curve(d3.curveStep)(pts);

function showPlayer(key, animate = true) {
  const p      = players[key];
  const last   = p.data[p.data.length - 1];
  const pathEl = document.getElementById(`line-${key}`);
  d3.select(`#line-${key}`).attr('d', lineGen(p.data)).style('opacity', 1);
  if (animate) {
    const len = pathEl.getTotalLength();
    d3.select(`#line-${key}`)
      .attr('stroke-dasharray', `${len} ${len}`).attr('stroke-dashoffset', len)
      .transition().duration(1400).ease(d3.easeCubicInOut).attr('stroke-dashoffset', 0)
      .on('end', () => d3.select(`#line-${key}`).attr('stroke-dasharray', null).attr('stroke-dashoffset', null));
  }
  const lx = x(last[0]) + 8, ly = y(last[1]);
  const delay = animate ? 1300 : 0;
  d3.select(`#dot-${key}`).attr('cx', x(last[0])).attr('cy', y(last[1])).style('opacity', 0)
    .transition().delay(delay).duration(300).style('opacity', 1);
  d3.select(`#lbl-${key}`).attr('x', lx).attr('y', ly - 4).attr('font-size', 13)
    .text(p.label).style('opacity', 0).transition().delay(delay).duration(400).style('opacity', 1);
  d3.select(`#sub-${key}`).attr('x', lx).attr('y', ly + 12).attr('font-size', 10)
    .text(`${p.matches} Spiele`).style('opacity', 0).transition().delay(delay).duration(400).style('opacity', 1);
  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) legEl.style.display = 'flex';
  document.getElementById('legend').classList.add('visible');
}

function hidePlayer(key) {
  ['line','dot','lbl','sub'].forEach(t => d3.select(`#${t}-${key}`).style('opacity', 0));
  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) legEl.style.display = 'none';
}


// ── HISTOGRAM ────────────────────────────────────────────────────────────

const HISTO_MAX_BIN = 5;
const FADE_OPACITY  = 0.12;
const H_COLOR_HAALAND = '#c00';
const H_COLOR_BAR     = '#888780';
const H_COLOR_GRID    = '#eeece8';
const H_COLOR_TEXT    = '#2C2C2A';
const H_COLOR_MUTED   = '#888780';

const ANN_FONT    = F_CONDENSED;
const ANN_COLOR   = '#2C2C2A';
const ANN_STROKE  = '#888780';
const ANN_SIZE    = '10px';
const ANN_LINE_H  = 11;
const ANN_PAD_BELOW_LABEL = 0;
const ANN_PAD_ABOVE_BARS  = 0;

// ── Y-AXIS CONFIGURATION ─────────────────────────────────────────────────

const Y_HERO = { domain: [0, 20], ticks: [0, 5, 10, 15, 20] };   // Haaland
const Y_REST = { domain: [0, 60], ticks: [0, 20, 40, 60] }; // all others


// ── ANNOTATION DEFINITIONS ────────────────────────────────────────────────

const ANNOTATIONS = [
  {
    step: 6, panel: 'haaland', bins: [0], targetBin: 0,
    labelSide: 'right', labelOffsetX: 10, labelOffsetY: 30, bowX: -12,
    label: ['Nur in jedem dritten Spiel', 'blieb Haaland torlos.'],
  },
  {
    step: 7, panel: 'haaland', bins: [0, 1], targetBin: 1,
    labelSide: 'right', labelOffsetX: 10, labelOffsetY: 0, bowX: -12,
    label: ['Tatsächlich traf er sogar', 'häufiger ein Mal', 'das Tor als gar nicht!'],
  },
  {
    step: 8, panel: 'haaland', bins: [3], targetBin: 3,
    labelSide: 'right', labelOffsetX: -17, labelOffsetY: 27, bowX: -10,
    label: ['Haaland hat in 5 seiner 48', 'Spiele drei Tore geschossen,', 'eine Quote von über 10%.'],
  },
  {
    step: 9, panel: 'haaland', bins: [4], targetBin: 4,
    labelSide: 'left', labelOffsetX: 5, labelOffsetY: 55, bowX: 24,
    label: ['... aber in keinem', 'Spiel gelangen ihm', '4 oder mehr Tore.'],
  },
  {
    step: 10, panel: 'cole', bins: [5], targetBin: 5,
    labelSide: 'left', labelOffsetX: -5, labelOffsetY: 50, bowX: 15,
    label: ['Cole war der erste', 'Spieler mit 5 Toren', 'in einem PL Spiel.'],
  },
];


// ── DRAW ANNOTATION ───────────────────────────────────────────────────────

function drawAnnotation(annG, ann, xScale, yScale, binData) {
  annG.selectAll('*').remove();

  const bw = xScale.bandwidth();
  const bx = xScale(ann.targetBin);
  const bd = binData.find(d => d.bin === ann.targetBin) || { count: 0 };

  const Ex = bx + bw / 2;
  const Ey = yScale(bd.count) - 3;

  const lines  = ann.label;
  const blockH = lines.length * ANN_LINE_H;

  const labelX = ann.labelSide === 'right'
    ? bx + bw + ann.labelOffsetX
    : bx - ann.labelOffsetX;

  const labelCentreY = Ey - blockH * 0.5 - ann.labelOffsetY;
  const labelTopY    = labelCentreY - blockH / 2;

  const Sx = ann.labelSide === 'right' ? labelX - 6  : labelX + 6;
  const Sy = labelCentreY - 7;

  const Mx  = (Sx + Ex) / 2;
  const My  = (Sy + Ey) / 2;
  const CPx = Mx + ann.bowX;
  const CPy = My - 10;

  const markerId = `ann-arrow-${ann.step}-${ann.panel}`;
  annG.append('defs').append('marker')
    .attr('id', markerId).attr('viewBox', '0 -4 8 8')
    .attr('refX', 7).attr('refY', 0)
    .attr('markerWidth', 5).attr('markerHeight', 5).attr('orient', 'auto')
    .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', ANN_STROKE);

  annG.append('path')
    .attr('d', `M ${Sx} ${Sy} Q ${CPx} ${CPy} ${Ex} ${Ey}`)
    .attr('fill', 'none').attr('stroke', ANN_STROKE)
    .attr('stroke-width', 1.1).attr('stroke-linecap', 'round')
    .attr('marker-end', `url(#${markerId})`);

  const anchor = ann.labelSide === 'right' ? 'start' : 'end';
  const textEl = annG.append('text')
    .attr('text-anchor', anchor)
    .attr('font-family', ANN_FONT)
    .attr('font-size', ANN_SIZE)
    .attr('font-weight', '600')
    .attr('letter-spacing', '0.02em')
    .attr('fill', ANN_COLOR);

  lines.forEach((line, i) => {
    textEl.append('tspan').attr('x', labelX).attr('y', labelTopY + i * ANN_LINE_H).text(line);
  });

  annG.style('opacity', 0).transition().duration(400).ease(d3.easeCubicOut).style('opacity', 1);
}

function clearAnnotation(annG) {
  annG.transition().duration(200).style('opacity', 0)
    .on('end', () => annG.selectAll('*').remove());
}


// ── MODULE-LEVEL REGISTRY ─────────────────────────────────────────────────
let _panels     = [];
let _panelByKey = {};


// ── HISTOGRAM INIT ────────────────────────────────────────────────────────

function buildCardEl(isHero) {
  const card = document.createElement('div');
  Object.assign(card.style, {
    background: '#ffffff', border: '1px solid #e8e6e0',
    borderTop: '3px solid #c00', borderRadius: '4px',
    padding: isHero ? '16px 20px 12px' : '14px 12px 10px',
    boxSizing: 'border-box',
  });
  return card;
}

function initHistogram() {
  const histoWrap = document.getElementById('histogram-wrap');
  if (!histoWrap) return;

  histoWrap.innerHTML = '';
  _panels = [];
  _panelByKey = {};

  const allPlayers = Object.entries(rawData).map(([key, cum]) => {
    const gpm    = goalsPerMatch(cum);
    const total  = gpm.length;
    const counts = Array(HISTO_MAX_BIN + 1).fill(0);
    gpm.forEach(v => { counts[Math.min(v, HISTO_MAX_BIN)]++; });
    const binData = counts.map((count, bin) => ({ bin, count, pct: count / total * 100 }));
    return { key, name: players[key].label, total, binData, mean: meanOf(gpm) };
  }).sort((a, b) => b.mean - a.mean);

  const haalandData = allPlayers.find(p => p.key === 'haaland');
  const restData    = allPlayers.filter(p => p.key !== 'haaland');
  const xBinLabels  = [...d3.range(HISTO_MAX_BIN).map(String), `${HISTO_MAX_BIN}+`];

  histoWrap.style.cssText += 'display:block;';

  const HERO_BASE = { IW: 500, IH: 220, MB: 38, ML: 32, MR: 12 };
  const SMAL_BASE = { IW: 110, IH: 100, MB: 28, ML: 28, MR:  8 };

  function maxAnnotationLines(key) {
    const anns = ANNOTATIONS.filter(a => a.panel === key);
    return anns.length === 0 ? 0 : Math.max(...anns.map(a => a.label.length));
  }

  function computeMT(key) {
    return 16; // kept simple; annotations use overflow:visible
  }

  function makeDim(base, key) {
    return { ...base, MT: computeMT(key) };
  }

  // Fixed y-scales: hero uses Y_HERO, rest uses Y_REST
  function makeScales(dim, isHero) {
    const yCfg = isHero ? Y_HERO : Y_REST;
    return {
      x: d3.scaleBand().domain(d3.range(HISTO_MAX_BIN + 1)).range([0, dim.IW]).padding(0.2),
      y: d3.scaleLinear().domain(yCfg.domain).range([dim.IH, 0]),
      yTicks: yCfg.ticks,
    };
  }

  // Tooltip
  let tooltipEl = document.getElementById('histo-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'histo-tooltip';
    Object.assign(tooltipEl.style, {
      display: 'none', position: 'fixed',
      background: '#ffffff', border: '1px solid #e8e6e0',
      borderTop: '2px solid #c00', borderRadius: '4px',
      padding: '10px 14px', fontSize: '12px',
      fontFamily: 'inherit',           // inherits body font from page
      fontVariantNumeric: 'tabular-nums',
      pointerEvents: 'none', zIndex: '999',
      minWidth: '160px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    });
    document.body.appendChild(tooltipEl);
  }

  function buildPanel(p, baseDim, isHero) {
    const dim = makeDim(baseDim, p.key);
    const { x: xScale, y: yScale, yTicks } = makeScales(dim, isHero);
    const SVG_W = dim.IW + dim.ML + dim.MR;
    const SVG_H = dim.IH + dim.MT + dim.MB;

    const card = buildCardEl(isHero);

    // Header — uses CSS font variables via inline style
    const header = document.createElement('div');
    header.style.marginBottom = '10px';

    const nameEl = document.createElement('div');
    Object.assign(nameEl.style, {
      fontSize:      isHero ? '17px' : '15px',
      fontWeight:    '600',
      fontFamily:    'var(--font-condensed)',
      color:         H_COLOR_TEXT,
      lineHeight:    '1.2',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    });
    nameEl.textContent = p.name;

    const avgEl = document.createElement('div');
    Object.assign(avgEl.style, {
      fontSize:           '11px',
      fontFamily:         'var(--font-condensed)',
      color:              H_COLOR_MUTED,
      marginTop:          '2px',
      fontVariantNumeric: 'tabular-nums',
      textTransform:      'uppercase',
      letterSpacing:      '0.04em',
    });
    avgEl.textContent = `ø ${p.mean.toFixed(2)} tore / spiel`;

    header.appendChild(nameEl);
    header.appendChild(avgEl);
    card.appendChild(header);

    const svgEl = d3.select(card).append('svg')
      .attr('viewBox', `0 0 ${SVG_W} ${SVG_H}`)
      .attr('width', '100%')
      .style('display', 'block')
      .style('overflow', 'visible');

    const pg = svgEl.append('g').attr('transform', `translate(${dim.ML},${dim.MT})`);

    // y-grid — only at tick positions
    pg.append('g').selectAll('line.grid').data(yTicks).join('line')
      .attr('x1', 0).attr('x2', dim.IW)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', H_COLOR_GRID).attr('stroke-width', 1);

    // y-axis — fixed ticks, article font
    const yAx = pg.append('g')
      .call(d3.axisLeft(yScale).tickValues(yTicks).tickSize(0).tickPadding(4));
    yAx.select('.domain').remove();
    yAx.selectAll('text')
      .style('font-family', 'var(--font-condensed)')
      .style('font-size', '9px')
      .attr('fill', H_COLOR_MUTED)
      .attr('x', -4);

    // x-axis — article font
    const xAx = pg.append('g').attr('transform', `translate(0,${dim.IH})`)
      .call(d3.axisBottom(xScale).tickSize(0).tickPadding(5).tickFormat(d => xBinLabels[d]));
    xAx.select('.domain').attr('stroke', '#d8d6d0');
    xAx.selectAll('text')
      .style('font-family', 'var(--font-condensed)')
      .style('font-size', '9px')
      .attr('fill', H_COLOR_MUTED);

    if (isHero) {
      pg.append('text')
        .attr('x', dim.IW / 2).attr('y', dim.IH + 30)
        .attr('text-anchor', 'middle')
        .attr('class', 'axis-label')   // picks up article CSS
        .text('Tore in einem Spiel');
    }

    const baseColor = p.key === 'haaland' ? H_COLOR_HAALAND : H_COLOR_BAR;
    const bars = pg.append('g').selectAll('rect').data(p.binData).join('rect')
      .attr('x', d => xScale(d.bin)).attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth()).attr('height', d => dim.IH - yScale(d.count))
      .attr('fill', baseColor).attr('opacity', 1).attr('rx', 1.5);

    const annG = pg.append('g').attr('class', 'annotation-layer').style('opacity', 0);

    const panel = { key: p.key, name: p.name, bars, annG, binData: p.binData,
                    total: p.total, xScale, yScale, IH: dim.IH, baseColor, card };
    _panels.push(panel);
    _panelByKey[p.key] = panel;
    return panel;
  }

  // Row 1: Haaland hero
  const heroRow = document.createElement('div');
  heroRow.style.cssText = 'margin-bottom:12px;';
  heroRow.appendChild(buildPanel(haalandData, HERO_BASE, true).card);
  histoWrap.appendChild(heroRow);

  // Row 2: rest
  const restRow = document.createElement('div');
  restRow.style.cssText = 'display:flex;gap:12px;';
  restData.forEach(p => {
    const panel = buildPanel(p, SMAL_BASE, false);
    panel.card.style.flex = '1 1 0';
    restRow.appendChild(panel.card);
  });
  histoWrap.appendChild(restRow);

  // Hover interaction
  _panels.forEach(panel => {
    panel.bars
      .on('mousemove', function(event, d) {
        const bin = d.bin;
        _panels.forEach(pp => {
          const bc = pp.baseColor;
          pp.bars
            .attr('fill', barD => barD.bin === bin ? bc : d3.interpolateRgb(bc, '#ffffff')(0.75))
            .attr('opacity', 1);
        });
        const binLabel = bin === HISTO_MAX_BIN
          ? `${HISTO_MAX_BIN}+ Tore in einem Spiel`
          : `${bin} Tor${bin !== 1 ? 'e' : ''} in einem Spiel`;
        const rows = [..._panels]
          .sort((a, b) => {
            const ca = a.binData.find(bd => bd.bin === bin)?.count || 0;
            const cb = b.binData.find(bd => bd.bin === bin)?.count || 0;
            return cb - ca;
          })
          .map(pp => {
            const match  = pp.binData.find(b => b.bin === bin);
            const cnt    = match ? match.count : 0;
            const pct    = pp.total > 0 ? (cnt / pp.total * 100) : 0;
            const active = pp.key === panel.key;
            return `<tr style="${active ? 'font-weight:600;' : 'opacity:0.4;'}">
              <td style="padding:2px 6px 2px 0;white-space:nowrap;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${pp.baseColor};vertical-align:middle;margin-right:5px;"></span>
                <span style="color:${H_COLOR_TEXT};vertical-align:middle;">${pp.name}</span>
              </td>
              <td style="padding:2px 0 2px 6px;text-align:right;color:${H_COLOR_TEXT};">${cnt}</td>
              <td style="padding:2px 0 2px 8px;text-align:right;color:${H_COLOR_MUTED};font-size:10px;">${pct.toFixed(0)}%</td>
            </tr>`;
          }).join('');
        tooltipEl.innerHTML = `
          <div style="font-size:10px;font-weight:600;color:${H_COLOR_MUTED};margin-bottom:7px;letter-spacing:.05em;text-transform:uppercase;">${binLabel}</div>
          <table style="border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;">${rows}</table>`;
        tooltipEl.style.display = 'block';
        tooltipEl.style.left    = `${event.clientX + 14}px`;
        tooltipEl.style.top     = `${event.clientY - 10}px`;
      })
      .on('mouseleave', function() {
        _panels.forEach(pp => { pp.bars.attr('fill', pp.baseColor).attr('opacity', 1); });
        tooltipEl.style.display = 'none';
      });
  });
}


// ── ANNOTATION CONTROLLER ─────────────────────────────────────────────────

function setHistogramAnnotation(step) {
  if (_panels.length === 0) return;

  const stepAnns = ANNOTATIONS.filter(a => a.step === step);

  const globalActiveBins = new Set();
  stepAnns.forEach(a => { a.bins.forEach(b => globalActiveBins.add(b)); });

  _panels.forEach(pp => {
    const bc  = pp.baseColor;
    const dim = d3.interpolateRgb(bc, '#ffffff')(0.75);
    const myAnn = stepAnns.find(a => a.panel === pp.key);

    pp.bars.transition().duration(400)
      .attr('fill', d => {
        if (myAnn) return myAnn.bins.includes(d.bin) ? bc : dim;
        if (globalActiveBins.size > 0) return globalActiveBins.has(d.bin) ? bc : dim;
        return bc;
      })
      .attr('opacity', 1);

    if (myAnn) drawAnnotation(pp.annG, myAnn, pp.xScale, pp.yScale, pp.binData);
    else clearAnnotation(pp.annG);
  });
}


// ── STEP STATE ────────────────────────────────────────────────────────────

let currentStep = -1;
const stateForStep = [
  ['cole'], ['cole','shearer'], ['cole','shearer','salah'],
  ['cole','shearer','salah','kane'],
  ['cole','shearer','salah','kane','haaland'],
  ['cole','shearer','salah','kane','haaland'],
  ['cole','shearer','salah','kane','haaland'],
  ['cole','shearer','salah','kane','haaland'],
  ['cole','shearer','salah','kane','haaland'],
];

function applyStep(step, animate = true) {
  if (step === currentStep) return;
  currentStep = step;
  const lineWrap  = d3.select('#chart-wrap');
  const histoWrap = d3.select('#histogram-wrap');
  if (step <= 4) {
    lineWrap.style('display', 'block').transition().duration(500).style('opacity', 1);
    histoWrap.style('display', 'none').style('opacity', 0);
    const desired = stateForStep[step] || [];
    ['cole','shearer','salah','kane','haaland'].forEach(key => {
      const isVisible = d3.select(`#line-${key}`).style('opacity') !== '0';
      if (desired.includes(key) && !isVisible) showPlayer(key, animate);
      else if (!desired.includes(key) && isVisible) hidePlayer(key);
    });
  } else {
    lineWrap.style('display', 'none').style('opacity', 0);
    histoWrap.style('display', 'block').transition().duration(500).style('opacity', 1);
    setHistogramAnnotation(step);
  }
}


// ── OBSERVER ─────────────────────────────────────────────────────────────

function setupObserver() {
  const steps = document.querySelectorAll('.step');
  const obs   = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) applyStep(+entry.target.dataset.step, true);
    });
  }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
  steps.forEach(s => obs.observe(s));
}


// ── INIT ──────────────────────────────────────────────────────────────────

initChart();
initHistogram();
setupObserver();

window.addEventListener('resize', () => {
  const prev = currentStep;
  currentStep = -1;
  initChart();
  if (prev >= 0) applyStep(prev, false);
});
