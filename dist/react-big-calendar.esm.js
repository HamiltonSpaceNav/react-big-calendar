import _extends from '@babel/runtime/helpers/esm/extends';
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose';
import _inheritsLoose from '@babel/runtime/helpers/esm/inheritsLoose';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import uncontrollable from 'uncontrollable';
import cn from 'classnames';
import elementType from 'prop-types-extra/lib/elementType';
import all from 'prop-types-extra/lib/all';
import warning from 'warning';
import invariant from 'invariant';
import _assertThisInitialized from '@babel/runtime/helpers/esm/assertThisInitialized';
import { findDOMNode } from 'react-dom';
import dateMath from 'date-arithmetic';
import chunk from 'lodash/chunk';
import getPosition from 'dom-helpers/query/position';
import raf from 'dom-helpers/util/requestAnimationFrame';
import getOffset from 'dom-helpers/query/offset';
import getScrollTop from 'dom-helpers/query/scrollTop';
import getScrollLeft from 'dom-helpers/query/scrollLeft';
import Overlay from 'react-overlays/lib/Overlay';
import getHeight from 'dom-helpers/query/height';
import qsa from 'dom-helpers/query/querySelectorAll';
import contains from 'dom-helpers/query/contains';
import closest from 'dom-helpers/query/closest';
import events from 'dom-helpers/events';
import findIndex from 'lodash/findIndex';
import range from 'lodash/range';
import memoize from 'memoize-one';
import _createClass from '@babel/runtime/helpers/esm/createClass';
import sortBy from 'lodash/sortBy';
import getWidth from 'dom-helpers/query/width';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';
import classes from 'dom-helpers/class';
import omit from 'lodash/omit';
import defaults from 'lodash/defaults';
import transform from 'lodash/transform';
import mapValues from 'lodash/mapValues';

var navigate = {
  PREVIOUS: 'PREV',
  NEXT: 'NEXT',
  TODAY: 'TODAY',
  DATE: 'DATE'
};
var views = {
  MONTH: 'month',
  WEEK: 'week',
  WORK_WEEK: 'work_week',
  DAY: 'day',
  AGENDA: 'agenda'
};

var eventComponent = PropTypes.oneOfType([elementType, PropTypes.shape({
  month: elementType,
  week: elementType,
  day: elementType,
  agenda: elementType
})]);
var viewNames = Object.keys(views).map(function (k) {
  return views[k];
});
var accessor = PropTypes.oneOfType([PropTypes.string, PropTypes.func]);
var dateFormat = PropTypes.any;
var dateRangeFormat = PropTypes.func;
/**
 * accepts either an array of builtin view names:
 *
 * ```
 * views={['month', 'day', 'agenda']}
 * ```
 *
 * or an object hash of the view name and the component (or boolean for builtin)
 *
 * ```
 * views={{
 *   month: true,
 *   week: false,
 *   workweek: WorkWeekViewComponent,
 * }}
 * ```
 */

var views$1 = PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.oneOf(viewNames)), all(PropTypes.object, function (props, name) {
  for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  var prop = props[name],
      err;
  Object.keys(prop).every(function (key) {
    var isBuiltinView = viewNames.indexOf(key) !== -1 && typeof prop[key] === 'boolean';
    return isBuiltinView || !(err = elementType.apply(void 0, [prop, key].concat(args)));
  });
  return err || null;
})]);

function notify(handler, args) {
  handler && handler.apply(null, [].concat(args));
}

var localePropType = PropTypes.oneOfType([PropTypes.string, PropTypes.func]);

function _format(localizer, formatter, value, format, culture) {
  var result = typeof format === 'function' ? format(value, culture, localizer) : formatter.call(localizer, value, format, culture);
  !(result == null || typeof result === 'string') ? process.env.NODE_ENV !== "production" ? invariant(false, '`localizer format(..)` must return a string, null, or undefined') : invariant(false) : void 0;
  return result;
}

var DateLocalizer = function DateLocalizer(spec) {
  var _this = this;

  !(typeof spec.format === 'function') ? process.env.NODE_ENV !== "production" ? invariant(false, 'date localizer `format(..)` must be a function') : invariant(false) : void 0;
  !(typeof spec.firstOfWeek === 'function') ? process.env.NODE_ENV !== "production" ? invariant(false, 'date localizer `firstOfWeek(..)` must be a function') : invariant(false) : void 0;
  this.propType = spec.propType || localePropType;
  this.startOfWeek = spec.firstOfWeek;
  this.formats = spec.formats;

  this.format = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _format.apply(void 0, [_this, spec.format].concat(args));
  };
};
function mergeWithDefaults(localizer, culture, formatOverrides, messages) {
  var formats = _extends({}, localizer.formats, formatOverrides);

  return _extends({}, localizer, {
    messages: messages,
    startOfWeek: function startOfWeek() {
      return localizer.startOfWeek(culture);
    },
    format: function format(value, _format2) {
      return localizer.format(value, formats[_format2] || _format2, culture);
    }
  });
}

var defaultMessages = {
  date: 'Date',
  time: 'Time',
  event: 'Event',
  allDay: 'All Day',
  week: 'Week',
  work_week: 'Work Week',
  day: 'Day',
  month: 'Month',
  previous: 'Back',
  next: 'Next',
  yesterday: 'Yesterday',
  tomorrow: 'Tomorrow',
  today: 'Today',
  agenda: 'Agenda',
  noEventsInRange: 'There are no events in this range.',
  showMore: function showMore(total) {
    return "+" + total + " more";
  }
};
function messages(msgs) {
  return _extends({}, defaultMessages, msgs);
}

var MILLI = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24
};
var MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

var dates = _extends({}, dateMath, {
  monthsInYear: function monthsInYear(year) {
    var date = new Date(year, 0, 1);
    return MONTHS.map(function (i) {
      return dates.month(date, i);
    });
  },
  firstVisibleDay: function firstVisibleDay(date, localizer) {
    var firstOfMonth = dates.startOf(date, 'month');
    return dates.startOf(firstOfMonth, 'week', localizer.startOfWeek());
  },
  lastVisibleDay: function lastVisibleDay(date, localizer) {
    var endOfMonth = dates.endOf(date, 'month');
    return dates.endOf(endOfMonth, 'week', localizer.startOfWeek());
  },
  visibleDays: function visibleDays(date, localizer) {
    var current = dates.firstVisibleDay(date, localizer),
        last = dates.lastVisibleDay(date, localizer),
        days = [];

    while (dates.lte(current, last, 'day')) {
      days.push(current);
      current = dates.add(current, 1, 'day');
    }

    return days;
  },
  ceil: function ceil(date, unit) {
    var floor = dates.startOf(date, unit);
    return dates.eq(floor, date) ? floor : dates.add(floor, 1, unit);
  },
  range: function range$$1(start, end, unit) {
    if (unit === void 0) {
      unit = 'day';
    }

    var current = start,
        days = [];

    while (dates.lte(current, end, unit)) {
      days.push(current);
      current = dates.add(current, 1, unit);
    }

    return days;
  },
  merge: function merge(date, time) {
    if (time == null && date == null) return null;
    if (time == null) time = new Date();
    if (date == null) date = new Date();
    date = dates.startOf(date, 'day');
    date = dates.hours(date, dates.hours(time));
    date = dates.minutes(date, dates.minutes(time));
    date = dates.seconds(date, dates.seconds(time));
    return dates.milliseconds(date, dates.milliseconds(time));
  },
  eqTime: function eqTime(dateA, dateB) {
    return dates.hours(dateA) === dates.hours(dateB) && dates.minutes(dateA) === dates.minutes(dateB) && dates.seconds(dateA) === dates.seconds(dateB);
  },
  isJustDate: function isJustDate(date) {
    return dates.hours(date) === 0 && dates.minutes(date) === 0 && dates.seconds(date) === 0 && dates.milliseconds(date) === 0;
  },
  duration: function duration(start, end, unit, firstOfWeek) {
    if (unit === 'day') unit = 'date';
    return Math.abs(dates[unit](start, undefined, firstOfWeek) - dates[unit](end, undefined, firstOfWeek));
  },
  diff: function diff(dateA, dateB, unit) {
    if (!unit || unit === 'milliseconds') return Math.abs(+dateA - +dateB); // the .round() handles an edge case
    // with DST where the total won't be exact
    // since one day in the range may be shorter/longer by an hour

    return Math.round(Math.abs(+dates.startOf(dateA, unit) / MILLI[unit] - +dates.startOf(dateB, unit) / MILLI[unit]));
  },
  total: function total(date, unit) {
    var ms = date.getTime(),
        div = 1;

    switch (unit) {
      case 'week':
        div *= 7;

      case 'day':
        div *= 24;

      case 'hours':
        div *= 60;

      case 'minutes':
        div *= 60;

      case 'seconds':
        div *= 1000;
    }

    return ms / div;
  },
  week: function week(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7 + 1) / 7);
  },
  today: function today() {
    return dates.startOf(new Date(), 'day');
  },
  yesterday: function yesterday() {
    return dates.add(dates.startOf(new Date(), 'day'), -1, 'day');
  },
  tomorrow: function tomorrow() {
    return dates.add(dates.startOf(new Date(), 'day'), 1, 'day');
  }
});

var EventCell =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(EventCell, _React$Component);

  function EventCell() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = EventCell.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        style = _this$props.style,
        className = _this$props.className,
        event = _this$props.event,
        selected = _this$props.selected,
        isAllDay = _this$props.isAllDay,
        onSelect = _this$props.onSelect,
        _onDoubleClick = _this$props.onDoubleClick,
        localizer = _this$props.localizer,
        continuesPrior = _this$props.continuesPrior,
        continuesAfter = _this$props.continuesAfter,
        accessors = _this$props.accessors,
        getters = _this$props.getters,
        children = _this$props.children,
        _this$props$component = _this$props.components,
        Event = _this$props$component.event,
        EventWrapper = _this$props$component.eventWrapper,
        props = _objectWithoutPropertiesLoose(_this$props, ["style", "className", "event", "selected", "isAllDay", "onSelect", "onDoubleClick", "localizer", "continuesPrior", "continuesAfter", "accessors", "getters", "children", "components"]);

    var title = accessors.title(event);
    var tooltip = accessors.tooltip(event);
    var end = accessors.end(event);
    var start = accessors.start(event);
    var allDay = accessors.allDay(event);
    var showAsAllDay = isAllDay || allDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1;
    var userProps = getters.eventProp(event, start, end, selected);
    var content = React.createElement("div", {
      className: "rbc-event-content",
      title: tooltip || undefined
    }, Event ? React.createElement(Event, {
      event: event,
      title: title,
      isAllDay: allDay,
      localizer: localizer
    }) : title);
    return React.createElement(EventWrapper, _extends({}, this.props, {
      type: "date"
    }), React.createElement("div", _extends({}, props, {
      tabIndex: 0,
      style: _extends({}, userProps.style, style),
      className: cn('rbc-event', className, userProps.className, {
        'rbc-selected': selected,
        'rbc-event-allday': showAsAllDay,
        'rbc-event-continues-prior': continuesPrior,
        'rbc-event-continues-after': continuesAfter
      }),
      onClick: function onClick(e) {
        return onSelect && onSelect(event, e);
      },
      onDoubleClick: function onDoubleClick(e) {
        return _onDoubleClick && _onDoubleClick(event, e);
      }
    }), typeof children === 'function' ? children(content) : content));
  };

  return EventCell;
}(React.Component);

EventCell.propTypes = process.env.NODE_ENV !== "production" ? {
  event: PropTypes.object.isRequired,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.instanceOf(Date),
  selected: PropTypes.bool,
  isAllDay: PropTypes.bool,
  continuesPrior: PropTypes.bool,
  continuesAfter: PropTypes.bool,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object,
  onSelect: PropTypes.func,
  onDoubleClick: PropTypes.func
} : {};

function isSelected(event, selected) {
  if (!event || selected == null) return false;
  return [].concat(selected).indexOf(event) !== -1;
}
function slotWidth(rowBox, slots) {
  var rowWidth = rowBox.right - rowBox.left;
  var cellWidth = rowWidth / slots;
  return cellWidth;
}
function getSlotAtX(rowBox, x, rtl, slots) {
  var cellWidth = slotWidth(rowBox, slots);
  return rtl ? slots - 1 - Math.floor((x - rowBox.left) / cellWidth) : Math.floor((x - rowBox.left) / cellWidth);
}
function pointInBox(box, _ref) {
  var x = _ref.x,
      y = _ref.y;
  return y >= box.top && y <= box.bottom && x >= box.left && x <= box.right;
}
function dateCellSelection(start, rowBox, box, slots, rtl) {
  var startIdx = -1;
  var endIdx = -1;
  var lastSlotIdx = slots - 1;
  var cellWidth = slotWidth(rowBox, slots); // cell under the mouse

  var currentSlot = getSlotAtX(rowBox, box.x, rtl, slots); // Identify row as either the initial row
  // or the row under the current mouse point

  var isCurrentRow = rowBox.top < box.y && rowBox.bottom > box.y;
  var isStartRow = rowBox.top < start.y && rowBox.bottom > start.y; // this row's position relative to the start point

  var isAboveStart = start.y > rowBox.bottom;
  var isBelowStart = rowBox.top > start.y;
  var isBetween = box.top < rowBox.top && box.bottom > rowBox.bottom; // this row is between the current and start rows, so entirely selected

  if (isBetween) {
    startIdx = 0;
    endIdx = lastSlotIdx;
  }

  if (isCurrentRow) {
    if (isBelowStart) {
      startIdx = 0;
      endIdx = currentSlot;
    } else if (isAboveStart) {
      startIdx = currentSlot;
      endIdx = lastSlotIdx;
    }
  }

  if (isStartRow) {
    // select the cell under the initial point
    startIdx = endIdx = rtl ? lastSlotIdx - Math.floor((start.x - rowBox.left) / cellWidth) : Math.floor((start.x - rowBox.left) / cellWidth);

    if (isCurrentRow) {
      if (currentSlot < startIdx) startIdx = currentSlot;else endIdx = currentSlot; //select current range
    } else if (start.y < box.y) {
      // the current row is below start row
      // select cells to the right of the start cell
      endIdx = lastSlotIdx;
    } else {
      // select cells to the left of the start cell
      startIdx = 0;
    }
  }

  return {
    startIdx: startIdx,
    endIdx: endIdx
  };
}

var Popup =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Popup, _React$Component);

  function Popup() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Popup.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this$props$popupOffs = this.props.popupOffset,
        popupOffset = _this$props$popupOffs === void 0 ? 5 : _this$props$popupOffs,
        _getOffset = getOffset(this.refs.root),
        top = _getOffset.top,
        left = _getOffset.left,
        width = _getOffset.width,
        height = _getOffset.height,
        viewBottom = window.innerHeight + getScrollTop(window),
        viewRight = window.innerWidth + getScrollLeft(window),
        bottom = top + height,
        right = left + width;

    if (bottom > viewBottom || right > viewRight) {
      var topOffset, leftOffset;
      if (bottom > viewBottom) topOffset = bottom - viewBottom + (popupOffset.y || +popupOffset || 0);
      if (right > viewRight) leftOffset = right - viewRight + (popupOffset.x || +popupOffset || 0);
      this.setState({
        topOffset: topOffset,
        leftOffset: leftOffset
      }); //eslint-disable-line
    }
  };

  _proto.render = function render() {
    var _this$props = this.props,
        events$$1 = _this$props.events,
        selected = _this$props.selected,
        getters = _this$props.getters,
        accessors = _this$props.accessors,
        components = _this$props.components,
        onSelect = _this$props.onSelect,
        onDoubleClick = _this$props.onDoubleClick,
        slotStart = _this$props.slotStart,
        slotEnd = _this$props.slotEnd,
        localizer = _this$props.localizer;
    var _this$props$position = this.props.position,
        left = _this$props$position.left,
        width = _this$props$position.width,
        top = _this$props$position.top,
        topOffset = (this.state || {}).topOffset || 0,
        leftOffset = (this.state || {}).leftOffset || 0;
    var style = {
      top: Math.max(0, top - topOffset),
      left: left - leftOffset,
      minWidth: width + width / 2
    };
    return React.createElement("div", {
      ref: "root",
      style: style,
      className: "rbc-overlay"
    }, React.createElement("div", {
      className: "rbc-overlay-header"
    }, localizer.format(slotStart, 'dayHeaderFormat')), events$$1.map(function (event, idx) {
      return React.createElement(EventCell, {
        key: idx,
        type: "popup",
        event: event,
        getters: getters,
        onSelect: onSelect,
        accessors: accessors,
        components: components,
        onDoubleClick: onDoubleClick,
        continuesPrior: dates.lt(accessors.end(event), slotStart, 'day'),
        continuesAfter: dates.gte(accessors.start(event), slotEnd, 'day'),
        selected: isSelected(event, selected)
      });
    }));
  };

  return Popup;
}(React.Component);

Popup.propTypes = process.env.NODE_ENV !== "production" ? {
  position: PropTypes.object,
  popupOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })]),
  events: PropTypes.array,
  selected: PropTypes.object,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  onSelect: PropTypes.func,
  onDoubleClick: PropTypes.func,
  slotStart: PropTypes.instanceOf(Date),
  slotEnd: PropTypes.number
} : {};

function addEventListener(type, handler, target) {
  if (target === void 0) {
    target = document;
  }

  events.on(target, type, handler, {
    passive: false
  });
  return {
    remove: function remove() {
      events.off(target, type, handler);
    }
  };
}

function isOverContainer(container, x, y) {
  return !container || contains(container, document.elementFromPoint(x, y));
}

function getEventNodeFromPoint(node, _ref) {
  var clientX = _ref.clientX,
      clientY = _ref.clientY;
  var target = document.elementFromPoint(clientX, clientY);
  return closest(target, '.rbc-event', node);
}
function isEvent(node, bounds) {
  return !!getEventNodeFromPoint(node, bounds);
}

function getEventCoordinates(e) {
  var target = e;

  if (e.touches && e.touches.length) {
    target = e.touches[0];
  }

  return {
    clientX: target.clientX,
    clientY: target.clientY,
    pageX: target.pageX,
    pageY: target.pageY
  };
}

var clickTolerance = 5;
var clickInterval = 250;

var Selection =
/*#__PURE__*/
function () {
  function Selection(node, _temp) {
    var _ref2 = _temp === void 0 ? {} : _temp,
        _ref2$global = _ref2.global,
        global = _ref2$global === void 0 ? false : _ref2$global,
        _ref2$longPressThresh = _ref2.longPressThreshold,
        longPressThreshold = _ref2$longPressThresh === void 0 ? 250 : _ref2$longPressThresh;

    this.container = node;
    this.globalMouse = !node || global;
    this.longPressThreshold = longPressThreshold;
    this._listeners = Object.create(null);
    this._handleInitialEvent = this._handleInitialEvent.bind(this);
    this._handleMoveEvent = this._handleMoveEvent.bind(this);
    this._handleTerminatingEvent = this._handleTerminatingEvent.bind(this);
    this._keyListener = this._keyListener.bind(this); // Fixes an iOS 10 bug where scrolling could not be prevented on the window.
    // https://github.com/metafizzy/flickity/issues/457#issuecomment-254501356

    this._onTouchMoveWindowListener = addEventListener('touchmove', function () {}, window);
    this._onKeyDownListener = addEventListener('keydown', this._keyListener);
    this._onKeyUpListener = addEventListener('keyup', this._keyListener);

    this._addInitialEventListener();
  }

  var _proto = Selection.prototype;

  _proto.on = function on(type, handler) {
    var handlers = this._listeners[type] || (this._listeners[type] = []);
    handlers.push(handler);
    return {
      remove: function remove() {
        var idx = handlers.indexOf(handler);
        if (idx !== -1) handlers.splice(idx, 1);
      }
    };
  };

  _proto.emit = function emit(type) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var result;
    var handlers = this._listeners[type] || [];
    handlers.forEach(function (fn) {
      if (result === undefined) result = fn.apply(void 0, args);
    });
    return result;
  };

  _proto.teardown = function teardown() {
    this.listeners = Object.create(null);
    this._onTouchMoveWindowListener && this._onTouchMoveWindowListener.remove();
    this._onInitialEventListener && this._onInitialEventListener.remove();
    this._onEndListener && this._onEndListener.remove();
    this._onEscListener && this._onEscListener.remove();
    this._onMoveListener && this._onMoveListener.remove();
    this._onKeyUpListener && this._onKeyUpListener.remove();
    this._onKeyDownListener && this._onKeyDownListener.remove();
  };

  _proto.isSelected = function isSelected(node) {
    var box = this._selectRect;
    if (!box || !this.selecting) return false;
    return objectsCollide(box, getBoundsForNode(node));
  };

  _proto.filter = function filter(items) {
    var box = this._selectRect; //not selecting

    if (!box || !this.selecting) return [];
    return items.filter(this.isSelected, this);
  }; // Adds a listener that will call the handler only after the user has pressed on the screen
  // without moving their finger for 250ms.


  _proto._addLongPressListener = function _addLongPressListener(handler, initialEvent) {
    var _this = this;

    var timer = null;
    var touchMoveListener = null;
    var touchEndListener = null;

    var handleTouchStart = function handleTouchStart(initialEvent) {
      timer = setTimeout(function () {
        cleanup();
        handler(initialEvent);
      }, _this.longPressThreshold);
      touchMoveListener = addEventListener('touchmove', function () {
        return cleanup();
      });
      touchEndListener = addEventListener('touchend', function () {
        return cleanup();
      });
    };

    var touchStartListener = addEventListener('touchstart', handleTouchStart);

    var cleanup = function cleanup() {
      if (timer) {
        clearTimeout(timer);
      }

      if (touchMoveListener) {
        touchMoveListener.remove();
      }

      if (touchEndListener) {
        touchEndListener.remove();
      }

      timer = null;
      touchMoveListener = null;
      touchEndListener = null;
    };

    if (initialEvent) {
      handleTouchStart(initialEvent);
    }

    return {
      remove: function remove() {
        cleanup();
        touchStartListener.remove();
      }
    };
  }; // Listen for mousedown and touchstart events. When one is received, disable the other and setup
  // future event handling based on the type of event.


  _proto._addInitialEventListener = function _addInitialEventListener() {
    var _this2 = this;

    var mouseDownListener = addEventListener('mousedown', function (e) {
      _this2._onInitialEventListener.remove();

      _this2._handleInitialEvent(e);

      _this2._onInitialEventListener = addEventListener('mousedown', _this2._handleInitialEvent);
    });
    var touchStartListener = addEventListener('touchstart', function (e) {
      _this2._onInitialEventListener.remove();

      _this2._onInitialEventListener = _this2._addLongPressListener(_this2._handleInitialEvent, e);
    });
    this._onInitialEventListener = {
      remove: function remove() {
        mouseDownListener.remove();
        touchStartListener.remove();
      }
    };
  };

  _proto._handleInitialEvent = function _handleInitialEvent(e) {
    var _getEventCoordinates = getEventCoordinates(e),
        clientX = _getEventCoordinates.clientX,
        clientY = _getEventCoordinates.clientY,
        pageX = _getEventCoordinates.pageX,
        pageY = _getEventCoordinates.pageY;

    var node = this.container(),
        collides,
        offsetData; // Right clicks

    if (e.which === 3 || e.button === 2 || !isOverContainer(node, clientX, clientY)) return;

    if (!this.globalMouse && node && !contains(node, e.target)) {
      var _normalizeDistance = normalizeDistance(0),
          top = _normalizeDistance.top,
          left = _normalizeDistance.left,
          bottom = _normalizeDistance.bottom,
          right = _normalizeDistance.right;

      offsetData = getBoundsForNode(node);
      collides = objectsCollide({
        top: offsetData.top - top,
        left: offsetData.left - left,
        bottom: offsetData.bottom + bottom,
        right: offsetData.right + right
      }, {
        top: pageY,
        left: pageX
      });
      if (!collides) return;
    }

    var result = this.emit('beforeSelect', this._initialEventData = {
      isTouch: /^touch/.test(e.type),
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY
    });
    if (result === false) return;

    switch (e.type) {
      case 'mousedown':
        this._onEndListener = addEventListener('mouseup', this._handleTerminatingEvent);
        this._onEscListener = addEventListener('keydown', this._handleTerminatingEvent);
        this._onMoveListener = addEventListener('mousemove', this._handleMoveEvent);
        break;

      case 'touchstart':
        this._handleMoveEvent(e);

        this._onEndListener = addEventListener('touchend', this._handleTerminatingEvent);
        this._onMoveListener = addEventListener('touchmove', this._handleMoveEvent);
        break;

      default:
        break;
    }
  };

  _proto._handleTerminatingEvent = function _handleTerminatingEvent(e) {
    var _getEventCoordinates2 = getEventCoordinates(e),
        pageX = _getEventCoordinates2.pageX,
        pageY = _getEventCoordinates2.pageY;

    this.selecting = false;
    this._onEndListener && this._onEndListener.remove();
    this._onMoveListener && this._onMoveListener.remove();
    if (!this._initialEventData) return;
    var inRoot = !this.container || contains(this.container(), e.target);
    var bounds = this._selectRect;
    var click = this.isClick(pageX, pageY);
    this._initialEventData = null;

    if (e.key === 'Escape') {
      return this.emit('reset');
    }

    if (!inRoot) {
      return this.emit('reset');
    }

    if (click && inRoot) {
      return this._handleClickEvent(e);
    } // User drag-clicked in the Selectable area


    if (!click) return this.emit('select', bounds);
  };

  _proto._handleClickEvent = function _handleClickEvent(e) {
    var _getEventCoordinates3 = getEventCoordinates(e),
        pageX = _getEventCoordinates3.pageX,
        pageY = _getEventCoordinates3.pageY,
        clientX = _getEventCoordinates3.clientX,
        clientY = _getEventCoordinates3.clientY;

    var now = new Date().getTime();

    if (this._lastClickData && now - this._lastClickData.timestamp < clickInterval) {
      // Double click event
      this._lastClickData = null;
      return this.emit('doubleClick', {
        x: pageX,
        y: pageY,
        clientX: clientX,
        clientY: clientY
      });
    } // Click event


    this._lastClickData = {
      timestamp: now
    };
    return this.emit('click', {
      x: pageX,
      y: pageY,
      clientX: clientX,
      clientY: clientY
    });
  };

  _proto._handleMoveEvent = function _handleMoveEvent(e) {
    if (this._initialEventData === null) {
      return;
    }

    var _this$_initialEventDa = this._initialEventData,
        x = _this$_initialEventDa.x,
        y = _this$_initialEventDa.y;

    var _getEventCoordinates4 = getEventCoordinates(e),
        pageX = _getEventCoordinates4.pageX,
        pageY = _getEventCoordinates4.pageY;

    var w = Math.abs(x - pageX);
    var h = Math.abs(y - pageY);
    var left = Math.min(pageX, x),
        top = Math.min(pageY, y),
        old = this.selecting; // Prevent emitting selectStart event until mouse is moved.
    // in Chrome on Windows, mouseMove event may be fired just after mouseDown event.

    if (this.isClick(pageX, pageY) && !old && !(w || h)) {
      return;
    }

    this.selecting = true;
    this._selectRect = {
      top: top,
      left: left,
      x: pageX,
      y: pageY,
      right: left + w,
      bottom: top + h
    };

    if (!old) {
      this.emit('selectStart', this._initialEventData);
    }

    if (!this.isClick(pageX, pageY)) this.emit('selecting', this._selectRect);
    e.preventDefault();
  };

  _proto._keyListener = function _keyListener(e) {
    this.ctrl = e.metaKey || e.ctrlKey;
  };

  _proto.isClick = function isClick(pageX, pageY) {
    var _this$_initialEventDa2 = this._initialEventData,
        x = _this$_initialEventDa2.x,
        y = _this$_initialEventDa2.y,
        isTouch = _this$_initialEventDa2.isTouch;
    return !isTouch && Math.abs(pageX - x) <= clickTolerance && Math.abs(pageY - y) <= clickTolerance;
  };

  return Selection;
}();
/**
 * Resolve the disance prop from either an Int or an Object
 * @return {Object}
 */


function normalizeDistance(distance) {
  if (distance === void 0) {
    distance = 0;
  }

  if (typeof distance !== 'object') distance = {
    top: distance,
    left: distance,
    right: distance,
    bottom: distance
  };
  return distance;
}
/**
 * Given two objects containing "top", "left", "offsetWidth" and "offsetHeight"
 * properties, determine if they collide.
 * @param  {Object|HTMLElement} a
 * @param  {Object|HTMLElement} b
 * @return {bool}
 */


function objectsCollide(nodeA, nodeB, tolerance) {
  if (tolerance === void 0) {
    tolerance = 0;
  }

  var _getBoundsForNode = getBoundsForNode(nodeA),
      aTop = _getBoundsForNode.top,
      aLeft = _getBoundsForNode.left,
      _getBoundsForNode$rig = _getBoundsForNode.right,
      aRight = _getBoundsForNode$rig === void 0 ? aLeft : _getBoundsForNode$rig,
      _getBoundsForNode$bot = _getBoundsForNode.bottom,
      aBottom = _getBoundsForNode$bot === void 0 ? aTop : _getBoundsForNode$bot;

  var _getBoundsForNode2 = getBoundsForNode(nodeB),
      bTop = _getBoundsForNode2.top,
      bLeft = _getBoundsForNode2.left,
      _getBoundsForNode2$ri = _getBoundsForNode2.right,
      bRight = _getBoundsForNode2$ri === void 0 ? bLeft : _getBoundsForNode2$ri,
      _getBoundsForNode2$bo = _getBoundsForNode2.bottom,
      bBottom = _getBoundsForNode2$bo === void 0 ? bTop : _getBoundsForNode2$bo;

  return !( // 'a' bottom doesn't touch 'b' top
  aBottom - tolerance < bTop || // 'a' top doesn't touch 'b' bottom
  aTop + tolerance > bBottom || // 'a' right doesn't touch 'b' left
  aRight - tolerance < bLeft || // 'a' left doesn't touch 'b' right
  aLeft + tolerance > bRight);
}
/**
 * Given a node, get everything needed to calculate its boundaries
 * @param  {HTMLElement} node
 * @return {Object}
 */

function getBoundsForNode(node) {
  if (!node.getBoundingClientRect) return node;
  var rect = node.getBoundingClientRect(),
      left = rect.left + pageOffset('left'),
      top = rect.top + pageOffset('top');
  return {
    top: top,
    left: left,
    right: (node.offsetWidth || 0) + left,
    bottom: (node.offsetHeight || 0) + top
  };
}

function pageOffset(dir) {
  if (dir === 'left') return window.pageXOffset || document.body.scrollLeft || 0;
  if (dir === 'top') return window.pageYOffset || document.body.scrollTop || 0;
}

var BackgroundCells =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(BackgroundCells, _React$Component);

  function BackgroundCells(props, context) {
    var _this;

    _this = _React$Component.call(this, props, context) || this;
    _this.state = {
      selecting: false
    };
    return _this;
  }

  var _proto = BackgroundCells.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.props.selectable && this._selectable();
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._teardownSelectable();
  };

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable();
    if (!nextProps.selectable && this.props.selectable) this._teardownSelectable();
  };

  _proto.render = function render() {
    var _this$props = this.props,
        range$$1 = _this$props.range,
        getNow = _this$props.getNow,
        getters = _this$props.getters,
        currentDate = _this$props.date,
        Wrapper = _this$props.components.dateCellWrapper;
    var _this$state = this.state,
        selecting = _this$state.selecting,
        startIdx = _this$state.startIdx,
        endIdx = _this$state.endIdx;
    var current = getNow();
    return React.createElement("div", {
      className: "rbc-row-bg"
    }, range$$1.map(function (date, index) {
      var selected = selecting && index >= startIdx && index <= endIdx;

      var _getters$dayProp = getters.dayProp(date),
          className = _getters$dayProp.className,
          style = _getters$dayProp.style;

      return React.createElement(Wrapper, {
        key: index,
        value: date,
        range: range$$1
      }, React.createElement("div", {
        style: style,
        className: cn('rbc-day-bg', className, selected && 'rbc-selected-cell', dates.eq(date, current, 'day') && 'rbc-today', currentDate && dates.month(currentDate) !== dates.month(date) && 'rbc-off-range-bg')
      }));
    }));
  };

  _proto._selectable = function _selectable() {
    var _this2 = this;

    var node = findDOMNode(this);
    var selector = this._selector = new Selection(this.props.container, {
      longPressThreshold: this.props.longPressThreshold
    });

    var selectorClicksHandler = function selectorClicksHandler(point, actionType) {
      if (!isEvent(findDOMNode(_this2), point)) {
        var rowBox = getBoundsForNode(node);
        var _this2$props = _this2.props,
            range$$1 = _this2$props.range,
            rtl = _this2$props.rtl;

        if (pointInBox(rowBox, point)) {
          var currentCell = getSlotAtX(rowBox, point.x, rtl, range$$1.length);

          _this2._selectSlot({
            startIdx: currentCell,
            endIdx: currentCell,
            action: actionType,
            box: point
          });
        }
      }

      _this2._initial = {};

      _this2.setState({
        selecting: false
      });
    };

    selector.on('selecting', function (box) {
      var _this2$props2 = _this2.props,
          range$$1 = _this2$props2.range,
          rtl = _this2$props2.rtl;
      var startIdx = -1;
      var endIdx = -1;

      if (!_this2.state.selecting) {
        notify(_this2.props.onSelectStart, [box]);
        _this2._initial = {
          x: box.x,
          y: box.y
        };
      }

      if (selector.isSelected(node)) {
        var nodeBox = getBoundsForNode(node);

        var _dateCellSelection = dateCellSelection(_this2._initial, nodeBox, box, range$$1.length, rtl);

        startIdx = _dateCellSelection.startIdx;
        endIdx = _dateCellSelection.endIdx;
      }

      _this2.setState({
        selecting: true,
        startIdx: startIdx,
        endIdx: endIdx
      });
    });
    selector.on('beforeSelect', function (box) {
      if (_this2.props.selectable !== 'ignoreEvents') return;
      return !isEvent(findDOMNode(_this2), box);
    });
    selector.on('click', function (point) {
      return selectorClicksHandler(point, 'click');
    });
    selector.on('doubleClick', function (point) {
      return selectorClicksHandler(point, 'doubleClick');
    });
    selector.on('select', function (bounds) {
      _this2._selectSlot(_extends({}, _this2.state, {
        action: 'select',
        bounds: bounds
      }));

      _this2._initial = {};

      _this2.setState({
        selecting: false
      });

      notify(_this2.props.onSelectEnd, [_this2.state]);
    });
  };

  _proto._teardownSelectable = function _teardownSelectable() {
    if (!this._selector) return;

    this._selector.teardown();

    this._selector = null;
  };

  _proto._selectSlot = function _selectSlot(_ref) {
    var endIdx = _ref.endIdx,
        startIdx = _ref.startIdx,
        action = _ref.action,
        bounds = _ref.bounds,
        box = _ref.box;
    if (endIdx !== -1 && startIdx !== -1) this.props.onSelectSlot && this.props.onSelectSlot({
      start: startIdx,
      end: endIdx,
      action: action,
      bounds: bounds,
      box: box
    });
  };

  return BackgroundCells;
}(React.Component);

BackgroundCells.propTypes = process.env.NODE_ENV !== "production" ? {
  date: PropTypes.instanceOf(Date),
  getNow: PropTypes.func.isRequired,
  getters: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  container: PropTypes.func,
  dayPropGetter: PropTypes.func,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,
  onSelectSlot: PropTypes.func.isRequired,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  rtl: PropTypes.bool,
  type: PropTypes.string
} : {};

/* eslint-disable react/prop-types */

var EventRowMixin = {
  propTypes: {
    slotMetrics: PropTypes.object.isRequired,
    selected: PropTypes.object,
    isAllDay: PropTypes.bool,
    accessors: PropTypes.object.isRequired,
    localizer: PropTypes.object.isRequired,
    components: PropTypes.object.isRequired,
    getters: PropTypes.object.isRequired,
    onSelect: PropTypes.func,
    onDoubleClick: PropTypes.func
  },
  defaultProps: {
    segments: [],
    selected: {}
  },
  renderEvent: function renderEvent(props, event) {
    var selected = props.selected,
        _ = props.isAllDay,
        accessors = props.accessors,
        getters = props.getters,
        onSelect = props.onSelect,
        onDoubleClick = props.onDoubleClick,
        localizer = props.localizer,
        slotMetrics = props.slotMetrics,
        components = props.components;
    var continuesPrior = slotMetrics.continuesPrior(event);
    var continuesAfter = slotMetrics.continuesAfter(event);
    return React.createElement(EventCell, {
      event: event,
      getters: getters,
      localizer: localizer,
      accessors: accessors,
      components: components,
      onSelect: onSelect,
      onDoubleClick: onDoubleClick,
      continuesPrior: continuesPrior,
      continuesAfter: continuesAfter,
      selected: isSelected(event, selected)
    });
  },
  renderSpan: function renderSpan(slots, len, key, content) {
    if (content === void 0) {
      content = ' ';
    }

    var per = Math.abs(len) / slots * 100 + '%';
    return React.createElement("div", {
      key: key,
      className: "rbc-row-segment" // IE10/11 need max-width. flex-basis doesn't respect box-sizing
      ,
      style: {
        WebkitFlexBasis: per,
        flexBasis: per,
        maxWidth: per
      }
    }, content);
  }
};

var EventRow =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(EventRow, _React$Component);

  function EventRow() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = EventRow.prototype;

  _proto.render = function render() {
    var _this = this;

    var _this$props = this.props,
        segments = _this$props.segments,
        slots = _this$props.slotMetrics.slots,
        className = _this$props.className;
    var lastEnd = 1;
    return React.createElement("div", {
      className: cn(className, 'rbc-row')
    }, segments.reduce(function (row, _ref, li) {
      var event = _ref.event,
          left = _ref.left,
          right = _ref.right,
          span = _ref.span;
      var key = '_lvl_' + li;
      var gap = left - lastEnd;
      var content = EventRowMixin.renderEvent(_this.props, event);
      if (gap) row.push(EventRowMixin.renderSpan(slots, gap, key + "_gap"));
      row.push(EventRowMixin.renderSpan(slots, span, key, content));
      lastEnd = right + 1;
      return row;
    }, []));
  };

  return EventRow;
}(React.Component);

EventRow.propTypes = process.env.NODE_ENV !== "production" ? _extends({
  segments: PropTypes.array
}, EventRowMixin.propTypes) : {};
EventRow.defaultProps = _extends({}, EventRowMixin.defaultProps);

function endOfRange(dateRange, unit) {
  if (unit === void 0) {
    unit = 'day';
  }

  return {
    first: dateRange[0],
    last: dates.add(dateRange[dateRange.length - 1], 1, unit)
  };
}
function eventSegments(event, range$$1, accessors) {
  var _endOfRange = endOfRange(range$$1),
      first = _endOfRange.first,
      last = _endOfRange.last;

  var slots = dates.diff(first, last, 'day');
  var start = dates.max(dates.startOf(accessors.start(event), 'day'), first);
  var end = dates.min(dates.ceil(accessors.end(event), 'day'), last);
  var padding = findIndex(range$$1, function (x) {
    return dates.eq(x, start, 'day');
  });
  var span = dates.diff(start, end, 'day');
  span = Math.min(span, slots);
  span = Math.max(span, 1);
  return {
    event: event,
    span: span,
    left: padding + 1,
    right: Math.max(padding + span, 1)
  };
}
function eventLevels(rowSegments, limit) {
  if (limit === void 0) {
    limit = Infinity;
  }

  var i,
      j,
      seg,
      levels = [],
      extra = [];

  for (i = 0; i < rowSegments.length; i++) {
    seg = rowSegments[i];

    for (j = 0; j < levels.length; j++) {
      if (!segsOverlap(seg, levels[j])) break;
    }

    if (j >= limit) {
      extra.push(seg);
    } else {
      (levels[j] || (levels[j] = [])).push(seg);
    }
  }

  for (i = 0; i < levels.length; i++) {
    levels[i].sort(function (a, b) {
      return a.left - b.left;
    }); //eslint-disable-line
  }

  return {
    levels: levels,
    extra: extra
  };
}
function inRange(e, start, end, accessors) {
  var eStart = dates.startOf(accessors.start(e), 'day');
  var eEnd = accessors.end(e);
  var startsBeforeEnd = dates.lte(eStart, end, 'day'); // when the event is zero duration we need to handle a bit differently

  var endsAfterStart = !dates.eq(eStart, eEnd, 'minutes') ? dates.gt(eEnd, start, 'minutes') : dates.gte(eEnd, start, 'minutes');
  return startsBeforeEnd && endsAfterStart;
}
function segsOverlap(seg, otherSegs) {
  return otherSegs.some(function (otherSeg) {
    return otherSeg.left <= seg.right && otherSeg.right >= seg.left;
  });
}
function sortEvents(evtA, evtB, accessors) {
  var startSort = +dates.startOf(accessors.start(evtA), 'day') - +dates.startOf(accessors.start(evtB), 'day');
  var durA = dates.diff(accessors.start(evtA), dates.ceil(accessors.end(evtA), 'day'), 'day');
  var durB = dates.diff(accessors.start(evtB), dates.ceil(accessors.end(evtB), 'day'), 'day');
  return startSort || // sort by start Day first
  Math.max(durB, 1) - Math.max(durA, 1) || // events spanning multiple days go first
  !!accessors.allDay(evtB) - !!accessors.allDay(evtA) || // then allDay single day events
  +accessors.start(evtA) - +accessors.start(evtB); // then sort by start time
}

var isSegmentInSlot = function isSegmentInSlot(seg, slot) {
  return seg.left <= slot && seg.right >= slot;
};

var eventsInSlot = function eventsInSlot(segments, slot) {
  return segments.filter(function (seg) {
    return isSegmentInSlot(seg, slot);
  }).length;
};

var EventEndingRow =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(EventEndingRow, _React$Component);

  function EventEndingRow() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = EventEndingRow.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        segments = _this$props.segments,
        slots = _this$props.slotMetrics.slots;
    var rowSegments = eventLevels(segments).levels[0];
    var current = 1,
        lastEnd = 1,
        row = [];

    while (current <= slots) {
      var key = '_lvl_' + current;

      var _ref = rowSegments.filter(function (seg) {
        return isSegmentInSlot(seg, current);
      })[0] || {},
          event = _ref.event,
          left = _ref.left,
          right = _ref.right,
          span = _ref.span; //eslint-disable-line


      if (!event) {
        current++;
        continue;
      }

      var gap = Math.max(0, left - lastEnd);

      if (this.canRenderSlotEvent(left, span)) {
        var content = EventRowMixin.renderEvent(this.props, event);

        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'));
        }

        row.push(EventRowMixin.renderSpan(slots, span, key, content));
        lastEnd = current = right + 1;
      } else {
        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'));
        }

        row.push(EventRowMixin.renderSpan(slots, 1, key, this.renderShowMore(segments, current)));
        lastEnd = current = current + 1;
      }
    }

    return React.createElement("div", {
      className: "rbc-row"
    }, row);
  };

  _proto.canRenderSlotEvent = function canRenderSlotEvent(slot, span) {
    var segments = this.props.segments;
    return range(slot, slot + span).every(function (s) {
      var count = eventsInSlot(segments, s);
      return count === 1;
    });
  };

  _proto.renderShowMore = function renderShowMore(segments, slot) {
    var _this = this;

    var localizer = this.props.localizer;
    var count = eventsInSlot(segments, slot);
    return count ? React.createElement("a", {
      key: 'sm_' + slot,
      href: "#",
      className: 'rbc-show-more',
      onClick: function onClick(e) {
        return _this.showMore(slot, e);
      }
    }, localizer.messages.showMore(count)) : false;
  };

  _proto.showMore = function showMore(slot, e) {
    e.preventDefault();
    this.props.onShowMore(slot);
  };

  return EventEndingRow;
}(React.Component);

EventEndingRow.propTypes = process.env.NODE_ENV !== "production" ? _extends({
  segments: PropTypes.array,
  slots: PropTypes.number,
  onShowMore: PropTypes.func
}, EventRowMixin.propTypes) : {};
EventEndingRow.defaultProps = _extends({}, EventRowMixin.defaultProps);

var isSegmentInSlot$1 = function isSegmentInSlot(seg, slot) {
  return seg.left <= slot && seg.right >= slot;
};

var isEqual = function isEqual(a, b) {
  return a.range === b.range && a.events === b.events;
};

function getSlotMetrics() {
  return memoize(function (options) {
    var range$$1 = options.range,
        events$$1 = options.events,
        maxRows = options.maxRows,
        minRows = options.minRows,
        accessors = options.accessors;

    var _endOfRange = endOfRange(range$$1),
        first = _endOfRange.first,
        last = _endOfRange.last;

    var segments = events$$1.map(function (evt) {
      return eventSegments(evt, range$$1, accessors);
    });

    var _eventLevels = eventLevels(segments, Math.max(maxRows - 1, 1)),
        levels = _eventLevels.levels,
        extra = _eventLevels.extra;

    while (levels.length < minRows) {
      levels.push([]);
    }

    return {
      first: first,
      last: last,
      levels: levels,
      extra: extra,
      range: range$$1,
      slots: range$$1.length,
      clone: function clone(args) {
        var metrics = getSlotMetrics();
        return metrics(_extends({}, options, args));
      },
      getDateForSlot: function getDateForSlot(slotNumber) {
        return range$$1[slotNumber];
      },
      getSlotForDate: function getSlotForDate(date) {
        return range$$1.find(function (r) {
          return dates.eq(r, date, 'day');
        });
      },
      getEventsForSlot: function getEventsForSlot(slot) {
        return segments.filter(function (seg) {
          return isSegmentInSlot$1(seg, slot);
        }).map(function (seg) {
          return seg.event;
        });
      },
      continuesPrior: function continuesPrior(event) {
        return dates.lt(accessors.start(event), first, 'day');
      },
      continuesAfter: function continuesAfter(event) {
        var eventEnd = accessors.end(event);
        var singleDayDuration = dates.eq(accessors.start(event), eventEnd, 'minutes');
        return singleDayDuration ? dates.gte(eventEnd, last, 'minutes') : dates.gt(eventEnd, last, 'minutes');
      }
    };
  }, isEqual);
}

var DateContentRow =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(DateContentRow, _React$Component);

  function DateContentRow() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this.handleSelectSlot = function (slot) {
      var _this$props = _this.props,
          range$$1 = _this$props.range,
          onSelectSlot = _this$props.onSelectSlot;
      onSelectSlot(range$$1.slice(slot.start, slot.end + 1), slot);
    };

    _this.handleShowMore = function (slot) {
      var _this$props2 = _this.props,
          range$$1 = _this$props2.range,
          onShowMore = _this$props2.onShowMore;

      var metrics = _this.slotMetrics(_this.props);

      var row = qsa(findDOMNode(_assertThisInitialized(_assertThisInitialized(_this))), '.rbc-row-bg')[0];
      var cell;
      if (row) cell = row.children[slot - 1];
      var events$$1 = metrics.getEventsForSlot(slot);
      onShowMore(events$$1, range$$1[slot - 1], cell, slot);
    };

    _this.createHeadingRef = function (r) {
      _this.headingRow = r;
    };

    _this.createEventRef = function (r) {
      _this.eventRow = r;
    };

    _this.getContainer = function () {
      var container = _this.props.container;
      return container ? container() : findDOMNode(_assertThisInitialized(_assertThisInitialized(_this)));
    };

    _this.renderHeadingCell = function (date, index) {
      var _this$props3 = _this.props,
          renderHeader = _this$props3.renderHeader,
          getNow = _this$props3.getNow;
      return renderHeader({
        date: date,
        key: "header_" + index,
        className: cn('rbc-date-cell', dates.eq(date, getNow(), 'day') && 'rbc-now')
      });
    };

    _this.renderDummy = function () {
      var _this$props4 = _this.props,
          className = _this$props4.className,
          range$$1 = _this$props4.range,
          renderHeader = _this$props4.renderHeader;
      return React.createElement("div", {
        className: className
      }, React.createElement("div", {
        className: "rbc-row-content"
      }, renderHeader && React.createElement("div", {
        className: "rbc-row",
        ref: _this.createHeadingRef
      }, range$$1.map(_this.renderHeadingCell)), React.createElement("div", {
        className: "rbc-row",
        ref: _this.createEventRef
      }, React.createElement("div", {
        className: "rbc-row-segment"
      }, React.createElement("div", {
        className: "rbc-event"
      }, React.createElement("div", {
        className: "rbc-event-content"
      }, "\xA0"))))));
    };

    _this.slotMetrics = getSlotMetrics();
    return _this;
  }

  var _proto = DateContentRow.prototype;

  _proto.getRowLimit = function getRowLimit() {
    var eventHeight = getHeight(this.eventRow);
    var headingHeight = this.headingRow ? getHeight(this.headingRow) : 0;
    var eventSpace = getHeight(findDOMNode(this)) - headingHeight;
    return Math.max(Math.floor(eventSpace / eventHeight), 1);
  };

  _proto.render = function render() {
    var _this$props5 = this.props,
        date = _this$props5.date,
        rtl = _this$props5.rtl,
        range$$1 = _this$props5.range,
        className = _this$props5.className,
        selected = _this$props5.selected,
        selectable = _this$props5.selectable,
        renderForMeasure = _this$props5.renderForMeasure,
        accessors = _this$props5.accessors,
        getters = _this$props5.getters,
        components = _this$props5.components,
        getNow = _this$props5.getNow,
        renderHeader = _this$props5.renderHeader,
        onSelect = _this$props5.onSelect,
        localizer = _this$props5.localizer,
        onSelectStart = _this$props5.onSelectStart,
        onSelectEnd = _this$props5.onSelectEnd,
        onDoubleClick = _this$props5.onDoubleClick,
        resourceId = _this$props5.resourceId,
        longPressThreshold = _this$props5.longPressThreshold,
        isAllDay = _this$props5.isAllDay;
    if (renderForMeasure) return this.renderDummy();
    var metrics = this.slotMetrics(this.props);
    var levels = metrics.levels,
        extra = metrics.extra;
    var WeekWrapper = components.weekWrapper;
    var eventRowProps = {
      selected: selected,
      accessors: accessors,
      getters: getters,
      localizer: localizer,
      components: components,
      onSelect: onSelect,
      onDoubleClick: onDoubleClick,
      resourceId: resourceId,
      slotMetrics: metrics
    };
    return React.createElement("div", {
      className: className
    }, React.createElement(BackgroundCells, {
      date: date,
      getNow: getNow,
      rtl: rtl,
      range: range$$1,
      selectable: selectable,
      container: this.getContainer,
      getters: getters,
      onSelectStart: onSelectStart,
      onSelectEnd: onSelectEnd,
      onSelectSlot: this.handleSelectSlot,
      components: components,
      longPressThreshold: longPressThreshold
    }), React.createElement("div", {
      className: "rbc-row-content"
    }, renderHeader && React.createElement("div", {
      className: "rbc-row ",
      ref: this.createHeadingRef
    }, range$$1.map(this.renderHeadingCell)), React.createElement(WeekWrapper, _extends({
      isAllDay: isAllDay
    }, eventRowProps), levels.map(function (segs, idx) {
      return React.createElement(EventRow, _extends({
        key: idx,
        segments: segs
      }, eventRowProps));
    }), !!extra.length && React.createElement(EventEndingRow, _extends({
      segments: extra,
      onShowMore: this.handleShowMore
    }, eventRowProps)))));
  };

  return DateContentRow;
}(React.Component);

DateContentRow.propTypes = process.env.NODE_ENV !== "production" ? {
  date: PropTypes.instanceOf(Date),
  events: PropTypes.array.isRequired,
  range: PropTypes.array.isRequired,
  rtl: PropTypes.bool,
  resourceId: PropTypes.any,
  renderForMeasure: PropTypes.bool,
  renderHeader: PropTypes.func,
  container: PropTypes.func,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,
  onShowMore: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelect: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onDoubleClick: PropTypes.func,
  dayPropGetter: PropTypes.func,
  getNow: PropTypes.func.isRequired,
  isAllDay: PropTypes.bool,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  minRows: PropTypes.number.isRequired,
  maxRows: PropTypes.number.isRequired
} : {};
DateContentRow.defaultProps = {
  minRows: 0,
  maxRows: Infinity
};

var Header = function Header(_ref) {
  var label = _ref.label;
  return React.createElement("span", null, label);
};

Header.propTypes = process.env.NODE_ENV !== "production" ? {
  label: PropTypes.node
} : {};

var DateHeader = function DateHeader(_ref) {
  var label = _ref.label,
      drilldownView = _ref.drilldownView,
      onDrillDown = _ref.onDrillDown;

  if (!drilldownView) {
    return React.createElement("span", null, label);
  }

  return React.createElement("a", {
    href: "#",
    onClick: onDrillDown
  }, label);
};

DateHeader.propTypes = process.env.NODE_ENV !== "production" ? {
  label: PropTypes.node,
  date: PropTypes.instanceOf(Date),
  drilldownView: PropTypes.string,
  onDrillDown: PropTypes.func,
  isOffRange: PropTypes.bool
} : {};

var eventsForWeek = function eventsForWeek(evts, start, end, accessors) {
  return evts.filter(function (e) {
    return inRange(e, start, end, accessors);
  });
};

var MonthView =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(MonthView, _React$Component);

  function MonthView() {
    var _this;

    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(_args)) || this;

    _this.getContainer = function () {
      return findDOMNode(_assertThisInitialized(_assertThisInitialized(_this)));
    };

    _this.renderWeek = function (week, weekIdx) {
      var _this$props = _this.props,
          events$$1 = _this$props.events,
          components = _this$props.components,
          selectable = _this$props.selectable,
          getNow = _this$props.getNow,
          selected = _this$props.selected,
          date = _this$props.date,
          localizer = _this$props.localizer,
          longPressThreshold = _this$props.longPressThreshold,
          accessors = _this$props.accessors,
          getters = _this$props.getters;
      var _this$state = _this.state,
          needLimitMeasure = _this$state.needLimitMeasure,
          rowLimit = _this$state.rowLimit;
      events$$1 = eventsForWeek(events$$1, week[0], week[week.length - 1], accessors);
      events$$1.sort(function (a, b) {
        return sortEvents(a, b, accessors);
      });
      return React.createElement(DateContentRow, {
        key: weekIdx,
        ref: weekIdx === 0 ? 'slotRow' : undefined,
        container: _this.getContainer,
        className: "rbc-month-row",
        getNow: getNow,
        date: date,
        range: week,
        events: events$$1,
        maxRows: Infinity,
        selected: selected,
        selectable: selectable,
        components: components,
        accessors: accessors,
        getters: getters,
        localizer: localizer,
        renderHeader: _this.readerDateHeading,
        renderForMeasure: needLimitMeasure,
        onShowMore: _this.handleShowMore,
        onSelect: _this.handleSelectEvent,
        onDoubleClick: _this.handleDoubleClickEvent,
        onSelectSlot: _this.handleSelectSlot,
        longPressThreshold: longPressThreshold,
        rtl: _this.props.rtl
      });
    };

    _this.readerDateHeading = function (_ref) {
      var date = _ref.date,
          className = _ref.className,
          props = _objectWithoutPropertiesLoose(_ref, ["date", "className"]);

      var _this$props2 = _this.props,
          currentDate = _this$props2.date,
          getDrilldownView = _this$props2.getDrilldownView,
          localizer = _this$props2.localizer;
      var isOffRange = dates.month(date) !== dates.month(currentDate);
      var isCurrent = dates.eq(date, currentDate, 'day');
      var drilldownView = getDrilldownView(date);
      var label = localizer.format(date, 'dateFormat');
      var DateHeaderComponent = _this.props.components.dateHeader || DateHeader;
      return React.createElement("div", _extends({}, props, {
        className: cn(className, isOffRange && 'rbc-off-range', isCurrent && 'rbc-current')
      }), React.createElement(DateHeaderComponent, {
        label: label,
        date: date,
        drilldownView: drilldownView,
        isOffRange: isOffRange,
        onDrillDown: function onDrillDown(e) {
          return _this.handleHeadingClick(date, drilldownView, e);
        }
      }));
    };

    _this.handleSelectSlot = function (range$$1, slotInfo) {
      _this._pendingSelection = _this._pendingSelection.concat(range$$1);
      clearTimeout(_this._selectTimer);
      _this._selectTimer = setTimeout(function () {
        return _this.selectDates(slotInfo);
      });
    };

    _this.handleHeadingClick = function (date, view, e) {
      e.preventDefault();

      _this.clearSelection();

      notify(_this.props.onDrillDown, [date, view]);
    };

    _this.handleSelectEvent = function () {
      _this.clearSelection();

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      notify(_this.props.onSelectEvent, args);
    };

    _this.handleDoubleClickEvent = function () {
      _this.clearSelection();

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      notify(_this.props.onDoubleClickEvent, args);
    };

    _this.handleShowMore = function (events$$1, date, cell, slot) {
      var _this$props3 = _this.props,
          popup = _this$props3.popup,
          onDrillDown = _this$props3.onDrillDown,
          onShowMore = _this$props3.onShowMore,
          getDrilldownView = _this$props3.getDrilldownView; //cancel any pending selections so only the event click goes through.

      _this.clearSelection();

      if (popup) {
        var position = getPosition(cell, findDOMNode(_assertThisInitialized(_assertThisInitialized(_this))));

        _this.setState({
          overlay: {
            date: date,
            events: events$$1,
            position: position
          }
        });
      } else {
        notify(onDrillDown, [date, getDrilldownView(date) || views.DAY]);
      }

      notify(onShowMore, [events$$1, date, slot]);
    };

    _this._bgRows = [];
    _this._pendingSelection = [];
    _this.state = {
      rowLimit: 5,
      needLimitMeasure: true
    };
    return _this;
  }

  var _proto = MonthView.prototype;

  _proto.componentWillReceiveProps = function componentWillReceiveProps(_ref2) {
    var date = _ref2.date;
    this.setState({
      needLimitMeasure: !dates.eq(date, this.props.date)
    });
  };

  _proto.componentDidMount = function componentDidMount() {
    var _this2 = this;

    var running;
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props);
    window.addEventListener('resize', this._resizeListener = function () {
      if (!running) {
        raf(function () {
          running = false;

          _this2.setState({
            needLimitMeasure: true
          }); //eslint-disable-line

        });
      }
    }, false);
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    if (this.state.needLimitMeasure) this.measureRowLimit(this.props);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    window.removeEventListener('resize', this._resizeListener, false);
  };

  _proto.render = function render() {
    var _this$props4 = this.props,
        date = _this$props4.date,
        localizer = _this$props4.localizer,
        className = _this$props4.className,
        month = dates.visibleDays(date, localizer),
        weeks = chunk(month, 7);
    this._weekCount = weeks.length;
    return React.createElement("div", {
      className: cn('rbc-month-view', className)
    }, React.createElement("div", {
      className: "rbc-row rbc-month-header"
    }, this.renderHeaders(weeks[0])), weeks.map(this.renderWeek), this.props.popup && this.renderOverlay());
  };

  _proto.renderHeaders = function renderHeaders(row) {
    var _this$props5 = this.props,
        localizer = _this$props5.localizer,
        components = _this$props5.components;
    var first = row[0];
    var last = row[row.length - 1];
    var HeaderComponent = components.header || Header;
    return dates.range(first, last, 'day').map(function (day, idx) {
      return React.createElement("div", {
        key: 'header_' + idx,
        className: "rbc-header"
      }, React.createElement(HeaderComponent, {
        date: day,
        localizer: localizer,
        label: localizer.format(day, 'weekdayFormat')
      }));
    });
  };

  _proto.renderOverlay = function renderOverlay() {
    var _this3 = this;

    var overlay = this.state && this.state.overlay || {};
    var _this$props6 = this.props,
        accessors = _this$props6.accessors,
        localizer = _this$props6.localizer,
        components = _this$props6.components,
        getters = _this$props6.getters,
        selected = _this$props6.selected;
    return React.createElement(Overlay, {
      rootClose: true,
      placement: "bottom",
      container: this,
      show: !!overlay.position,
      onHide: function onHide() {
        return _this3.setState({
          overlay: null
        });
      }
    }, React.createElement(Popup, {
      accessors: accessors,
      getters: getters,
      selected: selected,
      components: components,
      localizer: localizer,
      position: overlay.position,
      events: overlay.events,
      slotStart: overlay.date,
      slotEnd: overlay.end,
      onSelect: this.handleSelectEvent,
      onDoubleClick: this.handleDoubleClickEvent
    }));
  };

  _proto.measureRowLimit = function measureRowLimit() {
    this.setState({
      needLimitMeasure: false,
      rowLimit: this.refs.slotRow.getRowLimit()
    });
  };

  _proto.selectDates = function selectDates(slotInfo) {
    var slots = this._pendingSelection.slice();

    this._pendingSelection = [];
    slots.sort(function (a, b) {
      return +a - +b;
    });
    notify(this.props.onSelectSlot, {
      slots: slots,
      start: slots[0],
      end: slots[slots.length - 1],
      action: slotInfo.action,
      bounds: slotInfo.bounds,
      box: slotInfo.box
    });
  };

  _proto.clearSelection = function clearSelection() {
    clearTimeout(this._selectTimer);
    this._pendingSelection = [];
  };

  return MonthView;
}(React.Component);

MonthView.propTypes = process.env.NODE_ENV !== "production" ? {
  events: PropTypes.array.isRequired,
  date: PropTypes.instanceOf(Date),
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  step: PropTypes.number,
  getNow: PropTypes.func.isRequired,
  scrollToTime: PropTypes.instanceOf(Date),
  rtl: PropTypes.bool,
  width: PropTypes.number,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,
  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onShowMore: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
  popup: PropTypes.bool,
  popupOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })])
} : {};

MonthView.range = function (date, _ref3) {
  var localizer = _ref3.localizer;
  var start = dates.firstVisibleDay(date, localizer);
  var end = dates.lastVisibleDay(date, localizer);
  return {
    start: start,
    end: end
  };
};

MonthView.navigate = function (date, action) {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'month');

    case navigate.NEXT:
      return dates.add(date, 1, 'month');

    default:
      return date;
  }
};

MonthView.title = function (date, _ref4) {
  var localizer = _ref4.localizer;
  return localizer.format(date, 'monthHeaderFormat');
};

var getDstOffset = function getDstOffset(start, end) {
  return start.getTimezoneOffset() - end.getTimezoneOffset();
};

var getKey = function getKey(min, max, step, slots) {
  return "" + +dates.startOf(min, 'minutes') + ("" + +dates.startOf(max, 'minutes')) + (step + "-" + slots);
};

function getSlotMetrics$1(_ref) {
  var start = _ref.min,
      end = _ref.max,
      step = _ref.step,
      timeslots = _ref.timeslots;
  var key = getKey(start, end, step, timeslots);
  var totalMin = 1 + dates.diff(start, end, 'minutes') + getDstOffset(start, end);
  var minutesFromMidnight = dates.diff(dates.startOf(start, 'day'), start, 'minutes');
  var numGroups = Math.ceil(totalMin / (step * timeslots));
  var numSlots = numGroups * timeslots;
  var groups = new Array(numGroups);
  var slots = new Array(numSlots); // Each slot date is created from "zero", instead of adding `step` to
  // the previous one, in order to avoid DST oddities

  for (var grp = 0; grp < numGroups; grp++) {
    groups[grp] = new Array(timeslots);

    for (var slot = 0; slot < timeslots; slot++) {
      var slotIdx = grp * timeslots + slot;
      var minFromStart = slotIdx * step; // A date with total minutes calculated from the start of the day

      slots[slotIdx] = groups[grp][slot] = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, minutesFromMidnight + minFromStart, 0, 0);
    }
  } // Necessary to be able to select up until the last timeslot in a day


  var lastSlotMinFromStart = slots.length * step;
  slots.push(new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, minutesFromMidnight + lastSlotMinFromStart, 0, 0));

  function positionFromDate(date) {
    var diff = dates.diff(start, date, 'minutes') + getDstOffset(start, date);
    return Math.min(diff, totalMin);
  }

  return {
    groups: groups,
    update: function update(args) {
      if (getKey(args) !== key) return getSlotMetrics$1(args);
      return this;
    },
    dateIsInGroup: function dateIsInGroup(date, groupIndex) {
      var nextGroup = groups[groupIndex + 1];
      return dates.inRange(date, groups[groupIndex][0], nextGroup ? nextGroup[0] : end, 'minutes');
    },
    nextSlot: function nextSlot(slot) {
      var next = slots[Math.min(slots.indexOf(slot) + 1, slots.length - 1)]; // in the case of the last slot we won't a long enough range so manually get it

      if (next === slot) next = dates.add(slot, step, 'minutes');
      return next;
    },
    closestSlotToPosition: function closestSlotToPosition(percent) {
      var slot = Math.min(slots.length - 1, Math.max(0, Math.floor(percent * numSlots)));
      return slots[slot];
    },
    closestSlotFromPoint: function closestSlotFromPoint(point, boundaryRect) {
      var range$$1 = Math.abs(boundaryRect.top - boundaryRect.bottom);
      return this.closestSlotToPosition((point.y - boundaryRect.top) / range$$1);
    },
    closestSlotFromDate: function closestSlotFromDate(date, offset) {
      if (offset === void 0) {
        offset = 0;
      }

      if (dates.lt(date, start, 'minutes')) return slots[0];
      var diffMins = dates.diff(start, date, 'minutes');
      return slots[(diffMins - diffMins % step) / step + offset];
    },
    startsBeforeDay: function startsBeforeDay(date) {
      return dates.lt(date, start, 'day');
    },
    startsAfterDay: function startsAfterDay(date) {
      return dates.gt(date, end, 'day');
    },
    startsBefore: function startsBefore(date) {
      return dates.lt(dates.merge(start, date), start, 'minutes');
    },
    startsAfter: function startsAfter(date) {
      return dates.gt(dates.merge(end, date), end, 'minutes');
    },
    getRange: function getRange(rangeStart, rangeEnd) {
      rangeStart = dates.min(end, dates.max(start, rangeStart));
      rangeEnd = dates.min(end, dates.max(start, rangeEnd));
      var rangeStartMin = positionFromDate(rangeStart);
      var rangeEndMin = positionFromDate(rangeEnd);
      var top = rangeStartMin / (step * numSlots) * 100;
      return {
        top: top,
        height: rangeEndMin / (step * numSlots) * 100 - top,
        start: positionFromDate(rangeStart),
        startDate: rangeStart,
        end: positionFromDate(rangeEnd),
        endDate: rangeEnd
      };
    }
  };
}

var Event =
/*#__PURE__*/
function () {
  function Event(data, _ref) {
    var accessors = _ref.accessors,
        slotMetrics = _ref.slotMetrics;

    var _slotMetrics$getRange = slotMetrics.getRange(accessors.start(data), accessors.end(data)),
        start = _slotMetrics$getRange.start,
        startDate = _slotMetrics$getRange.startDate,
        end = _slotMetrics$getRange.end,
        endDate = _slotMetrics$getRange.endDate,
        top = _slotMetrics$getRange.top,
        height = _slotMetrics$getRange.height;

    this.start = start;
    this.end = end;
    this.startMs = +startDate;
    this.endMs = +endDate;
    this.top = top;
    this.height = height;
    this.data = data;
  }
  /**
   * The event's width without any overlap.
   */


  _createClass(Event, [{
    key: "_width",
    get: function get() {
      // The container event's width is determined by the maximum number of
      // events in any of its rows.
      if (this.rows) {
        var columns = this.rows.reduce(function (max, row) {
          return Math.max(max, row.leaves.length + 1);
        }, // add itself
        0) + 1; // add the container

        return 100 / columns;
      }

      var availableWidth = 100 - this.container._width; // The row event's width is the space left by the container, divided
      // among itself and its leaves.

      if (this.leaves) {
        return availableWidth / (this.leaves.length + 1);
      } // The leaf event's width is determined by its row's width


      return this.row._width;
    }
    /**
     * The event's calculated width, possibly with extra width added for
     * overlapping effect.
     */

  }, {
    key: "width",
    get: function get() {
      var noOverlap = this._width;
      var overlap = Math.min(100, this._width * 1.7); // Containers can always grow.

      if (this.rows) {
        return overlap;
      } // Rows can grow if they have leaves.


      if (this.leaves) {
        return this.leaves.length > 0 ? overlap : noOverlap;
      } // Leaves can grow unless they're the last item in a row.


      var leaves = this.row.leaves;
      var index = leaves.indexOf(this);
      return index === leaves.length - 1 ? noOverlap : overlap;
    }
  }, {
    key: "xOffset",
    get: function get() {
      // Containers have no offset.
      if (this.rows) return 0; // Rows always start where their container ends.

      if (this.leaves) return this.container._width; // Leaves are spread out evenly on the space left by its row.

      var _this$row = this.row,
          leaves = _this$row.leaves,
          xOffset = _this$row.xOffset,
          _width = _this$row._width;
      var index = leaves.indexOf(this) + 1;
      return xOffset + index * _width;
    }
  }]);

  return Event;
}();
/**
 * Return true if event a and b is considered to be on the same row.
 */


function onSameRow(a, b, minimumStartDifference) {
  return (// Occupies the same start slot.
    Math.abs(b.start - a.start) < minimumStartDifference || // A's start slot overlaps with b's end slot.
    b.start > a.start && b.start < a.end
  );
}

function sortByRender(events$$1) {
  var sortedByTime = sortBy(events$$1, ['startMs', function (e) {
    return -e.endMs;
  }]);
  var sorted = [];

  while (sortedByTime.length > 0) {
    var event = sortedByTime.shift();
    sorted.push(event);

    for (var i = 0; i < sortedByTime.length; i++) {
      var test = sortedByTime[i]; // Still inside this event, look for next.

      if (event.endMs > test.startMs) continue; // We've found the first event of the next event group.
      // If that event is not right next to our current event, we have to
      // move it here.

      if (i > 0) {
        var _event = sortedByTime.splice(i, 1)[0];
        sorted.push(_event);
      } // We've already found the next event group, so stop looking.


      break;
    }
  }

  return sorted;
}

function getStyledEvents(_ref2) {
  var events$$1 = _ref2.events,
      minimumStartDifference = _ref2.minimumStartDifference,
      slotMetrics = _ref2.slotMetrics,
      accessors = _ref2.accessors;
  // Create proxy events and order them so that we don't have
  // to fiddle with z-indexes.
  var proxies = events$$1.map(function (event) {
    return new Event(event, {
      slotMetrics: slotMetrics,
      accessors: accessors
    });
  });
  var eventsInRenderOrder = sortByRender(proxies); // Group overlapping events, while keeping order.
  // Every event is always one of: container, row or leaf.
  // Containers can contain rows, and rows can contain leaves.

  var containerEvents = [];

  var _loop = function _loop(i) {
    var event = eventsInRenderOrder[i]; // Check if this event can go into a container event.

    var container = containerEvents.find(function (c) {
      return c.end > event.start || Math.abs(event.start - c.start) < minimumStartDifference;
    }); // Couldn't find a container — that means this event is a container.

    if (!container) {
      event.rows = [];
      containerEvents.push(event);
      return "continue";
    } // Found a container for the event.


    event.container = container; // Check if the event can be placed in an existing row.
    // Start looking from behind.

    var row = null;

    for (var j = container.rows.length - 1; !row && j >= 0; j--) {
      if (onSameRow(container.rows[j], event, minimumStartDifference)) {
        row = container.rows[j];
      }
    }

    if (row) {
      // Found a row, so add it.
      row.leaves.push(event);
      event.row = row;
    } else {
      // Couldn't find a row – that means this event is a row.
      event.leaves = [];
      container.rows.push(event);
    }
  };

  for (var i = 0; i < eventsInRenderOrder.length; i++) {
    var _ret = _loop(i);

    if (_ret === "continue") continue;
  } // Return the original events, along with their styles.


  return eventsInRenderOrder.map(function (event) {
    return {
      event: event.data,
      style: {
        top: event.top,
        height: event.height,
        width: event.width,
        xOffset: event.xOffset
      }
    };
  });
}

function NoopWrapper(props) {
  return props.children;
}

var TimeSlotGroup =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(TimeSlotGroup, _Component);

  function TimeSlotGroup() {
    return _Component.apply(this, arguments) || this;
  }

  var _proto = TimeSlotGroup.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        renderSlot = _this$props.renderSlot,
        resource = _this$props.resource,
        group = _this$props.group,
        getters = _this$props.getters,
        _this$props$component = _this$props.components;
    _this$props$component = _this$props$component === void 0 ? {} : _this$props$component;
    var _this$props$component2 = _this$props$component.timeSlotWrapper,
        Wrapper = _this$props$component2 === void 0 ? NoopWrapper : _this$props$component2;
    return React.createElement("div", {
      className: "rbc-timeslot-group"
    }, group.map(function (value, idx) {
      var slotProps = getters ? getters.slotProp(value, resource) : {};
      return React.createElement(Wrapper, {
        key: idx,
        value: value,
        resource: resource
      }, React.createElement("div", _extends({}, slotProps, {
        className: cn('rbc-time-slot', slotProps.className)
      }), renderSlot && renderSlot(value, idx)));
    }));
  };

  return TimeSlotGroup;
}(Component);
TimeSlotGroup.propTypes = process.env.NODE_ENV !== "production" ? {
  renderSlot: PropTypes.func,
  group: PropTypes.array.isRequired,
  resource: PropTypes.any,
  components: PropTypes.object,
  getters: PropTypes.object
} : {};

/* eslint-disable react/prop-types */

function TimeGridEvent(props) {
  var _extends2;

  var style = props.style,
      className = props.className,
      event = props.event,
      accessors = props.accessors,
      isRtl = props.isRtl,
      selected = props.selected,
      label = props.label,
      continuesEarlier = props.continuesEarlier,
      continuesLater = props.continuesLater,
      getters = props.getters,
      onClick = props.onClick,
      onDoubleClick = props.onDoubleClick,
      _props$components = props.components,
      Event = _props$components.event,
      EventWrapper = _props$components.eventWrapper;
  var title = accessors.title(event);
  var tooltip = accessors.tooltip(event);
  var end = accessors.end(event);
  var start = accessors.start(event);
  var userProps = getters.eventProp(event, start, end, selected);
  var height = style.height,
      top = style.top,
      width = style.width,
      xOffset = style.xOffset;
  var inner = [React.createElement("div", {
    key: "1",
    className: "rbc-event-label"
  }, label), React.createElement("div", {
    key: "2",
    className: "rbc-event-content"
  }, Event ? React.createElement(Event, {
    event: event,
    title: title
  }) : title)];
  return React.createElement(EventWrapper, _extends({
    type: "time"
  }, props), React.createElement("div", {
    onClick: onClick,
    onDoubleClick: onDoubleClick,
    style: _extends({}, userProps.style, (_extends2 = {
      top: top + "%",
      height: height + "%"
    }, _extends2[isRtl ? 'right' : 'left'] = Math.max(0, xOffset) + "%", _extends2.width = width + "%", _extends2)),
    title: tooltip ? (typeof label === 'string' ? label + ': ' : '') + tooltip : undefined,
    className: cn('rbc-event', className, userProps.className, {
      'rbc-selected': selected,
      'rbc-event-continues-earlier': continuesEarlier,
      'rbc-event-continues-later': continuesLater
    })
  }, inner));
}

var DayColumn =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(DayColumn, _React$Component);

  function DayColumn() {
    var _this;

    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(_args)) || this;
    _this.state = {
      selecting: false,
      timeIndicatorPosition: null
    };
    _this.intervalTriggered = false;

    _this.renderEvents = function () {
      var _this$props = _this.props,
          events$$1 = _this$props.events,
          isRtl = _this$props.rtl,
          selected = _this$props.selected,
          accessors = _this$props.accessors,
          localizer = _this$props.localizer,
          getters = _this$props.getters,
          components = _this$props.components,
          step = _this$props.step,
          timeslots = _this$props.timeslots;

      var _assertThisInitialize = _assertThisInitialized(_assertThisInitialized(_this)),
          slotMetrics = _assertThisInitialize.slotMetrics;

      var messages = localizer.messages;
      var styledEvents = getStyledEvents({
        events: events$$1,
        accessors: accessors,
        slotMetrics: slotMetrics,
        minimumStartDifference: Math.ceil(step * timeslots / 2)
      });
      return styledEvents.map(function (_ref, idx) {
        var event = _ref.event,
            style = _ref.style;
        var end = accessors.end(event);
        var start = accessors.start(event);
        var format = 'eventTimeRangeFormat';
        var label;
        var startsBeforeDay = slotMetrics.startsBeforeDay(start);
        var startsAfterDay = slotMetrics.startsAfterDay(end);
        if (startsBeforeDay) format = 'eventTimeRangeEndFormat';else if (startsAfterDay) format = 'eventTimeRangeStartFormat';
        if (startsBeforeDay && startsAfterDay) label = messages.allDay;else label = localizer.format({
          start: start,
          end: end
        }, format);
        var continuesEarlier = startsBeforeDay || slotMetrics.startsBefore(start);
        var continuesLater = startsAfterDay || slotMetrics.startsAfter(end);
        return React.createElement(TimeGridEvent, {
          style: style,
          event: event,
          label: label,
          key: 'evt_' + idx,
          getters: getters,
          isRtl: isRtl,
          components: components,
          continuesEarlier: continuesEarlier,
          continuesLater: continuesLater,
          accessors: accessors,
          selected: isSelected(event, selected),
          onClick: function onClick(e) {
            return _this._select(event, e);
          },
          onDoubleClick: function onDoubleClick(e) {
            return _this._doubleClick(event, e);
          }
        });
      });
    };

    _this._selectable = function () {
      var node = findDOMNode(_assertThisInitialized(_assertThisInitialized(_this)));
      var selector = _this._selector = new Selection(function () {
        return findDOMNode(_assertThisInitialized(_assertThisInitialized(_this)));
      }, {
        longPressThreshold: _this.props.longPressThreshold
      });

      var maybeSelect = function maybeSelect(box) {
        var onSelecting = _this.props.onSelecting;
        var current = _this.state || {};
        var state = selectionState(box);
        var start = state.startDate,
            end = state.endDate;

        if (onSelecting) {
          if (dates.eq(current.startDate, start, 'minutes') && dates.eq(current.endDate, end, 'minutes') || onSelecting({
            start: start,
            end: end
          }) === false) return;
        }

        if (_this.state.start !== state.start || _this.state.end !== state.end || _this.state.selecting !== state.selecting) {
          _this.setState(state);
        }
      };

      var selectionState = function selectionState(point) {
        var currentSlot = _this.slotMetrics.closestSlotFromPoint(point, getBoundsForNode(node));

        if (!_this.state.selecting) _this._initialSlot = currentSlot;
        var initialSlot = _this._initialSlot;
        if (initialSlot === currentSlot) currentSlot = _this.slotMetrics.nextSlot(initialSlot);

        var selectRange = _this.slotMetrics.getRange(dates.min(initialSlot, currentSlot), dates.max(initialSlot, currentSlot));

        return _extends({}, selectRange, {
          selecting: true,
          top: selectRange.top + "%",
          height: selectRange.height + "%"
        });
      };

      var selectorClicksHandler = function selectorClicksHandler(box, actionType) {
        if (!isEvent(findDOMNode(_assertThisInitialized(_assertThisInitialized(_this))), box)) {
          var _selectionState = selectionState(box),
              startDate = _selectionState.startDate,
              endDate = _selectionState.endDate;

          _this._selectSlot({
            startDate: startDate,
            endDate: endDate,
            action: actionType,
            box: box
          });
        }

        _this.setState({
          selecting: false
        });
      };

      selector.on('selecting', maybeSelect);
      selector.on('selectStart', maybeSelect);
      selector.on('beforeSelect', function (box) {
        if (_this.props.selectable !== 'ignoreEvents') return;
        return !isEvent(findDOMNode(_assertThisInitialized(_assertThisInitialized(_this))), box);
      });
      selector.on('click', function (box) {
        return selectorClicksHandler(box, 'click');
      });
      selector.on('doubleClick', function (box) {
        return selectorClicksHandler(box, 'doubleClick');
      });
      selector.on('select', function (bounds) {
        if (_this.state.selecting) {
          _this._selectSlot(_extends({}, _this.state, {
            action: 'select',
            bounds: bounds
          }));

          _this.setState({
            selecting: false
          });
        }
      });
      selector.on('reset', function () {
        if (_this.state.selecting) {
          _this.setState({
            selecting: false
          });
        }
      });
    };

    _this._teardownSelectable = function () {
      if (!_this._selector) return;

      _this._selector.teardown();

      _this._selector = null;
    };

    _this._selectSlot = function (_ref2) {
      var startDate = _ref2.startDate,
          endDate = _ref2.endDate,
          action = _ref2.action,
          bounds = _ref2.bounds,
          box = _ref2.box;
      var current = startDate,
          slots = [];

      while (dates.lte(current, endDate)) {
        slots.push(current);
        current = dates.add(current, _this.props.step, 'minutes');
      }

      notify(_this.props.onSelectSlot, {
        slots: slots,
        start: startDate,
        end: endDate,
        resourceId: _this.props.resource,
        action: action,
        bounds: bounds,
        box: box
      });
    };

    _this._select = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      notify(_this.props.onSelectEvent, args);
    };

    _this._doubleClick = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      notify(_this.props.onDoubleClickEvent, args);
    };

    _this.slotMetrics = getSlotMetrics$1(_this.props);
    return _this;
  }

  var _proto = DayColumn.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.props.selectable && this._selectable();

    if (this.props.isNow) {
      this.setTimeIndicatorPositionUpdateInterval();
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._teardownSelectable();

    this.clearTimeIndicatorInterval();
  };

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable) this._selectable();
    if (!nextProps.selectable && this.props.selectable) this._teardownSelectable();
    this.slotMetrics = this.slotMetrics.update(nextProps);
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    var getNowChanged = !dates.eq(prevProps.getNow(), this.props.getNow(), 'minutes');

    if (prevProps.isNow !== this.props.isNow || getNowChanged) {
      this.clearTimeIndicatorInterval();

      if (this.props.isNow) {
        var tail = !getNowChanged && dates.eq(prevProps.date, this.props.date, 'minutes') && prevState.timeIndicatorPosition === this.state.timeIndicatorPosition;
        this.setTimeIndicatorPositionUpdateInterval(tail);
      }
    }
  };

  /**
   * @param tail {Boolean} - whether `positionTimeIndicator` call should be
   *   deferred or called upon setting interval (`true` - if deferred);
   */
  _proto.setTimeIndicatorPositionUpdateInterval = function setTimeIndicatorPositionUpdateInterval(tail) {
    var _this2 = this;

    if (tail === void 0) {
      tail = false;
    }

    if (!this.intervalTriggered && !tail) {
      this.positionTimeIndicator();
    }

    this._timeIndicatorTimeout = window.setTimeout(function () {
      _this2.intervalTriggered = true;

      _this2.positionTimeIndicator();

      _this2.setTimeIndicatorPositionUpdateInterval();
    }, 60000);
  };

  _proto.clearTimeIndicatorInterval = function clearTimeIndicatorInterval() {
    this.intervalTriggered = false;
    window.clearTimeout(this._timeIndicatorTimeout);
  };

  _proto.positionTimeIndicator = function positionTimeIndicator() {
    var _this$props2 = this.props,
        min = _this$props2.min,
        max = _this$props2.max,
        getNow = _this$props2.getNow;
    var current = getNow();

    if (current >= min && current <= max) {
      var _this$slotMetrics$get = this.slotMetrics.getRange(current, current),
          top = _this$slotMetrics$get.top;

      this.setState({
        timeIndicatorPosition: top
      });
    } else {
      this.clearTimeIndicatorInterval();
    }
  };

  _proto.render = function render() {
    var _this$props3 = this.props,
        max = _this$props3.max,
        rtl = _this$props3.rtl,
        isNow = _this$props3.isNow,
        resource = _this$props3.resource,
        accessors = _this$props3.accessors,
        localizer = _this$props3.localizer,
        _this$props3$getters = _this$props3.getters,
        dayProp = _this$props3$getters.dayProp,
        getters = _objectWithoutPropertiesLoose(_this$props3$getters, ["dayProp"]),
        _this$props3$componen = _this$props3.components,
        EventContainer = _this$props3$componen.eventContainerWrapper,
        components = _objectWithoutPropertiesLoose(_this$props3$componen, ["eventContainerWrapper"]);

    var slotMetrics = this.slotMetrics;
    var _this$state = this.state,
        selecting = _this$state.selecting,
        top = _this$state.top,
        height = _this$state.height,
        startDate = _this$state.startDate,
        endDate = _this$state.endDate;
    var selectDates = {
      start: startDate,
      end: endDate
    };

    var _dayProp = dayProp(max),
        className = _dayProp.className,
        style = _dayProp.style;

    return React.createElement("div", {
      style: style,
      className: cn(className, 'rbc-day-slot', 'rbc-time-column', isNow && 'rbc-now', isNow && 'rbc-today', // WHY
      selecting && 'rbc-slot-selecting')
    }, slotMetrics.groups.map(function (grp, idx) {
      return React.createElement(TimeSlotGroup, {
        key: idx,
        group: grp,
        resource: resource,
        getters: getters,
        components: components
      });
    }), React.createElement(EventContainer, {
      localizer: localizer,
      resource: resource,
      accessors: accessors,
      getters: getters,
      components: components,
      slotMetrics: slotMetrics
    }, React.createElement("div", {
      className: cn('rbc-events-container', rtl && 'rtl')
    }, this.renderEvents())), selecting && React.createElement("div", {
      className: "rbc-slot-selection",
      style: {
        top: top,
        height: height
      }
    }, React.createElement("span", null, localizer.format(selectDates, 'selectRangeFormat'))), isNow && React.createElement("div", {
      className: "rbc-current-time-indicator",
      style: {
        top: this.state.timeIndicatorPosition + "%"
      }
    }));
  };

  return DayColumn;
}(React.Component);

DayColumn.propTypes = process.env.NODE_ENV !== "production" ? {
  events: PropTypes.array.isRequired,
  step: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  getNow: PropTypes.func.isRequired,
  isNow: PropTypes.bool,
  rtl: PropTypes.bool,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  showMultiDayTimes: PropTypes.bool,
  culture: PropTypes.string,
  timeslots: PropTypes.number,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  eventOffset: PropTypes.number,
  longPressThreshold: PropTypes.number,
  onSelecting: PropTypes.func,
  onSelectSlot: PropTypes.func.isRequired,
  onSelectEvent: PropTypes.func.isRequired,
  onDoubleClickEvent: PropTypes.func.isRequired,
  className: PropTypes.string,
  dragThroughEvents: PropTypes.bool,
  resource: PropTypes.any
} : {};
DayColumn.defaultProps = {
  dragThroughEvents: true,
  timeslots: 2
};

var TimeGutter =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(TimeGutter, _Component);

  function TimeGutter() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Component.call.apply(_Component, [this].concat(args)) || this;

    _this.renderSlot = function (value, idx) {
      if (idx !== 0) return null;
      var _this$props = _this.props,
          localizer = _this$props.localizer,
          getNow = _this$props.getNow;

      var isNow = _this.slotMetrics.dateIsInGroup(getNow(), idx);

      return React.createElement("span", {
        className: cn('rbc-label', isNow && 'rbc-now')
      }, localizer.format(value, 'timeGutterFormat'));
    };

    var _this$props2 = _this.props,
        min = _this$props2.min,
        max = _this$props2.max,
        timeslots = _this$props2.timeslots,
        step = _this$props2.step;
    _this.slotMetrics = getSlotMetrics$1({
      min: min,
      max: max,
      timeslots: timeslots,
      step: step
    });
    return _this;
  }

  var _proto = TimeGutter.prototype;

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var min = nextProps.min,
        max = nextProps.max,
        timeslots = nextProps.timeslots,
        step = nextProps.step;
    this.slotMetrics = this.slotMetrics.update({
      min: min,
      max: max,
      timeslots: timeslots,
      step: step
    });
  };

  _proto.render = function render() {
    var _this2 = this;

    var _this$props3 = this.props,
        resource = _this$props3.resource,
        components = _this$props3.components;
    return React.createElement("div", {
      className: "rbc-time-gutter rbc-time-column"
    }, this.slotMetrics.groups.map(function (grp, idx) {
      return React.createElement(TimeSlotGroup, {
        key: idx,
        group: grp,
        resource: resource,
        components: components,
        renderSlot: _this2.renderSlot
      });
    }));
  };

  return TimeGutter;
}(Component);
TimeGutter.propTypes = process.env.NODE_ENV !== "production" ? {
  min: PropTypes.instanceOf(Date).isRequired,
  max: PropTypes.instanceOf(Date).isRequired,
  timeslots: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  getNow: PropTypes.func.isRequired,
  components: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  resource: PropTypes.string
} : {};

var ResourceHeader = function ResourceHeader(_ref) {
  var label = _ref.label;
  return React.createElement(React.Fragment, null, label);
};

ResourceHeader.propTypes = process.env.NODE_ENV !== "production" ? {
  label: PropTypes.node,
  index: PropTypes.number,
  resource: PropTypes.object
} : {};

var TimeGridHeader =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(TimeGridHeader, _React$Component);

  function TimeGridHeader() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this.handleHeaderClick = function (date, view, e) {
      e.preventDefault();
      notify(_this.props.onDrillDown, [date, view]);
    };

    _this.renderRow = function (resource) {
      var _this$props = _this.props,
          events$$1 = _this$props.events,
          rtl = _this$props.rtl,
          selectable = _this$props.selectable,
          getNow = _this$props.getNow,
          range$$1 = _this$props.range,
          getters = _this$props.getters,
          localizer = _this$props.localizer,
          accessors = _this$props.accessors,
          components = _this$props.components;
      var resourceId = accessors.resourceId(resource);
      var eventsToDisplay = resource ? events$$1.filter(function (event) {
        return accessors.resource(event) === resourceId;
      }) : events$$1;
      return React.createElement(DateContentRow, {
        isAllDay: true,
        rtl: rtl,
        getNow: getNow,
        minRows: 2,
        range: range$$1,
        events: eventsToDisplay,
        resourceId: resourceId,
        className: "rbc-allday-cell",
        selectable: selectable,
        selected: _this.props.selected,
        components: components,
        accessors: accessors,
        getters: getters,
        localizer: localizer,
        onSelect: _this.props.onSelectEvent,
        onDoubleClick: _this.props.onDoubleClickEvent,
        onSelectSlot: _this.props.onSelectSlot,
        longPressThreshold: _this.props.longPressThreshold
      });
    };

    return _this;
  }

  var _proto = TimeGridHeader.prototype;

  _proto.renderHeaderCells = function renderHeaderCells(range$$1) {
    var _this2 = this;

    var _this$props2 = this.props,
        localizer = _this$props2.localizer,
        getDrilldownView = _this$props2.getDrilldownView,
        getNow = _this$props2.getNow,
        dayProp = _this$props2.getters.dayProp,
        _this$props2$componen = _this$props2.components.header,
        HeaderComponent = _this$props2$componen === void 0 ? Header : _this$props2$componen;
    var today = getNow();
    return range$$1.map(function (date, i) {
      var drilldownView = getDrilldownView(date);
      var label = localizer.format(date, 'dayFormat');

      var _dayProp = dayProp(date),
          className = _dayProp.className,
          style = _dayProp.style;

      var header = React.createElement(HeaderComponent, {
        date: date,
        label: label,
        localizer: localizer
      });
      return React.createElement("div", {
        key: i,
        style: style,
        className: cn('rbc-header', className, dates.eq(date, today, 'day') && 'rbc-today')
      }, drilldownView ? React.createElement("a", {
        href: "#",
        onClick: function onClick(e) {
          return _this2.handleHeaderClick(date, drilldownView, e);
        }
      }, header) : React.createElement("span", null, header));
    });
  };

  _proto.render = function render() {
    var _this3 = this;

    var _this$props3 = this.props,
        width = _this$props3.width,
        rtl = _this$props3.rtl,
        resources = _this$props3.resources,
        range$$1 = _this$props3.range,
        events$$1 = _this$props3.events,
        getNow = _this$props3.getNow,
        accessors = _this$props3.accessors,
        selectable = _this$props3.selectable,
        components = _this$props3.components,
        getters = _this$props3.getters,
        scrollRef = _this$props3.scrollRef,
        localizer = _this$props3.localizer,
        isOverflowing = _this$props3.isOverflowing,
        _this$props3$componen = _this$props3.components,
        TimeGutterHeader = _this$props3$componen.timeGutterHeader,
        _this$props3$componen2 = _this$props3$componen.resourceHeader,
        ResourceHeaderComponent = _this$props3$componen2 === void 0 ? ResourceHeader : _this$props3$componen2;
    var style = {};

    if (isOverflowing) {
      style[rtl ? 'marginLeft' : 'marginRight'] = scrollbarSize() + "px";
    }

    var groupedEvents = resources.groupEvents(events$$1);
    return React.createElement("div", {
      style: style,
      ref: scrollRef,
      className: cn('rbc-time-header', isOverflowing && 'rbc-overflowing')
    }, React.createElement("div", {
      className: "rbc-label rbc-time-header-gutter",
      style: {
        width: width,
        minWidth: width,
        maxWidth: width
      }
    }, TimeGutterHeader && React.createElement(TimeGutterHeader, null)), resources.map(function (_ref, idx) {
      var id = _ref[0],
          resource = _ref[1];
      return React.createElement("div", {
        className: "rbc-time-header-content",
        key: id || idx
      }, resource && React.createElement("div", {
        className: "rbc-row rbc-row-resource",
        key: "resource_" + idx
      }, React.createElement("div", {
        className: "rbc-header"
      }, React.createElement(ResourceHeaderComponent, {
        index: idx,
        label: accessors.resourceTitle(resource),
        resource: resource
      }))), React.createElement("div", {
        className: "rbc-row rbc-time-header-cell" + (range$$1.length <= 1 ? ' rbc-time-header-cell-single-day' : '')
      }, _this3.renderHeaderCells(range$$1)), React.createElement(DateContentRow, {
        isAllDay: true,
        rtl: rtl,
        getNow: getNow,
        minRows: 2,
        range: range$$1,
        events: groupedEvents.get(id) || [],
        resourceId: resource && id,
        className: "rbc-allday-cell",
        selectable: selectable,
        selected: _this3.props.selected,
        components: components,
        accessors: accessors,
        getters: getters,
        localizer: localizer,
        onSelect: _this3.props.onSelectEvent,
        onDoubleClick: _this3.props.onDoubleClickEvent,
        onSelectSlot: _this3.props.onSelectSlot,
        longPressThreshold: _this3.props.longPressThreshold
      }));
    }));
  };

  return TimeGridHeader;
}(React.Component);

TimeGridHeader.propTypes = process.env.NODE_ENV !== "production" ? {
  range: PropTypes.array.isRequired,
  events: PropTypes.array.isRequired,
  resources: PropTypes.object,
  getNow: PropTypes.func.isRequired,
  isOverflowing: PropTypes.bool,
  rtl: PropTypes.bool,
  width: PropTypes.number,
  localizer: PropTypes.object.isRequired,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,
  onSelectSlot: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired,
  scrollRef: PropTypes.any
} : {};

var NONE = {};
function Resources(resources, accessors) {
  return {
    map: function map(fn) {
      if (!resources) return [fn([NONE, null], 0)];
      return resources.map(function (resource, idx) {
        return fn([accessors.resourceId(resource), resource], idx);
      });
    },
    groupEvents: function groupEvents(events$$1) {
      var eventsByResource = new Map();

      if (!resources) {
        // Return all events if resources are not provided
        eventsByResource.set(NONE, events$$1);
        return eventsByResource;
      }

      events$$1.forEach(function (event) {
        var id = accessors.resource(event) || NONE;
        var resourceEvents = eventsByResource.get(id) || [];
        resourceEvents.push(event);
        eventsByResource.set(id, resourceEvents);
      });
      return eventsByResource;
    }
  };
}

var TimeGrid =
/*#__PURE__*/
function (_Component) {
  _inheritsLoose(TimeGrid, _Component);

  function TimeGrid(props) {
    var _this;

    _this = _Component.call(this, props) || this;

    _this.handleScroll = function (e) {
      if (_this.scrollRef.current) {
        _this.scrollRef.current.scrollLeft = e.target.scrollLeft;
      }
    };

    _this.handleResize = function () {
      raf.cancel(_this.rafHandle);
      _this.rafHandle = raf(_this.checkOverflow);
    };

    _this.gutterRef = function (ref) {
      _this.gutter = ref && findDOMNode(ref);
    };

    _this.handleSelectAlldayEvent = function () {
      //cancel any pending selections so only the event click goes through.
      _this.clearSelection();

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      notify(_this.props.onSelectEvent, args);
    };

    _this.handleSelectAllDaySlot = function (slots, slotInfo) {
      var onSelectSlot = _this.props.onSelectSlot;
      notify(onSelectSlot, {
        slots: slots,
        start: slots[0],
        end: slots[slots.length - 1],
        action: slotInfo.action
      });
    };

    _this.checkOverflow = function () {
      if (_this._updatingOverflow) return;
      var isOverflowing = _this.refs.content.scrollHeight > _this.refs.content.clientHeight;

      if (_this.state.isOverflowing !== isOverflowing) {
        _this._updatingOverflow = true;

        _this.setState({
          isOverflowing: isOverflowing
        }, function () {
          _this._updatingOverflow = false;
        });
      }
    };

    _this.memoizedResources = memoize(function (resources, accessors) {
      return Resources(resources, accessors);
    });
    _this.state = {
      gutterWidth: undefined,
      isOverflowing: null
    };
    _this.scrollRef = React.createRef();
    return _this;
  }

  var _proto = TimeGrid.prototype;

  _proto.componentWillMount = function componentWillMount() {
    this.calculateScroll();
  };

  _proto.componentDidMount = function componentDidMount() {
    this.checkOverflow();

    if (this.props.width == null) {
      this.measureGutter();
    }

    this.applyScroll();
    window.addEventListener('resize', this.handleResize);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    raf.cancel(this.rafHandle);

    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest);
    }
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    if (this.props.width == null) {
      this.measureGutter();
    }

    this.applyScroll(); //this.checkOverflow()
  };

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var _this$props = this.props,
        range$$1 = _this$props.range,
        scrollToTime = _this$props.scrollToTime; // When paginating, reset scroll

    if (!dates.eq(nextProps.range[0], range$$1[0], 'minute') || !dates.eq(nextProps.scrollToTime, scrollToTime, 'minute')) {
      this.calculateScroll(nextProps);
    }
  };

  _proto.renderEvents = function renderEvents(range$$1, events$$1, now) {
    var _this2 = this;

    var _this$props2 = this.props,
        min = _this$props2.min,
        max = _this$props2.max,
        components = _this$props2.components,
        accessors = _this$props2.accessors,
        localizer = _this$props2.localizer;
    var resources = this.memoizedResources(this.props.resources, accessors);
    var groupedEvents = resources.groupEvents(events$$1);
    return resources.map(function (_ref, i) {
      var id = _ref[0],
          resource = _ref[1];
      return range$$1.map(function (date, jj) {
        var daysEvents = (groupedEvents.get(id) || []).filter(function (event) {
          return dates.inRange(date, accessors.start(event), accessors.end(event), 'day');
        });
        return React.createElement(DayColumn, _extends({}, _this2.props, {
          localizer: localizer,
          min: dates.merge(date, min),
          max: dates.merge(date, max),
          resource: resource && id,
          components: components,
          isNow: dates.eq(date, now, 'day'),
          key: i + '-' + jj,
          date: date,
          events: daysEvents
        }));
      });
    });
  };

  _proto.render = function render() {
    var _this$props3 = this.props,
        events$$1 = _this$props3.events,
        range$$1 = _this$props3.range,
        width = _this$props3.width,
        selected = _this$props3.selected,
        getNow = _this$props3.getNow,
        resources = _this$props3.resources,
        components = _this$props3.components,
        accessors = _this$props3.accessors,
        getters = _this$props3.getters,
        localizer = _this$props3.localizer,
        min = _this$props3.min,
        max = _this$props3.max,
        showMultiDayTimes = _this$props3.showMultiDayTimes,
        longPressThreshold = _this$props3.longPressThreshold;
    width = width || this.state.gutterWidth;
    var start = range$$1[0],
        end = range$$1[range$$1.length - 1];
    this.slots = range$$1.length;
    var allDayEvents = [],
        rangeEvents = [];
    events$$1.forEach(function (event) {
      if (inRange(event, start, end, accessors)) {
        var eStart = accessors.start(event),
            eEnd = accessors.end(event);

        if (accessors.allDay(event) || dates.isJustDate(eStart) && dates.isJustDate(eEnd) || !showMultiDayTimes && !dates.eq(eStart, eEnd, 'day')) {
          allDayEvents.push(event);
        } else {
          rangeEvents.push(event);
        }
      }
    });
    allDayEvents.sort(function (a, b) {
      return sortEvents(a, b, accessors);
    });
    return React.createElement("div", {
      className: cn('rbc-time-view', resources && 'rbc-time-view-resources')
    }, React.createElement(TimeGridHeader, {
      range: range$$1,
      events: allDayEvents,
      width: width,
      getNow: getNow,
      localizer: localizer,
      selected: selected,
      resources: this.memoizedResources(resources, accessors),
      selectable: this.props.selectable,
      accessors: accessors,
      getters: getters,
      components: components,
      scrollRef: this.scrollRef,
      isOverflowing: this.state.isOverflowing,
      longPressThreshold: longPressThreshold,
      onSelectSlot: this.handleSelectAllDaySlot,
      onSelectEvent: this.handleSelectAlldayEvent,
      onDoubleClickEvent: this.props.onDoubleClickEvent,
      onDrillDown: this.props.onDrillDown,
      getDrilldownView: this.props.getDrilldownView
    }), React.createElement("div", {
      ref: "content",
      className: "rbc-time-content",
      onScroll: this.handleScroll
    }, React.createElement(TimeGutter, {
      date: start,
      ref: this.gutterRef,
      localizer: localizer,
      min: dates.merge(start, min),
      max: dates.merge(start, max),
      step: this.props.step,
      getNow: this.props.getNow,
      timeslots: this.props.timeslots,
      components: components,
      className: "rbc-time-gutter"
    }), this.renderEvents(range$$1, rangeEvents, getNow())));
  };

  _proto.clearSelection = function clearSelection() {
    clearTimeout(this._selectTimer);
    this._pendingSelection = [];
  };

  _proto.measureGutter = function measureGutter() {
    var _this3 = this;

    if (this.measureGutterAnimationFrameRequest) {
      window.cancelAnimationFrame(this.measureGutterAnimationFrameRequest);
    }

    this.measureGutterAnimationFrameRequest = window.requestAnimationFrame(function () {
      var width = getWidth(_this3.gutter);

      if (width && _this3.state.gutterWidth !== width) {
        _this3.setState({
          gutterWidth: width
        });
      }
    });
  };

  _proto.applyScroll = function applyScroll() {
    if (this._scrollRatio) {
      var content = this.refs.content;
      content.scrollTop = content.scrollHeight * this._scrollRatio; // Only do this once

      this._scrollRatio = null;
    }
  };

  _proto.calculateScroll = function calculateScroll(props) {
    if (props === void 0) {
      props = this.props;
    }

    var _props = props,
        min = _props.min,
        max = _props.max,
        scrollToTime = _props.scrollToTime;
    var diffMillis = scrollToTime - dates.startOf(scrollToTime, 'day');
    var totalMillis = dates.diff(max, min);
    this._scrollRatio = diffMillis / totalMillis;
  };

  return TimeGrid;
}(Component);
TimeGrid.propTypes = process.env.NODE_ENV !== "production" ? {
  events: PropTypes.array.isRequired,
  resources: PropTypes.array,
  step: PropTypes.number,
  timeslots: PropTypes.number,
  range: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  min: PropTypes.instanceOf(Date),
  max: PropTypes.instanceOf(Date),
  getNow: PropTypes.func.isRequired,
  scrollToTime: PropTypes.instanceOf(Date),
  showMultiDayTimes: PropTypes.bool,
  rtl: PropTypes.bool,
  width: PropTypes.number,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired,
  selected: PropTypes.object,
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),
  longPressThreshold: PropTypes.number,
  onNavigate: PropTypes.func,
  onSelectSlot: PropTypes.func,
  onSelectEnd: PropTypes.func,
  onSelectStart: PropTypes.func,
  onSelectEvent: PropTypes.func,
  onDoubleClickEvent: PropTypes.func,
  onDrillDown: PropTypes.func,
  getDrilldownView: PropTypes.func.isRequired
} : {};
TimeGrid.defaultProps = {
  step: 30,
  timeslots: 2,
  min: dates.startOf(new Date(), 'day'),
  max: dates.endOf(new Date(), 'day'),
  scrollToTime: dates.startOf(new Date(), 'day')
};

var Day =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Day, _React$Component);

  function Day() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Day.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        date = _this$props.date,
        props = _objectWithoutPropertiesLoose(_this$props, ["date"]);

    var range$$1 = Day.range(date);
    return React.createElement(TimeGrid, _extends({}, props, {
      range: range$$1,
      eventOffset: 10
    }));
  };

  return Day;
}(React.Component);

Day.propTypes = process.env.NODE_ENV !== "production" ? {
  date: PropTypes.instanceOf(Date).isRequired
} : {};

Day.range = function (date) {
  return [dates.startOf(date, 'day')];
};

Day.navigate = function (date, action) {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'day');

    case navigate.NEXT:
      return dates.add(date, 1, 'day');

    default:
      return date;
  }
};

Day.title = function (date, _ref) {
  var localizer = _ref.localizer;
  return localizer.format(date, 'dayHeaderFormat');
};

var Week =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Week, _React$Component);

  function Week() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Week.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        date = _this$props.date,
        props = _objectWithoutPropertiesLoose(_this$props, ["date"]);

    var range$$1 = Week.range(date, this.props);
    return React.createElement(TimeGrid, _extends({}, props, {
      range: range$$1,
      eventOffset: 15
    }));
  };

  return Week;
}(React.Component);

Week.propTypes = process.env.NODE_ENV !== "production" ? {
  date: PropTypes.instanceOf(Date).isRequired
} : {};
Week.defaultProps = TimeGrid.defaultProps;

Week.navigate = function (date, action) {
  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'week');

    case navigate.NEXT:
      return dates.add(date, 1, 'week');

    default:
      return date;
  }
};

Week.range = function (date, _ref) {
  var localizer = _ref.localizer;
  var firstOfWeek = localizer.startOfWeek();
  var start = dates.startOf(date, 'week', firstOfWeek);
  var end = dates.endOf(date, 'week', firstOfWeek);
  return dates.range(start, end);
};

Week.title = function (date, _ref2) {
  var localizer = _ref2.localizer;

  var _Week$range = Week.range(date, {
    localizer: localizer
  }),
      start = _Week$range[0],
      rest = _Week$range.slice(1);

  return localizer.format({
    start: start,
    end: rest.pop()
  }, 'dayRangeHeaderFormat');
};

function workWeekRange(date, options) {
  return Week.range(date, options).filter(function (d) {
    return [6, 0].indexOf(d.getDay()) === -1;
  });
}

var WorkWeek =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(WorkWeek, _React$Component);

  function WorkWeek() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = WorkWeek.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        date = _this$props.date,
        props = _objectWithoutPropertiesLoose(_this$props, ["date"]);

    var range$$1 = workWeekRange(date, this.props);
    return React.createElement(TimeGrid, _extends({}, props, {
      range: range$$1,
      eventOffset: 15
    }));
  };

  return WorkWeek;
}(React.Component);

WorkWeek.propTypes = process.env.NODE_ENV !== "production" ? {
  date: PropTypes.instanceOf(Date).isRequired
} : {};
WorkWeek.defaultProps = TimeGrid.defaultProps;
WorkWeek.range = workWeekRange;
WorkWeek.navigate = Week.navigate;

WorkWeek.title = function (date, _ref) {
  var localizer = _ref.localizer;

  var _workWeekRange = workWeekRange(date, {
    localizer: localizer
  }),
      start = _workWeekRange[0],
      rest = _workWeekRange.slice(1);

  return localizer.format({
    start: start,
    end: rest.pop()
  }, 'dayRangeHeaderFormat');
};

var Agenda =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Agenda, _React$Component);

  function Agenda() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this.renderDay = function (day, events$$1, dayKey) {
      var _this$props = _this.props,
          selected = _this$props.selected,
          getters = _this$props.getters,
          accessors = _this$props.accessors,
          localizer = _this$props.localizer,
          _this$props$component = _this$props.components,
          Event = _this$props$component.event,
          AgendaDate = _this$props$component.date;
      events$$1 = events$$1.filter(function (e) {
        return inRange(e, dates.startOf(day, 'day'), dates.endOf(day, 'day'), accessors);
      });
      return events$$1.map(function (event, idx) {
        var title = accessors.title(event);
        var end = accessors.end(event);
        var start = accessors.start(event);
        var userProps = getters.eventProp(event, start, end, isSelected(event, selected));
        var dateLabel = idx === 0 && localizer.format(day, 'agendaDateFormat');
        var first = idx === 0 ? React.createElement("td", {
          rowSpan: events$$1.length,
          className: "rbc-agenda-date-cell"
        }, AgendaDate ? React.createElement(AgendaDate, {
          day: day,
          label: dateLabel
        }) : dateLabel) : false;
        return React.createElement("tr", {
          key: dayKey + '_' + idx,
          className: userProps.className,
          style: userProps.style
        }, first, React.createElement("td", {
          className: "rbc-agenda-time-cell"
        }, _this.timeRangeLabel(day, event)), React.createElement("td", {
          className: "rbc-agenda-event-cell"
        }, Event ? React.createElement(Event, {
          event: event,
          title: title
        }) : title));
      }, []);
    };

    _this.timeRangeLabel = function (day, event) {
      var _this$props2 = _this.props,
          accessors = _this$props2.accessors,
          localizer = _this$props2.localizer,
          components = _this$props2.components;
      var labelClass = '',
          TimeComponent = components.time,
          label = localizer.messages.allDay;
      var end = accessors.end(event);
      var start = accessors.start(event);

      if (!accessors.allDay(event)) {
        if (dates.eq(start, end, 'day')) {
          label = localizer.format({
            start: start,
            end: end
          }, 'agendaTimeRangeFormat');
        } else if (dates.eq(day, start, 'day')) {
          label = localizer.format(start, 'agendaTimeFormat');
        } else if (dates.eq(day, end, 'day')) {
          label = localizer.format(end, 'agendaTimeFormat');
        }
      }

      if (dates.gt(day, start, 'day')) labelClass = 'rbc-continues-prior';
      if (dates.lt(day, end, 'day')) labelClass += ' rbc-continues-after';
      return React.createElement("span", {
        className: labelClass.trim()
      }, TimeComponent ? React.createElement(TimeComponent, {
        event: event,
        day: day,
        label: label
      }) : label);
    };

    _this._adjustHeader = function () {
      if (!_this.refs.tbody) return;
      var header = _this.refs.header;
      var firstRow = _this.refs.tbody.firstChild;
      if (!firstRow) return;
      var isOverflowing = _this.refs.content.scrollHeight > _this.refs.content.clientHeight;
      var widths = _this._widths || [];
      _this._widths = [getWidth(firstRow.children[0]), getWidth(firstRow.children[1])];

      if (widths[0] !== _this._widths[0] || widths[1] !== _this._widths[1]) {
        _this.refs.dateCol.style.width = _this._widths[0] + 'px';
        _this.refs.timeCol.style.width = _this._widths[1] + 'px';
      }

      if (isOverflowing) {
        classes.addClass(header, 'rbc-header-overflowing');
        header.style.marginRight = scrollbarSize() + 'px';
      } else {
        classes.removeClass(header, 'rbc-header-overflowing');
      }
    };

    return _this;
  }

  var _proto = Agenda.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this._adjustHeader();
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this._adjustHeader();
  };

  _proto.render = function render() {
    var _this2 = this;

    var _this$props3 = this.props,
        length = _this$props3.length,
        date = _this$props3.date,
        events$$1 = _this$props3.events,
        accessors = _this$props3.accessors,
        localizer = _this$props3.localizer;
    var messages = localizer.messages;
    var end = dates.add(date, length, 'day');
    var range$$1 = dates.range(date, end, 'day');
    events$$1 = events$$1.filter(function (event) {
      return inRange(event, date, end, accessors);
    });
    events$$1.sort(function (a, b) {
      return +accessors.start(a) - +accessors.start(b);
    });
    return React.createElement("div", {
      className: "rbc-agenda-view"
    }, events$$1.length !== 0 ? React.createElement(React.Fragment, null, React.createElement("table", {
      ref: "header",
      className: "rbc-agenda-table"
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
      className: "rbc-header",
      ref: "dateCol"
    }, messages.date), React.createElement("th", {
      className: "rbc-header",
      ref: "timeCol"
    }, messages.time), React.createElement("th", {
      className: "rbc-header"
    }, messages.event)))), React.createElement("div", {
      className: "rbc-agenda-content",
      ref: "content"
    }, React.createElement("table", {
      className: "rbc-agenda-table"
    }, React.createElement("tbody", {
      ref: "tbody"
    }, range$$1.map(function (day, idx) {
      return _this2.renderDay(day, events$$1, idx);
    }))))) : React.createElement("span", {
      className: "rbc-agenda-empty"
    }, messages.noEventsInRange));
  };

  return Agenda;
}(React.Component);

Agenda.propTypes = process.env.NODE_ENV !== "production" ? {
  events: PropTypes.array,
  date: PropTypes.instanceOf(Date),
  length: PropTypes.number.isRequired,
  selected: PropTypes.object,
  accessors: PropTypes.object.isRequired,
  components: PropTypes.object.isRequired,
  getters: PropTypes.object.isRequired,
  localizer: PropTypes.object.isRequired
} : {};
Agenda.defaultProps = {
  length: 30
};

Agenda.range = function (start, _ref) {
  var _ref$length = _ref.length,
      length = _ref$length === void 0 ? Agenda.defaultProps.length : _ref$length;
  var end = dates.add(start, length, 'day');
  return {
    start: start,
    end: end
  };
};

Agenda.navigate = function (date, action, _ref2) {
  var _ref2$length = _ref2.length,
      length = _ref2$length === void 0 ? Agenda.defaultProps.length : _ref2$length;

  switch (action) {
    case navigate.PREVIOUS:
      return dates.add(date, -length, 'day');

    case navigate.NEXT:
      return dates.add(date, length, 'day');

    default:
      return date;
  }
};

Agenda.title = function (start, _ref3) {
  var _ref3$length = _ref3.length,
      length = _ref3$length === void 0 ? Agenda.defaultProps.length : _ref3$length,
      localizer = _ref3.localizer;
  var end = dates.add(start, length, 'day');
  return localizer.format({
    start: start,
    end: end
  }, 'agendaHeaderFormat');
};

var _VIEWS;
var VIEWS = (_VIEWS = {}, _VIEWS[views.MONTH] = MonthView, _VIEWS[views.WEEK] = Week, _VIEWS[views.WORK_WEEK] = WorkWeek, _VIEWS[views.DAY] = Day, _VIEWS[views.AGENDA] = Agenda, _VIEWS);

function moveDate(View, _ref) {
  var action = _ref.action,
      date = _ref.date,
      today = _ref.today,
      props = _objectWithoutPropertiesLoose(_ref, ["action", "date", "today"]);

  View = typeof View === 'string' ? VIEWS[View] : View;

  switch (action) {
    case navigate.TODAY:
      date = today || new Date();
      break;

    case navigate.DATE:
      break;

    default:
      !(View && typeof View.navigate === 'function') ? process.env.NODE_ENV !== "production" ? invariant(false, 'Calendar View components must implement a static `.navigate(date, action)` method.s') : invariant(false) : void 0;
      date = View.navigate(date, action, props);
  }

  return date;
}

var Toolbar =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Toolbar, _React$Component);

  function Toolbar() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this.navigate = function (action) {
      _this.props.onNavigate(action);
    };

    _this.view = function (view) {
      _this.props.onView(view);
    };

    return _this;
  }

  var _proto = Toolbar.prototype;

  _proto.render = function render() {
    var _this$props = this.props,
        messages = _this$props.localizer.messages,
        label = _this$props.label;
    return React.createElement("div", {
      className: "rbc-toolbar"
    }, React.createElement("span", {
      className: "rbc-btn-group"
    }, React.createElement("button", {
      type: "button",
      onClick: this.navigate.bind(null, navigate.TODAY)
    }, messages.today), React.createElement("button", {
      type: "button",
      onClick: this.navigate.bind(null, navigate.PREVIOUS)
    }, messages.previous), React.createElement("button", {
      type: "button",
      onClick: this.navigate.bind(null, navigate.NEXT)
    }, messages.next)), React.createElement("span", {
      className: "rbc-toolbar-label"
    }, label), React.createElement("span", {
      className: "rbc-btn-group"
    }, this.viewNamesGroup(messages)));
  };

  _proto.viewNamesGroup = function viewNamesGroup(messages) {
    var _this2 = this;

    var viewNames = this.props.views;
    var view = this.props.view;

    if (viewNames.length > 1) {
      return viewNames.map(function (name) {
        return React.createElement("button", {
          type: "button",
          key: name,
          className: cn({
            'rbc-active': view === name
          }),
          onClick: _this2.view.bind(null, name)
        }, messages[name]);
      });
    }
  };

  return Toolbar;
}(React.Component);

Toolbar.propTypes = process.env.NODE_ENV !== "production" ? {
  view: PropTypes.string.isRequired,
  views: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.node.isRequired,
  localizer: PropTypes.object,
  onNavigate: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired
} : {};

/**
 * Retrieve via an accessor-like property
 *
 *    accessor(obj, 'name')   // => retrieves obj['name']
 *    accessor(data, func)    // => retrieves func(data)
 *    ... otherwise null
 */
function accessor$1(data, field) {
  var value = null;
  if (typeof field === 'function') value = field(data);else if (typeof field === 'string' && typeof data === 'object' && data != null && field in data) value = data[field];
  return value;
}
var wrapAccessor = function wrapAccessor(acc) {
  return function (data) {
    return accessor$1(data, acc);
  };
};

function viewNames$1(_views) {
  return !Array.isArray(_views) ? Object.keys(_views) : _views;
}

function isValidView(view, _ref) {
  var _views = _ref.views;
  var names = viewNames$1(_views);
  return names.indexOf(view) !== -1;
}
/**
 * react-big-calendar is a full featured Calendar component for managing events and dates. It uses
 * modern `flexbox` for layout, making it super responsive and performant. Leaving most of the layout heavy lifting
 * to the browser. __note:__ The default styles use `height: 100%` which means your container must set an explicit
 * height (feel free to adjust the styles to suit your specific needs).
 *
 * Big Calendar is unopiniated about editing and moving events, preferring to let you implement it in a way that makes
 * the most sense to your app. It also tries not to be prescriptive about your event data structures, just tell it
 * how to find the start and end datetimes and you can pass it whatever you want.
 *
 * One thing to note is that, `react-big-calendar` treats event start/end dates as an _exclusive_ range.
 * which means that the event spans up to, but not including, the end date. In the case
 * of displaying events on whole days, end dates are rounded _up_ to the next day. So an
 * event ending on `Apr 8th 12:00:00 am` will not appear on the 8th, whereas one ending
 * on `Apr 8th 12:01:00 am` will. If you want _inclusive_ ranges consider providing a
 * function `endAccessor` that returns the end date + 1 day for those events that end at midnight.
 */


var Calendar =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Calendar, _React$Component);

  function Calendar() {
    var _this;

    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(_args)) || this;

    _this.getViews = function () {
      var views$$1 = _this.props.views;

      if (Array.isArray(views$$1)) {
        return transform(views$$1, function (obj, name) {
          return obj[name] = VIEWS[name];
        }, {});
      }

      if (typeof views$$1 === 'object') {
        return mapValues(views$$1, function (value, key) {
          if (value === true) {
            return VIEWS[key];
          }

          return value;
        });
      }

      return VIEWS;
    };

    _this.getView = function () {
      var views$$1 = _this.getViews();

      return views$$1[_this.props.view];
    };

    _this.getDrilldownView = function (date) {
      var _this$props = _this.props,
          view = _this$props.view,
          drilldownView = _this$props.drilldownView,
          getDrilldownView = _this$props.getDrilldownView;
      if (!getDrilldownView) return drilldownView;
      return getDrilldownView(date, view, Object.keys(_this.getViews()));
    };

    _this.handleRangeChange = function (date, viewComponent, view) {
      var _this$props2 = _this.props,
          onRangeChange = _this$props2.onRangeChange,
          localizer = _this$props2.localizer;

      if (onRangeChange) {
        if (viewComponent.range) {
          onRangeChange(viewComponent.range(date, {
            localizer: localizer
          }), view);
        } else {
          process.env.NODE_ENV !== "production" ? warning(true, 'onRangeChange prop not supported for this view') : void 0;
        }
      }
    };

    _this.handleNavigate = function (action, newDate) {
      var _this$props3 = _this.props,
          view = _this$props3.view,
          date = _this$props3.date,
          getNow = _this$props3.getNow,
          onNavigate = _this$props3.onNavigate,
          props = _objectWithoutPropertiesLoose(_this$props3, ["view", "date", "getNow", "onNavigate"]);

      var ViewComponent = _this.getView();

      var today = getNow();
      date = moveDate(ViewComponent, _extends({}, props, {
        action: action,
        date: newDate || date || today,
        today: today
      }));
      onNavigate(date, view, action);

      _this.handleRangeChange(date, ViewComponent);
    };

    _this.handleViewChange = function (view) {
      if (view !== _this.props.view && isValidView(view, _this.props)) {
        _this.props.onView(view);
      }

      var views$$1 = _this.getViews();

      _this.handleRangeChange(_this.props.date || _this.props.getNow(), views$$1[view], view);
    };

    _this.handleSelectEvent = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      notify(_this.props.onSelectEvent, args);
    };

    _this.handleDoubleClickEvent = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      notify(_this.props.onDoubleClickEvent, args);
    };

    _this.handleSelectSlot = function (slotInfo) {
      notify(_this.props.onSelectSlot, slotInfo);
    };

    _this.handleDrillDown = function (date, view) {
      var onDrillDown = _this.props.onDrillDown;

      if (onDrillDown) {
        onDrillDown(date, view, _this.drilldownView);
        return;
      }

      if (view) _this.handleViewChange(view);

      _this.handleNavigate(navigate.DATE, date);
    };

    _this.state = {
      context: _this.getContext(_this.props)
    };
    return _this;
  }

  var _proto = Calendar.prototype;

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    this.setState({
      context: this.getContext(nextProps)
    });
  };

  _proto.getContext = function getContext(_ref2) {
    var startAccessor = _ref2.startAccessor,
        endAccessor = _ref2.endAccessor,
        allDayAccessor = _ref2.allDayAccessor,
        tooltipAccessor = _ref2.tooltipAccessor,
        titleAccessor = _ref2.titleAccessor,
        resourceAccessor = _ref2.resourceAccessor,
        resourceIdAccessor = _ref2.resourceIdAccessor,
        resourceTitleAccessor = _ref2.resourceTitleAccessor,
        eventPropGetter = _ref2.eventPropGetter,
        slotPropGetter = _ref2.slotPropGetter,
        dayPropGetter = _ref2.dayPropGetter,
        view = _ref2.view,
        views$$1 = _ref2.views,
        localizer = _ref2.localizer,
        culture = _ref2.culture,
        _ref2$messages = _ref2.messages,
        messages$$1 = _ref2$messages === void 0 ? {} : _ref2$messages,
        _ref2$components = _ref2.components,
        components = _ref2$components === void 0 ? {} : _ref2$components,
        _ref2$formats = _ref2.formats,
        formats = _ref2$formats === void 0 ? {} : _ref2$formats;
    var names = viewNames$1(views$$1);
    var msgs = messages(messages$$1);
    return {
      viewNames: names,
      localizer: mergeWithDefaults(localizer, culture, formats, msgs),
      getters: {
        eventProp: function eventProp() {
          return eventPropGetter && eventPropGetter.apply(void 0, arguments) || {};
        },
        slotProp: function slotProp() {
          return slotPropGetter && slotPropGetter.apply(void 0, arguments) || {};
        },
        dayProp: function dayProp() {
          return dayPropGetter && dayPropGetter.apply(void 0, arguments) || {};
        }
      },
      components: defaults(components[view] || {}, omit(components, names), {
        eventWrapper: NoopWrapper,
        eventContainerWrapper: NoopWrapper,
        dayWrapper: NoopWrapper,
        dateCellWrapper: NoopWrapper,
        weekWrapper: NoopWrapper,
        timeSlotWrapper: NoopWrapper
      }),
      accessors: {
        start: wrapAccessor(startAccessor),
        end: wrapAccessor(endAccessor),
        allDay: wrapAccessor(allDayAccessor),
        tooltip: wrapAccessor(tooltipAccessor),
        title: wrapAccessor(titleAccessor),
        resource: wrapAccessor(resourceAccessor),
        resourceId: wrapAccessor(resourceIdAccessor),
        resourceTitle: wrapAccessor(resourceTitleAccessor)
      }
    };
  };

  _proto.render = function render() {
    var _this$props4 = this.props,
        view = _this$props4.view,
        toolbar = _this$props4.toolbar,
        events$$1 = _this$props4.events,
        style = _this$props4.style,
        className = _this$props4.className,
        elementProps = _this$props4.elementProps,
        current = _this$props4.date,
        getNow = _this$props4.getNow,
        length = _this$props4.length,
        showMultiDayTimes = _this$props4.showMultiDayTimes,
        onShowMore = _this$props4.onShowMore,
        _0 = _this$props4.components,
        _1 = _this$props4.formats,
        _2 = _this$props4.messages,
        _3 = _this$props4.culture,
        props = _objectWithoutPropertiesLoose(_this$props4, ["view", "toolbar", "events", "style", "className", "elementProps", "date", "getNow", "length", "showMultiDayTimes", "onShowMore", "components", "formats", "messages", "culture"]);

    current = current || getNow();
    var View = this.getView();
    var _this$state$context = this.state.context,
        accessors = _this$state$context.accessors,
        components = _this$state$context.components,
        getters = _this$state$context.getters,
        localizer = _this$state$context.localizer,
        viewNames = _this$state$context.viewNames;
    var CalToolbar = components.toolbar || Toolbar;
    var label = View.title(current, {
      localizer: localizer,
      length: length
    });
    return React.createElement("div", _extends({}, elementProps, {
      className: cn(className, 'rbc-calendar', props.rtl && 'rbc-is-rtl'),
      style: style
    }), toolbar && React.createElement(CalToolbar, {
      date: current,
      view: view,
      views: viewNames,
      label: label,
      onView: this.handleViewChange,
      onNavigate: this.handleNavigate,
      localizer: localizer
    }), React.createElement(View, _extends({
      ref: "view"
    }, props, {
      events: events$$1,
      date: current,
      getNow: getNow,
      length: length,
      localizer: localizer,
      getters: getters,
      components: components,
      accessors: accessors,
      showMultiDayTimes: showMultiDayTimes,
      getDrilldownView: this.getDrilldownView,
      onNavigate: this.handleNavigate,
      onDrillDown: this.handleDrillDown,
      onSelectEvent: this.handleSelectEvent,
      onDoubleClickEvent: this.handleDoubleClickEvent,
      onSelectSlot: this.handleSelectSlot,
      onShowMore: onShowMore
    })));
  };
  /**
   *
   * @param date
   * @param viewComponent
   * @param {'month'|'week'|'work_week'|'day'|'agenda'} [view] - optional
   * parameter. It appears when range change on view changing. It could be handy
   * when you need to have both: range and view type at once, i.e. for manage rbc
   * state via url
   */


  return Calendar;
}(React.Component);

Calendar.defaultProps = {
  elementProps: {},
  popup: false,
  toolbar: true,
  view: views.MONTH,
  views: [views.MONTH, views.WEEK, views.DAY, views.AGENDA],
  step: 30,
  length: 30,
  drilldownView: views.DAY,
  titleAccessor: 'title',
  tooltipAccessor: 'title',
  allDayAccessor: 'allDay',
  startAccessor: 'start',
  endAccessor: 'end',
  resourceAccessor: 'resourceId',
  resourceIdAccessor: 'id',
  resourceTitleAccessor: 'title',
  longPressThreshold: 250,
  getNow: function getNow() {
    return new Date();
  }
};
Calendar.propTypes = process.env.NODE_ENV !== "production" ? {
  localizer: PropTypes.object.isRequired,

  /**
   * Props passed to main calendar `<div>`.
   *
   */
  elementProps: PropTypes.object,

  /**
   * The current date value of the calendar. Determines the visible view range.
   * If `date` is omitted then the result of `getNow` is used; otherwise the
   * current date is used.
   *
   * @controllable onNavigate
   */
  date: PropTypes.instanceOf(Date),

  /**
   * The current view of the calendar.
   *
   * @default 'month'
   * @controllable onView
   */
  view: PropTypes.string,

  /**
   * The initial view set for the Calendar.
   * @type Calendar.Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @default 'month'
   */
  defaultView: PropTypes.string,

  /**
   * An array of event objects to display on the calendar. Events objects
   * can be any shape, as long as the Calendar knows how to retrieve the
   * following details of the event:
   *
   *  - start time
   *  - end time
   *  - title
   *  - whether its an "all day" event or not
   *  - any resource the event may be related to
   *
   * Each of these properties can be customized or generated dynamically by
   * setting the various "accessor" props. Without any configuration the default
   * event should look like:
   *
   * ```js
   * Event {
   *   title: string,
   *   start: Date,
   *   end: Date,
   *   allDay?: boolean
   *   resource?: any,
   * }
   * ```
   */
  events: PropTypes.arrayOf(PropTypes.object),

  /**
   * Accessor for the event title, used to display event information. Should
   * resolve to a `renderable` value.
   *
   * ```js
   * string | (event: Object) => string
   * ```
   *
   * @type {(func|string)}
   */
  titleAccessor: accessor,

  /**
   * Accessor for the event tooltip. Should
   * resolve to a `renderable` value. Removes the tooltip if null.
   *
   * ```js
   * string | (event: Object) => string
   * ```
   *
   * @type {(func|string)}
   */
  tooltipAccessor: accessor,

  /**
   * Determines whether the event should be considered an "all day" event and ignore time.
   * Must resolve to a `boolean` value.
   *
   * ```js
   * string | (event: Object) => boolean
   * ```
   *
   * @type {(func|string)}
   */
  allDayAccessor: accessor,

  /**
   * The start date/time of the event. Must resolve to a JavaScript `Date` object.
   *
   * ```js
   * string | (event: Object) => Date
   * ```
   *
   * @type {(func|string)}
   */
  startAccessor: accessor,

  /**
   * The end date/time of the event. Must resolve to a JavaScript `Date` object.
   *
   * ```js
   * string | (event: Object) => Date
   * ```
   *
   * @type {(func|string)}
   */
  endAccessor: accessor,

  /**
   * Returns the id of the `resource` that the event is a member of. This
   * id should match at least one resource in the `resources` array.
   *
   * ```js
   * string | (event: Object) => Date
   * ```
   *
   * @type {(func|string)}
   */
  resourceAccessor: accessor,

  /**
   * An array of resource objects that map events to a specific resource.
   * Resource objects, like events, can be any shape or have any properties,
   * but should be uniquly identifiable via the `resourceIdAccessor`, as
   * well as a "title" or name as provided by the `resourceTitleAccessor` prop.
   */
  resources: PropTypes.arrayOf(PropTypes.object),

  /**
   * Provides a unique identifier for each resource in the `resources` array
   *
   * ```js
   * string | (resource: Object) => any
   * ```
   *
   * @type {(func|string)}
   */
  resourceIdAccessor: accessor,

  /**
   * Provides a human readable name for the resource object, used in headers.
   *
   * ```js
   * string | (resource: Object) => any
   * ```
   *
   * @type {(func|string)}
   */
  resourceTitleAccessor: accessor,

  /**
   * Determines the current date/time which is highlighted in the views.
   *
   * The value affects which day is shaded and which time is shown as
   * the current time. It also affects the date used by the Today button in
   * the toolbar.
   *
   * Providing a value here can be useful when you are implementing time zones
   * using the `startAccessor` and `endAccessor` properties.
   *
   * @type {func}
   * @default () => new Date()
   */
  getNow: PropTypes.func,

  /**
   * Callback fired when the `date` value changes.
   *
   * @controllable date
   */
  onNavigate: PropTypes.func,

  /**
   * Callback fired when the `view` value changes.
   *
   * @controllable view
   */
  onView: PropTypes.func,

  /**
   * Callback fired when date header, or the truncated events links are clicked
   *
   */
  onDrillDown: PropTypes.func,

  /**
   *
   * ```js
   * (dates: Date[] | { start: Date; end: Date }, view?: 'month'|'week'|'work_week'|'day'|'agenda') => void
   * ```
   *
   * Callback fired when the visible date range changes. Returns an Array of dates
   * or an object with start and end dates for BUILTIN views. Optionally new `view`
   * will be returned when callback called after view change.
   *
   * Custom views may return something different.
   */
  onRangeChange: PropTypes.func,

  /**
   * A callback fired when a date selection is made. Only fires when `selectable` is `true`.
   *
   * ```js
   * (
   *   slotInfo: {
   *     start: Date,
   *     end: Date,
   *     slots: Array<Date>,
   *     action: "select" | "click" | "doubleClick",
   *     bounds: ?{ // For "select" action
   *       x: number,
   *       y: number,
   *       top: number,
   *       right: number,
   *       left: number,
   *       bottom: number,
   *     },
   *     box: ?{ // For "click" or "doubleClick" actions
   *       clientX: number,
   *       clientY: number,
   *       x: number,
   *       y: number,
   *     },
   *   }
   * ) => any
   * ```
   */
  onSelectSlot: PropTypes.func,

  /**
   * Callback fired when a calendar event is selected.
   *
   * ```js
   * (event: Object, e: SyntheticEvent) => any
   * ```
   *
   * @controllable selected
   */
  onSelectEvent: PropTypes.func,

  /**
   * Callback fired when a calendar event is clicked twice.
   *
   * ```js
   * (event: Object, e: SyntheticEvent) => void
   * ```
   */
  onDoubleClickEvent: PropTypes.func,

  /**
   * Callback fired when dragging a selection in the Time views.
   *
   * Returning `false` from the handler will prevent a selection.
   *
   * ```js
   * (range: { start: Date, end: Date }) => ?boolean
   * ```
   */
  onSelecting: PropTypes.func,

  /**
   * Callback fired when a +{count} more is clicked
   *
   * ```js
   * (events: Object, date: Date) => any
   * ```
   */
  onShowMore: PropTypes.func,

  /**
   * The selected event, if any.
   */
  selected: PropTypes.object,

  /**
   * An array of built-in view names to allow the calendar to display.
   * accepts either an array of builtin view names,
   *
   * ```jsx
   * views={['month', 'day', 'agenda']}
   * ```
   * or an object hash of the view name and the component (or boolean for builtin).
   *
   * ```jsx
   * views={{
   *   month: true,
   *   week: false,
   *   myweek: WorkWeekViewComponent,
   * }}
   * ```
   *
   * Custom views can be any React component, that implements the following
   * interface:
   *
   * ```js
   * interface View {
   *   static title(date: Date, { formats: DateFormat[], culture: string?, ...props }): string
   *   static navigate(date: Date, action: 'PREV' | 'NEXT' | 'DATE'): Date
   * }
   * ```
   *
   * @type Calendar.Views ('month'|'week'|'work_week'|'day'|'agenda')
   * @View
   ['month', 'week', 'day', 'agenda']
   */
  views: views$1,

  /**
   * The string name of the destination view for drill-down actions, such
   * as clicking a date header, or the truncated events links. If
   * `getDrilldownView` is also specified it will be used instead.
   *
   * Set to `null` to disable drill-down actions.
   *
   * ```js
   * <BigCalendar
   *   drilldownView="agenda"
   * />
   * ```
   */
  drilldownView: PropTypes.string,

  /**
   * Functionally equivalent to `drilldownView`, but accepts a function
   * that can return a view name. It's useful for customizing the drill-down
   * actions depending on the target date and triggering view.
   *
   * Return `null` to disable drill-down actions.
   *
   * ```js
   * <BigCalendar
   *   getDrilldownView={(targetDate, currentViewName, configuredViewNames) =>
   *     if (currentViewName === 'month' && configuredViewNames.includes('week'))
   *       return 'week'
   *
   *     return null;
   *   }}
   * />
   * ```
   */
  getDrilldownView: PropTypes.func,

  /**
   * Determines the end date from date prop in the agenda view
   * date prop + length (in number of days) = end date
   */
  length: PropTypes.number,

  /**
   * Determines whether the toolbar is displayed
   */
  toolbar: PropTypes.bool,

  /**
   * Show truncated events in an overlay when you click the "+_x_ more" link.
   */
  popup: PropTypes.bool,

  /**
   * Distance in pixels, from the edges of the viewport, the "show more" overlay should be positioned.
   *
   * ```jsx
   * <BigCalendar popupOffset={30}/>
   * <BigCalendar popupOffset={{x: 30, y: 20}}/>
   * ```
   */
  popupOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })]),

  /**
   * Allows mouse selection of ranges of dates/times.
   *
   * The 'ignoreEvents' option prevents selection code from running when a
   * drag begins over an event. Useful when you want custom event click or drag
   * logic
   */
  selectable: PropTypes.oneOf([true, false, 'ignoreEvents']),

  /**
   * Specifies the number of miliseconds the user must press and hold on the screen for a touch
   * to be considered a "long press." Long presses are used for time slot selection on touch
   * devices.
   *
   * @type {number}
   * @default 250
   */
  longPressThreshold: PropTypes.number,

  /**
   * Determines the selectable time increments in week and day views
   */
  step: PropTypes.number,

  /**
   * The number of slots per "section" in the time grid views. Adjust with `step`
   * to change the default of 1 hour long groups, with 30 minute slots.
   */
  timeslots: PropTypes.number,

  /**
   *Switch the calendar to a `right-to-left` read direction.
   */
  rtl: PropTypes.bool,

  /**
   * Optionally provide a function that returns an object of className or style props
   * to be applied to the the event node.
   *
   * ```js
   * (
   * 	event: Object,
   * 	start: Date,
   * 	end: Date,
   * 	isSelected: boolean
   * ) => { className?: string, style?: Object }
   * ```
   */
  eventPropGetter: PropTypes.func,

  /**
   * Optionally provide a function that returns an object of className or style props
   * to be applied to the the time-slot node. Caution! Styles that change layout or
   * position may break the calendar in unexpected ways.
   *
   * ```js
   * (date: Date, resourceId: (number|string)) => { className?: string, style?: Object }
   * ```
   */
  slotPropGetter: PropTypes.func,

  /**
   * Optionally provide a function that returns an object of className or style props
   * to be applied to the the day background. Caution! Styles that change layout or
   * position may break the calendar in unexpected ways.
   *
   * ```js
   * (date: Date) => { className?: string, style?: Object }
   * ```
   */
  dayPropGetter: PropTypes.func,

  /**
   * Support to show multi-day events with specific start and end times in the
   * main time grid (rather than in the all day header).
   *
   * **Note: This may cause calendars with several events to look very busy in
   * the week and day views.**
   */
  showMultiDayTimes: PropTypes.bool,

  /**
   * Constrains the minimum _time_ of the Day and Week views.
   */
  min: PropTypes.instanceOf(Date),

  /**
   * Constrains the maximum _time_ of the Day and Week views.
   */
  max: PropTypes.instanceOf(Date),

  /**
   * Determines how far down the scroll pane is initially scrolled down.
   */
  scrollToTime: PropTypes.instanceOf(Date),

  /**
   * Specify a specific culture code for the Calendar.
   *
   * **Note: it's generally better to handle this globally via your i18n library.**
   */
  culture: PropTypes.string,

  /**
   * Localizer specific formats, tell the Calendar how to format and display dates.
   *
   * `format` types are dependent on the configured localizer; both Moment and Globalize
   * accept strings of tokens according to their own specification, such as: `'DD mm yyyy'`.
   *
   * ```jsx
   * let formats = {
   *   dateFormat: 'dd',
   *
   *   dayFormat: (date, , localizer) =>
   *     localizer.format(date, 'DDD', culture),
   *
   *   dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
   *     localizer.format(start, { date: 'short' }, culture) + ' — ' +
   *     localizer.format(end, { date: 'short' }, culture)
   * }
   *
   * <Calendar formats={formats} />
   * ```
   *
   * All localizers accept a function of
   * the form `(date: Date, culture: ?string, localizer: Localizer) -> string`
   */
  formats: PropTypes.shape({
    /**
     * Format for the day of the month heading in the Month view.
     * e.g. "01", "02", "03", etc
     */
    dateFormat: dateFormat,

    /**
     * A day of the week format for Week and Day headings,
     * e.g. "Wed 01/04"
     *
     */
    dayFormat: dateFormat,

    /**
     * Week day name format for the Month week day headings,
     * e.g: "Sun", "Mon", "Tue", etc
     *
     */
    weekdayFormat: dateFormat,

    /**
     * The timestamp cell formats in Week and Time views, e.g. "4:00 AM"
     */
    timeGutterFormat: dateFormat,

    /**
     * Toolbar header format for the Month view, e.g "2015 April"
     *
     */
    monthHeaderFormat: dateFormat,

    /**
     * Toolbar header format for the Week views, e.g. "Mar 29 - Apr 04"
     */
    dayRangeHeaderFormat: dateRangeFormat,

    /**
     * Toolbar header format for the Day view, e.g. "Wednesday Apr 01"
     */
    dayHeaderFormat: dateFormat,

    /**
     * Toolbar header format for the Agenda view, e.g. "4/1/2015 — 5/1/2015"
     */
    agendaHeaderFormat: dateRangeFormat,

    /**
     * A time range format for selecting time slots, e.g "8:00am — 2:00pm"
     */
    selectRangeFormat: dateRangeFormat,
    agendaDateFormat: dateFormat,
    agendaTimeFormat: dateFormat,
    agendaTimeRangeFormat: dateRangeFormat,

    /**
     * Time range displayed on events.
     */
    eventTimeRangeFormat: dateRangeFormat,

    /**
     * An optional event time range for events that continue onto another day
     */
    eventTimeRangeStartFormat: dateFormat,

    /**
     * An optional event time range for events that continue from another day
     */
    eventTimeRangeEndFormat: dateFormat
  }),

  /**
   * Customize how different sections of the calendar render by providing custom Components.
   * In particular the `Event` component can be specified for the entire calendar, or you can
   * provide an individual component for each view type.
   *
   * ```jsx
   * let components = {
   *   event: MyEvent, // used by each view (Month, Day, Week)
   *   eventWrapper: MyEventWrapper,
   *   eventContainerWrapper: MyEventContainerWrapper,
   *   dayWrapper: MyDayWrapper,
   *   dateCellWrapper: MyDateCellWrapper,
   *   timeSlotWrapper: MyTimeSlotWrapper,
   *   timeGutterHeader: MyTimeGutterWrapper,
   *   toolbar: MyToolbar,
   *   agenda: {
   *   	 event: MyAgendaEvent // with the agenda view use a different component to render events
   *     time: MyAgendaTime,
   *     date: MyAgendaDate,
   *   },
   *   day: {
   *     header: MyDayHeader,
   *     event: MyDayEvent,
   *   },
   *   week: {
   *     header: MyWeekHeader,
   *     event: MyWeekEvent,
   *   },
   *   month: {
   *     header: MyMonthHeader,
   *     dateHeader: MyMonthDateHeader,
   *     event: MyMonthEvent,
   *   }
   * }
   * <Calendar components={components} />
   * ```
   */
  components: PropTypes.shape({
    event: elementType,
    eventWrapper: elementType,
    eventContainerWrapper: elementType,
    dayWrapper: elementType,
    dateCellWrapper: elementType,
    timeSlotWrapper: elementType,
    timeGutterHeader: elementType,
    toolbar: elementType,
    agenda: PropTypes.shape({
      date: elementType,
      time: elementType,
      event: elementType
    }),
    day: PropTypes.shape({
      header: elementType,
      event: elementType
    }),
    week: PropTypes.shape({
      header: elementType,
      event: elementType
    }),
    month: PropTypes.shape({
      header: elementType,
      dateHeader: elementType,
      event: elementType
    })
  }),

  /**
   * String messages used throughout the component, override to provide localizations
   */
  messages: PropTypes.shape({
    allDay: PropTypes.node,
    previous: PropTypes.node,
    next: PropTypes.node,
    today: PropTypes.node,
    month: PropTypes.node,
    week: PropTypes.node,
    day: PropTypes.node,
    agenda: PropTypes.node,
    date: PropTypes.node,
    time: PropTypes.node,
    event: PropTypes.node,
    noEventsInRange: PropTypes.node,
    showMore: PropTypes.func
  })
} : {};
var Calendar$1 = uncontrollable(Calendar, {
  view: 'onView',
  date: 'onNavigate',
  selected: 'onSelectEvent'
});

var dateRangeFormat$1 = function dateRangeFormat(_ref, culture, local) {
  var start = _ref.start,
      end = _ref.end;
  return local.format(start, 'L', culture) + ' — ' + local.format(end, 'L', culture);
};

var timeRangeFormat = function timeRangeFormat(_ref2, culture, local) {
  var start = _ref2.start,
      end = _ref2.end;
  return local.format(start, 'LT', culture) + ' — ' + local.format(end, 'LT', culture);
};

var timeRangeStartFormat = function timeRangeStartFormat(_ref3, culture, local) {
  var start = _ref3.start;
  return local.format(start, 'LT', culture) + ' — ';
};

var timeRangeEndFormat = function timeRangeEndFormat(_ref4, culture, local) {
  var end = _ref4.end;
  return ' — ' + local.format(end, 'LT', culture);
};

var weekRangeFormat = function weekRangeFormat(_ref5, culture, local) {
  var start = _ref5.start,
      end = _ref5.end;
  return local.format(start, 'MMMM DD', culture) + ' - ' + local.format(end, dates.eq(start, end, 'month') ? 'DD' : 'MMMM DD', culture);
};

var formats = {
  dateFormat: 'DD',
  dayFormat: 'DD ddd',
  weekdayFormat: 'ddd',
  selectRangeFormat: timeRangeFormat,
  eventTimeRangeFormat: timeRangeFormat,
  eventTimeRangeStartFormat: timeRangeStartFormat,
  eventTimeRangeEndFormat: timeRangeEndFormat,
  timeGutterFormat: 'LT',
  monthHeaderFormat: 'MMMM YYYY',
  dayHeaderFormat: 'dddd MMM DD',
  dayRangeHeaderFormat: weekRangeFormat,
  agendaHeaderFormat: dateRangeFormat$1,
  agendaDateFormat: 'ddd MMM DD',
  agendaTimeFormat: 'LT',
  agendaTimeRangeFormat: timeRangeFormat
};
function momentLocalizer (moment) {
  var locale = function locale(m, c) {
    return c ? m.locale(c) : m;
  };

  return new DateLocalizer({
    formats: formats,
    firstOfWeek: function firstOfWeek(culture) {
      var data = culture ? moment.localeData(culture) : moment.localeData();
      return data ? data.firstDayOfWeek() : 0;
    },
    format: function format(value, _format, culture) {
      return locale(moment(value), culture).format(_format);
    }
  });
}

var dateRangeFormat$2 = function dateRangeFormat(_ref, culture, local) {
  var start = _ref.start,
      end = _ref.end;
  return local.format(start, 'd', culture) + ' — ' + local.format(end, 'd', culture);
};

var timeRangeFormat$1 = function timeRangeFormat(_ref2, culture, local) {
  var start = _ref2.start,
      end = _ref2.end;
  return local.format(start, 't', culture) + ' — ' + local.format(end, 't', culture);
};

var timeRangeStartFormat$1 = function timeRangeStartFormat(_ref3, culture, local) {
  var start = _ref3.start;
  return local.format(start, 't', culture) + ' — ';
};

var timeRangeEndFormat$1 = function timeRangeEndFormat(_ref4, culture, local) {
  var end = _ref4.end;
  return ' — ' + local.format(end, 't', culture);
};

var weekRangeFormat$1 = function weekRangeFormat(_ref5, culture, local) {
  var start = _ref5.start,
      end = _ref5.end;
  return local.format(start, 'MMM dd', culture) + ' - ' + local.format(end, dates.eq(start, end, 'month') ? 'dd' : 'MMM dd', culture);
};

var formats$1 = {
  dateFormat: 'dd',
  dayFormat: 'ddd dd/MM',
  weekdayFormat: 'ddd',
  selectRangeFormat: timeRangeFormat$1,
  eventTimeRangeFormat: timeRangeFormat$1,
  eventTimeRangeStartFormat: timeRangeStartFormat$1,
  eventTimeRangeEndFormat: timeRangeEndFormat$1,
  timeGutterFormat: 't',
  monthHeaderFormat: 'Y',
  dayHeaderFormat: 'dddd MMM dd',
  dayRangeHeaderFormat: weekRangeFormat$1,
  agendaHeaderFormat: dateRangeFormat$2,
  agendaDateFormat: 'ddd MMM dd',
  agendaTimeFormat: 't',
  agendaTimeRangeFormat: timeRangeFormat$1
};
function oldGlobalize (globalize) {
  function getCulture(culture) {
    return culture ? globalize.findClosestCulture(culture) : globalize.culture();
  }

  function firstOfWeek(culture) {
    culture = getCulture(culture);
    return culture && culture.calendar.firstDay || 0;
  }

  return new DateLocalizer({
    firstOfWeek: firstOfWeek,
    formats: formats$1,
    format: function format(value, _format, culture) {
      return globalize.format(value, _format, culture);
    }
  });
}

var dateRangeFormat$3 = function dateRangeFormat(_ref, culture, local) {
  var start = _ref.start,
      end = _ref.end;
  return local.format(start, {
    date: 'short'
  }, culture) + ' — ' + local.format(end, {
    date: 'short'
  }, culture);
};

var timeRangeFormat$2 = function timeRangeFormat(_ref2, culture, local) {
  var start = _ref2.start,
      end = _ref2.end;
  return local.format(start, {
    time: 'short'
  }, culture) + ' — ' + local.format(end, {
    time: 'short'
  }, culture);
};

var timeRangeStartFormat$2 = function timeRangeStartFormat(_ref3, culture, local) {
  var start = _ref3.start;
  return local.format(start, {
    time: 'short'
  }, culture) + ' — ';
};

var timeRangeEndFormat$2 = function timeRangeEndFormat(_ref4, culture, local) {
  var end = _ref4.end;
  return ' — ' + local.format(end, {
    time: 'short'
  }, culture);
};

var weekRangeFormat$2 = function weekRangeFormat(_ref5, culture, local) {
  var start = _ref5.start,
      end = _ref5.end;
  return local.format(start, 'MMM dd', culture) + ' — ' + local.format(end, dates.eq(start, end, 'month') ? 'dd' : 'MMM dd', culture);
};

var formats$2 = {
  dateFormat: 'dd',
  dayFormat: 'eee dd/MM',
  weekdayFormat: 'eee',
  selectRangeFormat: timeRangeFormat$2,
  eventTimeRangeFormat: timeRangeFormat$2,
  eventTimeRangeStartFormat: timeRangeStartFormat$2,
  eventTimeRangeEndFormat: timeRangeEndFormat$2,
  timeGutterFormat: {
    time: 'short'
  },
  monthHeaderFormat: 'MMMM yyyy',
  dayHeaderFormat: 'eeee MMM dd',
  dayRangeHeaderFormat: weekRangeFormat$2,
  agendaHeaderFormat: dateRangeFormat$3,
  agendaDateFormat: 'eee MMM dd',
  agendaTimeFormat: {
    time: 'short'
  },
  agendaTimeRangeFormat: timeRangeFormat$2
};
function globalizeLocalizer (globalize) {
  var locale = function locale(culture) {
    return culture ? globalize(culture) : globalize;
  }; // return the first day of the week from the locale data. Defaults to 'world'
  // territory if no territory is derivable from CLDR.
  // Failing to use CLDR supplemental (not loaded?), revert to the original
  // method of getting first day of week.


  function firstOfWeek(culture) {
    try {
      var days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      var cldr = locale(culture).cldr;
      var territory = cldr.attributes.territory;
      var weekData = cldr.get('supplemental').weekData;
      var firstDay = weekData.firstDay[territory || '001'];
      return days.indexOf(firstDay);
    } catch (e) {
      process.env.NODE_ENV !== "production" ? warning(true, "Failed to accurately determine first day of the week.\n            Is supplemental data loaded into CLDR?") : void 0; // maybe cldr supplemental is not loaded? revert to original method

      var date = new Date(); //cldr-data doesn't seem to be zero based

      var localeDay = Math.max(parseInt(locale(culture).formatDate(date, {
        raw: 'e'
      }), 10) - 1, 0);
      return Math.abs(date.getDay() - localeDay);
    }
  }

  if (!globalize.load) return oldGlobalize(globalize);
  return new DateLocalizer({
    firstOfWeek: firstOfWeek,
    formats: formats$2,
    format: function format(value, _format, culture) {
      _format = typeof _format === 'string' ? {
        raw: _format
      } : _format;
      return locale(culture).formatDate(value, _format);
    }
  });
}

_extends(Calendar$1, {
  globalizeLocalizer: globalizeLocalizer,
  momentLocalizer: momentLocalizer,
  Views: views,
  Navigate: navigate,
  move: moveDate,
  components: {
    eventWrapper: NoopWrapper,
    dayWrapper: NoopWrapper,
    dateCellWrapper: NoopWrapper
  }
});

export default Calendar$1;
