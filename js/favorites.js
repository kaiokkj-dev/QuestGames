const favoritesGrid = document.getElementById("favoritesGrid");
function getFavorites() {
  return JSON.parse(localStorage.getItem("quest-favorites")) || [];
}

function renderFavorites() {
  const favorites = getFavorites();
  if (favorites.length === 0) {
    favoritesGrid.innerHTML = `
      <p class="empty-message">
        No favorite games yet.
      </p>
    `;
    return;
  }
  favoritesGrid.innerHTML = "";
  favorites.forEach((game) => {
    const gameCard = document.createElement("div");
    gameCard.classList.add("game-card");
    gameCard.style.setProperty(
      "--game-image",
      `url(${game.background_image})`
    );
    gameCard.innerHTML = `
      <div class="game-card-content">
        <span>${game.genres?.[0]?.name || "Game"}</span>
        <h3>${game.name}</h3>
        <p>
          ⭐ ${game.rating || "N/A"} • ${game.released || "Unknown"}
        </p>
      </div>
    `;
    favoritesGrid.appendChild(gameCard);
  });
}

renderFavorites();