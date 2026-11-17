(function () {
  const STORAGE_KEY = "datashield_answers_v1";

  let chartCategorias = null;
  let chartRadar = null;

  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function initNav() {
    const toggle = $(".nav-toggle");
    const nav = $(".site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function renderQuestionnaire() {
    const container = $("#perguntas-container");
    if (!container) return;

    QUESTIONS.forEach((q, index) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "question-block";
      fieldset.innerHTML = `<legend>${index + 1}. ${q.text}</legend>`;

      q.options.forEach((opt, oi) => {
        const id = `${q.id}_${oi}`;
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="${q.id}" id="${id}" value="${opt.score}" required /> ${opt.label}`;
        fieldset.appendChild(label);
      });

      container.appendChild(fieldset);
    });
  }

  function loadAnswers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.entries(data).forEach(([name, score]) => {
        const input = document.querySelector(`input[name="${name}"][value="${score}"]`);
        if (input) input.checked = true;
      });
      computeAndShowPanel();
    } catch {
      /* ignore */
    }
  }

  function saveAnswers(answers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }

  function collectAnswers() {
    /** @type {Record<string, number>} */
    const answers = {};
    let complete = true;

    for (const q of QUESTIONS) {
      const selected = document.querySelector(`input[name="${q.id}"]:checked`);
      if (!selected) {
        complete = false;
        break;
      }
      answers[q.id] = Number(selected.value);
    }

    return complete ? answers : null;
  }

  function scoreFromAnswers(answers) {
    const byCategory = {};
    let total = 0;

    QUESTIONS.forEach((q) => {
      const s = answers[q.id] ?? 0;
      total += s;
      byCategory[q.category] = (byCategory[q.category] || 0) + s;
    });

    const max = QUESTIONS.length * 6;
    const ratio = total / max;

    let level;
    if (ratio <= 0.33) level = "baixo";
    else if (ratio <= 0.66) level = "medio";
    else level = "alto";

    const labels = { baixo: "Baixo", medio: "Médio", alto: "Alto" };

    return { total, max, byCategory, level, label: labels[level] };
  }

  function buildPersonalRecommendations(answers, byCategory) {
    const list = [];
    const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

    sorted.slice(0, 3).forEach(([cat, score]) => {
      if (score > 0 && RECOMMENDATIONS_BY_CATEGORY[cat]) {
        list.push(RECOMMENDATIONS_BY_CATEGORY[cat]);
      }
    });

    const { level } = scoreFromAnswers(answers);
    RECOMMENDATIONS_BY_LEVEL[level].forEach((r) => {
      if (!list.includes(r)) list.push(r);
    });

    return list.slice(0, 7);
  }

  function destroyCharts() {
    if (chartCategorias) {
      chartCategorias.destroy();
      chartCategorias = null;
    }
    if (chartRadar) {
      chartRadar.destroy();
      chartRadar = null;
    }
  }

  function renderCharts(byCategory) {
    destroyCharts();

    const labels = Object.keys(byCategory);
    const values = Object.values(byCategory);
    const blue = "#1e4d8c";
    const green = "#2d9f6f";

    const ctxBar = $("#chart-categorias");
    const ctxRadar = $("#chart-radar");

    if (typeof Chart === "undefined" || !ctxBar || !ctxRadar) return;

    chartCategorias = new Chart(ctxBar, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Pontos de risco",
            data: values,
            backgroundColor: green,
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });

    chartRadar = new Chart(ctxRadar, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "Perfil",
            data: values,
            borderColor: blue,
            backgroundColor: "rgba(30, 77, 140, 0.15)",
            pointBackgroundColor: green,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          r: {
            beginAtZero: true,
            ticks: { stepSize: 2 },
          },
        },
      },
    });
  }

  function computeAndShowPanel() {
    const answers = collectAnswers();
    const empty = $("#painel-vazio");
    const content = $("#painel-conteudo");

    if (!answers) {
      if (empty) {
        empty.hidden = false;
        empty.classList.remove("hidden");
      }
      if (content) {
        content.hidden = true;
        content.classList.add("hidden");
      }
      return;
    }

    const scored = scoreFromAnswers(answers);
    const recs = buildPersonalRecommendations(answers, scored.byCategory);

    if (empty) {
      empty.hidden = true;
      empty.classList.add("hidden");
    }
    if (content) {
      content.hidden = false;
      content.classList.remove("hidden");
    }

    const nivelEl = $("#nivel-risco");
    const metaEl = $("#pontuacao-total");
    if (nivelEl) {
      nivelEl.textContent = scored.label;
      nivelEl.className = `score-value risco-${scored.level}`;
    }
    if (metaEl) {
      metaEl.textContent = `Pontuação: ${scored.total} de ${scored.max} (quanto menor, melhor)`;
    }

    const recEl = $("#recomendacoes-painel");
    if (recEl) {
      recEl.innerHTML = `<h3>Recomendações personalizadas</h3><ul>${recs.map((r) => `<li>${r}</li>`).join("")}</ul>`;
    }

    renderCharts(scored.byCategory);
    return { answers, scored, recs };
  }

  function onQuestionnaireSubmit(e) {
    e.preventDefault();
    const answers = collectAnswers();
    if (!answers) {
      alert("Responda todas as perguntas antes de calcular o risco.");
      return;
    }
    saveAnswers(answers);
    computeAndShowPanel();
    $("#painel")?.scrollIntoView({ behavior: "smooth" });
  }

  function onQuestionnaireReset() {
    localStorage.removeItem(STORAGE_KEY);
    destroyCharts();
    const empty = $("#painel-vazio");
    const content = $("#painel-conteudo");
    if (empty) {
      empty.hidden = false;
      empty.classList.remove("hidden");
    }
    if (content) {
      content.hidden = true;
      content.classList.add("hidden");
    }
  }

  function exportPdf() {
    const answers = collectAnswers();
    if (!answers) {
      alert("Complete o questionário para gerar o relatório.");
      return;
    }

    const { scored, recs } = scoreFromAnswers(answers);
    const full = buildPersonalRecommendations(answers, scored.byCategory);

    const jspdf = window.jspdf?.jsPDF;
    if (!jspdf) {
      alert("Biblioteca PDF não carregada. Verifique sua conexão.");
      return;
    }

    const doc = new jspdf();
    const margin = 14;
    let y = 20;

    doc.setFontSize(16);
    doc.text("DataShield — Relatório educativo de risco", margin, y);
    y += 10;
    doc.setFontSize(11);
    doc.text(`Nível: ${scored.label} | Pontuação: ${scored.total}/${scored.max}`, margin, y);
    y += 8;
    doc.text("Respostas anônimas — não inclui senhas reais.", margin, y);
    y += 12;

    doc.setFontSize(12);
    doc.text("Recomendações:", margin, y);
    y += 7;
    doc.setFontSize(10);

    full.forEach((line) => {
      const wrapped = doc.splitTextToSize(`• ${line}`, 180);
      wrapped.forEach((w) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(w, margin, y);
        y += 5;
      });
      y += 2;
    });

    y += 6;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(9);
    doc.text(
      "Fundamentação: LGPD Arts. 6º, 46 a 50. Cartilha completa: seção Cartilha do site.",
      margin,
      y
    );

    doc.save("datashield-relatorio-risco.pdf");
  }

  function renderSimulator() {
    const tabs = $("#sim-cenarios");
    const panel = $("#sim-panel");
    if (!tabs || !panel) return;

    let active = 0;

    function showScenario(index) {
      active = index;
      const scenario = SIMULATOR_SCENARIOS[index];
      tabs.querySelectorAll(".sim-tab").forEach((btn, i) => {
        btn.setAttribute("aria-selected", i === index ? "true" : "false");
      });

      panel.innerHTML = `
        <h3>${scenario.title}</h3>
        <p>${scenario.story}</p>
        <div class="sim-choices" id="sim-choices"></div>
        <div id="sim-feedback" class="sim-feedback" hidden></div>
      `;

      const choicesEl = $("#sim-choices", panel);
      const feedbackEl = $("#sim-feedback", panel);

      scenario.choices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sim-choice";
        btn.textContent = choice.text;
        btn.addEventListener("click", () => {
          feedbackEl.hidden = false;
          feedbackEl.className = `sim-feedback ${choice.correct ? "sim-feedback--ok" : "sim-feedback--bad"}`;
          feedbackEl.textContent = choice.feedback;
        });
        choicesEl.appendChild(btn);
      });
    }

    SIMULATOR_SCENARIOS.forEach((sc, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sim-tab";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.textContent = sc.title;
      btn.addEventListener("click", () => showScenario(i));
      tabs.appendChild(btn);
    });

    showScenario(0);
  }

  function renderQuickTips() {
    const grid = $("#orientacoes-grid");
    if (!grid) return;

    QUICK_TIPS.forEach((tip) => {
      const card = document.createElement("article");
      card.className = "tip-card";
      card.innerHTML = `<h3>${tip.title}</h3><p>${tip.text}</p>`;
      grid.appendChild(card);
    });
  }

  /** Cartilha: único lugar com o conteúdo integral do folder */
  function renderCartilha() {
    const viewer = $("#cartilha-viewer");
    if (!viewer || typeof CARTILHA_CONTENT === "undefined") return;

    const c = CARTILHA_CONTENT;

    const cover = document.createElement("section");
    cover.className = "cartilha-cover";
      cover.innerHTML = `<h3>${c.titulo}</h3><p>${c.subtitulo}</p><p><strong>${c.destaque}</strong></p>`;

    viewer.appendChild(cover);

    for (let i = 0; i < c.blocos.length; i += 2) {
      const spread = document.createElement("div");
      spread.className = "cartilha-spread cartilha-spread--double";

      [c.blocos[i], c.blocos[i + 1]].filter(Boolean).forEach((bloco) => {
        const panel = document.createElement("article");
        panel.className = "cartilha-panel";
        panel.innerHTML = `
          <span class="cartilha-panel__badge">${bloco.num} · ${bloco.titulo}</span>
          <h3>${bloco.subtitulo}</h3>
          <p>${bloco.intro}</p>
          <ul>${bloco.itens.map((item) => `<li>${item}</li>`).join("")}</ul>
          ${bloco.callout ? `<p class="cartilha-callout">${bloco.callout}</p>` : ""}
        `;
        spread.appendChild(panel);
      });

      viewer.appendChild(spread);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    renderQuestionnaire();
    renderSimulator();
    renderQuickTips();
    renderCartilha();
    loadAnswers();

    $("#form-questionario")?.addEventListener("submit", onQuestionnaireSubmit);
    $("#form-questionario")?.addEventListener("reset", onQuestionnaireReset);
    $("#btn-exportar-pdf")?.addEventListener("click", exportPdf);
  });
})();