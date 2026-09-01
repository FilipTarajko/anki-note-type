function tagNameAt(text, ltPos) {
    let i = ltPos + 1;
    if (text[i] === "/") i++;
    let start = i;
    while (i < text.length && /[a-zA-Z0-9]/.test(text[i])) i++;
    return text.slice(start, i);
}

function findMatchingCloseStart(text, openStart) {
    const gt = text.indexOf(">", openStart);
    if (gt === -1) return -1;
    const name = tagNameAt(text, openStart);
    let depth = 1;
    let j = gt + 1;
    while (j < text.length) {
        if (text[j] === "<") {
            const tagEnd = text.indexOf(">", j);
            if (tagEnd === -1) return -1;
            if (tagNameAt(text, j) === name) {
                if (text[j + 1] === "/") {
                    depth--;
                    if (depth === 0) return j;
                } else {
                    depth++;
                }
            }
            j = tagEnd + 1;
        } else {
            j++;
        }
    }
    return -1;
}

function findMatchingOpenEnd(text, closeStart) {
    const name = tagNameAt(text, closeStart);
    let depth = 1;
    let j = closeStart - 1;
    while (j >= 0) {
        if (text[j] === ">") {
            const tagStart = text.lastIndexOf("<", j);
            if (tagStart === -1) return -1;
            if (tagNameAt(text, tagStart) === name) {
                if (text[tagStart + 1] === "/") {
                    depth++;
                } else {
                    depth--;
                    if (depth === 0) return j + 1;
                }
            }
            j = tagStart - 1;
        } else {
            j--;
        }
    }
    return -1;
}

function buildVisibleMap(text, start) {
    let visible = "";
    let map = [];
    let j = start;
    while (j < text.length) {
        if (text[j] === "<") {
            const close = text.indexOf(">", j);
            if (close === -1) break;
            j = close + 1;
            continue;
        }
        visible += text[j];
        map.push(j);
        j++;
    }
    return { visible, map };
}

export function textToSpans(text, words, divNumber, nextStart) {
    for (let i = 0; i < words.length; i++) {
        let lookingFor = words[i].trim();

        const { visible, map } = buildVisibleMap(text, nextStart);
        const visibleIndex = visible.indexOf(lookingFor);
        if (visibleIndex === -1) continue;

        const lastVisibleIndex = visibleIndex + lookingFor.length - 1;
        let rawStart = map[visibleIndex];
        let rawEnd = map[lastVisibleIndex] + 1;

        // Repeatedly absorb adjacent tags in both directions. Each pass can
        // unlock the next (e.g. absorbing an inner </u> lets the outer </b>
        // become adjacent too), so we loop until a full pass changes nothing.
        let changed = true;
        while (changed) {
            changed = false;

            // Backward: adjacent opening tag whose matching close falls at
            // or before our current end -> it wraps only this word (so far).
            if (rawStart > 0 && text[rawStart - 1] === ">") {
                const tagStart = text.lastIndexOf("<", rawStart - 1);
                if (tagStart !== -1 && text[tagStart + 1] !== "/") {
                    const closeStart = findMatchingCloseStart(text, tagStart);
                    if (closeStart !== -1 && closeStart <= rawEnd) {
                        rawStart = tagStart;
                        changed = true;
                    }
                }
            }

            // Forward: adjacent closing tag whose matching open falls at or
            // after our current start -> mirror of the above.
            if (rawEnd < text.length && text[rawEnd] === "<" && text[rawEnd + 1] === "/") {
                const tagEnd = text.indexOf(">", rawEnd);
                const openEnd = findMatchingOpenEnd(text, rawEnd);
                if (tagEnd !== -1 && openEnd !== -1 && openEnd >= rawStart) {
                    rawEnd = tagEnd + 1;
                    changed = true;
                }
            }
        }

        const rawSegment = text.slice(rawStart, rawEnd);
        const replaceWith = `<span id='${divNumber}-${i}'>${rawSegment}</span>`;

        text = text.slice(0, rawStart) + replaceWith + text.slice(rawEnd);
        nextStart = rawStart + replaceWith.length;
    }

    return [text, nextStart + 1];
}

export function textToWords(text, preservesLinks = false) {
  const stripChars = new Set([
    "(",
    ")",
    "<",
    "[",
    ">",
    "]",
    ",",
    ";",
    "'",
    '"',
    "\\",
    "\n",
    ...(preservesLinks ? [] : ["/", ":", ".", "?", "=", "&"]),
  ]);

  // Matches a full HTML entity anchored at the current position:
  // named (&amp;), decimal (&#123;), or hex (&#x1F600;).
  // Sticky flag ('y') means it only matches starting exactly at lastIndex,
  // so we can cheaply test "is there an entity right here?" without
  // scanning the whole remaining string.
  const entityPattern = /&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]{1,31});/y;

  const words = [];
  let current = "";
  let i = 0;

  const pushCurrent = () => {
    if (current) {
      words.push(current);
      current = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === "<") {
      const close = text.indexOf(">", i);
      if (close !== -1) {
        // real tag — removed silently, doesn't split a word
        i = close + 1;
        continue;
      }
    }

    if (ch === "&") {
      entityPattern.lastIndex = i;
      const match = entityPattern.exec(text);
      if (match) {
        // whole entity treated as a separator, like a stripped char —
        // avoids fragmenting it into "lt"/"gt"/"nbsp" etc.
        pushCurrent();
        i += match[0].length;
        continue;
      }
      // not a real entity (stray '&') — falls through to normal handling below
    }

    if (stripChars.has(ch) || /\s/.test(ch)) {
      pushCurrent();
    } else {
      current += ch;
    }
    i++;
  }
  pushCurrent();

  return words;
}

export function cleanWordForLink(word) {
    return word.replace(/[,\.!]/g, "").replace(/-$/, "");
}
