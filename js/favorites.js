const favoritesGrid = document.getElementById("favoritesGrid");
const librarySearch = document.getElementById("librarySearch");
let activeFilter = "all";
function getFavorites() {
  try {
    const value = JSON.parse(localStorage.getItem("quest-favorites") || "[]");
    return Array.isArray(value) ? value.filter(game => game?.id) : [];
  } catch { return []; }
}
function libraryText(key) {
  const pt = document.documentElement.lang === "pt-BR";
  const labels = {
    want: ["Want to play", "Quero jogar"], playing: ["Playing", "Jogando"], played: ["Played", "Já joguei"],
    favorites: ["Favorite", "Favorito"], empty: ["No games in this collection yet.", "Nenhum jogo nesta coleção ainda."],
    remove: ["Remove", "Remover"], error: ["Could not save in this browser.", "Não foi possível salvar neste navegador."]
  };
  return labels[key]?.[pt ? 1 : 0] || key;
}
function renderFavorites() {
  const favorites = getFavorites();
  const entries = QuestLibrary.read();
  const games = new Map(favorites.map(game => [game.id, game]));
  entries.forEach(entry => games.set(entry.game.id, entry.game));
  const query = librarySearch.value.trim().toLocaleLowerCase();
  const visible = [...games.values()].filter(game => {
    const status = QuestLibrary.status(game.id);
    const collectionMatches = activeFilter === "all" || (activeFilter === "favorites" ? favorites.some(item => item.id === game.id) : status === activeFilter);
    return collectionMatches && game.name.toLocaleLowerCase().includes(query);
  });
  document.getElementById("libraryCount").textContent = `${visible.length} / ${games.size}`;
  favoritesGrid.replaceChildren();
  if (!visible.length) {
    const message = document.createElement("p");
    message.className = "catalog-message";
    message.textContent = libraryText("empty");
    favoritesGrid.append(message);
  }
  visible.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";
    if (game.background_image) card.style.setProperty("--game-image", `url(${game.background_image})`);
    const content = document.createElement("div");
    content.className = "game-card-content";
    const badge = document.createElement("span");
    badge.textContent = libraryText(QuestLibrary.status(game.id) || "favorites");
    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = `./game.html?id=${encodeURIComponent(game.id)}`;
    link.textContent = game.name;
    title.append(link);
    const meta = document.createElement("p");
    meta.innerHTML = '<span class="icon" data-icon="star" aria-hidden="true"></span>';
    meta.append(String(game.rating ?? "—"));
    const select = document.createElement("select");
    select.className = "library-card-select";
    select.setAttribute("aria-label", game.name);
    for (const status of ["", "want", "playing", "played"]) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status ? libraryText(status) : (document.documentElement.lang === "pt-BR" ? "Sem status" : "No status");
      select.append(option);
    }
    select.value = QuestLibrary.status(game.id);
    select.addEventListener("change", () => {
      try { QuestLibrary.set(game, select.value); } catch { document.getElementById("libraryCount").textContent = libraryText("error"); select.value = QuestLibrary.status(game.id); }
    });
    const remove = document.createElement("button");
    remove.className = "library-remove";
    remove.innerHTML = '<span class="icon" data-icon="trash" aria-hidden="true"></span>';
    remove.append(libraryText("remove"));
    remove.setAttribute("aria-label", `${libraryText("remove")}: ${game.name}`);
    remove.addEventListener("click", () => {
      try {
        localStorage.setItem("quest-favorites", JSON.stringify(getFavorites().filter(item => item.id !== game.id)));
        QuestLibrary.set(game, "");
      } catch { document.getElementById("libraryCount").textContent = libraryText("error"); }
    });
    content.append(badge, title, meta, select, remove);
    card.append(content);
    favoritesGrid.append(card);
  });
}
document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    renderFavorites();
  });
});
librarySearch.addEventListener("input", renderFavorites);
window.addEventListener("quest-library-change", renderFavorites);
window.addEventListener("storage", renderFavorites);
document.addEventListener("quest-language-change", renderFavorites);
renderFavorites();
