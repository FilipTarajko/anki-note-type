import { expect, describe, it } from 'vitest';
import { textToSpans, textToWords, cleanWordForLink } from './helpers';

describe('textToWords', () => {
    it('transforms word into 1-elem array', () => {
        expect(textToWords('test')).toStrictEqual(['test']);
    })

    it('transforms string with a few words into 1-elem array', () => {
        expect(textToWords('test a abc')).toStrictEqual(['test', 'a', 'abc']);
    })

    it('works with several instances of ([<)]>/\\ and multiple spaces and non-breaking spaces', () => {
        expect(textToWords('test/a/b\xa0\xa0     \\c\\e[(a]c')).toStrictEqual(['test', 'a', 'b', 'c', 'e', 'a', 'c']);
    })

    it('handles whitespace present at first and last position', () => {
        expect(textToWords(' a ')).toStrictEqual(['a']);
    })

    it('doesn\'t run terribly slowly', () => {
        const startTime = Date.now();

        for (let i = 0; i < 10000; i++) {
            textToWords('test/a/b \\c\\e[a] test/a/b \\c\\e[a] test/a/b');
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        console.log(totalTime + 'ms')
        expect((endTime - startTime) < 250).toBe(true);
    })

    it('doesn\'t preserve links if second arg is false or not specified', () => {
        const someUrl = 'https://www.someWebsite.com/watch?v=LPd8jEujXpw'
        const expectedResult = [
            "https",
            "www",
            "someWebsite",
            "com",
            "watch",
            "v",
            "LPd8jEujXpw",
        ]
        expect(textToWords(someUrl)).toStrictEqual(expectedResult);
        expect(textToWords(someUrl, false)).toStrictEqual(expectedResult);
    })

    it('preserves links in second arg is true', () => {
        const someUrl = 'https://www.someWebsite.com/watch?v=LPd8jEujXpw'
        expect(textToWords(someUrl, true)).toStrictEqual([someUrl]);
    })

    it('works with ,:;.\'"', () => {
        expect(textToWords('test,a:e;g.b\'u"U')).toStrictEqual(['test', 'a', 'e', 'g', 'b', 'u', 'U']);
    })

    it('handles <b> tags properly', () => {
        expect(textToWords('<b>test</b>')).toStrictEqual(['test']);
    })

    it('handles <b> tags properly, even if inside a word', () => {
        expect(textToWords('t<b>es</b>t')).toStrictEqual(['test']);
    })

    it('handles german letters properly', () => {
        expect(textToWords('der Bruder (die Brüder) üÄÜäëËß')).toStrictEqual(['der', 'Bruder', 'die', 'Brüder', 'üÄÜäëËß']);
    })

    it('handles commas after {{sth}} (cloze) correctly', () => {
        expect(textToWords('{{sth}}, b')).toStrictEqual(['{{sth}}', 'b']);
    })
})

describe('textToSpans', () => {
    it('transforms a word into a span and knows where next replaceable stuff may begin', () => {
        expect(textToSpans('test', ['test'], 0, 0)).toStrictEqual(["<span id=\'0-0\'>test</span>", 27]);
    })

    it('respects divNumber', () => {
        expect(textToSpans('test', ['test'], 1, 0)).toStrictEqual(["<span id=\'1-0\'>test</span>", 27]);
    })

    it('transforms a string with multiple words into spans and knows where next replaceable stuff may begin', () => {
        expect(textToSpans('test a abc', ['test', 'a', 'abc'], 0, 0)).toStrictEqual(["<span id='0-0'>test</span> <span id='0-1'>a</span> <span id='0-2'>abc</span>", 77]);
    })

    it('handles <b> tags properly', () => {
        expect(textToSpans('<b>test</b>', textToWords('<b>test</b>'), 0, 0))
            .toStrictEqual([
                "<span id='0-0'><b>test</b></span>",
                34, // todo: shouldn't it actually be higher?
            ]);
    })

    it('handles german letters properly', () => {
        expect(textToSpans('der Bruder (die Brüder) üÄÜäëËß', ['der', 'Bruder', 'die', 'Brüder', 'üÄÜäëËß'], 0, 0)[0]).toStrictEqual("<span id='0-0'>der</span> <span id='0-1'>Bruder</span> (<span id='0-2'>die</span> <span id='0-3'>Brüder</span>) <span id='0-4'>üÄÜäëËß</span>");
    })

    it('handles commas after {{sth}} (cloze) correctly', () => {
        expect(textToSpans('{{sth}}, b', 0, 0)[0]).toStrictEqual('{{sth}}, b');
    })

    // TODO: textToSpans doesn't support tags inside of words, eg tes<b>t</b> won't work

    it('handles tags inside of words', () => {
        expect(
            textToSpans('<u>A</u>lgemene <u>I</u>nlichtingen- en <u>V</u>eiligheids<u>d</u>ienst',
                textToWords('<u>A</u>lgemene <u>I</u>nlichtingen- en <u>V</u>eiligheids<u>d</u>ienst'),
                0,
                0
            )).toStrictEqual([
                "<span id='0-0'><u>A</u>lgemene</span> <span id='0-1'><u>I</u>nlichtingen-</span> <span id='0-2'>en</span> <span id='0-3'><u>V</u>eiligheids<u>d</u>ienst</span>",
                160,
            ]);
    })

    it('handles tag containing last letter of the last word', () => {
        expect(
            textToSpans('<u>c</u>yan <u>m</u>agenta <u>y</u>ellow blac<u>k</u>',
                textToWords('<u>c</u>yan <u>m</u>agenta <u>y</u>ellow blac<u>k</u>'),
                0,
                0,
            ),
        ).toStrictEqual([
            "<span id='0-0'><u>c</u>yan</span> <span id='0-1'><u>m</u>agenta</span> <span id='0-2'><u>y</u>ellow</span> <span id='0-3'>blac<u>k</u></span>",
            142
        ]);
    })

    it('handles nested tags', () => {
        expect(textToSpans("<b><u>test</u></b>", textToWords("<b><u>test</u></b>"), 0, 0)).toStrictEqual([
          "<span id='0-0'><b><u>test</u></b></span>",
          41,
        ]);
    })

    it("handles long text", () => {
      expect(
        textToSpans(
          "<b><u>test</u></b> handles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tags",
          textToWords(
            "<b><u>test</u></b> handles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tagshandles nested tags",
          ),
          0,
          0,
        ),
      ).toStrictEqual([
        "<span id='0-0'><b><u>test</u></b></span> <span id='0-1'>handles</span> <span id='0-2'>nested</span> <span id='0-3'>tagshandles</span> <span id='0-4'>nested</span> <span id='0-5'>tagshandles</span> <span id='0-6'>nested</span> <span id='0-7'>tagshandles</span> <span id='0-8'>nested</span> <span id='0-9'>tagshandles</span> <span id='0-10'>nested</span> <span id='0-11'>tagshandles</span> <span id='0-12'>nested</span> <span id='0-13'>tagshandles</span> <span id='0-14'>nested</span> <span id='0-15'>tagshandles</span> <span id='0-16'>nested</span> <span id='0-17'>tagshandles</span> <span id='0-18'>nested</span> <span id='0-19'>tagshandles</span> <span id='0-20'>nested</span> <span id='0-21'>tagshandles</span> <span id='0-22'>nested</span> <span id='0-23'>tagshandles</span> <span id='0-24'>nested</span> <span id='0-25'>tagshandles</span> <span id='0-26'>nested</span> <span id='0-27'>tagshandles</span> <span id='0-28'>nested</span> <span id='0-29'>tagshandles</span> <span id='0-30'>nested</span> <span id='0-31'>tagshandles</span> <span id='0-32'>nested</span> <span id='0-33'>tagshandles</span> <span id='0-34'>nested</span> <span id='0-35'>tagshandles</span> <span id='0-36'>nested</span> <span id='0-37'>tagshandles</span> <span id='0-38'>nested</span> <span id='0-39'>tagshandles</span> <span id='0-40'>nested</span> <span id='0-41'>tagshandles</span> <span id='0-42'>nested</span> <span id='0-43'>tagshandles</span> <span id='0-44'>nested</span> <span id='0-45'>tagshandles</span> <span id='0-46'>nested</span> <span id='0-47'>tagshandles</span> <span id='0-48'>nested</span> <span id='0-49'>tagshandles</span> <span id='0-50'>nested</span> <span id='0-51'>tagshandles</span> <span id='0-52'>nested</span> <span id='0-53'>tagshandles</span> <span id='0-54'>nested</span> <span id='0-55'>tagshandles</span> <span id='0-56'>nested</span> <span id='0-57'>tags</span>",
        1876,
      ]);
    });

    it("handles text with tags between &lt; and &gt;", ()=>{
        expect(
          textToSpans(
            "AIVD...<br>type P = ReturnType&lt;<u>typeof</u>&nbsp;f&gt;",
            textToWords("AIVD...<br>type P = ReturnType&lt;<u>typeof</u>&nbsp;f&gt;"),
            0,
            0,
          ),
        ).toStrictEqual([
          "<span id='0-0'>AIVD</span>...<br><span id='0-1'>type</span> <span id='0-2'>P</span> = <span id='0-3'>ReturnType</span>&lt;<span id='0-4'><u>typeof</u></span>&nbsp;<span id='0-5'>f</span>&gt;",
          187,
        ]);
    });
})

describe('cleanWordForLink', () => {
    it('returns simple words as-is', () => {
        expect(cleanWordForLink('abc')).toBe('abc');
    })

    it('removes commas, dots, exclamation marks', () => {
        expect(cleanWordForLink(',.!a,.!c,.!e,.!')).toBe('ace');
    })

    it('removes hyphen at the end', () => {
        expect(cleanWordForLink('inlichtingen-')).toBe('inlichtingen');
    })

    it('preserves hyphen inside the end', () => {
        expect(cleanWordForLink('aan-uitknop')).toBe('aan-uitknop');
    })
})
