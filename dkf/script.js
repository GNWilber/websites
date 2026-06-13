// DYSKUSYJNY KLUB FILMOWY — logika strony v7
const POLISH_MONTHS = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
];
const RANKING_PREFIX = "Ranking DKF";

// DATE HELPERS
function parseDate(str) {
  const [d, m, y] = str.split(".").map(Number);
  return new Date(y, m - 1, d);
}
function isUpcoming(movieDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return movieDate >= today;
}
function getNextMovie(sortedMovies) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return sortedMovies.find(m => parseDate(m.date) >= today) || null;
}

// DISPLAY HELPERS
function displayName(movie) {
  return movie.altName ? `${movie.name} (${movie.altName})` : movie.name;
}
function extractFlags(movie) {
  if (!movie.flag) return [];
  return [...movie.flag.matchAll(/\p{Regional_Indicator}\p{Regional_Indicator}/gu)].map(m => m[0]);
}

// COPY FORMAT BUILDERS
function buildUpcomingCopyText(upcomingMovies) {
  return upcomingMovies
    .map(m => `### ${m.date}: [*${displayName(m)} [${m.year}]*](${m.filmweb})`)
    .join("  \n") + "  \n";
}
function buildArchiveCopyText(archiveMovies, globalIndexMap) {
  return [...archiveMovies]
    .reverse()
    .map(m => `${globalIndexMap.get(m)}. ${m.date}: ${displayName(m)} [${m.year}]`)
    .join("\n");
}
function buildRankingCopyText(rankingMovies, code) {
  const header = `${RANKING_PREFIX} {${code}}:`;
  const body = rankingMovies
    .map((m, i) => `${i + 1}. ${displayName(m)} [${m.year}]`)
    .join("\n");
  return `${header}\n${body}`;
}

// RANKING SEED CODE — encode order of movie indices into a short base36 string
function encodeRanking(orderIndices) {
  // Each index encoded as 2-char base36 (supports up to 1295 movies)
  return orderIndices.map(i => i.toString(36).padStart(2, "0")).join("");
}
function decodeRanking(code) {
  const clean = code.trim().replace(/[^0-9a-z]/gi, "").toLowerCase();
  if (clean.length === 0 || clean.length % 2 !== 0) return null;
  const out = [];
  for (let i = 0; i < clean.length; i += 2) {
    const n = parseInt(clean.slice(i, i + 2), 36);
    if (Number.isNaN(n)) return null;
    out.push(n);
  }
  return out;
}
function extractCodeFromInput(raw) {
  // Accept either the bare code or the full first line "Ranking DKF {code}:"
  const m = raw.match(/\{([^}]+)\}/);
  return m ? m[1] : raw;
}

// TOAST SYSTEM
let _toastTimer = null;
function showToast(message) {
  const footer = document.querySelector("footer");
  if (footer) {
    const toastMsg = footer.querySelector(".footer-toast-msg");
    toastMsg.textContent = message;
    footer.classList.add("toast-active");
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => footer.classList.remove("toast-active"), 2400);
    return;
  }
  const existing = document.getElementById("copy-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "copy-toast";
  toast.className = "copy-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  toast.getBoundingClientRect();
  toast.classList.add("visible");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 400);
  }, 2400);
}
async function copyToClipboard(text, toastMessage) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  showToast(toastMessage);
}

// CARD BUILDER
function buildCard(movie) {
  const date = parseDate(movie.date);
  const day = date.getDate();
  const monthFull = POLISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.getTime() === today.getTime();
  const isPast = date < today;
  const card = document.createElement("article");
  card.className = "movie-card" + (isToday ? " is-today" : "") + (isPast ? " is-past" : "");
  card.innerHTML = `
    <div class="card-date">
      <span class="date-day">${day}</span>
      <div class="date-gap"></div>
      <span class="date-month-year">${monthFull} ${year}</span>
      ${isToday ? '<span class="badge-today">‎ Dziś!</span>' : ""}
    </div>
    <div class="card-divider"></div>
    <div class="card-info">
      <h2 class="card-title">${movie.name}</h2>
      ${movie.altName ? `<p class="card-alt">${movie.altName}</p>` : ""}
      <p class="card-year">${movie.flag ? movie.flag + ' ' : ''}${movie.year}</p>
      ${movie.author ? `<p class="card-author">${movie.author}</p>` : ""}
    </div>
    <a class="card-link" href="${movie.filmweb}" target="_blank" rel="noopener" title="Otwórz na Filmweb">
      <img src="filmwebfull.svg" alt="Filmweb" class="filmweb-logo-full" />
    </a>
  `;
  card.querySelector(".card-link").addEventListener("click", e => e.stopPropagation());
  card.addEventListener("click", () => {
    copyToClipboard(`${displayName(movie)} [${movie.year}]`, `Skopiowano\n${displayName(movie)} [${movie.year}]`);
  });
  return card;
}

// ARCHIVE ITEM BUILDER
function buildArchiveItem(movie, globalNum, dimmed) {
  const date = parseDate(movie.date);
  const day = date.getDate();
  const month = POLISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const li = document.createElement("li");
  li.className = "archive-item" + (dimmed ? " is-filtered-out" : "");
  li.innerHTML = `
    <span class="archive-num">${globalNum}.</span>
    <span class="archive-date">${day} ${month} ${year}</span>
    <span class="archive-dot"></span>
    <span class="archive-title">
      ${movie.name}
      ${movie.altName ? `<span class="archive-alt">– ${movie.altName}</span>` : ""}
      <span class="archive-year">${movie.flag ? movie.flag + ' ' : ''}${movie.year}</span>
    </span>
    ${movie.author ? `<span class="author-bubble">${movie.author}</span>` : '<span></span>'}
    <a href="${movie.filmweb}" target="_blank" rel="noopener" class="archive-link" title="Otwórz na Filmweb">
      <img src="filmweb.svg" alt="Filmweb" class="filmweb-logo-sq" />
    </a>
  `;
  li.querySelector(".archive-link").addEventListener("click", e => e.stopPropagation());
  li.addEventListener("click", () => {
    copyToClipboard(`${displayName(movie)} [${movie.year}]`, `Skopiowano\n${displayName(movie)} [${movie.year}]`);
  });
  return li;
}

// RANKING ITEM BUILDER
function buildRankingItem(movie, rank, movieKey, shouldSuppressClick) {
  const li = document.createElement("li");
  li.className = "archive-item ranking-item";
  li.draggable = true;
  li.dataset.movieKey = movieKey;
  li.innerHTML = `
    <span class="archive-num ranking-num">${rank}.</span>
    <span class="ranking-handle" aria-hidden="true" title="Przeciągnij, aby zmienić pozycję">⋮⋮</span>
    <span class="archive-title ranking-title">
      ${movie.name}
      ${movie.altName ? `<span class="archive-alt">– ${movie.altName}</span>` : ""}
      <span class="archive-year">${movie.flag ? movie.flag + ' ' : ''}${movie.year}</span>
    </span>
    ${movie.author ? `<span class="author-bubble">${movie.author}</span>` : '<span></span>'}
    <a href="${movie.filmweb}" target="_blank" rel="noopener" class="archive-link" title="Otwórz na Filmweb" draggable="false">
      <img src="filmweb.svg" alt="Filmweb" class="filmweb-logo-sq" draggable="false" />
    </a>
  `;
  const link = li.querySelector(".archive-link");
  link.addEventListener("click", e => e.stopPropagation());
  link.addEventListener("dragstart", e => e.preventDefault());
  li.addEventListener("click", () => {
    if (shouldSuppressClick && shouldSuppressClick()) return;
    copyToClipboard(`${displayName(movie)} [${movie.year}]`, `Skopiowano\n${displayName(movie)} [${movie.year}]`);
  });
  return li;
}
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".ranking-item:not(.is-dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

// STICKY FOOTER — announcement OR next upcoming movie
function isAnnouncementActive() {
  if (typeof ANNOUNCEMENT === "undefined" || !ANNOUNCEMENT || !ANNOUNCEMENT.trim()) return false;
  if (typeof ANNOUNCEMENT_EXPIRY === "undefined" || !ANNOUNCEMENT_EXPIRY) return true;
  const expiry = parseDate(ANNOUNCEMENT_EXPIRY);
  expiry.setHours(23, 59, 59, 999);
  return new Date() <= expiry;
}
function renderFooter(nextMovie) {
  const showAnnouncement = isAnnouncementActive();
  if (!showAnnouncement && !nextMovie) return;
  const footer = document.createElement("footer");
  if (showAnnouncement) {
    footer.classList.add("footer--announcement");
    footer.innerHTML = `
      <div class="footer-inner">
        <div class="footer-content">
          <span class="footer-label footer-announce-label"><span class="footer-announce-dot"></span>Ogłoszenie</span>
          <div class="footer-divider"></div>
          <span class="footer-announce-text">${ANNOUNCEMENT}</span>
        </div>
        <div class="footer-toast-msg" aria-live="polite"></div>
      </div>
    `;
  } else {
    const date = parseDate(nextMovie.date);
    const day = date.getDate();
    const monthFull = POLISH_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    footer.innerHTML = `
      <div class="footer-inner">
        <div class="footer-content">
          <span class="footer-label">${isToday ? "Dzisiejszy seans" : "Następny seans"}</span>
          <div class="footer-divider"></div>
          <div class="footer-meta">
            <span class="footer-date">${day} ${monthFull} ${year}</span>
            <span class="footer-sep">·</span>
            <span class="footer-title">${nextMovie.name}</span>
            ${nextMovie.altName ? `<span class="footer-alt">${nextMovie.altName}</span>` : ""}
            <span class="footer-year">${nextMovie.year}</span>
          </div>
          <div class="footer-divider"></div>
          <a class="footer-fw-link" href="${nextMovie.filmweb}" target="_blank" rel="noopener" title="Filmweb">
            <img src="filmweb.svg" alt="Filmweb" class="footer-fw-icon" />
          </a>
        </div>
        <div class="footer-toast-msg" aria-live="polite"></div>
      </div>
    `;
  }
  document.body.appendChild(footer);
  document.body.classList.add("has-footer");
}

// MAIN RENDER
function render() {
  const sorted = [...MOVIES].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  const globalIndexMap = new Map();
  const movieKeyMap = new Map();
  const movieByKey = new Map();
  const movieByGlobalIndex = new Map();
  sorted.forEach((m, i) => {
    globalIndexMap.set(m, i + 1);
    const key = String(i);
    movieKeyMap.set(m, key);
    movieByKey.set(key, m);
    movieByGlobalIndex.set(i, m);
  });

  const upcomingMovies = sorted.filter(m => isUpcoming(parseDate(m.date)));
  const archiveMovies = sorted.filter(m => !isUpcoming(parseDate(m.date))).reverse();
  let rankingMovies = [...archiveMovies];

  renderFooter(getNextMovie(sorted));

  // UPCOMING CARDS
  const upcomingEl = document.getElementById("upcoming-cards");
  const upcomingEmpty = document.getElementById("upcoming-empty");
  if (upcomingMovies.length === 0) {
    upcomingEmpty.classList.remove("hidden");
  } else {
    upcomingMovies.forEach((m, i) => {
      const card = buildCard(m);
      card.style.animationDelay = `${i * 0.1}s`;
      upcomingEl.appendChild(card);
    });
  }

  // MEETINGS / ARCHIVE LIST + FILTERS
  const archiveEl = document.getElementById("archive-list");
  const archiveEmpty = document.getElementById("archive-empty");
  const filtersEl = document.getElementById("filters");
  const countriesEl = document.getElementById("filter-countries");
  const authorsEl = document.getElementById("filter-authors");
  const filterGroupAuthors = document.getElementById("filter-group-authors");
  const showAllToggle = document.getElementById("show-all-toggle");
  const yearSlider = document.getElementById("year-slider");
  const yearMinInput = document.getElementById("year-min");
  const yearMaxInput = document.getElementById("year-max");
  const yearRangeEl = document.getElementById("year-range");
  const yearMinVal = document.getElementById("year-min-val");
  const yearMaxVal = document.getElementById("year-max-val");

  const selectedCountries = new Set();
  const selectedAuthors = new Set();
  let yearLo, yearHi, yearBoundLo, yearBoundHi;

  // Collect countries present in archive that exist in COUNTRIES list
  function buildCountryFilter() {
    const present = new Set();
    const flagCount = new Map();
    archiveMovies.forEach(m => extractFlags(m).forEach(f => {
      if (COUNTRIES[f]) {
        present.add(f);
        flagCount.set(f, (flagCount.get(f) || 0) + 1);
      }
    }));
    countriesEl.innerHTML = "";
    if (present.size === 0) return;
    [...present].sort((a, b) => (flagCount.get(b) || 0) - (flagCount.get(a) || 0)).forEach(flag => {
      const count = flagCount.get(flag) || 0;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "country-chip";
      btn.title = COUNTRIES[flag];
      btn.innerHTML = `<span class="country-flag">${flag}</span><span class="country-count">${count}</span>`;
      btn.addEventListener("click", () => {
        if (selectedCountries.has(flag)) {
          selectedCountries.delete(flag);
          btn.classList.remove("is-active");
        } else {
          selectedCountries.add(flag);
          btn.classList.add("is-active");
        }
        renderArchiveList();
      });
      countriesEl.appendChild(btn);
    });
  }

  // Collect authors present in archive movies
  function buildAuthorFilter() {
    const authorCount = new Map();
    archiveMovies.forEach(m => {
      if (m.author && m.author.trim()) {
        const a = m.author.trim();
        authorCount.set(a, (authorCount.get(a) || 0) + 1);
      }
    });
    authorsEl.innerHTML = "";
    if (authorCount.size === 0) {
      filterGroupAuthors.classList.add("hidden");
      return;
    }
    filterGroupAuthors.classList.remove("hidden");
    [...authorCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([author, count]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "author-chip";
        btn.title = author;
        btn.innerHTML = `<span class="author-chip-name">${author}</span><span class="country-count">${count}</span>`;
        btn.addEventListener("click", () => {
          if (selectedAuthors.has(author)) {
            selectedAuthors.delete(author);
            btn.classList.remove("is-active");
          } else {
            selectedAuthors.add(author);
            btn.classList.add("is-active");
          }
          renderArchiveList();
        });
        authorsEl.appendChild(btn);
      });
  }

  function buildYearSlider() {
    if (archiveMovies.length === 0) { yearSlider.classList.add("hidden"); return; }
    const years = archiveMovies.map(m => m.year);
    yearBoundLo = Math.min(...years);
    yearBoundHi = Math.max(...years);
    yearLo = yearBoundLo;
    yearHi = yearBoundHi;
    [yearMinInput, yearMaxInput].forEach(inp => {
      inp.min = yearBoundLo;
      inp.max = yearBoundHi;
      inp.step = 1;
    });
    yearMinInput.value = yearLo;
    yearMaxInput.value = yearHi;
    if (yearBoundLo === yearBoundHi) yearSlider.classList.add("year-slider--single");
    updateYearUI();
  }

  function updateYearUI() {
    yearMinVal.textContent = yearLo;
    yearMaxVal.textContent = yearHi;
    const span = Math.max(1, yearBoundHi - yearBoundLo);
    const left = ((yearLo - yearBoundLo) / span) * 100;
    const right = ((yearHi - yearBoundLo) / span) * 100;
    yearRangeEl.style.left = left + "%";
    yearRangeEl.style.right = (100 - right) + "%";
  }

  yearMinInput.addEventListener("input", () => {
    yearLo = Math.min(Number(yearMinInput.value), yearHi);
    yearMinInput.value = yearLo;
    updateYearUI();
    renderArchiveList();
  });
  yearMaxInput.addEventListener("input", () => {
    yearHi = Math.max(Number(yearMaxInput.value), yearLo);
    yearMaxInput.value = yearHi;
    updateYearUI();
    renderArchiveList();
  });

  function movieQualifies(m) {
    if (selectedCountries.size > 0) {
      const flags = extractFlags(m);
      if (!flags.some(f => selectedCountries.has(f))) return false;
    }
    if (selectedAuthors.size > 0) {
      const author = m.author ? m.author.trim() : "";
      if (!selectedAuthors.has(author)) return false;
    }
    if (typeof yearLo === "number" && (m.year < yearLo || m.year > yearHi)) return false;
    return true;
  }

  function renderArchiveList() {
    archiveEl.innerHTML = "";
    const showAll = showAllToggle.checked;
    let anyVisible = false;
    archiveMovies.forEach(m => {
      const ok = movieQualifies(m);
      if (!ok && !showAll) return;
      anyVisible = true;
      archiveEl.appendChild(buildArchiveItem(m, globalIndexMap.get(m), !ok));
    });
    archiveEmpty.classList.toggle("hidden", anyVisible);
    archiveEl.classList.toggle("hidden", !anyVisible);
  }

  showAllToggle.addEventListener("change", renderArchiveList);

  if (archiveMovies.length === 0) {
    filtersEl.classList.add("hidden");
    archiveEmpty.classList.remove("hidden");
  } else {
    buildCountryFilter();
    buildAuthorFilter();
    buildYearSlider();
    renderArchiveList();
  }

  // RANKING VIEW
  const meetingsView = document.getElementById("meetings-view");
  const rankingView = document.getElementById("ranking-view");
  const rankingEl = document.getElementById("ranking-list");
  const rankingEmpty = document.getElementById("ranking-empty");
  const rankingActions = document.getElementById("ranking-actions");
  const rankingCopyBtn = document.getElementById("ranking-copy-btn");
  const rankingCodeBtn = document.getElementById("ranking-code-btn");
  const rankingRestoreBtn = document.getElementById("ranking-restore-btn");
  const meetingsBtn = document.getElementById("toggle-meetings");
  const rankingBtn = document.getElementById("toggle-ranking");

  let currentArchiveView = "meetings";
  let isRankingDragging = false;
  let suppressNextRankingClick = false;

  function copyMeetings() {
    if (archiveMovies.length === 0) return;
    copyToClipboard(buildArchiveCopyText(archiveMovies, globalIndexMap), `Archiwum skopiowane\n${archiveMovies.length} filmów`);
  }
  function currentRankingCode() {
    return encodeRanking(rankingMovies.map(m => globalIndexMap.get(m) - 1));
  }
  function copyRanking() {
    if (rankingMovies.length === 0) return;
    const code = currentRankingCode();
    copyToClipboard(buildRankingCopyText(rankingMovies, code), `Ranking skopiowany\nkod: ${code}`);
  }
  function copyRankingCode() {
    if (rankingMovies.length === 0) return;
    const code = currentRankingCode();
    copyToClipboard(code, `Kod skopiowany\n${code}`);
  }
  function restoreRanking() {
    const raw = window.prompt("Wklej kod rankingu lub całą pierwszą linię (Ranking DKF {kod}:)");
    if (raw == null) return;
    const code = extractCodeFromInput(raw);
    const order = decodeRanking(code);
    if (!order || order.length === 0) {
      showToast("Nieprawidłowy kod");
      return;
    }
    const restored = order.map(i => movieByGlobalIndex.get(i)).filter(Boolean);
    // Append any movies missing from code at the end to keep full set
    const missing = rankingMovies.filter(m => !restored.includes(m));
    rankingMovies = [...restored, ...missing];
    renderRankingList();
    showToast(`Ranking wczytany\n${restored.length} filmów`);
  }

  function setArchiveView(view) {
    currentArchiveView = view;
    const isMeetings = view === "meetings";
    meetingsView.classList.toggle("hidden", !isMeetings);
    rankingView.classList.toggle("hidden", isMeetings);
    meetingsBtn.classList.toggle("is-selected", isMeetings);
    rankingBtn.classList.toggle("is-selected", !isMeetings);
    meetingsBtn.setAttribute("aria-selected", String(isMeetings));
    rankingBtn.setAttribute("aria-selected", String(!isMeetings));
    meetingsBtn.title = isMeetings ? "Kliknij ponownie, aby skopiować listę spotkań" : "Przełącz na spotkania";
    rankingBtn.title = !isMeetings ? "Kliknij ponownie, aby skopiować ranking" : "Przełącz na ranking";
  }

  function commitRankingOrderFromDom() {
    const reordered = [...rankingEl.querySelectorAll(".ranking-item")]
      .map(item => movieByKey.get(item.dataset.movieKey))
      .filter(Boolean);
    if (reordered.length === rankingMovies.length) rankingMovies = reordered;
    renderRankingList();
  }
  function finishRankingDrag() {
    const draggingEl = rankingEl.querySelector(".ranking-item.is-dragging");
    if (draggingEl) draggingEl.classList.remove("is-dragging");
    isRankingDragging = false;
    suppressNextRankingClick = true;
    commitRankingOrderFromDom();
    window.setTimeout(() => { suppressNextRankingClick = false; }, 80);
  }
  function renderRankingList() {
    rankingEl.innerHTML = "";
    const isEmpty = rankingMovies.length === 0;
    rankingEl.classList.toggle("hidden", isEmpty);
    rankingEmpty.classList.toggle("hidden", !isEmpty);
    rankingActions.classList.toggle("hidden", isEmpty);
    if (isEmpty) return;
    rankingMovies.forEach((m, i) => {
      const item = buildRankingItem(m, i + 1, movieKeyMap.get(m), () => suppressNextRankingClick);
      item.addEventListener("dragstart", e => {
        isRankingDragging = true;
        suppressNextRankingClick = false;
        item.classList.add("is-dragging");
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.dataset.movieKey);
        }
      });
      item.addEventListener("dragend", () => { if (isRankingDragging) finishRankingDrag(); });
      rankingEl.appendChild(item);
    });
  }
  rankingEl.addEventListener("dragover", e => {
    const draggingEl = rankingEl.querySelector(".ranking-item.is-dragging");
    if (!draggingEl) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const afterElement = getDragAfterElement(rankingEl, e.clientY);
    if (afterElement == null) rankingEl.appendChild(draggingEl);
    else rankingEl.insertBefore(draggingEl, afterElement);
  });
  rankingEl.addEventListener("drop", e => {
    if (!isRankingDragging) return;
    e.preventDefault();
    finishRankingDrag();
  });

  renderRankingList();
  setArchiveView("meetings");

  meetingsBtn.addEventListener("click", () => {
    if (currentArchiveView === "meetings") copyMeetings();
    else setArchiveView("meetings");
  });
  rankingBtn.addEventListener("click", () => {
    if (currentArchiveView === "ranking") copyRanking();
    else setArchiveView("ranking");
  });
  rankingCopyBtn.addEventListener("click", copyRanking);
  rankingCodeBtn.addEventListener("click", copyRankingCode);
  rankingRestoreBtn.addEventListener("click", restoreRanking);

  document.getElementById("label-upcoming").addEventListener("click", () => {
    if (upcomingMovies.length === 0) return;
    const count = upcomingMovies.length;
    copyToClipboard(buildUpcomingCopyText(upcomingMovies), `Plan spotkań skopiowany\n${count} ${count === 1 ? "seans" : "seanse"}`);
  });
}
document.addEventListener("DOMContentLoaded", render);