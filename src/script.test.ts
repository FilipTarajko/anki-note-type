import {expect, describe, it} from 'vitest';
import {textToSpans, textToWords} from './helpers';

describe('textToWords', () => {
    it('transforms word into 1-elem array', () => {
        expect(textToWords('test')).toStrictEqual(['test']);
    })

    it('transforms string with a few words into 1-elem array', () => {
        expect(textToWords('test a abc')).toStrictEqual(['test', 'a', 'abc']);
    })

    it('works with several instances of ([<)]>/\\ and multiple spaces', ()=>{
        expect(textToWords('test/a/b \\c\\e[a]')).toStrictEqual(['test', 'a', 'b', 'c', 'e', 'a']);
    })

    // TODO
    // it('works with ,:;.\'"', ()=>{
    //     expect(textToWords('test,a:e;g.b\'u"U')).toStrictEqual(['test', 'a', 'b', 'c', 'e', 'a']);
    // })

    // TODO: check if second argument preserves links
})

describe('textToSpans', () => {
    it('transforms a word into a span and knows where next replaceable stuff may begin', () => {
        expect(textToSpans('test', ['test'], 0, 0)).toStrictEqual(["<span id=\'0-0\'>test</span>", 27]);
    })

    it('transforms a string with multiple words into spans and knows where next replaceable stuff may begin', () => {
        expect(textToSpans('test a abc', ['test', 'a', 'abc'], 0, 0)).toStrictEqual(["<span id='0-0'>test</span> <span id='0-1'>a</span> <span id='0-2'>abc</span>", 77]);
    })
})
