/* ============================= */
/* ELEMENTOS DOM */
/* ============================= */
const gamesGrid = document.getElementById("gamesGrid");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

/* ============================= */
/* MODAL */
/* ============================= */
const gameModal = document.getElementById("gameModal");
const closeModal = document.getElementById("closeModal");

const modalBanner = document.getElementById("modalBanner");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalGenre = document.getElementById("modalGenre");
const modalRating = document.getElementById("modalRating");
const modalReleased = document.getElementById("modalReleased");

/* ============================= */
/* HERO / FEATURED GAME */
/* ============================= */
const featuredCard = document.getElementById("featuredCard");
const featuredTitle = document.getElementById("featuredTitle");
const featuredGenre = document.getElementById("featuredGenre");

const featuredRating = document.getElementById("featuredRating");
const featuredMetacritic = document.getElementById("featuredMetacritic");
const featuredPlatform = document.getElementById("featuredPlatform");

/* ============================= */
/* MENU MOBILE */
/* ============================= */
const menuButton = document.getElementById("menuButton");
const closeMenu = document.getElementById("closeMenu");
const mobileMenu = document.getElementById("mobileMenu");

/* ============================= */
/* ESTADO */
/* ============================= */
let featuredIndex = 0;
let featuredInterval = null;

/* ============================= */
/* FEATURED GAME */
/* ============================= */
function updateFeaturedGame(games) {
  if (!games || games.length === 0) return;

  const game = games[featuredIndex];
  featuredCard.setAttribute("aria-busy", "false");
  featuredTitle.removeAttribute("data-i18n");
  featuredGenre.removeAttribute("data-i18n");

  featuredCard.style.backgroundImage = `
    linear-gradient(to top, rgba(5, 7, 18, 0.95), rgba(5, 7, 18, 0.15)),
    url(${game.background_image})
  `;

  featuredTitle.textContent = game.name;

  featuredGenre.textContent =
    game.genres?.map((genre) => genre.name).slice(0, 3).join(" • ") || "Game";

  featuredRating.textContent = game.rating || "N/A";

  featuredMetacritic.textContent = game.metacritic || "N/A";

  featuredPlatform.textContent =
    game.platforms?.[0]?.platform?.name || "—";

  featuredIndex = (featuredIndex + 1) % games.length;
}

function startFeaturedSlider(games) {
  featuredIndex = 0;

  updateFeaturedGame(games);

  if (featuredInterval) {
    clearInterval(featuredInterval);
  }

  featuredInterval = setInterval(() => {
    updateFeaturedGame(games);
  }, 5000);
}

/* ============================= */
/* RENDERIZAÇÃO DOS GAMES */
/* ============================= */
function renderGames(games) {
  if (!games || games.length === 0) {
    gamesGrid.innerHTML = '<p class="catalog-message">Nenhum jogo encontrado. Tente outra busca.</p>';
    return;
  }

  gamesGrid.innerHTML = "";

  games.forEach((game) => {
    const gameCard = document.createElement("div");

    gameCard.classList.add("game-card");

    gameCard.style.setProperty(
      "--game-image",
      `url(${game.background_image})`
    );

    gameCard.innerHTML = `
      <button class="favorite-button" data-game-id="${game.id}">
        <span class="icon" data-icon="heart" aria-hidden="true"></span>
      </button>

      <div class="game-card-content">
        <span>${game.genres?.[0]?.name || "Game"}</span>
        <h3>${game.name}</h3>
        <p><span class="icon" data-icon="star" aria-hidden="true"></span> ${game.rating ?? "N/A"} • ${game.released || "Unknown"}</p>
      </div>
    `;

    /* FAVORITOS */
    const favoriteButton = gameCard.querySelector(".favorite-button");

    favoriteButton.classList.toggle("is-favorite", isFavorite(game.id));

    favoriteButton.addEventListener("click", (e) => {
      e.stopPropagation();

      toggleFavorite(game);

      favoriteButton.classList.toggle("is-favorite", isFavorite(game.id));
    });

    favoriteButton.setAttribute("aria-label", "Favoritar " + game.name);
    favoriteButton.setAttribute("aria-pressed", String(isFavorite(game.id)));
    favoriteButton.addEventListener("click", () => {
      favoriteButton.setAttribute("aria-pressed", String(isFavorite(game.id)));
    });
    gameCard.tabIndex = 0;
    gameCard.setAttribute("role", "button");
    gameCard.setAttribute("aria-label", "Ver detalhes: " + game.name);
    gameCard.addEventListener("keydown", (event) => {
      if (event.target === gameCard && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        gameCard.click();
      }
    });
    /* ABRIR MODAL */
    gameCard.addEventListener("click", async () => {
      try {
        const gameDetails = await getGameDetails(game.id);
        openGameModal(gameDetails);
      } catch (error) {
        openGameModal({ ...game, description_raw: "Não foi possível carregar a descrição. Feche e tente novamente." });
      }
    });

    gamesGrid.appendChild(gameCard);
  });
}

/* ============================= */
/* CARREGAR GAMES POPULARES */
/* ============================= */
async function displayPopularGames() {
  gamesGrid.innerHTML = '<p class="catalog-message" role="status">Carregando jogos…</p>';
  try {
    const games = await getPopularGames();

    renderGames(games);

    startFeaturedSlider(games);
  } catch (error) {
    console.error(error);

    gamesGrid.innerHTML = '<p class="catalog-message">Não foi possível carregar os jogos. Atualize a página para tentar novamente.</p>';
    featuredCard.setAttribute("aria-busy", "false");
    featuredTitle.dataset.i18n = "featured.unavailable";
    featuredTitle.textContent = document.documentElement.lang === "pt-BR" ? "Destaque indisponível" : "Featured game unavailable";
    featuredGenre.removeAttribute("data-i18n");
    featuredGenre.textContent = "";
  }
}

/* ============================= */
/* PESQUISA */
/* ============================= */
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const query = searchInput.value.trim();

  if (!query) {
    displayPopularGames();
    return;
  }

  gamesGrid.innerHTML = '<p class="catalog-message" role="status">Buscando jogos…</p>';
  try {
    const games = await searchGames(query);

    renderGames(games);

    startFeaturedSlider(games);
  } catch (error) {
    console.error(error);

    gamesGrid.innerHTML = "<p>Failed to search games.</p>";
  }
});

/* ============================= */
/* MODAL FUNCTIONS */
/* ============================= */
let currentModalGame = null;
function openGameModal(game) {
  currentModalGame = game;
  document.getElementById("libraryStatus").value = QuestLibrary.status(game.id);
  document.getElementById("modalDetailsLink").href = "./game.html?id=" + encodeURIComponent(game.id);
  document.getElementById("libraryFeedback").textContent = "";
  gameModal.classList.add("active");
  closeModal.focus();

  modalBanner.style.backgroundImage = `url(${game.background_image})`;

  modalTitle.textContent = game.name;

  modalDescription.textContent =
    game.description_raw?.slice(0, 300) ||
    "No description available.";

  modalGenre.textContent =
    game.genres?.map((genre) => genre.name).join(", ") || "Game";

  modalRating.innerHTML = '<span class="icon" data-icon="star" aria-hidden="true"></span>';
  modalRating.append(String(game.rating ?? "N/A"));

  modalReleased.innerHTML = '<span class="icon" data-icon="calendar-days" aria-hidden="true"></span>';
  modalReleased.append(game.released || "Unknown");
}

/* ============================= */
/* FECHAR MODAL */
/* ============================= */
closeModal.addEventListener("click", () => {
  gameModal.classList.remove("active");
});

/* ============================= */
/* FECHAR MODAL CLICANDO FORA */
/* ============================= */
gameModal.addEventListener("click", (e) => {
  if (e.target === gameModal) {
    gameModal.classList.remove("active");
  }
});

/* ============================= */
/* FILTRO DE CATEGORIAS */
/* ============================= */
const categoryButtons =
  document.querySelectorAll(".category-card");

categoryButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    categoryButtons.forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    gamesGrid.innerHTML = '<p class="catalog-message" role="status">Carregando categoria…</p>';
    const genre = button.dataset.genre;

    try {
      const games = await getGamesByGenre(genre);

      renderGames(games);

      startFeaturedSlider(games);

      document
        .getElementById("trending")
        .scrollIntoView({
          behavior: "smooth"
        });
    } catch (error) {
      console.error(error);

      gamesGrid.innerHTML =
        "<p>Failed to load genre games.</p>";
    }
  });
});

/* ============================= */
/* FAVORITOS */
/* ============================= */
function getFavorites() {
  return JSON.parse(
    localStorage.getItem("quest-favorites")
  ) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem(
    "quest-favorites",
    JSON.stringify(favorites)
  );
}

function isFavorite(gameId) {
  const favorites = getFavorites();

  return favorites.some(
    (game) => game.id === gameId
  );
}

function toggleFavorite(game) {
  const favorites = getFavorites();

  const gameExists = favorites.some(
    (favorite) => favorite.id === game.id
  );

  if (gameExists) {
    const updatedFavorites = favorites.filter(
      (favorite) => favorite.id !== game.id
    );

    saveFavorites(updatedFavorites);
  } else {
    favorites.push(game);

    saveFavorites(favorites);
  }
}

/* ============================= */
/* MENU MOBILE */
/* ============================= */
menuButton.addEventListener("click", () => {
  mobileMenu.classList.add("active");
});

closeMenu.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
  });
});

/* ============================= */
/* INICIALIZAÇÃO */
/* ============================= */
displayPopularGames();
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    gameModal.classList.remove("active");
    mobileMenu.classList.remove("active");
  }
});

document.getElementById("libraryStatus").addEventListener("change", (event) => {
  if (!currentModalGame) return;
  const feedback = document.getElementById("libraryFeedback");
  try {
    QuestLibrary.set(currentModalGame, event.target.value);
    feedback.textContent = document.documentElement.lang === "pt-BR" ? "Biblioteca atualizada." : "Library updated.";
  } catch {
    event.target.value = QuestLibrary.status(currentModalGame.id);
    feedback.textContent = document.documentElement.lang === "pt-BR" ? "Não foi possível salvar neste navegador." : "Could not save in this browser.";
  }
});
