/* =====================================================================
   PARTE 1 — Configuración, estado y elementos del DOM        (commit 3)
   ===================================================================== */
 
const API_URL = "https://rickandmortyapi.com/api/character";
const FAVORITES_KEY = "rm-favoritos";
 
// Todo lo que cambia en la aplicación vive en este objeto.
const state = {
  page: 1,
  totalPages: 1,
  name: "",
  status: "",
  species: "",
  gender: "",
  characters: [],
  favorites: []
};
 
// La API responde en inglés; este diccionario muestra los valores en español.
const TRANSLATIONS = {
  status: { alive: "Vivo", dead: "Muerto", unknown: "Desconocido" },
  gender: { female: "Femenino", male: "Masculino", genderless: "Sin género", unknown: "Desconocido" }
};
 
function translate(group, value) {
  return TRANSLATIONS[group][value.toLowerCase()] || value;
}
 
// Referencias a los elementos del HTML que vamos a usar.
const el = {
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  filterStatus: document.getElementById("filter-status"),
  filterGender: document.getElementById("filter-gender"),
  filterSpecies: document.getElementById("filter-species"),
  clearBtn: document.getElementById("clear-btn"),
  message: document.getElementById("message"),
  results: document.getElementById("results"),
  pagination: document.getElementById("pagination"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  pageInfo: document.getElementById("page-info"),
  tabExplorer: document.getElementById("tab-explorer"),
  tabFavorites: document.getElementById("tab-favorites"),
  explorerView: document.getElementById("explorer-view"),
  favoritesView: document.getElementById("favorites-view"),
  favoritesCount: document.getElementById("favorites-count"),
  favoritesMessage: document.getElementById("favorites-message"),
  favoritesGrid: document.getElementById("favorites-grid")
};
 
/* =====================================================================
   PARTE 2 — Conexión con la API usando fetch()               (commit 3)
   ===================================================================== */
 
// Sirve para ignorar respuestas viejas si el usuario escribe rápido.
let lastRequestId = 0;
 
async function fetchCharacters() {
  const requestId = ++lastRequestId;
 
  // Armamos la URL con los parámetros de búsqueda y filtros.
  const params = new URLSearchParams({ page: state.page });
  if (state.name) params.set("name", state.name);
  if (state.status) params.set("status", state.status);
  if (state.species) params.set("species", state.species);
  if (state.gender) params.set("gender", state.gender);
 
  showMessage("Cargando personajes...", "info");
 
  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (requestId !== lastRequestId) return;
 
    // La API responde 404 cuando no hay personajes con esa búsqueda.
    if (response.status === 404) {
      state.characters = [];
      state.totalPages = 1;
      renderAll();
      showMessage("No se encontraron personajes con esa búsqueda o esos filtros. Prueba con otro nombre o limpia los filtros.", "info");
      return;
    }
 
    if (!response.ok) {
      throw new Error("Respuesta HTTP " + response.status);
    }
 
    const data = await response.json();
    if (requestId !== lastRequestId) return;
 
    state.characters = data.results;
    state.totalPages = data.info.pages;
    hideMessage();
    renderAll();
  } catch (error) {
    if (requestId !== lastRequestId) return;
    console.error("Error al consultar la API:", error);
    state.characters = [];
    state.totalPages = 1;
    renderAll();
    showMessage("No se pudo conectar con la API. Revisa tu conexión a internet e inténtalo de nuevo.", "error");
  }
}
 
/* =====================================================================
   PARTE 3 — Mostrar información en pantalla                  (commit 3)
   ===================================================================== */
 
function showMessage(text, type) {
  el.message.textContent = text;
  el.message.className = "message " + type;
}
 
function hideMessage() {
  el.message.textContent = "";
  el.message.className = "message";
}
 
// Construye la tarjeta de un personaje (imagen + descripción + botones).
function createCard(character) {
  const card = document.createElement("article");
  card.className = "card";
 
  const img = document.createElement("img");
  img.src = character.image;
  img.alt = "Foto de " + character.name;
  img.loading = "lazy";
 
  const body = document.createElement("div");
  body.className = "card-body";
 
  const title = document.createElement("h3");
  title.textContent = character.name;
 
  const badge = document.createElement("span");
  badge.className = "badge " + character.status.toLowerCase();
  badge.textContent = translate("status", character.status);
 
  const description = document.createElement("p");
  description.className = "description";
  description.textContent =
    character.species + " · " + translate("gender", character.gender) +
    " · Origen: " + character.origin.name +
    " · Aparece en " + character.episode.length + " episodios";
 
  const actions = document.createElement("div");
  actions.className = "card-actions";
 
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = "btn" + (isFavorite(character.id) ? " active" : "");
  favBtn.textContent = isFavorite(character.id) ? "♥ Quitar favorito" : "♡ Favorito";
  favBtn.addEventListener("click", () => toggleFavorite(character));
  actions.appendChild(favBtn);
 
  // [RETO COMPARAR] aquí se agregará el botón "Comparar"
 
  body.append(title, badge, description, actions);
  card.append(img, body);
  return card;
}
 
function renderList(container, list) {
  container.replaceChildren(...list.map(createCard));
}
 
function renderCharacters() {
  renderList(el.results, state.characters);
}
 
function renderFavorites() {
  renderList(el.favoritesGrid, state.favorites);
  el.favoritesMessage.textContent = state.favorites.length === 0
    ? "Todavía no tienes favoritos. Marca personajes con el botón ♡ y aparecerán aquí."
    : "";
}
 
function renderPagination() {
  el.pagination.hidden = state.characters.length === 0;
  el.pageInfo.textContent = "Página " + state.page + " de " + state.totalPages;
  el.prevBtn.disabled = state.page <= 1;
  el.nextBtn.disabled = state.page >= state.totalPages;
}

// [RETO COMPARAR] aquí se pegará el bloque de comparación
 
/* =====================================================================
   PARTE 4 — Buscador, filtros y paginación                   (commit 4)
   ===================================================================== */
 
let searchTimer = null;
 
// Cada vez que cambia la búsqueda o un filtro volvemos a la página 1.
function applyFilters() {
  state.page = 1;
  fetchCharacters();
}
 
function changePage(step) {
  state.page += step;
  fetchCharacters();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
 
function setupEvents() {
  // Buscar al presionar Enter.
  el.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearTimeout(searchTimer);
    state.name = el.searchInput.value.trim();
    applyFilters();
  });
 
  // Buscar mientras escribe, esperando 400 ms para no saturar la API.
  el.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.name = el.searchInput.value.trim();
      applyFilters();
    }, 400);
  });
 
  el.filterStatus.addEventListener("change", () => {
    state.status = el.filterStatus.value;
    applyFilters();
  });
 
  el.filterGender.addEventListener("change", () => {
    state.gender = el.filterGender.value;
    applyFilters();
  });
 
  el.filterSpecies.addEventListener("change", () => {
    state.species = el.filterSpecies.value;
    applyFilters();
  });
 
  el.clearBtn.addEventListener("click", () => {
    el.searchForm.reset();
    state.name = "";
    state.status = "";
    state.gender = "";
    state.species = "";
    applyFilters();
  });
 
  el.prevBtn.addEventListener("click", () => changePage(-1));
  el.nextBtn.addEventListener("click", () => changePage(1));
}
