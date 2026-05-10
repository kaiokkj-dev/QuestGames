const gameModal = document.getElementById("gameModal");
const closeModal = document.getElementById("closeModal");

const modalBanner = document.getElementById("modalBanner");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalGenre = document.getElementById("modalGenre");
const modalRating = document.getElementById("modalRating");
const modalReleased = document.getElementById("modalReleased");

function openGameModal(game) {
  gameModal.classList.add("active");

  modalBanner.style.backgroundImage =
    `url(${game.background_image})`;

  modalTitle.textContent = game.name;

  modalDescription.innerHTML =
    game.description_raw.slice(0, 300);

  modalGenre.textContent =
    game.genres.map(g => g.name).join(", ");

  modalRating.textContent =
    `⭐ ${game.rating}`;

  modalReleased.textContent =
    `📅 ${game.released}`;
}

closeModal.addEventListener("click", () => {
  gameModal.classList.remove("active");
});