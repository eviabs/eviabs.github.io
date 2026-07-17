(function () {
  "use strict";

  const catNav = document.getElementById("catNav");
  const categoriesContainer = document.getElementById("categoriesContainer");
  const searchInput = document.getElementById("searchInput");
  const emptyState = document.getElementById("emptyState");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalContent = document.getElementById("modalContent");
  const modalClose = document.getElementById("modalClose");
  const menuToggle = document.getElementById("menuToggle");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const startBrowsing = document.getElementById("startBrowsing");
  const brandLink = document.getElementById("brandLink");

  let activeCategory = "all";
  let searchTerm = "";

  // ---------- Fill dedication ----------
  document.getElementById("dedHeading").textContent = BOOK.dedication.heading;
  document.getElementById("dedParagraphs").innerHTML = BOOK.dedication.paragraphs
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  document.getElementById("dedSignature").textContent = BOOK.dedication.signature;

  // ---------- Build category nav buttons ----------
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "cat-btn";
    btn.dataset.cat = cat.id;
    btn.textContent = cat.name;
    catNav.appendChild(btn);
  });

  // ---------- Build category sections + recipe cards ----------
  CATEGORIES.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "category-section";
    section.id = "cat-" + cat.id;
    section.dataset.cat = cat.id;

    section.innerHTML = `
      <div class="category-header">
        <img src="${cat.image}" alt="${escapeHtml(cat.name)}" loading="lazy">
        <div class="category-header-text">
          <h2>${escapeHtml(cat.name)}</h2>
          <p class="tagline">${escapeHtml(cat.tagline)}</p>
        </div>
      </div>
      <p class="category-intro">${escapeHtml(cat.intro)}</p>
      <div class="recipe-grid" id="grid-${cat.id}"></div>
    `;
    categoriesContainer.appendChild(section);

    const grid = section.querySelector(".recipe-grid");
    const recipes = RECIPES.filter((r) => r.category === cat.id);
    recipes.forEach((recipe) => {
      grid.appendChild(buildCard(recipe));
    });
  });

  function buildCard(recipe) {
    const card = document.createElement("article");
    card.className = "recipe-card";
    card.dataset.id = recipe.id;
    card.dataset.search = (recipe.title + " " + recipe.tagline + " " + flattenIngredients(recipe)).toLowerCase();

    card.innerHTML = `
      <div class="card-img">
        <img src="${recipe.image}" alt="${escapeHtml(recipe.title)}" loading="lazy">
        ${recipe.incomplete ? '<span class="badge-incomplete">בקרוב</span>' : ""}
      </div>
      <div class="card-body">
        <h3>${escapeHtml(recipe.title)}</h3>
        <p class="card-tagline">${escapeHtml(recipe.tagline)}</p>
        <div class="card-meta">
          <span>⏱ ${escapeHtml(recipe.totalTime)}</span>
          <span>🍽 ${escapeHtml(recipe.servings)}</span>
          <span>⭐ ${escapeHtml(recipe.difficulty)}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => openModal(recipe));
    return card;
  }

  function flattenIngredients(recipe) {
    return recipe.ingredients
      .map((g) => g.items.map((i) => i.name).join(" "))
      .join(" ");
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- Modal ----------
  function openModal(recipe) {
    const ingredientsHtml = recipe.ingredients
      .map((group) => {
        const groupTitle = group.group ? `<div class="ingredient-group-title">${escapeHtml(group.group)}</div>` : "";
        const items = group.items
          .map(
            (item) =>
              `<li><span class="ing-name">${escapeHtml(item.name)}</span><span class="ing-qty">${escapeHtml(item.qty)}</span></li>`
          )
          .join("");
        return `${groupTitle}<ul class="ingredient-list">${items}</ul>`;
      })
      .join("");

    const instructionsHtml = recipe.instructions
      .map((step) => `<li>${escapeHtml(step)}</li>`)
      .join("");

    modalContent.innerHTML = `
      <div class="modal-hero">
        <img src="${recipe.image}" alt="${escapeHtml(recipe.title)}">
      </div>
      <div class="modal-body">
        <h2>${escapeHtml(recipe.title)}</h2>
        <p class="modal-tagline">${escapeHtml(recipe.tagline)}</p>
        ${recipe.incomplete ? '<div class="incomplete-note">המתכון הזה עוד לא הושלם במקור — אפשר להשלים אותו בגרסה הבאה של הספר.</div>' : ""}
        <div class="meta-strip">
          <div class="meta-item"><span class="meta-label">הכנה</span><span class="meta-value">${escapeHtml(recipe.prepTime)}</span></div>
          <div class="meta-item"><span class="meta-label">בישול</span><span class="meta-value">${escapeHtml(recipe.cookTime)}</span></div>
          <div class="meta-item"><span class="meta-label">סה"כ</span><span class="meta-value">${escapeHtml(recipe.totalTime)}</span></div>
          <div class="meta-item"><span class="meta-label">מנות</span><span class="meta-value">${escapeHtml(recipe.servings)}</span></div>
          <div class="meta-item"><span class="meta-label">רמת קושי</span><span class="meta-value">${escapeHtml(recipe.difficulty)}</span></div>
        </div>
        <h3 class="section-title">רכיבים</h3>
        ${ingredientsHtml}
        <h3 class="section-title">אופן הכנה</h3>
        <ol class="instructions-list">${instructionsHtml}</ol>
      </div>
    `;
    modalOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    modalOverlay.scrollTop = 0;
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ---------- Category filter ----------
  catNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-btn");
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    [...catNav.children].forEach((b) => b.classList.toggle("active", b === btn));
    applyFilters();
    if (activeCategory !== "all") {
      const target = document.getElementById("cat-" + activeCategory);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
    catNav.classList.remove("open");
  });

  // ---------- Search ----------
  searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  function applyFilters() {
    let anyVisible = false;
    document.querySelectorAll(".category-section").forEach((section) => {
      const catId = section.dataset.cat;
      const catMatches = activeCategory === "all" || activeCategory === catId;
      let sectionHasVisible = false;

      section.querySelectorAll(".recipe-card").forEach((card) => {
        const searchMatches = !searchTerm || card.dataset.search.includes(searchTerm);
        const visible = catMatches && searchMatches;
        card.style.display = visible ? "" : "none";
        if (visible) sectionHasVisible = true;
      });

      section.style.display = sectionHasVisible ? "" : "none";
      if (sectionHasVisible) anyVisible = true;
    });

    emptyState.hidden = anyVisible;
  }

  // ---------- Mobile menu toggle ----------
  menuToggle.addEventListener("click", () => {
    catNav.classList.toggle("open");
  });

  // ---------- Scroll to top button ----------
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 500);
  });
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ---------- Hero CTA ----------
  startBrowsing.addEventListener("click", () => {
    document.getElementById("categoriesContainer").scrollIntoView({ behavior: "smooth" });
  });

  brandLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
