const DEFAULT_LANGUAGE = "en";

async function loadTranslations(language) {
  const response = await fetch(`./locales/${language}.json`);
  if (!response.ok) {
    throw new Error(`Could not load ${language} translations`);
  }
  return response.json();
}
function getNestedTranslation(translations, key) {
  return key.split(".").reduce((obj, part) => obj?.[part], translations);
}
async function setLanguage(language) {
  try {
    const translations = await loadTranslations(language);
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      const translation = getNestedTranslation(translations, key);
      if (translation) {
        element.textContent = translation;
      }
    });
    localStorage.setItem("nebula-language", language);
    document.documentElement.lang = language;
  } catch (error) {
    console.error(error);
  }
}
function setupLanguageButtons() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const savedLanguage = localStorage.getItem("nebula-language") || DEFAULT_LANGUAGE;
  setLanguage(savedLanguage);
  setupLanguageButtons();
});