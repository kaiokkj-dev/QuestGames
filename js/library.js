const QuestLibrary = (() => {
  const key = "quest-library";
  const statuses = ["want", "playing", "played"];
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value.filter(item => item?.game?.id && statuses.includes(item.status)) : [];
    } catch { return []; }
  }
  function set(game, status) {
    if (status && !statuses.includes(status)) return;
    const entries = read().filter(item => item.game.id !== game.id);
    if (status) entries.push({ game, status });
    localStorage.setItem(key, JSON.stringify(entries));
    window.dispatchEvent(new Event("quest-library-change"));
  }
  function status(id) { return read().find(item => item.game.id === id)?.status || ""; }
  function pick(previousId = null, random = Math.random) {
    const unique = new Map(read().filter(item => item.status === "want").map(item => [String(item.game.id), item.game]));
    const games = [...unique.values()];
    const alternatives = games.length > 1 ? games.filter(game => String(game.id) !== String(previousId)) : games;
    return alternatives.length ? alternatives[Math.floor(random() * alternatives.length)] : null;
  }
  return { read, set, status, pick };
})();
