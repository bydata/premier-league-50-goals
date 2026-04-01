// ── CUMULATIVE GOALS CHART ────────────────────────────────────────────────

import { players } from "./data.js";

const svg = d3.select("#linechart");
const wrap = document.getElementById("linechart-wrap");
let width, height, margin, innerWidth, innerHeight, xScale, yScale, group;

export function initLineChart() {
  svg.selectAll("*").remove();

  // set up viz dimensions
  width = wrap.clientWidth;
  height = wrap.clientHeight;
  margin = { top: 30, right: 20, bottom: 50, left: 48 };
  innerWidth = width - margin.left - margin.right;
  innerHeight = height - margin.top - margin.bottom;

  // set up scales
  xScale = d3.scaleLinear().domain([0, 90]).range([0, innerWidth]);
  yScale = d3.scaleLinear().domain([0, 54]).range([innerHeight, 0]);

  // set up SVG and main group
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  group = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X Axis with grid lines and tick labels
  const xTicks = [20, 40, 60, 80];
  const xAxis = group
    .append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).tickValues(xTicks).tickSize(0).tickPadding(10));
  xAxis.select(".domain").attr("class", "axis-line");
  xAxis.selectAll("text").attr("class", "tick-text");
  group
    .append("g")
    .attr("class", "grid-x")
    .selectAll("line")
    .data(xTicks)
    .join("line")
    .attr("class", "grid-line")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", 0)
    .attr("y2", innerHeight);

  // Y Axis with grid lines and tick labels
  const yTicks = [10, 20, 30, 40];
  const yAxis = group
    .append("g")
    .call(d3.axisLeft(yScale).tickValues(yTicks).tickSize(0).tickPadding(10));
  yAxis.select(".domain").attr("class", "axis-line");
  yAxis.selectAll("text").attr("class", "tick-text");
  group
    .append("g")
    .attr("class", "grid-y")
    .selectAll("line")
    .data(yTicks)
    .join("line")
    .attr("class", "grid-line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", (d) => yScale(d))
    .attr("y2", (d) => yScale(d));

  // Axis labels
  group
    .append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 42)
    .attr("text-anchor", "middle")
    .text("Gespielte Partien");
  group
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -38)
    .attr("text-anchor", "middle")
    .text("Tore (kumuliert)");

  // 50 goals annotation (line + label)
  group
    .append("line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", yScale(50))
    .attr("y2", yScale(50))
    .attr("stroke", "rgba(204,0,0,0.25)")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "6 4");
  group
    .append("text")
    .attr("x", 4)
    .attr("y", yScale(50) - 6)
    .attr("fill", "rgba(204,0,0,0.50)")
    .attr("font-family", "Impact, Arial Narrow, sans-serif")
    .attr("font-size", 10)
    .attr("letter-spacing", ".12em")
    .text("50 TORE");

  const playersGroup = group.append("g").attr("class", "players-group");

  // prepare line, dot and label elements for each player (initially hidden)
  Object.keys(players).forEach((key) => {
    const individualPlayerGroup = playersGroup
      .append("g")
      .attr("id", `group-${key}`);

    individualPlayerGroup
      .append("path")
      .attr("id", `line-${key}`)
      .attr("class", "goal-line")
      .attr("stroke", players[key].color)
      .attr("d", "M0,0")
      .style("opacity", 0);
    individualPlayerGroup
      .append("circle")
      .attr("id", `dot-${key}`)
      .attr("class", "end-dot")
      .attr("fill", players[key].color)
      .style("opacity", 0);
    individualPlayerGroup
      .append("text")
      .attr("id", `lbl-${key}`)
      .attr("class", "player-label")
      .attr("fill", players[key].color)
      .style("opacity", 0);
    individualPlayerGroup
      .append("text")
      .attr("id", `sub-${key}`)
      .attr("class", "goal-rate-label")
      .attr("fill", "var(--muted)")
      .style("opacity", 0);
    individualPlayerGroup
      .append("line")
      .attr("id", `lbl-line-${key}`)
      .attr("class", "player-label-line")
      .attr("stroke", "var(--muted)")
      .attr("stroke-width", 0.5)
      .style("opacity", 0);
  });
}

const lineGen = (pts) =>
  d3
    .line()
    .x((pt) => xScale(pt[0]))
    .y((pt) => yScale(pt[1]))
    .curve(d3.curveStep)(pts);

// animate player elements appearing one by one, with line drawing animation for the path
// configuration per player (e.g. label position) can be set in the data.js file
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
  const lx = xScale(last[0]) + (p.linechart?.offsetLabel?.x || 0),
    ly = yScale(last[1]) - 24 + (p.linechart?.offsetLabel?.y || 0);
  const delay = animate ? 1300 : 0;
  d3.select(`#dot-${key}`)
    .attr("cx", xScale(last[0]) - 3)
    .attr("cy", yScale(last[1]))
    .style("opacity", 0)
    .transition()
    .delay(delay)
    .duration(300)
    .style("opacity", 1);
  d3.select(`#lbl-${key}`)
    .attr("x", lx)
    .attr("y", ly)
    .attr("font-size", 14)
    .attr("text-anchor", "middle")
    .text(p.label)
    .style("opacity", 0)
    .transition()
    .delay(delay)
    .duration(400)
    .style("opacity", 1);
  d3.select(`#sub-${key}`)
    .attr("x", lx)
    .attr("y", ly + 12)
    .attr("font-size", 12)
    .attr("text-anchor", "middle")
    .text(`${p.matches} ${p.linechart?.pathLabelText || "Spiele"}`)
    .style("opacity", 0)
    .transition()
    .delay(delay)
    .duration(400)
    .style("opacity", 1);
  if (p.linechart?.showLabelLine) {
    d3.select(`#lbl-line-${key}`)
      .attr("x1", xScale(last[0]) - 3)
      .attr("y1", ly + 12 + 4)
      .attr("x2", xScale(last[0]) - 3)
      .attr("y2", yScale(last[1]) - 8)
      .style("opacity", 0)
      .transition()
      .delay(delay)
      .duration(400)
      .style("opacity", 1);
  }
  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) legEl.style.display = "flex";
  document.getElementById("legend").classList.add("visible");
}

export function hidePlayer(key) {
  ["line", "dot", "lbl", "sub", "lbl-line"].forEach((t) =>
    d3.select(`#${t}-${key}`).style("opacity", 0),
  );
  const legEl = document.getElementById(`leg-${key}`);
  if (legEl) legEl.style.display = "none";
}
