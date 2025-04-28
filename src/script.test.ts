import {expect, describe, it} from 'vitest';
import {textToSpans} from './helpers';

describe('textToSpans', () => {
    it('transforms a word into a span', () => {
        expect(textToSpans('test', ['test'], 0, 0)).toBe("<span id=\'0-0\'>test</span>");
    })

    it('transforms a string with multiple words into spans', () => {
        expect(textToSpans('test a abc', ['test', 'a', 'abc'], 0, 0)).toBe("<span id='0-0'>test</span> <span id='0-1'>a</span> <span id='0-2'>abc</span>");
    })
})