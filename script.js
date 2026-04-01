import { initLineChart, showPlayer, hidePlayer } from "./js/lineChart.js";
import { initHistogram, setHistogramAnnotation } from "./js/histogram.js";

// ── STEP STATE ────────────────────────────────────────────────────────────

let currentStep = -1;
const stateForStep = [
  ["cole"], // 0
  ["cole", "shearer"], // 1
  ["cole", "shearer", "salah"], // 2
  ["cole", "shearer", "salah", "kane"], // 3
  ["cole", "shearer", "salah", "kane", "haaland"], // 4
  ["cole", "shearer", "salah", "kane", "haaland"], // 5
];

function applyStep(step, animate = true) {
  if (step === currentStep) return;
  currentStep = step;
  const lineWrap = d3.select("#linechart-wrap");
  const histoWrap = d3.select("#histogram-wrap");
  if (step <= 5) {
    lineWrap
      .style("display", "block")
      .transition()
      .duration(500)
      .style("opacity", 1);
    histoWrap.style("display", "none").style("opacity", 0);
    const desired = stateForStep[step] || [];
    ["cole", "shearer", "salah", "kane", "haaland"].forEach((key) => {
      const isVisible = d3.select(`#line-${key}`).style("opacity") !== "0";
      if (desired.includes(key) && !isVisible) showPlayer(key, animate);
      else if (!desired.includes(key) && isVisible) hidePlayer(key);
    });
  } else {
    lineWrap.style("display", "none").style("opacity", 0);
    histoWrap
      .style("display", "block")
      .transition()
      .duration(500)
      .style("opacity", 1);
    setHistogramAnnotation(step);
  }
}

// ── OBSERVER ─────────────────────────────────────────────────────────────

function setupObserver() {
  const steps = document.querySelectorAll(".step");
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) applyStep(+entry.target.dataset.step, true);
      });
    },
    { rootMargin: "-35% 0px -35% 0px", threshold: 0 },
  );
  steps.forEach((s) => obs.observe(s));
}

// ── MAIN ──────────────────────────────────────────────────────────────────

initLineChart();
initHistogram();
setupObserver();

window.addEventListener("resize", () => {
  const prev = currentStep;
  currentStep = -1;
  initLineChart();
  if (prev >= 0) applyStep(prev, false);
});
