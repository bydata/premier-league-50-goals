// ── CUMULATIVE GOALS CHART ────────────────────────────────────────────────

import { players } from "./data.js";

const svg = d3.select("#linechart");
const wrap = document.getElementById("linechart-wrap");
let W, H, margin, iW, iH, x, y, g;

export function initLineChart() {
  svg.selectAll("*").remove();
  W = wrap.clientWidth;
  H = wrap.clientHeight;
  margin = { top: 30, right: 80, bottom: 50, left: 48 };
  iW = W - margin.left - margin.right;
  iH = H - margin.top - margin.bottom;
  svg.attr("viewBox", `0 0 ${W} ${H}`);
  x = d3.scaleLinear().domain([0, 90]).range([0, iW]);
  y = d3.scaleLinear().domain([0, 54]).range([iH, 0]);
  g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  g.append("g")
    .attr("class", "grid-x")
    .selectAll("line")
    .data([25, 50, 75])
    .join("line")
    .attr("class", "grid-line")
    .attr("x1", (d) => x(d))
    .attr("x2", (d) => x(d))
    .attr("y1", 0)
    .attr("y2", iH);
  g.append("g")
    .attr("class", "grid-y")
    .selectAll("line")
    .data([10, 20, 30, 40, 50])
    .join("line")
    .attr("class", "grid-line")
    .attr("x1", 0)
    .attr("x2", iW)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d));

  const xAxis = g
    .append("g")
    .attr("transform", `translate(0,${iH})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10));
  xAxis.select(".domain").attr("class", "axis-line");
  xAxis.selectAll("text").attr("class", "tick-text");

  const yAxis = g
    .append("g")
    .call(
      d3
        .axisLeft(y)
        .tickValues([10, 20, 30, 40, 50])
        .tickSize(0)
        .tickPadding(10),
    );
  yAxis.select(".domain").attr("class", "axis-line");
  yAxis.selectAll("text").attr("class", "tick-text");

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", iW / 2)
    .attr("y", iH + 42)
    .attr("text-anchor", "middle")
    .text("Gespielte Partien");
  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -iH / 2)
    .attr("y", -38)
    .attr("text-anchor", "middle")
    .text("Tore (kumuliert)");

  g.append("line")
    .attr("x1", 0)
    .attr("x2", iW)
    .attr("y1", y(50))
    .attr("y2", y(50))
    .attr("stroke", "rgba(204,0,0,0.25)")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "6 4");
  g.append("text")
    .attr("x", 4)
    .attr("y", y(50) - 6)
    .attr("fill", "rgba(204,0,0,0.50)")
    .attr("font-family", "Impact, Arial Narrow, sans-serif")
    .attr("font-size", 10)
    .attr("letter-spacing", ".12em")
    .text("50 TORE");

  ["cole", "shearer", "salah", "kane", "haaland"].forEach((key) => {
    g.append("path")
      .attr("id", `line-${key}`)
      .attr("class", "goal-line")
      .attr("stroke", players[key].color)
      .attr("d", "M0,0")
      .style("opacity", 0);
    g.append("circle")
      .attr("id", `dot-${key}`)
      .attr("class", "end-dot")
      .attr("fill", players[key].color)
      .style("opacity", 0);
    g.append("text")
      .attr("id", `lbl-${key}`)
      .attr("class", "player-label")
      .attr("fill", players[key].color)
      .style("opacity", 0);
    g.append("text")
      .attr("id", `sub-${key}`)
      .attr("class", "goal-rate-label")
      .attr("fill", "var(--muted)")
      .style("opacity", 0);
  });
}

const lineGen = (pts) =>
  d3
    .line()
    .x((pt) => x(pt[0]))
    .y((pt) => y(pt[1]))
    .curve(d3.curveStep)(pts);

export function showPlayer(key, animate = true) {
  const p = players[key];
  const last = p.data[p.data.length - 1];
  const pathEl = document.getElementById(`line-${key}`);

  d3.select(`#line-${key}`).attr("d", lineGen(p.data)).style("opacity", 1);

  if (animate) {
    const len = pathEl.getTotalLength();
    d3.select(`#line-${key}`)
      .attr("stroke-dasharray", `${len} ${len}`)
      .attr("stroke-dashoffset", len)
      .transition()
      .duration(1400)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0)
      .on("end", () =>
        d3
          .select(`#line-${key}`)
          .attr("stroke-dasharray", null)
          .attr("stroke-dashoffset", null),
      );
  }
  const lx = x(last[0]) + 8,
    ly = y(last[1]);
  const delay = animate ? 1300 : 0;
  d3.select(`#dot-${key}`)
    .attr("cx", x(last[0]))
    .attr("cy", y(last[1]))
    .style("opacity", 0)
    .transition()
    .delay(delay)
    .duration(300)
    .style("opacity", 1);
  d3.select(`#lbl-${key}`)
    .attr("x", lx)
    .attr("y", ly - 4)
    .attr("font-size", 13)
    .text(p.label)
    .style("opacity", 0)
    .transition()
    .delay(delay)
    .duration(400)
    .style("opacity", 1);
  d3.select(`#sub-${key}`)
    .attr("x", lx)
    .attr("y", ly + 12)
    .attr("font-size", 10)
    .text(`${p.matches} Spiele`)
    .style("opacity", 0)
    .transition()
    .delay(delay)
    .duration(400)
    .style("opacity", 1);
  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) legEl.style.display = "flex";
  document.getElementById("legend").classList.add("visible");
}

export function hidePlayer(key) {
  ["line", "dot", "lbl", "sub"].forEach((t) =>
    d3.select(`#${t}-${key}`).style("opacity", 0),
  );
  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) legEl.style.display = "none";
}
