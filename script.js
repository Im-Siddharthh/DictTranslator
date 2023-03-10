const dictwrapper = document.querySelector(".dict-wrapper"),
  searchInput = dictwrapper.querySelector("input"),
  volume = dictwrapper.querySelector(".word i"),
  infoText = dictwrapper.querySelector(".dict-info-text"),
  synonyms = dictwrapper.querySelector(".synonyms .list"),
  removeIcon = dictwrapper.querySelector(".dict-search span");
let audio;

function data(result, word) {
  if (result.title) {
    infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
  } else {
    dictwrapper.classList.add("active");
    let definitions = result[0].meanings[0].definitions[0],
      phontetics = `${result[0].meanings[0].partOfSpeech}  /${result[0].phonetics[0].text}/`;
    document.querySelector(".word p").innerText = result[0].word;
    document.querySelector(".word span").innerText = phontetics;
    document.querySelector(".meaning span").innerText = definitions.definition;
    document.querySelector(".example span").innerText = definitions.example;
    audio = new Audio("https:" + result[0].phonetics[0].audio);

    if (definitions.synonyms[0] == undefined) {
      synonyms.parentElement.style.display = "none";
    } else {
      synonyms.parentElement.style.display = "block";
      synonyms.innerHTML = "";
      for (let i = 0; i < 5; i++) {
        let tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[i]},</span>`;
        tag =
          i == 4
            ? (tag = `<span onclick="search('${definitions.synonyms[i]}')">${definitions.synonyms[4]}</span>`)
            : tag;
        synonyms.insertAdjacentHTML("beforeend", tag);
      }
    }
  }
}

function search(word) {
  fetchApi(word);
  searchInput.value = word;
}

function fetchApi(word) {
  dictwrapper.classList.remove("active");
  infoText.style.color = "#000";
  infoText.innerHTML = `Searching the meaning of <span>"${word}"</span>`;
  let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  fetch(url)
    .then((response) => response.json())
    .then((result) => data(result, word))
    .catch(() => {
      infoText.innerHTML = `Can't find the meaning of <span>"${word}"</span>. Please, try to search for another word.`;
    });
}

searchInput.addEventListener("keyup", (e) => {
  let word = e.target.value.replace(/\s+/g, " ");
  if (e.key == "Enter" && word) {
    fetchApi(word);
  }
});

volume.addEventListener("click", () => {
  volume.style.color = "#4D59FB";
  audio.play();
  setTimeout(() => {
    volume.style.color = "#999";
  }, 1000);
});

removeIcon.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  dictwrapper.classList.remove("active");
  infoText.style.color = "#9A9A9A";
  infoText.innerHTML =
    "Type any existing word and press enter to get meaning, example, synonyms, etc.";
});

/////////////////////////////////////-TRANSLATOR-/////////////////////////////////////////////////
const fromText = document.querySelector(".from-text"),
  toText = document.querySelector(".to-text"),
  exchageIcon = document.querySelector(".exchange"),
  selectTag = document.querySelectorAll("select"),
  icons = document.querySelectorAll(".row i");
(translateBtn = document.querySelector("button")),
  selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
      let selected =
        id == 0
          ? country_code == "en-GB"
            ? "selected"
            : ""
          : country_code == "hi-IN"
          ? "selected"
          : "";
      let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
      tag.insertAdjacentHTML("beforeend", option);
    }
  });
exchageIcon.addEventListener("click", () => {
  let tempText = fromText.value,
    tempLang = selectTag[0].value;
  fromText.value = toText.value;
  toText.value = tempText;
  selectTag[0].value = selectTag[1].value;
  selectTag[1].value = tempLang;
});
fromText.addEventListener("keyup", () => {
  if (!fromText.value) {
    toText.value = "";
  }
});
translateBtn.addEventListener("click", () => {
  let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;
  if (!text) return;
  toText.setAttribute("placeholder", "Translating...");
  let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      toText.value = data.responseData.translatedText;
      data.matches.forEach((data) => {
        if (data.id === 0) {
          toText.value = data.translation;
        }
      });
      toText.setAttribute("placeholder", "Translation");
    });
});
icons.forEach((icon) => {
  icon.addEventListener("click", ({ target }) => {
    if (!fromText.value || !toText.value) return;
    if (target.classList.contains("fa-copy")) {
      if (target.id == "from") {
        navigator.clipboard.writeText(fromText.value);
      } else {
        navigator.clipboard.writeText(toText.value);
      }
    } else {
      let utterance;
      if (target.id == "from") {
        utterance = new SpeechSynthesisUtterance(fromText.value);
        utterance.lang = selectTag[0].value;
      } else {
        utterance = new SpeechSynthesisUtterance(toText.value);
        utterance.lang = selectTag[1].value;
      }
      speechSynthesis.speak(utterance);
    }
  });
});
