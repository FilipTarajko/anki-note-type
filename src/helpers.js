export function textToSpans(text, words, divNumber, nextStart) {
    for (let i = 0; i < words.length; i++) {
        let lookingFor = words[i].trim();
        let replaceWith = `<span id='${divNumber}-${i}'>${lookingFor}</span>`;
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
        //   `<span id='${divNumber}-${i}'>` +
        //     words[i].trim() +
        //     `${i < words.length - 1 ? " " : ""}</span>`
        // );

        // textElement.insertAdjacentHTML(
        //   "beforeend",
        //   `<span id='${divNumber}-${i}'>"` +
        //     words[i] +
        //     `"${i < words.length - 1 ? " " : ""}</span>`
        // );
    }

    return [text, nextStart];
}

export function textToWords(text, preservesLinks = false) {
    // get rid of html tag openings/closings
    text = text.replaceAll(/<[^>]*>/g, " ")

    // remove some special chars unless links are to be preserved
    if (!preservesLinks) {
        // regex solution caused issues on AnkiDroid, so multiple replaceAll calls are used instead
        text = text.replaceAll("/", " ")
            .replaceAll(":", " ")
            .replaceAll(".", " ")
            .replaceAll("?", " ")
            .replaceAll("=", " ")
            .replaceAll("&", " ");
    }

    // regex solution caused issues on AnkiDroid, so multiple replaceAll calls are used instead
    text = text.replaceAll("(", " ")
        .replaceAll(")", " ")
        .replaceAll("<", " ")
        .replaceAll("[", " ")
        .replaceAll(">", " ")
        .replaceAll("]", " ")
        .replaceAll(",", " ")
        .replaceAll(";", " ")
        .replaceAll("'", " ")
        .replaceAll('"', " ")
        .replaceAll("\\", " ")
        .replaceAll("\n", " ");

    // remove consecutive whitespace chars, replace all whitespace with spaces
    text = text.replaceAll(/\s+/g, " ");

    // remove first char if space
    if (text[0] === " ") {
        text = text.slice(1);
    }

    // remove last char if space
    if (text[text.length - 1] === " ") {
        text = text.slice(0, -1);
    }

    // return anything left that isn't a space
    return text.split(" ");
}
