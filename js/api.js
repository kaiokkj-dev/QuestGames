const API_KEY = "2e1cb250c6d840f5ba57292d1ecd473d";
const BASE_URL = "https://api.rawg.io/api";

const FAMOUS_GAMES = [
  "Grand Theft Auto V",
  "Red Dead Redemption 2",
  "Elden Ring",
  "Cyberpunk 2077",
  "God of War",
  "Marvel's Spider-Man",
  "The Witcher 3",
  "Baldur's Gate 3",
  "Resident Evil 4",
  "Call of Duty: Warzone",
  "Fortnite",
  "Minecraft",
  "EA Sports FC 26",
  "Hogwarts Legacy",
  "Black Myth: Wukong",
  "Helldivers 2",
  "Forza Horizon 5",
  "Mortal Kombat 1",
  "Street Fighter 6",
  "Assassin's Creed Mirage",
  "Starfield",
  "The Last of Us Part I",
  "Palworld",
  "Valorant"
];

async function getPopularGames() {
  const requests = FAMOUS_GAMES.map((gameName) =>
    fetch(
      `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(gameName)}&page_size=1`
    )
      .then((response) => response.json())
      .then((data) => data.results[0])
  );
  const games = await Promise.all(requests);

  return games.filter(Boolean);
}

async function searchGames(query) {
  const response = await fetch(
    `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=12`
  );

  if (!response.ok) {
    throw new Error("Failed to search games");
  }

  const data = await response.json();

  return data.results;
}

async function getGameDetails(id) {
  const response = await fetch(
    `${BASE_URL}/games/${id}?key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch game details");
  }

  return response.json();
}

async function getGamesByGenre(genre) {
  const response = await fetch(
    `${BASE_URL}/games?key=${API_KEY}&genres=${genre}&ordering=-added&page_size=12`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch games by genre");
  }

  const data = await response.json();

  return data.results;
}