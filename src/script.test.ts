import {expect, describe, it} from 'vitest';
import {textToSpans, textToWords} from './helpers';

describe('textToWords', () => {
    it('transforms word into 1-elem array', () => {
        expect(textToWords('test')).toStrictEqual(['test']);
    })

    it('transforms string with a few words into 1-elem array', () => {
        expect(textToWords('test a abc')).toStrictEqual(['test', 'a', 'abc']);
    })
})

describe('textToSpans', () => {
    it('transforms a word into a span', () => {
        expect(textToSpans('test', ['test'], 0, 0)[0]).toBe("<span id=\'0-0\'>test</span>");
    })

    it('transforms a string with multiple words into spans', () => {
        expect(textToSpans('test a abc', ['test', 'a', 'abc'], 0, 0)[0]).toBe("<span id='0-0'>test</span> <span id='0-1'>a</span> <span id='0-2'>abc</span>");
    })
})
