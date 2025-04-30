import {expect, describe, it} from 'vitest';
import {textToSpans, textToWords} from './helpers';

describe('textToWords', () => {
    it('transforms word into 1-elem array', () => {
        expect(textToWords('test')).toStrictEqual(['test']);
    })

    it('transforms string with a few words into 1-elem array', () => {
        expect(textToWords('test a abc')).toStrictEqual(['test', 'a', 'abc']);
    })

    it('works with several instances of ([<)]>/\\ and multiple spaces and non-breaking spaces', ()=>{
        expect(textToWords('test/a/b\xa0\xa0     \\c\\e[a] ')).toStrictEqual(['test', 'a', 'b', 'c', 'e', 'a']);
    })

    it('it doesn\'t run terribly slowly', ()=>{
        const startTime = Date.now();

        for (let i=0; i<10000; i++) {
            textToWords('test/a/b \\c\\e[a] test/a/b \\c\\e[a] test/a/b');
        }

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        console.log(totalTime + 'ms')
        expect((endTime - startTime) < 250).toBe(true);
    })

    // TODO: check if second argument preserves links

    // TODO
    // it('works with ,:;.\'"', ()=>{
    //     expect(textToWords('test,a:e;g.b\'u"U')).toStrictEqual(['test', 'a', 'b', 'c', 'e', 'a']);
    // })
})

describe('textToSpans', () => {
    it('transforms a word into a span and knows where next replaceable stuff may begin', () => {
        expect(textToSpans('test', ['test'], 0, 0)).toStrictEqual(["<span id=\'0-0\'>test</span>", 27]);
    })

    it('transforms a string with multiple words into spans and knows where next replaceable stuff may begin', () => {
        expect(textToSpans('test a abc', ['test', 'a', 'abc'], 0, 0)).toStrictEqual(["<span id='0-0'>test</span> <span id='0-1'>a</span> <span id='0-2'>abc</span>", 77]);
    })
})
