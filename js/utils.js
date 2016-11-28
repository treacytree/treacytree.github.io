(function(win, doc) {
    'use strict';
    var mt = win.MT || {},
        _mobMaxWidth = 1024;
    mt.utils = {
        nameSpace: function(parent, ns, val) {
            var nsObj = parent,
                parts = ns.split('.'),
                partsLen = parts.length,
                i;
            if (parts[0] === 'FS') {
                parts = parts.slice(1);
            }
            for (i = 0; i < partsLen; i += 1) {
                if (nsObj[parts[i]] === undefined) {
                    nsObj[parts[i]] = {};
                }
                nsObj = nsObj[parts[i]];
            }
            if (val !== undefined) {}
            return nsObj;
        },
        arrayFix: function(arrLikeObj) {
            return Array.prototype.slice.call(arrLikeObj);
        },
        removePrimitive: function(array, val) {
            if (array && array.length && Array.isArray(array) && this.hasValue(val) && typeof val !== 'object') {
                return array.filter(function(el, i) {
                    return i !== array.indexOf(val);
                });
            }
            return array;
        },
        sortBy: function(arrayLike, prop) {
            return this.arrayFix(arrayLike).sort(function(e1, e2) {
                return e1[prop] - e2[prop];
            });
        },
        typeCheck: function(val) {
            return Object.prototype.toString.call(val).split(' ')[1].replace(']', '').toLowerCase();
        },
        hasValue: function(val) {
            return (val !== null && val !== undefined);
        },
        argCheck: function(args) {
            var validArgs = [],
                hasVal = this.hasValue;
            args = this.arrayFix(args);
            args.forEach(function(a) {
                if (hasVal(a)) {
                    validArgs.push(a);
                }
            });
            return args.length === validArgs.length;
        },
        isAny: function(val, valArr) {
            var match = false,
                matches = [];
            this.arrayFix(valArr).forEach(function(v) {
                if (v === val) {
                    matches.push(v);
                }
            });
            if (matches.length) {
                match = true;
            }
            return match;
        },
        isNone: function(val, valArr) {
            return !this.isAny(val, valArr);
        },
        fnCheck: function(fn) {
            var result = null;
            if (fn && typeof fn === 'function') {
                result = fn;
            }
            return result;
        },
        compare: function(valX, valY, operator) {
            var exp;
            operator = operator || 'eq';
            if (this.hasValue(valX) && this.hasValue(valY)) {
                switch (operator) {
                    case 'eq':
                        exp = valX === valY;
                        break;
                    case 'lt':
                        exp = valX < valY;
                        break;
                    case 'lteq':
                        exp = valX <= valY;
                        break;
                    case 'gt':
                        exp = valX > valY;
                        break;
                    case 'gteq':
                        exp = valX >= valY;
                        break;
                    default:
                        exp = valX === valY;
                }
                return exp;
            }
        },
        textFormat: function(text) {
            return text.replace('\'', '').replace(' ', '-').toLowerCase();
        },
        findAncestor: function(el, sel) {
            var n = el,
                elem, matchMethod = 'matches' in n ? 'matches' : this.prefix.js + 'MatchesSelector';
            for (; n; n = n.parentElement) {
                elem = n;
                if (n[matchMethod](sel))
                    return elem;
            }
            return null;
        },
        getMapFromListOfStrings: function(list, keyValueDelimiter) {
            var map = {};
            if (list && list.length && keyValueDelimiter) {
                list = mt.utils.arrayFix(list);
                list.forEach(function(str) {
                    var split, key, val;
                    str = str.trim();
                    if (str.indexOf(keyValueDelimiter) !== -1) {
                        split = str.split(keyValueDelimiter);
                        key = split[0];
                        val = split[1];
                        map[key] = val;
                    }
                });
            }
            return map;
        },
        getListOfStringsFromMap: function(map, keyValueDelimiter) {
            var arr = [],
                keys;
            if (map && keyValueDelimiter) {
                keys = Object.keys(map);
                keys.forEach(function(k) {
                    arr.push(k + keyValueDelimiter + map[k]);
                });
            }
            return arr;
        },
        editMetaTag: function(selector, attr, val, key) {
            var el = document.querySelector('meta[' + selector + ']'),
                oldAttrStr, oldAttrArr, oldAttrMap, newAttrVal;
            if (el) {
                oldAttrStr = el.getAttribute(attr);
                if (key) {
                    oldAttrArr = oldAttrStr.split(',');
                    oldAttrMap = mt.utils.getMapFromListOfStrings(oldAttrArr, '=');
                    oldAttrMap[key] = val;
                    val = mt.utils.getListOfStringsFromMap(oldAttrMap, '=').join(', ');
                }
                el.setAttribute(attr, val);
            }
            return oldAttrStr;
        },
        setUserScalable: function(scalable) {
            var value = '';
            if (mt.utils.hasValue(scalable)) {
                value = scalable ? 'yes' : 'no';
                mt.utils.editMetaTag('name="viewport"', 'content', value, 'user-scalable');
            }
        },
        prefix: (function(win) {
            var styles = win.getComputedStyle(doc.documentElement, ''),
                pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1],
                dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
            return {
                dom: dom,
                lowercase: pre,
                css: '-' + pre + '-',
                js: pre[0] + pre.substr(1)
            };
        }(win)),
        isSafari: (function(win) {
            return win.navigator.vendor.split(' ')[0].toLowerCase() === 'apple';
        }(win)),
        getViewportWidth: function(w, d) {
            return Math.max(d.documentElement.clientWidth, w.innerWidth || 0);
        },
        isMobView: function(w, d) {
            return mt.utils.getViewportWidth(w, d) <= _mobMaxWidth;
        },
        isSmallScreen: win.screen.availWidth <= _mobMaxWidth,
        isTouch: 'ontouchstart' in doc.documentElement,
        lib: {
            convertHour: function(hr, period, toMilitary) {
                var hourNum = 0,
                    hourPad = 0,
                    result = null;
                if (hr && period) {
                    hourNum = parseInt(hr, 10);
                    hourPad = period.toLowerCase() === 'pm' && (hourNum < 12) ? 12 : 0;
                    result = toMilitary ? hourNum + hourPad : hourNum - hourPad;
                }
                return result;
            },
            zeroPad: function(num, digits) {
                var isNum = mt.utils.hasValue(num) && mt.utils.typeCheck(num) === 'number',
                    numStr = isNum ? num.toString() : '',
                    len = numStr.length,
                    diff, str = "",
                    i = 0;
                digits = digits || 2;
                if (isNum && len < digits) {
                    diff = digits - len;
                    for (i; i < diff; i++) {
                        str = str + '0';
                    }
                    numStr = str + numStr;
                }
                return numStr;
            },
            poll: function(opts) {
                var endTime;
                if (opts && opts.condition && opts.success) {
                    endTime = Date.now() + (opts.timeout || 2000);
                    opts.interval = opts.interval || 100;
                    (function _poll() {
                        if (opts.condition()) {
                            opts.success();
                        } else if (Date.now() < endTime) {
                            if (opts.iteratee) {
                                opts.iteratee();
                            }
                            setTimeout(_poll, opts.interval);
                        } else if (opts.error) {
                            opts.error(new Error('timed out for ' + opts.condition.name + ': ' + arguments));
                        }
                    })();
                }
            },
            getTimeRemaining: function(endTime) {
                var ms = endTime - Date.now(),
                    secs = Math.floor((ms / 1000) % 60),
                    mins = Math.floor((ms / 1000 / 60) % 60),
                    hrs = Math.floor((ms / (1000 * 60 * 60)) % 24),
                    days = Math.floor(ms / (1000 * 60 * 60 * 24));
                return {
                    'milliseconds': ms,
                    'days': mt.utils.lib.zeroPad(days, 2),
                    'hours': mt.utils.lib.zeroPad(hrs, 2),
                    'minutes': mt.utils.lib.zeroPad(mins, 2),
                    'seconds': mt.utils.lib.zeroPad(secs, 2)
                };
            },
            convertUTCToLocale: function(utcMs) {
                var dateObj = new Date(utcMs),
                    offsetMins = -(dateObj.getTimezoneOffset()),
                    offsetMs = offsetMins * 60000;
                return utcMs + offsetMs;
            },
            countdown: function(opts) {
                var deadlineCb = {
                        string: function(time) {
                            return time;
                        },
                        number: function(time) {
                            return new Date(Date.now() + time);
                        }
                    },
                    deadline, deadlineType, timeLeft, isFn, utils = mt.utils;
                if (opts && opts.deadline) {
                    deadlineType = utils.typeCheck(opts.deadline);
                    deadline = deadlineCb[deadlineType] ? deadlineCb[deadlineType](opts.deadline) : null;
                    deadline = mt.utils.lib.convertUTCToLocale(Date.parse(deadline));
                    if (deadline) {
                        timeLeft = utils.lib.getTimeRemaining(deadline);
                        isFn = utils.fnCheck;
                        utils.lib.poll({
                            condition: function condition() {
                                return Date.now() >= Date.parse(deadline);
                            },
                            success: function() {
                                if (opts.done && isFn(opts.done)) {
                                    opts.done(Date.parse(deadline));
                                }
                                if (opts.logger) {
                                    opts.logger.log('***Time is up!***');
                                }
                            },
                            error: function(err) {
                                if (opts.logger) {
                                    opts.logger.log(err);
                                }
                            },
                            iteratee: function() {
                                var t = utils.lib.getTimeRemaining(deadline);
                                if (opts.counter && isFn(opts.counter)) {
                                    opts.counter(t);
                                }
                                if (opts.logger) {
                                    opts.logger.log('Timer is running!');
                                    opts.logger.log(t.days + ' days ' + t.hours + ' hours ' + t.minutes + ' minutes ' + t.seconds + ' seconds remaining!');
                                }
                            },
                            timeout: timeLeft.milliseconds,
                            interval: opts.interval || 1000
                        });
                    }
                }
            }
        },
        event: {
            _bind: function(target, handlerMap, bind) {
                var method = bind ? 'addEventListener' : 'removeEventListener',
                    events = Object.keys(handlerMap);
                if (target && events && events.length) {
                    events.forEach(function(e) {
                        target[method](e, handlerMap[e], false);
                    });
                }
            },
            binder: function(targetObj, handlerMap, bind) {
                var self = this,
                    targLen = null;
                if (targetObj && typeof targetObj === 'object') {
                    targLen = targetObj.length;
                    if (mt.utils.hasValue(targLen) && targLen) {
                        mt.utils.arrayFix(targetObj).forEach(function(t) {
                            self._bind(t, handlerMap, bind);
                        });
                    } else {
                        self._bind(targetObj, handlerMap, bind);
                    }
                }
            },
            viewBinder: function(els, mouseCb, touchCb) {
                if (mt.utils.getViewportWidth(window, document)) {
                    mouseCb(false, els);
                    touchCb(true, els);
                } else {
                    touchCb(false, els);
                    mouseCb(true, els);
                }
            },
            throttle: function(timeout, cb, interval, cbArgs) {
                cbArgs = cbArgs && cbArgs.length ? mt.utils.arrayFix(cbArgs) : null;
                if (!timeout) {
                    timeout = setTimeout(function() {
                        timeout = null;
                        if (typeof cb === 'function') {
                            cb.apply(this, cbArgs);
                        }
                    }, interval);
                }
            },
            waitCall: function(pastVal, futureVal, delay, cb, cbArgs) {
                cbArgs = cbArgs && cbArgs.length ? mt.utils.arrayFix(cbArgs) : null;
                if (mt.utils.argCheck(arguments)) {
                    setTimeout(function() {
                        futureVal = futureVal();
                        if (mt.utils.compare(pastVal, futureVal)) {
                            if (typeof cb === 'function') {
                                cb.apply(this, cbArgs);
                            }
                        }
                    }, delay);
                }
            },
            log: function(e, msg, color, bgColor) {
                var tgtCls, curTgtCls, tgtEl, curTgtEl;
                msg = msg || 'logged at ' + Date.now();
                color = color || '#fff';
                bgColor = bgColor || '#999';
                if (e) {
                    tgtCls = e.target.classList || '';
                    curTgtCls = e.currentTarget ? e.currentTarget.classList || '' : '';
                    tgtEl = e.target.nodeName.toLowerCase() || '';
                    curTgtEl = e.currentTarget && e.currentTarget.nodeName ? e.currentTarget.nodeName.toLowerCase() || '' : '';
                    console.log('%c%s', 'color:' + color + ';background-color:' + bgColor + ';font-family:"Courier";text-transform:uppercase;font-style:italic;', '*** Event: ' + e.type + ' Target: ' + tgtEl + '.' + tgtCls + ' Current Target: ' + curTgtEl + '.' + curTgtCls + " ***");
                    console.log('*** ' + msg + ' ***');
                    console.info(e);
                    console.log('%c%s', 'color:' + bgColor + ';background-color:' + color + ';font-family:"Courier";', '-----------------------------------------------------');
                }
            },
            trigger: function(targ, Constructor, type, cancelable) {
                var event = new Constructor(type, {
                        'view': window,
                        'bubbles': true,
                        'cancelable': cancelable,
                        'isTrusted': true
                    }),
                    cancelled = !targ.dispatchEvent(event);
                if (cancelled) {
                    console.warn('CANCELLED EVENT: ' + type + ' on ' + targ);
                    this.log(event, null, 'red', 'beige');
                    return false;
                }
                console.info('EVENT SUCCESSFUL: ' + type + ' on ' + targ);
                this.log(event, '', 'brown', 'beige');
                return true;
            },
            kill: function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            },
            proxy: function(targ, opts) {
                return function(e) {
                    var constructor = opts && opts.constructor ? opts.constructor : e.constructor,
                        type = opts && opts.type ? opts.type : e.type;
                    mt.utils.event.trigger(targ, constructor, type, false);
                };
            },
            getMobileHandlerMap: function(eventType, cb, clickBind) {
                var map = {};
                if (eventType && cb) {
                    if (clickBind) {
                        map.click = cb;
                    }
                    map[eventType] = cb;
                }
                return map;
            }
        },
        touch: {
            config: {
                space: {
                    xStart: null,
                    yStart: null,
                    xDist: 0,
                    yDist: 0,
                    threshold: {
                        scroll: 20,
                        swipe: 50,
                        hold: 50,
                        tap: 20
                    }
                },
                time: {
                    start: null,
                    elapse: 0,
                    scrollThresh: 500,
                    swipeThresh: 500,
                    holdThresh: 400,
                    threshold: {
                        scroll: 500,
                        swipe: 500,
                        hold: 400,
                        tap: 200
                    }
                }
            },
            reset: function() {
                var config = mt.utils.touch.config;
                config.space.xDist = config.space.yDist = config.time.elapse = 0;
                config.space.xStart = config.space.yStart = config.time.start = null;
                Object.keys(mt.utils.touch.config).forEach(function(k) {
                    if (k in config) {
                        mt.utils.touch.config[k] = config[k];
                    }
                });
            },
            startHandler: function(e) {
                var touchData = e.changedTouches ? e.changedTouches[0] : e,
                    config = mt.utils.touch.config;
                config.space.xStart = touchData.pageX;
                config.space.yStart = touchData.pageY;
                config.time.start = Date.now();
            },
            endHandler: function(e) {
                var touchData = e.changedTouches ? e.changedTouches[0] : e,
                    config = mt.utils.touch.config,
                    elapsedTime;
                config.space.xDist = mt.utils.hasValue(config.space.xStart) ? touchData.pageX - config.space.xStart : 0;
                config.space.yDist = mt.utils.hasValue(config.space.yStart) ? touchData.pageY - config.space.yStart : 0;
                elapsedTime = mt.utils.hasValue(config.time.start) ? Date.now() - config.time.start : 0;
                e.isSwipe = (elapsedTime > config.time.threshold.swipe) && ((Math.abs(config.space.xDist) + Math.abs(config.space.yDist)) > config.space.threshold.swipe) && (Math.abs(config.space.yDist) > config.space.threshold.swipe);
                e.preventDefault();
                mt.utils.touch.reset();
                return e;
            },
            swipeBinder: function(el, cbMap, bind) {
                var method = bind ? 'addEventListener' : 'removeEventListener',
                    swipeEndHandler = function(e) {
                        e = mt.utils.touch.endHandler(e);
                        if (e.isSwipe) {
                            if (cbMap.swipeSuccess && typeof cbMap.swipeSuccess === 'function') {
                                cbMap.swipeSuccess(e);
                            }
                        } else {
                            if (cbMap.swipeFail && typeof cbMap.swipeFail === 'function') {
                                cbMap.swipeFail(e);
                            }
                            console.log('___NOT A SWIPE!');
                            mt.utils.event.log(e);
                            mt.utils.touch.reset();
                            return e;
                        }
                    };
                el[method]('touchstart', mt.utils.touch.startHandler, false);
                el[method]('touchend', swipeEndHandler, false);
            },
            scrollFilter: function(e) {
                var touchData = e.changedTouches ? e.changedTouches[0] : e,
                    config = mt.utils.touch.config,
                    valid = {
                        distance: false,
                        time: false
                    };
                config.time.elapse = mt.utils.hasValue(config.time.start) ? Date.now() - config.time.start : 0;
                config.space.yDist = mt.utils.hasValue(config.space.yStart) ? touchData.pageY - config.space.yStart : 0;
                valid.distance = Math.abs(config.space.yDist) >= config.space.threshold.scroll;
                valid.time = config.time.elapse >= config.time.threshold.hold;
                e.isScroll = valid.distance;
                e.isHold = valid.time;
                e.preventDefault();
                mt.utils.touch.reset();
                return e;
            }
        },
        ajax: {
            call: function(method, url, handlerMap, headerMap, data) {
                var req = new XMLHttpRequest(),
                    headers;
                headers = Object.keys(headerMap);
                this._bind(req, handlerMap);
                req.open(method, url);
                headers.forEach(function(h) {
                    req.setRequestHeader(h, headerMap[h]);
                });
                data = data ? JSON.stringify(data) : null;
                req.send(data);
            },
            get: function(url, handlerMap, headerMap) {
                this.call('GET', url, handlerMap, headerMap, null);
            },
            post: function(url, handlerMap, headerMap, data) {
                headerMap["Content-Type"] = headerMap["Content-Type"] || "application/json; charset=utf-8";
                this.call('POST', url, handlerMap, headerMap, data);
            },
            put: function(url, handlerMap, headerMap, data) {
                headerMap["Content-Type"] = headerMap["Content-Type"] || "application/json; charset=utf-8";
                this.call('PUT', url, handlerMap, headerMap, data);
            },
            delete: function(url, handlerMap, headerMap) {
                this.call('DELETE', url, handlerMap, headerMap, null);
            },
            _bind: function(req, handlerMap) {
                var events = Object.keys(handlerMap);
                if (req) {
                    events.forEach(function(e) {
                        req.addEventListener(e, handlerMap[e], false);
                    });
                }
            },
            progressHandler: function(e) {
                if (e.lengthComputable) {
                    var percentComplete = (e.loaded / e.total) * 100;
                    console.info('*** PROGRESS: response is ' + percentComplete + '% complete ***');
                } else {
                    console.info('*** PROGRESS: Unable to compute since the total size is unknown ***');
                }
            },
            loadHandler: function() {
                var data = null;
                if (this.status >= 200 && this.status < 400) {
                    console.info('*** SUCCESS: response code is ' + this.status + ' ***');
                    data = JSON.parse(this.response);
                    console.dir(data);
                } else {
                    console.error('*** ERROR: Server returned an error ***');
                }
            },
            abortHandler: function() {
                alert("The transfer has been canceled by the user.");
            },
            errorHandler: function() {
                console.error('*** ERROR: Could not connect to server ***');
            }
        },
        form: {
            getLocation: function(zip, handler) {
                var zipNum, protocol = win.location.protocol + '//',
                    apiDomain = protocol + 'zip.getziptastic.com',
                    apiPath = '/v2/US/',
                    apiUrl = '';
                if (zip) {
                    zipNum = typeof zip === 'string' ? parseInt(zip, 10) : zip;
                    if (zipNum && typeof zipNum === 'number' && zipNum.toString().length === 5) {
                        apiUrl = apiDomain + apiPath + zip;
                        mt.utils.ajax.get(apiUrl, {
                            'load': handler
                        }, {});
                    }
                }
            },
            numFilter: function(e) {
                var code = e.charCode || e.keyCode;
                if (mt.utils.isNone(code, [8, 37, 13])) {
                    if (code < 48 || code > 57) {
                        mt.utils.event.kill(e);
                    }
                }
            },
            phoneCleaner: function(val) {
                return val.replace(/\(/g, '').replace(/\)/g, '').replace(/ /g, '').replace(/-/g, '');
            },
            inputToggler: function(el, attMap) {
                var attKeys = [];
                if (el && attMap) {
                    attKeys = Object.keys(attMap);
                    attKeys.forEach(function(k) {
                        if (el[k] === attMap[k]) {
                            el[k] = '';
                        }
                    });
                }
            }
        },
        ui: {
            getElStyleMap: function(el) {
                var str, arr = [],
                    map = {};
                if (el) {
                    str = el.getAttribute('style');
                    if (str) {
                        arr = str.split(';');
                        arr.forEach(function(s) {
                            if (s) {
                                var kv = s.split(':');
                                map[kv[0].trim()] = kv[1].trim();
                            }
                        });
                    }
                }
                return map;
            },
            setElStyle: function(el, map) {
                var styleStr = "",
                    keys = [],
                    oldMap = {};
                if (el && map) {
                    oldMap = mt.utils.ui.getElStyleMap(el);
                    keys = Object.keys(map);
                    if (keys && keys.length) {
                        keys.forEach(function(k) {
                            oldMap[k] = map[k];
                        });
                    }
                    keys = Object.keys(oldMap);
                    if (keys && keys.length) {
                        keys.forEach(function(k) {
                            styleStr += k + ': ' + oldMap[k] + ';';
                        });
                    }
                    el.setAttribute('style', styleStr);
                    return el;
                }
            },
            getClone: function(node, opts) {
                var clone = node.cloneNode(true);
                clone = mt.utils.ui.setElStyle(clone, opts.style || clone.style);
                clone.id = opts.id || 'clone-' + clone.id;
                return clone;
            },
            blowUp: {
                show: function(el, eType, map, frameFlow) {
                    var cloneEl = mt.utils.ui.getClone(el, {
                            style: {
                                'transition-property': 'opacity, transform',
                                'transition-duration': '.25s, .25s',
                                'transition-timing-function': 'cubic-bezier(0.1, -0.6, 0.2, 0)',
                                'transition-delay': '0s',
                                display: 'block',
                                margin: '0 auto',
                                opacity: '0 !important',
                                cursor: 'pointer',
                                transform: 'translateY(200px)'
                            }
                        }),
                        fnStart = mt.utils.touch.startHandler,
                        fnEnd = mt.utils.ui.blowUp.listener(eType, map, frameFlow, true),
                        cloneElDom;
                    map.hideEls.forEach(function(el) {
                        el.classList.add('fade');
                        el.classList.add('out');
                    });
                    map.frame.style.overflow = 'hidden';
                    setTimeout(function() {
                        map.frame.insertBefore(cloneEl, map.hideEls[0]);
                        cloneElDom = document.getElementById(cloneEl.id);
                        mt.utils.ui.setElStyle(cloneElDom, {
                            opacity: 1,
                            transform: 'translateY(0px)'
                        });
                        mt.utils.event.binder(cloneElDom, mt.utils.event.getMobileHandlerMap('touchstart', fnStart, true), true);
                        mt.utils.event.binder(cloneElDom, mt.utils.event.getMobileHandlerMap(eType, fnEnd), true);
                        mt.utils.ui.smoothScrollTo(0, 250);
                    }, 0);
                },
                hide: function(el, eType, map, frameFlow) {
                    var fnStart = mt.utils.touch.startHandler,
                        fnEnd = mt.utils.ui.blowUp.listener(eType, map, frameFlow, true);
                    mt.utils.event.binder(el, mt.utils.event.getMobileHandlerMap('touchstart', fnStart, true), false);
                    mt.utils.event.binder(el, mt.utils.event.getMobileHandlerMap(eType, fnEnd), false);
                    mt.utils.ui.setElStyle(el, {
                        transform: 'translateY(200px)'
                    });
                    setTimeout(function() {
                        el.style.opacity = 0;
                        map.frame.style.overflow = frameFlow;
                        if (map.frame.contains(el)) {
                            map.frame.removeChild(el);
                        }
                        map.hideEls.forEach(function(el) {
                            el.classList.remove('out');
                        });
                    }, 250);
                },
                listener: function(eventType, map, frameFlow, disableScroll) {
                    return function(e) {
                        var el = e.target,
                            isClone = el.id.split('-')[0] === 'clone';
                        e = mt.utils.touch.scrollFilter(e);
                        if (!e.isScroll && e.isHold) {
                            if (!isClone) {
                                mt.utils.ui.blowUp.show(el, eventType, map, frameFlow);
                            } else {
                                mt.utils.ui.blowUp.hide(el, eventType, map, frameFlow);
                            }
                        } else {
                            if (disableScroll) {
                                mt.utils.event.kill(e);
                            }
                        }
                    };
                },
                setUp: function(elMap, eventType, bind) {
                    var fnStart, fnEnd, frameFlow;
                    if (elMap && elMap.zoom) {
                        elMap.frame = elMap.frame || document.getElementsByTagName('body')[0];
                        frameFlow = elMap.frame.style.overflow || 'initial';
                        elMap.hideEls = mt.utils.arrayFix(elMap.frame.children);
                        fnStart = mt.utils.touch.startHandler;
                        fnEnd = mt.utils.ui.blowUp.listener(eventType, elMap, frameFlow);
                        mt.utils.event.binder(elMap.zoom, mt.utils.event.getMobileHandlerMap('touchstart', fnStart, true), bind);
                        mt.utils.event.binder(elMap.zoom, mt.utils.event.getMobileHandlerMap(eventType, fnEnd), bind);
                    }
                }
            },
            classTierRemover: function(el, baseClass, tiers) {
                var matches = el.querySelectorAll('[class^="' + baseClass + '"]'),
                    i;
                mt.utils.arrayFix(matches).forEach(function(el) {
                    for (i = 1; i <= tiers; i += 1) {
                        el.classList.remove(baseClass + '-' + i);
                    }
                });
            },
            transformer: function(el, prop, val, unit) {
                var vpTransform = mt.utils.prefix.js + 'Transform',
                    newVal = el.style[vpTransform] ? parseInt(el.style[vpTransform].split('(')[1].replace('deg)', ''), 10) : 0;
                el.style[vpTransform] = prop + '(' + (newVal + val) + unit + ')';
            },
            disabler: function(el, disable) {
                var events = ['click', 'dblclick', 'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mouseup', 'mousedown', 'focus', 'blur', 'change'],
                    eMethod = disable ? 'addEventListener' : 'removeEventListener',
                    cursorVal = disable ? 'not-allowed' : 'pointer';
                events.forEach(function(e) {
                    el[eMethod](e, mt.utils.event.kill, false);
                });
                el.style.cursor = cursorVal;
            },
            modal: function(opts) {
                var modal, modId = opts.id || 'modal-' + Math.ceil(Math.random() * 1000),
                    match = doc.getElementById(modId),
                    color = opts.color || '#000',
                    opacity = opts.opacity || 0.7,
                    parentEl = opts.parentEl || doc.getElementsByTagName('body')[0],
                    show = mt.utils.hasValue(opts.show) && typeof opts.show === 'boolean' ? opts.show : true;
                if (show && !match) {
                    modal = doc.createElement('div');
                    modal.id = modId;
                    modal.style.background_color = color;
                    modal.style.opacity = opacity;
                    parentEl.appendChild(modal);
                    doc.getElementById(modId).classList.add('in');
                    this.disabler(doc.getElementById(modId), true);
                } else if (!show && match) {
                    match.classList.remove('in');
                    mt.utils.ui.disabler(match, false);
                    if (match.parentElement.contains(match)) {
                        match.parentElement.removeChild(match);
                    }
                }
            },
            nestBounder: function(bound, baseClass, container, parent, child, left) {
                var boxPos, childPos, boxBot, childBot, childCols, pad;
                pad = mt.utils.isSafari ? 200 : 0;
                if (bound) {
                    if (child && (mt.utils.getViewportWidth(window, document) > _mobMaxWidth)) {
                        boxPos = container.getBoundingClientRect();
                        boxBot = boxPos.bottom + pad;
                        childPos = child.getBoundingClientRect();
                        childBot = childPos.bottom;
                        childCols = Math.ceil(childBot / boxBot);
                        if (childCols > 1) {
                            child.classList.add(baseClass + '-' + childCols.toString());
                        }
                        child.style.top = (parent.offsetTop).toString() + 'px';
                        child.style.left = (parent.offsetLeft + parent.offsetWidth + left).toString() + 'px';
                    }
                } else {
                    this.classTierRemover(container, baseClass, 4);
                }
            },
            nestStyler: function(containerEl, thisEl, baseClass, select) {
                var child, parent, grand, el, cl = {
                        t1: baseClass + '-1',
                        t2: baseClass + '-2',
                        t3: baseClass + '-3'
                    },
                    sel2, sel3, setCl = function(elem, clsName) {
                        var allT = Object.keys(cl),
                            oldClArr = allT.filter(function(c) {
                                return cl[c] !== clsName;
                            });
                        elem.classList.add(clsName);
                        oldClArr.forEach(function(c) {
                            elem.classList.remove(cl[c]);
                        });
                    },
                    resetEl = function(el) {
                        Object.keys(cl).forEach(function(c) {
                            el.classList.remove(cl[c]);
                        });
                    },
                    domArray = mt.utils.arrayFix,
                    resetAll = function() {
                        if (thisEl) {
                            Object.keys(el).forEach(function(t) {
                                if (el[t]) {
                                    resetEl(el[t]);
                                }
                            });
                        } else {
                            Object.keys(cl).forEach(function(c) {
                                var els = containerEl.querySelectorAll('[class~="' + cl[c] + '"]');
                                domArray(els).forEach(function(el) {
                                    el.classList.remove(cl[c]);
                                });
                                containerEl.classList.remove(cl[c]);
                            });
                        }
                    };
                if (thisEl) {
                    child = thisEl.querySelector('ul');
                    parent = thisEl.parentElement.tagName === 'UL' ? thisEl.parentElement : null;
                    grand = parent.parentElement.tagName === 'LI' ? parent.parentElement.parentElement : null;
                    el = {
                        t1: child || parent,
                        t2: child ? parent : grand,
                        t3: child ? grand : null
                    };
                }
                if (select) {
                    if (el.t1) {
                        setCl(el.t1, cl.t1);
                        if (el.t2) {
                            setCl(el.t2, cl.t2);
                            sel2 = el.t2.querySelector('.selected');
                            if (sel2) {
                                domArray(sel2.parentElement.children).forEach(function(s) {
                                    resetEl(s);
                                });
                                setCl(sel2, cl.t1);
                            }
                        }
                        if (el.t3) {
                            setCl(el.t3, cl.t3);
                            sel3 = el.t3.querySelector('.selected');
                            if (sel3) {
                                domArray(sel3.parentElement.children).forEach(function(s) {
                                    resetEl(s);
                                });
                                setCl(sel3, cl.t2);
                            }
                        }
                    }
                } else {
                    resetAll();
                }
            },
            scrollTo: function(el, containerEl, offSetX, offSetY) {
                var elBox = el.getBoundingClientRect(),
                    elTop = elBox.top,
                    curPosY = win.scrollY,
                    xScroll = 0,
                    yScroll = 0;
                if (elTop > curPosY) {
                    yScroll = (elTop - curPosY) + offSetY;
                } else {
                    yScroll = elTop + offSetY;
                }
                win.scroll(xScroll, yScroll);
            },
            smoothScrollTo: (function() {
                var timer, start, factor;
                return function(target, duration) {
                    var offset = window.pageYOffset,
                        delta = target - window.pageYOffset;
                    duration = duration || 1000;
                    start = Date.now();
                    factor = 0;
                    if (timer) {
                        clearInterval(timer);
                    }

                    function step() {
                        var y;
                        factor = (Date.now() - start) / duration;
                        if (factor >= 1) {
                            clearInterval(timer);
                            factor = 1;
                        }
                        y = factor * delta + offset;
                        window.scrollBy(0, y - window.pageYOffset);
                    }
                    timer = setInterval(step, 10);
                    return timer;
                };
            }()),
            countdownTimer: function(domMap, endDate, widgetEl) {
                var _counterFn = function(elMap) {
                        return function(t) {
                            Object.keys(elMap).forEach(function(k) {
                                elMap[k].textContent = t[k];
                            });
                        };
                    },
                    _doneFn = function(elMap, containerEl) {
                        return function(endTime) {
                            console.log('Timer up, deadline of ' + endTime + ' reached');
                            Object.keys(elMap).forEach(function(k) {
                                elMap[k].textContent = '';
                            });
                            containerEl.style.display = 'none';
                        };
                    },
                    paramMap;
                if (domMap && endDate) {
                    paramMap = {
                        deadline: endDate,
                        counter: _counterFn(domMap),
                        done: _doneFn(domMap, widgetEl)
                    };
                    mt.utils.lib.countdown(paramMap);
                }
            }
        }
    };
    win.MT = mt;
}(window, document));