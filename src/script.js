/** todo: why is this in a block */
{
  /** config for which themes to enable word-to-iframe links  */
  const enablingThemes = ["de", "rde", "het", "rhet", "nl", "deu", "der", "die", "das"];

  /** config for which fields to replace into iframe links */
  const divsWithLinks = ["source"];
  const divsToReplaceAll = ["frontbox", "backbox", "header", "info"];
  let divsToReplace = [];

  const iframe = document.getElementById("iframe");
  const buttonsDiv = document.getElementById("buttons");

  /** stuff for styling */
  const vw100 = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const vh100 = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const defaultButtonsDivStyle = buttonsDiv.style;

  const themeName = document.getElementById("Theme").innerText;

  let link1 = "https://en.m.wiktionary.org/wiki/";
  let link2 = "#Dutch";
  let word = "";
  let fullscreen = false;

  if (["deu", "der", "die", "das"].includes(themeName)) {
    link2 = "#German";
  }

  const enablingTheme = (element) => element === themeName;
  if (enablingThemes.some(enablingTheme)) {
    divsToReplace = divsToReplaceAll;
  }

  document.getElementsByClassName("card")[0].id = themeName;

  /**
   * configuration for iframe-websites-visiting buttons
   *
   * format: [buttonLabel, urlPartBeforeWord, urlPartAfterWord, buttonHue]
   * */
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

  /** make resize button resize iframe by overwriting its styling */
  document.getElementById("resize").addEventListener("click", () => {
    if (fullscreen) {
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

    let words = textToWords(text, divsWithLinks.includes(divsConcat[d]));

    /** wrap words into spans, so that event listeners can be added */
    let nextStart = 0;
    [textElement.innerHTML, nextStart] = textToSpans(textElement.innerHTML, words, d, nextStart);

    /** add event listeners to word spans, so that iframe can be opened when a word is pressed */
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