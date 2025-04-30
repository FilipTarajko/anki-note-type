export function textToSpans(text, words, d, nextStart) {
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

    return [text, nextStart];
}

export function textToWords(text, preservesLinks = false) {
    /** todo: what is this? shouldn't it use replaceAll instead of a loop? */
    for (let i = 0; i < text.length; i++) {
        if (!preservesLinks) {
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
    if (text[text.length - 1] === " ") {
        text = text.slice(0, -1);
    }
    return text.replace("\xa0", " ").split(" "); //.split('/');
}
