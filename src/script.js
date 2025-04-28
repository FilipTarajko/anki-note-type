{
  let enablingThemes = ["de", "rde", "het", "rhet", "nl"];
  let divsToReplace = [];
  let divsToReplaceAll = ["frontbox", "backbox", "header", "info"];
  let divsWithLinks = ["source"];

  const vw100 = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh100 = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  let iframe = document.getElementById("iframe");
  let buttonsDiv = document.getElementById("buttons");

  let themeName = document.getElementById("Theme").innerText;

  let link1 = "https://en.m.wiktionary.org/wiki/";
  let link2 = "#Dutch";
  let word = "";
  let fullscreen = false;

  const enablingTheme = (element) => element === themeName;
  if (enablingThemes.some(enablingTheme)) {
    divsToReplace = divsToReplaceAll;
  }

  document.getElementsByClassName("card")[0].id = themeName;

  let buttons = [
    ["Wiktionary", "https://en.m.wiktionary.org/wiki/", "#Dutch", 155],
    ["Reverso", "https://context.reverso.net/translation/dutch-english/", "", 17],
    ["HowToPronounce", "https://www.howtopronounce.com/dutch/", "", 140],
    ["Bing", "https://www.bing.com/search?q=", "", 210],
  ];

  buttonsDiv.insertAdjacentHTML(
    "beforeend",
    `<button id="browser"><a href=${link1 + word.toLowerCase().replace(/[,\.!]/g, "") + link2}>browser</a></button>`
  );

  for (let b = 0; b < buttons.length; b++) {
    buttonsDiv.insertAdjacentHTML(
      "beforeend",
      `<button id=b${b} style="background-color: hsl(${buttons[b][3]}, 100%, 80%);">${buttons[b][0]}</button>`
    );
    document.getElementById(`b${b}`).addEventListener("click", () => {
      link1 = buttons[b][1];
      link2 = buttons[b][2];
      iframe.src = link1 + word.toLowerCase().replace(/[,\.!]/g, "") + link2;
      document.getElementById("browser").innerHTML = `<a href=${link1 + word.toLowerCase().replace(/[,\.!]/g, "") + link2}>browser</a>`;
    });
  }

  buttonsDiv.insertAdjacentHTML("beforeend", `<button id="resize">resize</button>`);

  let defaultIframeStyle = iframe.style;
  let defaultButtonsDivStyle = buttonsDiv.style;

  document.getElementById("resize").addEventListener("click", () => {
    if (fullscreen) {
      // iframe.style = defaultIframeStyle;
      iframe.style = "position: relative; width: 100%; height: 100vh;";
      buttonsDiv.style = defaultButtonsDivStyle;
      iframe.style.height = parseInt(vh100) - 40 - parseInt(document.getElementById("nonIframe").clientHeight) + "px";
    } else {
      buttonsDiv.style.position = "absolute";
      buttonsDiv.style.top = "0px";
      buttonsDiv.style.left = "0px";
      buttonsDiv.style.right = "0px";
      iframe.style.top = "6vmin";
      iframe.style.bottom = "0px";
      iframe.style.left = "0.4vw";
      iframe.style.right = "1vw";
      iframe.style.position = "absolute";
      iframe.style.width = `98vw`;
      iframe.style.height = `${vh100 - Math.min(vw100, vh100) * 0.08}px`; //`calc (100vh - 8vmin)`; //${vh100-40}px
    }
    fullscreen = !fullscreen;
  });

  let divsConcat = divsToReplace.concat(divsWithLinks);
  for (let d = 0; d < divsConcat.length; d++) {
    let textElement = document.getElementById(divsConcat[d]);
    if (!textElement) {
      continue;
    }
    let text = textElement.innerText;

    for (let i = 0; i < text.length; i++) {
      // TEST READY LINKS
      if (d < divsToReplace.length) {
        text = text.replace("/", " ");
      }
      text = text.replace("(", " ");
      text = text.replace(")", " ");
      text = text.replace("<", " ");
      text = text.replace("[", " ");
      text = text.replace(">", " ");
      text = text.replace("]", " ");
      text = text.replace("\\", " ");
      text = text.replace("\n", " ");
      text = text.replace("  ", " ");
      text = text.replace("  ", " ");
    }
    if (text[text.length - 1] == " ") {
      text = text.slice(0, -1);
    }
    let words = text.replace("\xa0", " ").split(" "); //.split('/');

    //textElement.innerText = "";

    let nextStart = 0;

    text = textElement.innerHTML;
    for (let i = 0; i < words.length; i++) {
      let lookingFor = words[i].trim();
      let replaceWith = `<span id='${d}-${i}'>${lookingFor}</span>`;
      let position = 0;
      let otwarcia = 0;
      for (let j = nextStart; j < text.length - lookingFor.length + 1; j++) {
        if (text[j] == "<") {
          otwarcia += 1;
        }
        if (text[j] == ">") {
          otwarcia -= 1;
        }
        if (otwarcia < 1 && text.substr(j, lookingFor.length) == lookingFor) {
          position = j;
          nextStart = j + replaceWith.length + 1;
          break;
        }
      }

      let tablica = text.split("");
      tablica.splice(position, lookingFor.length, replaceWith);
      text = tablica.join("");

      // textElement.innerHTML = textElement.innerHTML.replace(
      //   words[i].trim(),
      //   `<span id='${d}-${i}'>` +
      //     words[i].trim() +
      //     `${i < words.length - 1 ? " " : ""}</span>`
      // );

      // textElement.insertAdjacentHTML(
      //   "beforeend",
      //   `<span id='${d}-${i}'>"` +
      //     words[i] +
      //     `"${i < words.length - 1 ? " " : ""}</span>`
      // );
    }
    textElement.innerHTML = text;

    for (let i = 0; i < words.length; i++) {
      document.getElementById(`${d}-${i}`).addEventListener("click", () => {
        buttonsDiv.style.visibility = "visible";
        iframe.style.visibility = "visible";
        if (d < divsToReplace.length) {
          word = words[i];
          iframe.src = link1 + word.toLowerCase().replace(/[,\.!]/g, "") + link2;
          document.getElementById("browser").innerHTML = `<a href=${link1 + word.toLowerCase().replace(/[,\.!]/g, "") + link2}>browser</a>`;
        } else {
          iframe.src = words[i].replace("youtube.com/watch?v=", "youtube.com/embed/");
          document.getElementById("browser").innerHTML = `<a href=${words[i]}>browser</a>`;
        }
        iframe.style.height = parseInt(vh100) - 40 - parseInt(document.getElementById("nonIframe").clientHeight) + "px";
      });
    }
  }
}

iframe.style.height = parseInt(vh100) - 40 - parseInt(document.getElementById("nonIframe").clientHeight) + "px";
document.body.style.overflow = "hidden";