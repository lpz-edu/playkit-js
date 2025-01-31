//@flow
/* eslint-disable no-unused-vars */
import FakeEvent from '../../../event/fake-event';
import FakeEventTarget from '../../../event/fake-event-target';
import Error from '../../../error/error';
import {CustomEventType, Html5EventType} from '../../../event/event-type';
import getLogger from '../../../utils/logger';
import Track from '../../../track/track';
import VideoTrack from '../../../track/video-track';
import AudioTrack from '../../../track/audio-track';
import TextTrack from '../../../track/text-track';
import EventManager from '../../../event/event-manager';
import ImageTrack from '../../../track/image-track';
import {ThumbnailInfo} from '../../../thumbnail/thumbnail-info';

const CURRENT_OR_NEXT_SEGMENT_COUNT: number = 2;

export default class BaseMediaSourceAdapter extends FakeEventTarget implements IMediaSourceAdapter {
  /**
   * The id of the adapter.
   * @member {string} id
   * @static
   * @private
   */
  static id: string = 'BaseAdapter';
  /**
   * Passing the getLogger function to the actual media source adapter.
   * @type {Function}
   * @static
   */
  static getLogger: Function = getLogger;

  static _logger = BaseMediaSourceAdapter.getLogger(BaseMediaSourceAdapter.id);

  /**
   * The adapter config.
   * @member {Object} _config
   * @private
   */
  _config: Object;

  /**
   * The source object.
   * @member {PKMediaSourceObject} _sourceObj
   * @private
   */
  _sourceObj: ?PKMediaSourceObject;

  /**
   * The dom video element.
   * @member {HTMLVideoElement} _videoElement
   * @private
   */
  _videoElement: HTMLVideoElement;

  /**
   * The adapter capabilities
   * @private
   */
  _capabilities: PKMediaSourceCapabilities = {fpsControl: false};

  /**
   * The event manager of the adapter.
   * @type {EventManager}
   * @private
   */
  _eventManager: EventManager;

  /**
   * The load promise
   * @member {Promise<{tracks: Array<Track>}>} - _loadPromise
   * @type {Promise<{tracks: Array<Track>}>}
   * @private
   */
  _loadPromise: Promise<{tracks: Array<Track>}> | null;

  /**
   * The duration change handler.
   * @type {Function}
   * @private
   */
  _onDurationChanged: Function;

  /**
   * Checks if the media source adapter is supported.
   * @function isSupported
   * @returns {boolean} - Whether the media source adapter is supported.
   * @static
   */
  static isSupported(): boolean {
    return true;
  }

  /**
   * check for media source supported on browser
   * @static
   * @returns {boolean} - Whether the media source is supported.
   */
  static isMSESupported(): boolean {
    const mediaSource = window.MediaSource || window.WebKitMediaSource;
    // isTypeSupported isn't exist or not a function for old MSE implementation
    return !!mediaSource && typeof mediaSource.isTypeSupported === 'function';
  }

  /**
   * @constructor
   * @param {HTMLVideoElement} videoElement - The video element which bind to media source adapter.
   * @param {PKMediaSourceObject} source - The source object.
   * @param {Object} config - The media source adapter configuration.
   */
  constructor(videoElement: HTMLVideoElement, source: PKMediaSourceObject, config: Object = {}) {
    super();
    this._videoElement = videoElement;
    this._sourceObj = source;
    this._config = config;
    this._onDurationChanged = () => {
      if (this.isLive() && this._videoElement.paused) {
        this._trigger(Html5EventType.TIME_UPDATE);
      }
    };
    this._eventManager = new EventManager();
    this._handleLiveTimeUpdate();
  }

  /**
   * Destroys the media source adapter.
   * @function destroy
   * @returns {void}
   */
  destroy(): Promise<*> {
    this._sourceObj = null;
    this._config = {};
    this.disableNativeTextTracks();
    this._videoElement.removeEventListener(Html5EventType.DURATION_CHANGE, this._onDurationChanged);
    this._eventManager.destroy();
    return Promise.resolve();
  }

  /**
   * Triggers the appropriate track changed event.
   * @param {Track} track - The selected track.
   * @private
   * @returns {void}
   */
  _onTrackChanged(track: Track): void {
    if (track instanceof VideoTrack) {
      BaseMediaSourceAdapter._logger.debug('Video track changed', track);
      this._trigger(CustomEventType.VIDEO_TRACK_CHANGED, {selectedVideoTrack: track});
    } else if (track instanceof AudioTrack) {
      BaseMediaSourceAdapter._logger.debug('Audio track changed', track);
      this._trigger(CustomEventType.AUDIO_TRACK_CHANGED, {selectedAudioTrack: track});
    } else if (track instanceof TextTrack) {
      BaseMediaSourceAdapter._logger.debug('Text track changed', track);
      this._trigger(CustomEventType.TEXT_TRACK_CHANGED, {selectedTextTrack: track});
    } else if (track instanceof ImageTrack) {
      BaseMediaSourceAdapter._logger.debug('Image track changed', track);
      this._trigger(CustomEventType.IMAGE_TRACK_CHANGED, {selectedImageTrack: track});
    }
  }

  /**
   * Dispatch an adapter event forward.
   * @param {string} name - The name of the event.
   * @param {?Object} payload - The event payload.
   * @returns {void}
   */
  _trigger(name: string, payload?: Object): void {
    this.dispatchEvent(new FakeEvent(name, payload));
  }

  /** Must implemented methods by the derived media source adapter **/

  static canPlayType(mimeType: string, preferNative: boolean): boolean {
    return BaseMediaSourceAdapter._throwNotImplementedError('static canPlayType');
  }

  load(): Promise<Object> {
    return BaseMediaSourceAdapter._throwNotImplementedError('load');
  }

  selectVideoTrack(videoTrack: VideoTrack): void {
    return BaseMediaSourceAdapter._throwNotImplementedError('selectVideoTrack');
  }

  selectAudioTrack(audioTrack: AudioTrack): void {
    BaseMediaSourceAdapter._throwNotImplementedError('selectAudioTrack');
  }

  selectTextTrack(textTrack: TextTrack): void {
    BaseMediaSourceAdapter._throwNotImplementedError('selectTextTrack');
  }

  selectImageTrack(imageTrack: ImageTrack): void {}

  hideTextTrack(): void {
    BaseMediaSourceAdapter._throwNotImplementedError('hideTextTrack');
  }

  enableAdaptiveBitrate(): void {
    BaseMediaSourceAdapter._throwNotImplementedError('enableAdaptiveBitrate');
  }

  isAdaptiveBitrateEnabled(): boolean {
    return BaseMediaSourceAdapter._throwNotImplementedError('isAdaptiveBitrateEnabled');
  }

  applyABRRestriction(restrictions: PKABRRestrictionObject): void {
    return BaseMediaSourceAdapter._throwNotImplementedError('applyABRRestriction');
  }

  _getLiveEdge(): number {
    return BaseMediaSourceAdapter._throwNotImplementedError('_getLiveEdge');
  }

  seekToLiveEdge(): void {
    BaseMediaSourceAdapter._throwNotImplementedError('seekToLiveEdge');
  }

  isLive(): boolean {
    return BaseMediaSourceAdapter._throwNotImplementedError('isLive');
  }

  isOnLiveEdge(): boolean {
    return this.liveDuration - this._videoElement.currentTime <= this.getSegmentDuration() * CURRENT_OR_NEXT_SEGMENT_COUNT;
  }

  setMaxBitrate(bitrate: number): void {
    return;
  }

  attachMediaSource(): void {}

  detachMediaSource(): void {}

  /**
   * Handling live time update (as is not triggered when video is paused, but the current time changed)
   * @function _handleLiveTimeUpdate
   * @returns {void}
   * @private
   */
  _handleLiveTimeUpdate(): void {
    this._videoElement.addEventListener(Html5EventType.DURATION_CHANGE, this._onDurationChanged);
  }

  /**
   * Disables all the existing text tracks.
   * @public
   * @returns {void}
   */
  disableNativeTextTracks(): void {
    Array.from(this._videoElement.textTracks).forEach(track => {
      if (TextTrack.isNativeTextTrack(track) && !TextTrack.isExternalTrack(track)) {
        track.mode = TextTrack.MODE.DISABLED;
      }
    });
  }

  /**
   * Checks if the adapter can recover from an error triggered by the video element error
   * @param {Event} event - the html5 video element error
   * @returns {boolean} - if it can recover or not
   * @public
   */
  handleMediaError(event: ?MediaError): boolean {
    return false;
  }

  getStartTimeOfDvrWindow(): number {
    return BaseMediaSourceAdapter._throwNotImplementedError('getStartTimeOfDvrWindow');
  }

  getThumbnail(time: number): ?ThumbnailInfo {
    return null;
  }

  getSegmentDuration(): number {
    return BaseMediaSourceAdapter._throwNotImplementedError('getSegmentDuration');
  }

  get liveDuration(): number {
    return BaseMediaSourceAdapter._throwNotImplementedError('liveDuration');
  }

  /**
   * throw a run time error
   * @param {string} name of the unimplemented function
   * @returns {any} void/string/boolean
   */
  static _throwNotImplementedError(name: string): any {
    throw new Error(Error.Severity.CRITICAL, Error.Category.PLAYER, Error.Code.RUNTIME_ERROR_METHOD_NOT_IMPLEMENTED, name);
  }

  /**
   * Getter for the src that the adapter plays on the video element.
   * In case the adapter preformed a load it will return the manifest url.
   * @public
   * @returns {string} - The src url.
   */
  get src(): string {
    if (this._loadPromise && this._sourceObj) {
      return this._sourceObj.url;
    }
    return '';
  }

  /**
   * Setter for the src that the adapter plays on the video element.
   * @param {string} source - The src url.
   * @public
   * @returns {void}
   */
  set src(source: string): void {
    if (!this._loadPromise && this._sourceObj) {
      this._sourceObj.url = source;
    }
  }

  /**
   * @public
   * @return {PKMediaSourceCapabilities} - The adapter capabilities.
   */
  get capabilities(): PKMediaSourceCapabilities {
    return this._capabilities;
  }

  get targetBuffer(): number {
    return NaN;
  }

  getDrmInfo(): ?PKDrmDataObject {
    return null;
  }
}
