/*
 * Copyright (c) 2015. Reflect, Alex K.
 */

/**
 * @fileoverview Touch hold helper class.
 * @author alexeykofficial@gmail.com (Alex K.)
 * @suppress {accessControls}
 */

goog.provide('rflect.ui.MomentumScrollerManager');
goog.provide('rflect.ui.MomentumScrollerManager.EventType');

goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.math.Coordinate');



/**
 * Touch hold helper main class.
 * @unrestricted
 */
class MomentumScrollerManager {
  constructor() {
    super(this);

    /**
     * Watching timeout id.
     * @type {number}
     * @private
     */
    this.holdTimeout_ = 0;

    /**
     * Element to listen events on.
     * @type {Element}
     * @private
     */
    this.element_;

    /**
     * Whether touch was dragged too far to fire hold end event.
     * @type {boolean}
     * @private
     */
    this.draggedTooFar_;

    /**
     * Coordinates of first touch.
     * @type {goog.math.Coordinate}
     * @private
     */
    this.startTouchCoordinate_;

    /**
     * Target of initial touch, and on which is to dispatch touch hold.
     * @type {Element}
     * @private
     */
    this.target_;

    /**
     * Whether touch hold was fire.
     * @type {boolean}
     * @private
     */
    this.touchHoldWasFired_ = false;

    /**
     * @type {Array.<string>}
     * @private
     */
    this.elementSelectors_ = [];
  };


  static setElement(aElement) {
    this.element_ = aElement;
  }


  static getElement() {
    return this.element_;
  }


  static getTouchHoldWasFired() {
    return this.touchHoldWasFired_;
  }


  setTouchHoldWasFired(aTouchHoldWasFired) {
    this.touchHoldWasFired_ = aTouchHoldWasFired;
  }


  removeAllListenableElementIds() {
    this.elementSelectors_.length = 0;
  }


  /**
   * @param {string} aId
   */
  addListenableElementId(aId) {
    this.elementSelectors_.push(aId);
  }


  /**
   * Starts listening for events.
   */
  handleTouchEvents() {
    this.elementSelectors_.forEach(aElementId => {
      let element = goog.dom.getElement(aElementId);
      if (element) {
        this.listen(element, goog.events.EventType.TOUCHSTART,
            this.onTouchStart_, false, this).
            listen(element, goog.events.EventType.TOUCHMOVE,
            this.onTouchMove_, false, this).
            listen(element, goog.events.EventType.TOUCHEND,
            this.onTouchEnd_, false, this).
            listen(element, goog.events.EventType.CONTEXTMENU,
            this.onContextMenu_, false, this);
      }
    })
  }


  /**
   * @param {goog.events.Event} aEvent Event object.
   * @private
   */
  onTouchStart_(aEvent) {
    if (goog.DEBUG)
      console.log('MomentumScrollerManager onTouchStart_');
    this.saveStartTouch(aEvent);

    clearTimeout(this.holdTimeout_);
    this.touchHoldWasFired_ = false;
    this.draggedTooFar_ = false;
    this.target_ = /**@type {Element}*/ (aEvent.target);

    this.holdTimeout_ = setTimeout(() => {
      if (!this.draggedTooFar_) {
        this.dispatchTouchHoldEvent(rflect.ui.MomentumScrollerManager.EventType.
            TOUCHHOLD);
        this.touchHoldWasFired_ = true;
      }
    }, rflect.ui.MomentumScrollerManager.TIMEOUT);
  }


  /**
   * @param {goog.events.Event} aEvent Event object.
   */
  onTouchMove_(aEvent) {
    var currentCoordinate = new goog.math.Coordinate(
      aEvent.getBrowserEvent().touches[0].clientX,
      aEvent.getBrowserEvent().touches[0].clientY
    );
    this.draggedTooFar_ = this.draggedTooFar_ || (goog.math.Coordinate.distance(
          currentCoordinate, this.startTouchCoordinate_ ||
          new goog.math.Coordinate(0 ,0)) >
          rflect.ui.MomentumScrollerManager.DRAG_THRESHOLD);
  }


  /**
   * @param {goog.events.Event} aEvent Event object.
   * @private
   */
  onTouchEnd_(aEvent) {
    clearTimeout(this.holdTimeout_);
    if (this.touchHoldWasFired_) {
      this.dispatchTouchHoldEvent(rflect.ui.MomentumScrollerManager.EventType.
          TOUCHHOLDEND);
    }
  }


  /**
   * @param {goog.events.Event} aEvent Event object.
   * @private
   */
  onContextMenu_(aEvent) {
    aEvent.preventDefault();
  }


  saveStartTouch(aEvent) {
    this.startTouchCoordinate_ = new goog.math.Coordinate(
      aEvent.getBrowserEvent().touches[0].clientX,
      aEvent.getBrowserEvent().touches[0].clientY
    );
  }


  dispatchTouchHoldEvent(aEventType) {
    // Create the event.
    var event = document.createEvent('Event');
    // Define that the event name is 'build'.
    event.initEvent(aEventType, true, true);
    event.clientX = this.startTouchCoordinate_.x;
    event.clientY = this.startTouchCoordinate_.y;
    // Target can be any Element or other EventTarget.
    this.target_.dispatchEvent(event);
  }


  /**
   * @override
   */
  disposeInternal() {
    MomentumScrollerManager.superClass_.disposeInternal.call(this);
    clearTimeout(this.holdTimeout_);
    this.target_ = null;
  }
}


/**
 * @typedef {MomentumScrollerManager}
 */
rflect.ui.MomentumScrollerManager = MomentumScrollerManager;


/**
 * Touch hold timeout.
 * @type {number}
 * @const
 */
rflect.ui.MomentumScrollerManager.TIMEOUT = 500;


/**
 * @type {number}
 */
rflect.ui.MomentumScrollerManager.DRAG_THRESHOLD = 5;


/**
 * @enum {string}
 */
rflect.ui.MomentumScrollerManager.EventType = {
  TOUCHHOLD: 'touchhold',
  TOUCHHOLDEND: 'touchholdend'
}