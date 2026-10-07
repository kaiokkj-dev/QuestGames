const API_KEY = "2e1cb250c6d840f5ba57292d1ecd473d";
const BASE_URL = "https://api.rawg.io/api";

// Selection from Steam Most Played, reviewed on 2026-10-07.
// RAWG entries must match explicitly; never substitute another edition.
const TRENDING_GAMES = [
  { name: "Counter-Strike 2", id: 965470 },
  { name: "Dota 2" },
  { name: "Bongo Cat" },
  { name: "Deadlock (Valve)", id: 998676 },
  { name: "PUBG: BATTLEGROUNDS", id: 10142 },
  { name: "Valheim" },
  { name: "Rust" },
  { name: "Overwatch", aliases: ["Overwatch 2"] },
  { name: "Team Fortress 2" },
  { name: "Tom Clancy's Rainbow Six Siege" },
  { name: "Marvel Rivals", id: 993875 },
  { name: "Apex Legends" },
  { name: "Project Zomboid" },
  { name: "Dead by Daylight" },
  { name: "Warframe" },
  { name: "Baldur's Gate 3" },
  { name: "ARC Raiders" },
  { name: "Slay the Spire 2", id: 994601 }
];

const TRENDING_CACHE_KEY = "quest-trending-2026-10-07";
let trendingRequest = null;
function normalizeGameName(name) {
  return name.toLowerCase().replace(/[’‘]/g, "'").replace(/[™®]/g, "").replace(/[^a-z0-9]/g, "");
}
async function fetchTrendingGames() {
  const games = [];
  for (let offset = 0; offset < TRENDING_GAMES.length; offset += 4) {
    const batch = await Promise.allSettled(TRENDING_GAMES.slice(offset, offset + 4).map(async entry => {
      const path = entry.id ? "/games/" + entry.id : "/games";
      const params = new URLSearchParams({ key: API_KEY });
      if (!entry.id) {
        params.set("search", entry.name);
        params.set("page_size", "5");
      }
      const response = await fetch(BASE_URL + path + "?" + params);
      if (!response.ok) throw new Error("Failed to load trending game");
      const data = await response.json();
      if (entry.id) return data;
      const names = [entry.name, ...(entry.aliases || [])].map(normalizeGameName);
      return data.results?.find(game => names.includes(normalizeGameName(game.name)));
    }));
    batch.forEach(result => { if (result.status === "fulfilled" && result.value?.id) games.push(result.value); });
  }
  const unique = games.filter((game, index) => games.findIndex(item => item.id === game.id) === index);
  if (!unique.length) throw new Error("No trending games available");
  try { sessionStorage.setItem(TRENDING_CACHE_KEY, JSON.stringify({ saved: Date.now(), games: unique })); } catch {}
  return unique;
}
async function getPopularGames() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(TRENDING_CACHE_KEY) || "null");
    if (cached && Date.now() - cached.saved < 3600000 && Array.isArray(cached.games) && cached.games.length) return cached.games;
  } catch {}
  if (!trendingRequest) trendingRequest = fetchTrendingGames().finally(() => { trendingRequest = null; });
  return trendingRequest;
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