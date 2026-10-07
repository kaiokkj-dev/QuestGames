(() => {
  const button = document.getElementById("pickGame");
  const label = document.getElementById("pickGameLabel");
  const result = document.getElementById("pickerResult");
  const notice = document.getElementById("pickerNotice");
  const image = document.getElementById("pickerImage");
  let selected = null;
  const text = (en, pt) => document.documentElement.lang === "pt-BR" ? pt : en;
  function refresh() {
    const games = [...new Map(QuestLibrary.read().filter(entry => entry.status === "want").map(entry => [String(entry.game.id), entry])).values()];
    if (selected && !games.some(entry => entry.game.id === selected.id)) selected = null;
    result.hidden = !selected;
    button.disabled = !games.length || (games.length === 1 && Boolean(selected));
    label.dataset.i18n = selected ? "picker.again" : "picker.button";
    label.textContent = selected ? text("Pick another", "Sortear novamente") : text("Pick a game", "Sortear um jogo");
    if (!games.length) {
      notice.textContent = text('Mark a game as “Want to play” in the catalog or library to start.', 'Marque um jogo como “Quero jogar” no catálogo ou na biblioteca para começar.');
    } else if (games.length === 1) {
      notice.textContent = selected
        ? text('Only one game is marked as “Want to play”. Add another to get a different suggestion.', 'Só há um jogo marcado como “Quero jogar”. Adicione outro para receber uma sugestão diferente.')
        : text('One game is marked as “Want to play”; it will be your suggestion.', 'Há apenas um jogo marcado como “Quero jogar”; ele será a sugestão.');
    } else if (selected) {
      notice.textContent = text(`Selected: ${selected.name}. Picking from ${games.length} games.`, `Jogo sorteado: ${selected.name}. Sorteio entre ${games.length} jogos.`);
    } else {
      notice.textContent = text(`${games.length} game(s) ready to pick.`, `${games.length} jogo(s) disponíveis para sortear.`);
    }
    if (!selected) return;
    document.getElementById("pickerGameTitle").textContent = selected.name;
    document.getElementById("pickerGameMeta").textContent = [selected.genres?.map(genre => genre.name).slice(0, 3).join(" • "), selected.rating ? text(`Rating: ${selected.rating}/5`, `Avaliação: ${selected.rating}/5`) : null].filter(Boolean).join(" · ");
    document.getElementById("pickerDetails").href = `./game.html?id=${encodeURIComponent(selected.id)}`;
    image.hidden = !selected.background_image;
    if (selected.background_image) image.src = selected.background_image;
    else image.removeAttribute("src");
  }
  button.addEventListener("click", () => {
    selected = QuestLibrary.pick(selected?.id);
    refresh();
  });
  image.addEventListener("error", () => { image.hidden = true; });
  window.addEventListener("quest-library-change", refresh);
  window.addEventListener("storage", refresh);
  document.addEventListener("quest-language-change", refresh);
  refresh();
})();
