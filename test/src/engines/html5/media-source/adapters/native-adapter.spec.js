import NativeAdapter from '../../../../../../src/engines/html5/media-source/adapters/native-adapter';
import VideoTrack from '../../../../../../src/track/video-track';
import AudioTrack from '../../../../../../src/track/audio-track';
import TextTrack from '../../../../../../src/track/text-track';
import {RequestType} from '../../../../../../src/enums/request-type';
import {removeVideoElementsFromTestPage} from '../../../../utils/test-utils';
import sourcesConfig from '../../../../configs/sources.json';
import * as Utils from '../../../../../../src/utils/util';
import Env from '../../../../../../src/utils/env';
import {CustomEventType, Html5EventType} from '../../../../../../src/event/event-type';
import Error from '../../../../../../src/error/error';
import {DrmScheme} from '../../../../../../src/drm/drm-scheme';

describe('NativeAdapter: isSupported', () => {
  it('should be supported', () => {
    NativeAdapter.isSupported().should.be.true;
  });
});

describe('NativeAdapter: canPlayType', () => {
  let video;

  before(() => {
    video = document.createElement('video');
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should return video/mp4 support', () => {
    NativeAdapter.canPlayType('video/mp4').should.equal(!!video.canPlayType('video/mp4'));
  });

  it('should return video/ogg support', () => {
    NativeAdapter.canPlayType('video/ogg').should.equal(!!video.canPlayType('video/ogg'));
  });

  it('should return application/x-mpegURL support', () => {
    NativeAdapter.canPlayType('application/x-mpegURL').should.equal(!!video.canPlayType('application/x-mpegURL'));
  });

  it('should return application/x-mpegURL not supported if preferNative equals false', () => {
    NativeAdapter.canPlayType('application/x-mpegURL', false).should.be.false;
  });

  it('should return false for unsupported mime type', () => {
    NativeAdapter.canPlayType('someType').should.be.false;
  });

  it('should return false for no mime type', () => {
    NativeAdapter.canPlayType().should.be.false;
  });
});

describe('NativeAdapter: canPlayDrm', () => {
  const fpDrmData = [{licenseUrl: 'LICENSE_URL', scheme: DrmScheme.FAIRPLAY}];

  it('should return true for fairplay data if configured', function () {
    NativeAdapter.canPlayDrm(fpDrmData, {keySystem: DrmScheme.FAIRPLAY}).should.be.true;
    NativeAdapter.canPlayDrm(fpDrmData, {}).should.be.false;
  });
});

describe('NativeAdapter: createAdapter', () => {
  let video;
  let nativeInstance;

  before(() => {
    video = document.createElement('video');
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  beforeEach(() => {
    nativeInstance = NativeAdapter.createAdapter(video, {url: 'url3'}, {sources: {}});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  it('should create all native adapter properties', () => {
    nativeInstance._config.should.exist;
    nativeInstance._videoElement.should.exist;
    nativeInstance._sourceObj.should.exist;
  });
});

describe('NativeAdapter: constructor', () => {
  let video;
  let nativeInstance;

  before(() => {
    video = document.createElement('video');
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  beforeEach(() => {
    nativeInstance = new NativeAdapter(video, {url: 'url3'}, {sources: {}});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  it('should create all native adapter properties', () => {
    nativeInstance._config.should.exist;
    nativeInstance._videoElement.should.exist;
    nativeInstance._sourceObj.should.exist;
  });
});

describe('NativeAdapter: attach detach', function () {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should save the current time to detach state', () => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
    video.play().then(() => {
      video.currentTime = 2;

      nativeInstance.detachMediaSource();
      (nativeInstance._lastTimeDetach === 2).should.be.true;
      isNaN(nativeInstance._startTimeAttach).should.be.true;
    });
  });

  it('should save the current time to attach state', () => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
    video.play().then(() => {
      video.currentTime = 2;

      nativeInstance.detachMediaSource();
      (nativeInstance._lastTimeDetach === 2).should.be.true;
      isNaN(nativeInstance._startTimeAttach).should.be.true;

      nativeInstance.attachMediaSource();
      isNaN(nativeInstance._lastTimeDetach).should.be.true;
      (nativeInstance._startTimeAttach === 2).should.be.true;
    });
  });

  it('should clear the internal values of detach after destory', () => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.UnknownMimetype.progressive[0], {sources: {}});
    video.play().then(() => {
      video.currentTime = 2;

      nativeInstance.detachMediaSource();
      nativeInstance.destroy().then(() => {
        isNaN(nativeInstance._lastTimeDetach).should.be.true;
        isNaN(nativeInstance._startTimeAttach).should.be.true;
      });
    });
  });

  it('should clear the internal values of attach after destory', () => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.UnknownMimetype.progressive[0], {sources: {}});
    video.play().then(() => {
      video.currentTime = 2;

      nativeInstance.detachMediaSource();
      nativeInstance.attachMediaSource();
      nativeInstance.destroy().then(() => {
        isNaN(nativeInstance._lastTimeDetach).should.be.true;
        isNaN(nativeInstance._startTimeAttach).should.be.true;
      });
    });
  });
});

describe('NativeAdapter: _isProgressivePlayback', function () {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should return true for mp4', () => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
    nativeInstance._isProgressivePlayback().should.be.true;
  });

  it('should return false for non mp4', () => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.UnknownMimetype.progressive[0], {sources: {}});
    nativeInstance._isProgressivePlayback().should.be.false;
  });
});

describe('NativeAdapter: load', function () {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should success', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
    nativeInstance.load().then(() => {
      done();
    });
  });

  it('should failed', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.CorruptedUrl.progressive[0], {sources: {}});
    video.addEventListener(Html5EventType.ERROR, e => {
      nativeInstance.handleMediaError(e);
    });
    nativeInstance.load().catch(error => {
      error.should.be.exist;
      done();
    });
  });
});

describe('NativeAdapter: _setProgressiveSource', function () {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
    document.body.appendChild(video);
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should replace _sourceObj', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.MultipleSources.progressive[1], {sources: sourcesConfig.MultipleSources});
    nativeInstance.load().then(() => {
      nativeInstance._sourceObj.id.should.equal('id1');
      done();
    });
  });

  it('should not replace _sourceObj', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.MultipleSources.progressive[0], {sources: sourcesConfig.MultipleSources});
    nativeInstance.load().then(() => {
      nativeInstance._sourceObj.id.should.equal('id1');
      done();
    });
  });
});

describe('NativeAdapter: destroy', function () {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(function () {
    removeVideoElementsFromTestPage();
  });

  it('should destroyed', done => {
    nativeInstance.load().then(() => {
      nativeInstance._loadPromise.should.be.exist;
      Utils.Object.isEmptyObject(nativeInstance._sourceObj).should.be.false;
      nativeInstance._liveDurationChangeInterval = 20;
      nativeInstance.destroy().then(() => {
        (!nativeInstance._loadPromise).should.be.true;
        (!nativeInstance._sourceObj).should.be.true;
        nativeInstance._liveEdge.should.equal(0);
        (!nativeInstance._liveDurationChangeInterval).should.be.true;
        done();
      });
    });
  });
});

describe('NativeAdapter: _getParsedTracks', function () {
  let video;
  let track1;
  let track2;
  let track3;
  let track4;
  let track5;
  let nativeInstance;

  before(() => {
    track1 = document.createElement('track');
    track2 = document.createElement('track');
    track3 = document.createElement('track');
    track4 = document.createElement('track');
    track5 = document.createElement('track');
    track1.kind = 'subtitles';
    track1.label = 'English';
    track1.default = true;
    track2.kind = 'captions';
    track2.srclang = 'fr';
    track3.kind = 'metadata';
    track4.kind = 'captions';
    track5.kind = 'captions';
  });

  beforeEach(() => {
    video = document.createElement('video');
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.MultipleSources.progressive[0], {
      sources: sourcesConfig.MultipleSources,
      text: {enableCEA708Captions: true, captionsTextTrack1Label: ''}
    });
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should return the parsed tracks', done => {
    video.appendChild(track1);
    video.appendChild(track2);
    nativeInstance.load().then(data => {
      let videoTracksLength = 2;
      let audioTracksLength = video.audioTracks ? video.audioTracks.length : 0;
      let textTracksLength = video.textTracks ? video.textTracks.length : 0;
      let totalTracksLength = videoTracksLength + audioTracksLength + textTracksLength;
      data.tracks.length.should.be.equal(totalTracksLength);
      data.tracks.map(track => {
        if (track instanceof VideoTrack) {
          track.id.should.equal(sourcesConfig.MultipleSources.progressive[track.index].id);
          track.active.should.equal(track.id === nativeInstance._sourceObj.id);
          track.width.should.equal(sourcesConfig.MultipleSources.progressive[track.index].width);
          track.height.should.equal(sourcesConfig.MultipleSources.progressive[track.index].height);
          track.bandwidth.should.equal(sourcesConfig.MultipleSources.progressive[track.index].bandwidth);
        }
        if (track instanceof AudioTrack) {
          track.id.should.equal(video.audioTracks[track.index].id);
          track.active.should.equal(video.audioTracks[track.index].enabled);
          track.label.should.equal(video.audioTracks[track.index].label);
          track.language.should.equal(video.audioTracks[track.index].language);
        }
        if (track instanceof TextTrack) {
          track.kind.should.equal(video.textTracks[track.index].kind);
          track.active.should.equal(video.textTracks[track.index].mode === 'showing');
          if (video.textTracks[track.index].label) {
            track.label.should.equal(video.textTracks[track.index].label);
          } else {
            track.label.should.equal(video.textTracks[track.index].language);
          }
          track.language.should.equal(video.textTracks[track.index].language);
        }
      });
      done();
    });
  });

  it('should not return parsed metadata track', done => {
    video.appendChild(track1);
    video.appendChild(track2);
    video.appendChild(track3);
    nativeInstance.load().then(data => {
      video.textTracks.length.should.equal(3);
      data.tracks.filter(track => track instanceof TextTrack).length.should.be.equal(2);
      done();
    });
  });

  it('should not parsed captions track', done => {
    video.appendChild(track1);
    video.appendChild(track2);
    nativeInstance._config.enableCEA708Captions = false;
    nativeInstance.load().then(data => {
      video.textTracks.length.should.equal(2);
      data.tracks.filter(track => track instanceof TextTrack).length.should.be.equal(1);
      done();
    });
  });

  it('should use the configured labels and language for captions track', done => {
    video.appendChild(track4);
    video.appendChild(track5);
    nativeInstance._config.captionsTextTrack1Label = 'l1';
    nativeInstance._config.captionsTextTrack1LanguageCode = 'c1';
    nativeInstance._config.captionsTextTrack2Label = 'l2';
    nativeInstance._config.captionsTextTrack2LanguageCode = 'c2';
    nativeInstance.load().then(data => {
      let textTracks = data.tracks.filter(track => track instanceof TextTrack);
      textTracks[0].label.should.equal('l1');
      textTracks[0].language.should.equal('c1');
      textTracks[1].label.should.equal('l2');
      textTracks[1].language.should.equal('c2');
      done();
    });
  });

  it('should return only progressive video tracks before loading', () => {
    let tracks = nativeInstance._getParsedTracks();
    tracks.length.should.be.equal(2);
  });
});

describe('NativeAdapter: _selectProgressiveVideoTrack', function () {
  let video;
  let nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.MultipleSources.progressive[1], {sources: sourcesConfig.MultipleSources});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should select a new video track', done => {
    nativeInstance.load().then(() => {
      nativeInstance.addEventListener(CustomEventType.VIDEO_TRACK_CHANGED, event => {
        event.payload.selectedVideoTrack.index.should.equal(0);
        nativeInstance._videoElement.currentTime.should.equal(2);
        nativeInstance._videoElement.paused.should.be.true;
        done();
      });
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[1].url) > -1).should.be.true;
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[0].url) > -1).should.be.false;
      nativeInstance._videoElement.currentTime = 2;
      nativeInstance._selectProgressiveVideoTrack(new VideoTrack({index: 0}));
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[1].url) > -1).should.be.false;
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[0].url) > -1).should.be.true;
    });
  });

  it('should not change the selected for non exist video track', done => {
    nativeInstance.load().then(() => {
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[1].url) > -1).should.be.true;
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[0].url) > -1).should.be.false;
      nativeInstance._selectProgressiveVideoTrack(new VideoTrack({index: 2}));
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[1].url) > -1).should.be.true;
      (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[0].url) > -1).should.be.false;
      done();
    });
  });
});

describe('NativeAdapter: selectVideoTrack - progressive', function () {
  let video;
  let nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.MultipleSources.progressive[1], {sources: sourcesConfig.MultipleSources});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should select a new video track', done => {
    nativeInstance.load().then(() => {
      try {
        (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[1].url) > -1).should.be.true;
        (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[0].url) > -1).should.be.false;
        nativeInstance.selectVideoTrack(new VideoTrack({index: 0}));
        setTimeout(() => {
          (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[1].url) > -1).should.be.false;
          (nativeInstance._videoElement.src.indexOf(sourcesConfig.MultipleSources.progressive[0].url) > -1).should.be.true;
          done();
        });
      } catch (error) {
        done(error);
      }
    });
  });
});

describe('NativeAdapter: selectAudioTrack', function () {
  let video;
  let nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should select a new audio track', done => {
    nativeInstance.load().then(() => {
      if (nativeInstance._videoElement.audioTracks) {
        nativeInstance.addEventListener(CustomEventType.AUDIO_TRACK_CHANGED, event => {
          event.payload.selectedAudioTrack.index.should.equal(2);
          done();
        });
        nativeInstance._videoElement.audioTracks[0].enabled.should.be.true;
        nativeInstance._videoElement.audioTracks[1].enabled.should.be.false;
        nativeInstance._videoElement.audioTracks[2].enabled.should.be.false;
        nativeInstance.selectAudioTrack(new AudioTrack({index: 2}));
        nativeInstance._videoElement.audioTracks[0].enabled.should.be.false;
        nativeInstance._videoElement.audioTracks[1].enabled.should.be.false;
        nativeInstance._videoElement.audioTracks[2].enabled.should.be.true;
      } else {
        done();
      }
    });
  });

  it('should not change the selected audio track', done => {
    nativeInstance.load().then(() => {
      if (nativeInstance._videoElement.audioTracks) {
        nativeInstance._videoElement.audioTracks[0].enabled.should.be.true;
        nativeInstance._videoElement.audioTracks[1].enabled.should.be.false;
        nativeInstance._videoElement.audioTracks[2].enabled.should.be.false;
        nativeInstance.selectAudioTrack(new AudioTrack({index: 0}));
        nativeInstance._videoElement.audioTracks[0].enabled.should.be.true;
        nativeInstance._videoElement.audioTracks[1].enabled.should.be.false;
        nativeInstance._videoElement.audioTracks[2].enabled.should.be.false;
      }
      done();
    });
  });

  it('should not change the selected for non exist audio track', done => {
    nativeInstance.load().then(() => {
      if (nativeInstance._videoElement.audioTracks) {
        nativeInstance._videoElement.audioTracks[0].enabled.should.be.true;
        nativeInstance._videoElement.audioTracks[1].enabled.should.be.false;
        nativeInstance._videoElement.audioTracks[2].enabled.should.be.false;
        nativeInstance.selectAudioTrack(new AudioTrack({index: 3}));
        nativeInstance._videoElement.audioTracks[0].enabled.should.be.true;
        nativeInstance._videoElement.audioTracks[1].enabled.should.be.false;
        nativeInstance._videoElement.audioTracks[2].enabled.should.be.false;
      }
      done();
    });
  });
});

describe('NativeAdapter: selectTextTrack', function () {
  let video;
  let track1;
  let track2;
  let track3;
  let nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
    track1 = document.createElement('track');
    track2 = document.createElement('track');
    track3 = document.createElement('track');
    track1.kind = 'subtitles';
    track1.label = 'English';
    track1.default = true;
    track1.srclang = 'en';
    track2.kind = 'metadata';
    track3.kind = 'subtitles';
    track3.srclang = 'fr';
    video.appendChild(track1);
    video.appendChild(track2);
    video.appendChild(track3);
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should select a new subtitles track', done => {
    const onTextTrackChanged = event => {
      nativeInstance.removeEventListener(CustomEventType.TEXT_TRACK_CHANGED, onTextTrackChanged);
      event.payload.selectedTextTrack.language.should.equal('fr');
      done();
    };
    nativeInstance
      .load()
      .then(() => {
        if (nativeInstance._videoElement.textTracks) {
          nativeInstance.addEventListener(CustomEventType.TEXT_TRACK_CHANGED, onTextTrackChanged);
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
          nativeInstance.selectTextTrack(nativeInstance._playerTracks[1]);
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('hidden');
        } else {
          done();
        }
      })
      .catch(() => {
        done();
      });
  });

  it('should select a new captions track', done => {
    const onTextTrackChanged = event => {
      nativeInstance.removeEventListener(CustomEventType.TEXT_TRACK_CHANGED, onTextTrackChanged);
      event.payload.selectedTextTrack.language.should.equal('fr');
      done();
    };
    nativeInstance
      .load()
      .then(() => {
        if (nativeInstance._videoElement.textTracks) {
          nativeInstance.addEventListener(CustomEventType.TEXT_TRACK_CHANGED, onTextTrackChanged);
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
          nativeInstance.selectTextTrack(nativeInstance._playerTracks[1]);
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('hidden');
        } else {
          done();
        }
      })
      .catch(() => {
        done();
      });
  });

  it('should not change the selected text track', done => {
    nativeInstance
      .load()
      .then(() => {
        if (nativeInstance._videoElement.textTracks) {
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
          nativeInstance.selectTextTrack(nativeInstance._playerTracks[0]);
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('hidden');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
        }
        done();
      })
      .catch(e => {
        done(new Error(e));
      });
  });

  it('should not change the selected for non exist text track', done => {
    nativeInstance
      .load()
      .then(() => {
        if (nativeInstance._videoElement.textTracks) {
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
          nativeInstance.selectTextTrack(new TextTrack({kind: 'subtitles'}));
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
        }
        done();
      })
      .catch(e => {
        done(e);
      });
  });

  it('should not change the selected for metadata text track', done => {
    nativeInstance
      .load()
      .then(() => {
        if (nativeInstance._videoElement.textTracks) {
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
          nativeInstance.selectTextTrack(new TextTrack({kind: 'subtitles'}));
          nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
          nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
          nativeInstance._videoElement.textTracks[2].mode.should.be.equal('disabled');
        }
        done();
      })
      .catch(e => {
        done(e);
      });
  });
});

describe('NativeAdapter: hideTextTrack', function () {
  let video;
  let track1;
  let track2;
  let nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
    track1 = document.createElement('track');
    track2 = document.createElement('track');
    track1.kind = 'subtitles';
    track1.label = 'English';
    track1.srclang = 'en';
    track1.default = true;
    track2.kind = 'subtitles';
    track2.srclang = 'fr';
    video.appendChild(track1);
    video.appendChild(track2);
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should disable the active text track', done => {
    nativeInstance.load().then(() => {
      if (nativeInstance._videoElement.textTracks) {
        nativeInstance._videoElement.textTracks[0].mode.should.be.equal('showing');
        nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
        nativeInstance.hideTextTrack();
        nativeInstance._videoElement.textTracks[0].mode.should.be.equal('disabled');
        nativeInstance._videoElement.textTracks[1].mode.should.be.equal('disabled');
      }
      done();
    });
  });
});

describe('NativeAdapter: isLive', function () {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should return false for VOD', function (done) {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
    nativeInstance.load().then(() => {
      nativeInstance.isLive().should.be.false;
      done();
    });
  });

  if (Env.browser.name === 'Safari') {
    it('should return false for live before load', () => {
      nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Live.hls[0], {sources: {}});
      nativeInstance.isLive().should.be.false;
    });

    it('should return true for live', done => {
      nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Live.hls[0], {sources: {}});
      video.addEventListener(Html5EventType.ERROR, e => {
        nativeInstance.handleMediaError(e);
      });
      nativeInstance
        .load()
        .then(() => {
          nativeInstance.isLive().should.be.true;
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  }
});

describe('NativeAdapter: seekToLiveEdge', () => {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  if (Env.browser.name === 'Safari') {
    it('should seek to live edge', done => {
      nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Live.hls[0], {sources: {}});
      video.addEventListener(Html5EventType.ERROR, e => {
        nativeInstance.handleMediaError(e);
      });
      nativeInstance
        .load()
        .then(() => {
          video.currentTime = 0;
          video.currentTime.should.not.equal(nativeInstance.duration);
          nativeInstance.seekToLiveEdge();
          video.currentTime.should.equal(nativeInstance.duration);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  }
});

describe('NativeAdapter: _handleLiveDurationChange', () => {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  if (Env.browser.name === 'Safari') {
    it('should trigger durationchange for live', done => {
      nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Live.hls[0], {sources: {}});
      video.addEventListener(Html5EventType.ERROR, e => {
        nativeInstance.handleMediaError(e);
      });
      nativeInstance
        .load()
        .then(() => {
          nativeInstance._videoElement.addEventListener('durationchange', () => {
            done();
          });
        })
        .catch(e => {
          done(e);
        });
    });
  }
});

describe('NativeAdapter: _handleLiveTimeUpdate', () => {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  if (Env.browser.name === 'Safari') {
    it('should trigger timeupdate for live when paused', done => {
      nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Live.hls[0], {sources: {}});
      video.addEventListener(Html5EventType.ERROR, e => {
        nativeInstance.handleMediaError(e);
      });
      nativeInstance
        .load()
        .then(() => {
          nativeInstance.addEventListener('timeupdate', () => {
            done();
          });
        })
        .catch(e => {
          done(e);
        });
    });
  }
});

describe('NativeAdapter: get duration', () => {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  if (Env.browser.name === 'Safari') {
    it('should return live duration for live', done => {
      nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Live.hls[0], {sources: {}});
      video.addEventListener(Html5EventType.ERROR, e => {
        nativeInstance.handleMediaError(e);
      });
      nativeInstance
        .load()
        .then(() => {
          let duration;
          if (nativeInstance._videoElement.seekable.length) {
            duration = nativeInstance._videoElement.seekable.end(nativeInstance._videoElement.seekable.length - 1);
          } else if (nativeInstance._videoElement.buffered.length) {
            duration = nativeInstance._videoElement.buffered.end(nativeInstance._videoElement.buffered.length - 1);
          } else {
            duration = nativeInstance._videoElement.duration;
          }
          nativeInstance.duration.should.be.equal(duration);
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  }
});

describe('NativeAdapter: getStartTimeOfDvrWindow', () => {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  it('should return 0 for VOD', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {sources: {}});
    nativeInstance.load().then(() => {
      nativeInstance.getStartTimeOfDvrWindow().should.equal(0);
      done();
    });
  });

  if (Env.browser.name === 'Safari') {
    it('should return the start of DVR window for live', done => {
      nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Live.hls[0], {sources: {}});
      video.addEventListener(Html5EventType.ERROR, e => {
        nativeInstance.handleMediaError(e);
      });
      nativeInstance
        .load()
        .then(() => {
          nativeInstance.getStartTimeOfDvrWindow().should.equal(nativeInstance._videoElement.seekable.start(0));
          done();
        })
        .catch(e => {
          done(e);
        });
    });
  }
});

describe('NativeAdapter: request filter', () => {
  let video, nativeInstance;

  beforeEach(() => {
    video = document.createElement('video');
  });

  afterEach(() => {
    nativeInstance.destroy();
    nativeInstance = null;
  });

  after(() => {
    removeVideoElementsFromTestPage();
  });

  const validateFilterError = e => {
    e.payload.severity.should.equal(Error.Severity.CRITICAL);
    e.payload.category.should.equal(Error.Category.NETWORK);
    e.payload.code.should.equal(Error.Code.REQUEST_FILTER_ERROR);
    e.payload.data.should.equal('error');
  };

  it('should pass the params to the request filter', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {
      network: {
        requestFilter: function (type, request) {
          try {
            type.should.equal(RequestType.MANIFEST);
            request.url.should.equal(sourcesConfig.Mp4.progressive[0].url);
            Object.prototype.hasOwnProperty.call(request, 'body').should.be.true;
            request.headers.should.be.exist;
            done();
          } catch (e) {
            done(e);
          }
        }
      }
    });
    nativeInstance.load();
  });

  it('should apply void filter for manifest', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {
      network: {
        requestFilter: function (type, request) {
          if (type === RequestType.MANIFEST) {
            request.url += '&test';
          }
        }
      }
    });
    sinon.stub(video, 'src').set(value => {
      try {
        value.indexOf('&test').should.be.gt(-1);
        done();
      } catch (e) {
        done(e);
      }
    });
    nativeInstance.load();
  });

  it('should apply promise filter for manifest', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {
      network: {
        requestFilter: function (type, request) {
          if (type === RequestType.MANIFEST) {
            return new Promise(resolve => {
              request.url += '&test';
              resolve(request);
            });
          }
        }
      }
    });
    sinon.stub(video, 'src').set(value => {
      try {
        value.indexOf('&test').should.be.gt(-1);
        done();
      } catch (e) {
        done(e);
      }
    });
    nativeInstance.load();
  });

  it('should handle error thrown from void filter', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {
      network: {
        requestFilter: function () {
          throw 'error';
        }
      }
    });
    nativeInstance.addEventListener(Html5EventType.ERROR, e => {
      try {
        validateFilterError(e);
        done();
      } catch (e) {
        done(e);
      }
    });
    nativeInstance.load();
  });

  it('should handle error thrown from promise filter', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {
      network: {
        requestFilter: function () {
          return new Promise(() => {
            throw 'error';
          });
        }
      }
    });
    nativeInstance.addEventListener(Html5EventType.ERROR, e => {
      try {
        validateFilterError(e);
        done();
      } catch (e) {
        done(e);
      }
    });
    nativeInstance.load();
  });

  it('should handle error rejected from promise filter', done => {
    nativeInstance = NativeAdapter.createAdapter(video, sourcesConfig.Mp4.progressive[0], {
      network: {
        requestFilter: function () {
          return new Promise((resolve, reject) => {
            reject('error');
          });
        }
      }
    });
    nativeInstance.addEventListener(Html5EventType.ERROR, e => {
      try {
        validateFilterError(e);
        done();
      } catch (e) {
        done(e);
      }
    });
    nativeInstance.load();
  });
});
