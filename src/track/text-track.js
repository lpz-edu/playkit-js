//@flow
import Track from './track';
import {Cue} from './vtt-cue';
import Error from '../error/error';

/**
 * Text track representation of the player.
 * @classdesc
 */
const TextTrack: TextTrack = class TextTrack extends Track {
  MODE: {[mode: string]: string};
  KIND: {[kind: string]: string};
  EXTERNAL_TRACK_ID: string;

  isMetaDataTrack: Function;
  isNativeTextTrack: Function;
  isExternalTrack: Function;

  /**
   * use as a uniq identifier of the track.
   * @static
   * @type {number}
   * @private
   */
  static _tracksCount: number = 0;
  /**
   * index generator.
   * @returns {number} - the next track index.
   */
  static _generateIndex(): number {
    return TextTrack._tracksCount++;
  }
  /**
   * reset the track count.
   * @returns {void}
   */
  static reset(): void {
    TextTrack._tracksCount = 0;
  }

  /**
   * The kind of the text track:
   * subtitles/captions/metadata.
   * @member
   * @type {string}
   * @private
   */
  _kind: string;
  /**
   * flag to know if it's external or not
   * @member
   * @type {boolean}
   * @private
   */
  _external: boolean;
  /**
   * flag to know if it's default or not
   * @member
   * @type {boolean}
   * @private
   */
  _default: boolean;

  /**
   * Getter for the kind of the text track.
   * @public
   * @returns {string} - The kind of the text track.
   */
  get kind(): string {
    return this._kind;
  }

  /**
   * Getter for the external of the text track.
   * @public
   * @returns {boolean} - Whether the text track is external.
   */
  get external(): boolean {
    return this._external;
  }

  /**
   * Getter for the default of the text track.
   * @public
   * @returns {boolean} - Whether the text track is default.
   */
  get default(): boolean {
    return this._default;
  }

  /**
   * @constructor
   * @param {Object} settings - The track settings object.
   */
  constructor(settings: Object = {}) {
    super(settings);
    // use language tag if no display label is available
    this._label = this.label || this.language;
    this._kind = settings.kind;
    this._external = settings.external;
    this._index = TextTrack._generateIndex();
    this._default = settings.default || false;
  }
};

TextTrack.MODE = {
  DISABLED: 'disabled',
  SHOWING: 'showing',
  HIDDEN: 'hidden'
};

TextTrack.KIND = {
  METADATA: 'metadata',
  SUBTITLES: 'subtitles',
  CAPTIONS: 'captions'
};

TextTrack.EXTERNAL_TRACK_ID = 'playkit-external-track';

TextTrack.isMetaDataTrack = (track: any) => {
  return track && track.kind === TextTrack.KIND.METADATA;
};

TextTrack.isNativeTextTrack = (track: any) => {
  return track && [TextTrack.KIND.SUBTITLES, TextTrack.KIND.CAPTIONS].includes(track.kind);
};

TextTrack.isExternalTrack = (track: any) => {
  return track && [track.language, track.label].includes(TextTrack.EXTERNAL_TRACK_ID);
};

/**
 * Normalize cues to be of type of VTT model.
 * @param {TextTrackCueList} textTrackCueList - The text track cue list contains the cues.
 * @returns {void}
 * @private
 */
function getActiveCues(textTrackCueList: TextTrackCueList): Array<Cue> {
  let normalizedCues: Array<Cue> = [];
  for (let cue of textTrackCueList) {
    //Normalize cues to be of type of VTT model
    if ((window.VTTCue && cue instanceof window.VTTCue) || (window.DataCue && cue instanceof window.DataCue)) {
      normalizedCues.push(cue);
    } else if (window.TextTrackCue && cue instanceof window.TextTrackCue) {
      try {
        normalizedCues.push(new Cue(cue.startTime, cue.endTime, cue.text));
      } catch (error) {
        new Error(Error.Severity.RECOVERABLE, Error.Category.TEXT, Error.Code.UNABLE_TO_CREATE_TEXT_CUE, error);
      }
    }
  }
  return normalizedCues;
}

export default TextTrack;
export {getActiveCues};
