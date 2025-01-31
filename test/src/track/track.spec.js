import Track from '../../../src/track/text-track';

describe('Track', () => {
  describe('langComparer', () => {
    it('should compare 2 languages with same length', () => {
      Track.langComparer('ita', 'ita').should.be.true;
      Track.langComparer('ita', 'eng').should.be.false;
      Track.langComparer('ita', 'ItA').should.be.true;
    });

    it('should compare 2 languages with different length', () => {
      Track.langComparer('ita', 'It').should.be.true;
      Track.langComparer('ita', 'it').should.be.true;
      Track.langComparer('it', 'ita').should.be.true;
      Track.langComparer('es', 'ita').should.be.false;
      Track.langComparer('ita', 'es').should.be.false;
    });

    it('should return false if the input lang is empty', () => {
      Track.langComparer('', 'rus').should.be.false;
    });

    it('should compare languages using equality flag', () => {
      Track.langComparer('zh', 'zh', undefined, true).should.be.true;
      Track.langComparer('zh_tw', 'zh', undefined, true).should.be.false;
      Track.langComparer('zh_tw', 'zh', undefined, false).should.be.true;
    });

    it('should compare languages also with the additionalLanguage from the configuration', () => {
      Track.langComparer('zh', 'chi', 'chi', true).should.be.true;
      Track.langComparer('es', 'spa', 'spa', true).should.be.true;
      Track.langComparer('es', 'zh', 'spa', true).should.be.false;
    });
  });
});
