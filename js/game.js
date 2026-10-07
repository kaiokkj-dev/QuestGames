const gameTitle = document.getElementById("gameTitle");

async function displayGameDetails() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id || !/^\d+$/.test(id)) {
    gameTitle.textContent = "Selecione um jogo para ver os detalhes.";
    return;
  }
  gameTitle.textContent = "Carregando…";
  try {
    const game = await getGameDetails(id);
    document.title = `${game.name} • Quest Games`;
    gameTitle.textContent = game.name;
    if (game.background_image) {
      document.getElementById("gameBanner").style.backgroundImage = `url(${game.background_image})`;
    }
    document.getElementById("gameGenre").textContent = game.genres?.map(genre => genre.name).join(" • ") || "";
    document.getElementById("gameDescription").textContent = game.description_raw || "Descrição indisponível.";
    document.getElementById("gameRating").textContent = game.rating ?? "—";
    document.getElementById("gameReleased").textContent = game.released || "—";
    document.getElementById("gamePlatforms").textContent = game.platforms?.map(item => item.platform.name).join(", ") || "—";
  } catch (error) {
    gameTitle.textContent = "Não foi possível carregar o jogo. Tente novamente.";
    console.error(error);
  }
}

displayGameDetails();
