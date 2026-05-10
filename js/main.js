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
    game.platforms?.[0]?.platform?.name || "PC";

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
    gamesGrid.innerHTML = "<p>No games found.</p>";
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
        ♡
      </button>

      <div class="game-card-content">
        <span>${game.genres?.[0]?.name || "Game"}</span>
        <h3>${game.name}</h3>
        <p>⭐ ${game.rating || "N/A"} • ${game.released || "Unknown"}</p>
      </div>
    `;

    /* FAVORITOS */
    const favoriteButton = gameCard.querySelector(".favorite-button");

    favoriteButton.textContent =
      isFavorite(game.id) ? "♥" : "♡";

    favoriteButton.addEventListener("click", (e) => {
      e.stopPropagation();

      toggleFavorite(game);

      favoriteButton.textContent =
        isFavorite(game.id) ? "♥" : "♡";
    });

    /* ABRIR MODAL */
    gameCard.addEventListener("click", async () => {
      const gameDetails = await getGameDetails(game.id);

      openGameModal(gameDetails);
    });

    gamesGrid.appendChild(gameCard);
  });
}

/* ============================= */
/* CARREGAR GAMES POPULARES */
/* ============================= */
async function displayPopularGames() {
  try {
    const games = await getPopularGames();

    renderGames(games);

    startFeaturedSlider(games);
  } catch (error) {
    console.error(error);

    gamesGrid.innerHTML = "<p>Failed to load games.</p>";
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
function openGameModal(game) {
  gameModal.classList.add("active");

  modalBanner.style.backgroundImage = `url(${game.background_image})`;

  modalTitle.textContent = game.name;

  modalDescription.textContent =
    game.description_raw?.slice(0, 300) ||
    "No description available.";

  modalGenre.textContent =
    game.genres?.map((genre) => genre.name).join(", ") || "Game";

  modalRating.textContent =
    `⭐ ${game.rating || "N/A"}`;

  modalReleased.textContent =
    `📅 ${game.released || "Unknown"}`;
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