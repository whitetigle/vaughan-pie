(function (exports) {
'use strict';

var fableGlobal = function () {
    var globalObj = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : null;
    if (typeof globalObj.__FABLE_CORE__ === "undefined") {
        globalObj.__FABLE_CORE__ = {
            types: new Map(),
            symbols: {
                reflection: Symbol("reflection"),
                generics: Symbol("generics")
            }
        };
    }
    return globalObj.__FABLE_CORE__;
}();
function setType(fullName, cons) {
    fableGlobal.types.set(fullName, cons);
}

var _Symbol = fableGlobal.symbols;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NonDeclaredType = function () {
    function NonDeclaredType(kind, name, generics) {
        _classCallCheck(this, NonDeclaredType);

        this.kind = kind;
        this.name = name;
        this.generics = generics || [];
    }

    _createClass(NonDeclaredType, [{
        key: "Equals",
        value: function Equals(other) {
            return this.kind === other.kind && this.name === other.name && equals(this.generics, other.generics);
        }
    }]);

    return NonDeclaredType;
}();

var GenericNonDeclaredType = function (_NonDeclaredType) {
    _inherits(GenericNonDeclaredType, _NonDeclaredType);

    function GenericNonDeclaredType(kind, generics) {
        _classCallCheck(this, GenericNonDeclaredType);

        return _possibleConstructorReturn(this, (GenericNonDeclaredType.__proto__ || Object.getPrototypeOf(GenericNonDeclaredType)).call(this, kind, null, generics));
    }

    _createClass(GenericNonDeclaredType, [{
        key: _Symbol.generics,
        value: function value() {
            return this.generics;
        }
    }]);

    return GenericNonDeclaredType;
}(NonDeclaredType);

var Any = new NonDeclaredType("Any");
var Unit = new NonDeclaredType("Unit");

function Tuple(ts) {
    return new GenericNonDeclaredType("Tuple", ts);
}


function makeGeneric(typeDef, genArgs) {
    return function (_typeDef) {
        _inherits(_class, _typeDef);

        function _class() {
            _classCallCheck(this, _class);

            return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
        }

        _createClass(_class, [{
            key: _Symbol.generics,
            value: function value() {
                return genArgs;
            }
        }]);

        return _class;
    }(typeDef);
}
/**
 * Checks if this a function constructor extending another with generic info.
 */
function isGeneric(typ) {
    return typeof typ === "function" && !!typ.prototype[_Symbol.generics];
}
/**
 * Returns the parent if this is a declared generic type or the argument otherwise.
 * Attention: Unlike .NET this doesn't throw an exception if type is not generic.
*/
function getDefinition(typ) {
    return typeof typ === "function" && typ.prototype[_Symbol.generics] ? Object.getPrototypeOf(typ.prototype).constructor : typ;
}

function hasInterface(obj, interfaceName) {
    if (typeof obj[_Symbol.reflection] === "function") {
        var interfaces = obj[_Symbol.reflection]().interfaces;
        return Array.isArray(interfaces) && interfaces.indexOf(interfaceName) > -1;
    }
    return false;
}

function getRestParams(args, idx) {
    for (var _len = args.length, restArgs = Array(_len > idx ? _len - idx : 0), _key = idx; _key < _len; _key++) {
        restArgs[_key - idx] = args[_key];
    }return restArgs;
}
function toString(o) {
    return o != null && typeof o.ToString == "function" ? o.ToString() : String(o);
}

function equals(x, y) {
    // Optimization if they are referencially equal
    if (x === y) return true;else if (x == null) return y == null;else if (y == null) return false;else if (isGeneric(x) && isGeneric(y)) return getDefinition(x) === getDefinition(y) && equalsRecords(x.prototype[_Symbol.generics](), y.prototype[_Symbol.generics]());else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;else if (typeof x.Equals === "function") return x.Equals(y);else if (Array.isArray(x)) {
        if (x.length != y.length) return false;
        for (var i = 0; i < x.length; i++) {
            if (!equals(x[i], y[i])) return false;
        }return true;
    } else if (ArrayBuffer.isView(x)) {
        if (x.byteLength !== y.byteLength) return false;
        var dv1 = new DataView(x.buffer),
            dv2 = new DataView(y.buffer);
        for (var _i = 0; _i < x.byteLength; _i++) {
            if (dv1.getUint8(_i) !== dv2.getUint8(_i)) return false;
        }return true;
    } else if (x instanceof Date) return x.getTime() == y.getTime();else return false;
}
function compare(x, y) {
    // Optimization if they are referencially equal
    if (x === y) return 0;
    if (x == null) return y == null ? 0 : -1;else if (y == null) return -1;else if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return -1;else if (hasInterface(x, "System.IComparable")) return x.CompareTo(y);else if (Array.isArray(x)) {
        if (x.length != y.length) return x.length < y.length ? -1 : 1;
        for (var i = 0, j = 0; i < x.length; i++) {
            if ((j = compare(x[i], y[i])) !== 0) return j;
        }return 0;
    } else if (ArrayBuffer.isView(x)) {
        if (x.byteLength != y.byteLength) return x.byteLength < y.byteLength ? -1 : 1;
        var dv1 = new DataView(x.buffer),
            dv2 = new DataView(y.buffer);
        for (var _i2 = 0, b1 = 0, b2 = 0; _i2 < x.byteLength; _i2++) {
            b1 = dv1.getUint8(_i2), b2 = dv2.getUint8(_i2);
            if (b1 < b2) return -1;
            if (b1 > b2) return 1;
        }
        return 0;
    } else if (x instanceof Date) return compare(x.getTime(), y.getTime());else return x < y ? -1 : 1;
}
function equalsRecords(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return true;
    } else {
        var keys = Object.getOwnPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            if (!equals(x[keys[i]], y[keys[i]])) return false;
        }
        return true;
    }
}
function compareRecords(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return 0;
    } else {
        var keys = Object.getOwnPropertyNames(x);
        for (var i = 0; i < keys.length; i++) {
            var res = compare(x[keys[i]], y[keys[i]]);
            if (res !== 0) return res;
        }
        return 0;
    }
}
function equalsUnions(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return true;
    } else if (x.Case !== y.Case) {
        return false;
    } else {
        for (var i = 0; i < x.Fields.length; i++) {
            if (!equals(x.Fields[i], y.Fields[i])) return false;
        }
        return true;
    }
}
function compareUnions(x, y) {
    // Optimization if they are referencially equal
    if (x === y) {
        return 0;
    } else {
        var res = compare(x.Case, y.Case);
        if (res !== 0) return res;
        for (var i = 0; i < x.Fields.length; i++) {
            res = compare(x.Fields[i], y.Fields[i]);
            if (res !== 0) return res;
        }
        return 0;
    }
}

function create(pattern, options) {
    var flags = "g";
    flags += options & 1 ? "i" : "";
    flags += options & 2 ? "m" : "";
    return new RegExp(pattern, flags);
}
// From http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escape(str) {
    return str.replace(/[\-\[\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function isMatch(str, pattern) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = create(pattern, options);
    return reg.test(str);
}

function matches(str, pattern) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var reg = str instanceof RegExp ? (reg = str, str = pattern, reg.lastIndex = options, reg) : reg = create(pattern, options);
    if (!reg.global) throw new Error("Non-global RegExp"); // Prevent infinite loop
    var m = void 0;
    var matches = [];
    while ((m = reg.exec(str)) !== null) {
        matches.push(m);
    }return matches;
}

function fromTicks(ticks) {
    return ticks / 10000;
}

function __getValue(d, key) {
    return d[(d.kind == 1 /* UTC */ ? "getUTC" : "get") + key]();
}




function create$1(year, month, day) /* Local */{
    var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var m = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var s = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var ms = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
    var kind = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 2;

    var date = kind === 1 /* UTC */ ? new Date(Date.UTC(year, month - 1, day, h, m, s, ms)) : new Date(year, month - 1, day, h, m, s, ms);
    if (isNaN(date.getTime())) throw new Error("The parameters describe an unrepresentable Date.");
    date.kind = kind;
    return date;
}



function isLeapYear(year) {
    return year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
}
function daysInMonth(year, month) {
    return month == 2 ? isLeapYear(year) ? 29 : 28 : month >= 8 ? month % 2 == 0 ? 31 : 30 : month % 2 == 0 ? 30 : 31;
}




function day(d) {
    return __getValue(d, "Date");
}
function hour(d) {
    return __getValue(d, "Hours");
}
function millisecond(d) {
    return __getValue(d, "Milliseconds");
}
function minute(d) {
    return __getValue(d, "Minutes");
}
function month(d) {
    return __getValue(d, "Month") + 1;
}
function second(d) {
    return __getValue(d, "Seconds");
}
function year(d) {
    return __getValue(d, "FullYear");
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var fsFormatRegExp = /(^|[^%])%([0+ ]*)(-?\d+)?(?:\.(\d+))?(\w)/;
var formatRegExp = /\{(\d+)(,-?\d+)?(?:\:(.+?))?\}/g;
function toHex(value) {
    return value < 0 ? "ff" + (16777215 - (Math.abs(value) - 1)).toString(16) : value.toString(16);
}
function fsFormat(str) {
    var _cont = void 0;
    function isObject(x) {
        return x !== null && (typeof x === "undefined" ? "undefined" : _typeof(x)) === "object" && !(x instanceof Number) && !(x instanceof String) && !(x instanceof Boolean);
    }
    function formatOnce(str, rep) {
        return str.replace(fsFormatRegExp, function (_, prefix, flags, pad, precision, format) {
            switch (format) {
                case "f":
                case "F":
                    rep = rep.toFixed(precision || 6);
                    break;
                case "g":
                case "G":
                    rep = rep.toPrecision(precision);
                    break;
                case "e":
                case "E":
                    rep = rep.toExponential(precision);
                    break;
                case "O":
                    rep = toString(rep);
                    break;
                case "A":
                    try {
                        rep = JSON.stringify(rep, function (k, v) {
                            return v && v[Symbol.iterator] && !Array.isArray(v) && isObject(v) ? Array.from(v) : v;
                        });
                    } catch (err) {
                        // Fallback for objects with circular references
                        rep = "{" + Object.getOwnPropertyNames(rep).map(function (k) {
                            return k + ": " + String(rep[k]);
                        }).join(", ") + "}";
                    }
                    break;
                case "x":
                    rep = toHex(Number(rep));
                    break;
                case "X":
                    rep = toHex(Number(rep)).toUpperCase();
                    break;
            }
            var plusPrefix = flags.indexOf("+") >= 0 && parseInt(rep) >= 0;
            if (!isNaN(pad = parseInt(pad))) {
                var ch = pad >= 0 && flags.indexOf("0") >= 0 ? "0" : " ";
                rep = padLeft(rep, Math.abs(pad) - (plusPrefix ? 1 : 0), ch, pad < 0);
            }
            var once = prefix + (plusPrefix ? "+" + rep : rep);
            return once.replace(/%/g, "%%");
        });
    }
    function makeFn(str) {
        return function (rep) {
            var str2 = formatOnce(str, rep);
            return fsFormatRegExp.test(str2) ? makeFn(str2) : _cont(str2.replace(/%%/g, "%"));
        };
    }

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    if (args.length === 0) {
        return function (cont) {
            _cont = cont;
            return fsFormatRegExp.test(str) ? makeFn(str) : _cont(str);
        };
    } else {
        for (var i = 0; i < args.length; i++) {
            str = formatOnce(str, args[i]);
        }
        return str.replace(/%%/g, "%");
    }
}








function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    str = String(str);
    len = len - str.length;
    for (var i = -1; ++i < len;) {
        str = isRight ? str + ch : ch + str;
    }return str;
}


function replace$$1(str, search, replace$$1) {
    return str.replace(new RegExp(escape(search), "g"), replace$$1);
}

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function ofArray(args, base) {
    var acc = base || new List$1();
    for (var i = args.length - 1; i >= 0; i--) {
        acc = new List$1(args[i], acc);
    }
    return acc;
}

var List$1 = function () {
    function List(head, tail) {
        _classCallCheck$1(this, List);

        this.head = head;
        this.tail = tail;
    }

    _createClass$1(List, [{
        key: "ToString",
        value: function ToString() {
            return "[" + Array.from(this).map(toString).join("; ") + "]";
        }
    }, {
        key: "Equals",
        value: function Equals(x) {
            // Optimization if they are referencially equal
            if (this === x) {
                return true;
            } else {
                var iter1 = this[Symbol.iterator](),
                    iter2 = x[Symbol.iterator]();
                for (;;) {
                    var cur1 = iter1.next(),
                        cur2 = iter2.next();
                    if (cur1.done) return cur2.done ? true : false;else if (cur2.done) return false;else if (!equals(cur1.value, cur2.value)) return false;
                }
            }
        }
    }, {
        key: "CompareTo",
        value: function CompareTo(x) {
            // Optimization if they are referencially equal
            if (this === x) {
                return 0;
            } else {
                var acc = 0;
                var iter1 = this[Symbol.iterator](),
                    iter2 = x[Symbol.iterator]();
                for (;;) {
                    var cur1 = iter1.next(),
                        cur2 = iter2.next();
                    if (cur1.done) return cur2.done ? acc : -1;else if (cur2.done) return 1;else {
                        acc = compare(cur1.value, cur2.value);
                        if (acc != 0) return acc;
                    }
                }
            }
        }
    }, {
        key: Symbol.iterator,
        value: function value() {
            var cur = this;
            return {
                next: function next() {
                    var tmp = cur;
                    cur = cur.tail;
                    return { done: tmp.tail == null, value: tmp.head };
                }
            };
        }
        //   append(ys: List<T>): List<T> {
        //     return append(this, ys);
        //   }
        //   choose<U>(f: (x: T) => U, xs: List<T>): List<U> {
        //     return choose(f, this);
        //   }
        //   collect<U>(f: (x: T) => List<U>): List<U> {
        //     return collect(f, this);
        //   }
        //   filter(f: (x: T) => boolean): List<T> {
        //     return filter(f, this);
        //   }
        //   where(f: (x: T) => boolean): List<T> {
        //     return filter(f, this);
        //   }
        //   map<U>(f: (x: T) => U): List<U> {
        //     return map(f, this);
        //   }
        //   mapIndexed<U>(f: (i: number, x: T) => U): List<U> {
        //     return mapIndexed(f, this);
        //   }
        //   partition(f: (x: T) => boolean): [List<T>, List<T>] {
        //     return partition(f, this) as [List<T>, List<T>];
        //   }
        //   reverse(): List<T> {
        //     return reverse(this);
        //   }
        //   slice(lower: number, upper: number): List<T> {
        //     return slice(lower, upper, this);
        //   }

    }, {
        key: _Symbol.reflection,
        value: function value() {
            return {
                type: "Microsoft.FSharp.Collections.FSharpList",
                interfaces: ["System.IEquatable", "System.IComparable"]
            };
        }
    }, {
        key: "length",
        get: function get() {
            var cur = this,
                acc = 0;
            while (cur.tail != null) {
                cur = cur.tail;
                acc++;
            }
            return acc;
        }
    }]);

    return List;
}();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function __failIfNone(res) {
    if (res == null) throw new Error("Seq did not contain any matching element");
    return res;
}
function toList(xs) {
    return foldBack(function (x, acc) {
        return new List$1(x, acc);
    }, xs, new List$1());
}

function ofArray$1(xs) {
    return delay(function () {
        return unfold(function (i) {
            return i < xs.length ? [xs[i], i + 1] : null;
        }, 0);
    });
}
function append$1(xs, ys) {
    return delay(function () {
        var firstDone = false;
        var i = xs[Symbol.iterator]();
        var iters = [i, null];
        return unfold(function () {
            var cur = void 0;
            if (!firstDone) {
                cur = iters[0].next();
                if (!cur.done) {
                    return [cur.value, iters];
                } else {
                    firstDone = true;
                    iters = [null, ys[Symbol.iterator]()];
                }
            }
            cur = iters[1].next();
            return !cur.done ? [cur.value, iters] : null;
        }, iters);
    });
}





function compareWith(f, xs, ys) {
    var nonZero = tryFind(function (i) {
        return i != 0;
    }, map2(function (x, y) {
        return f(x, y);
    }, xs, ys));
    return nonZero != null ? nonZero : count(xs) - count(ys);
}
function delay(f) {
    return _defineProperty$1({}, Symbol.iterator, function () {
        return f()[Symbol.iterator]();
    });
}






function exists(f, xs) {
    function aux(iter) {
        var cur = iter.next();
        return !cur.done && (f(cur.value) || aux(iter));
    }
    return aux(xs[Symbol.iterator]());
}

function filter$1(f, xs) {
    function trySkipToNext(iter) {
        var cur = iter.next();
        while (!cur.done) {
            if (f(cur.value)) {
                return [cur.value, iter];
            }
            cur = iter.next();
        }
        return void 0;
    }
    return delay(function () {
        return unfold(trySkipToNext, xs[Symbol.iterator]());
    });
}

function fold(f, acc, xs) {
    if (Array.isArray(xs) || ArrayBuffer.isView(xs)) {
        return xs.reduce(f, acc);
    } else {
        var cur = void 0;
        for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
            cur = iter.next();
            if (cur.done) break;
            acc = f(acc, cur.value, i);
        }
        return acc;
    }
}
function foldBack(f, xs, acc) {
    var arr = Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs : Array.from(xs);
    for (var i = arr.length - 1; i >= 0; i--) {
        acc = f(arr[i], acc, i);
    }
    return acc;
}








function tryItem(i, xs) {
    if (i < 0) return null;
    if (Array.isArray(xs) || ArrayBuffer.isView(xs)) return i < xs.length ? xs[i] : null;
    for (var j = 0, iter = xs[Symbol.iterator]();; j++) {
        var cur = iter.next();
        if (cur.done) return null;
        if (j === i) return cur.value;
    }
}
function item(i, xs) {
    return __failIfNone(tryItem(i, xs));
}





function tryLast(xs) {
    try {
        return reduce(function (_, x) {
            return x;
        }, xs);
    } catch (err) {
        return null;
    }
}
function last(xs) {
    return __failIfNone(tryLast(xs));
}
// A export function 'length' method causes problems in JavaScript -- https://github.com/Microsoft/TypeScript/issues/442
function count(xs) {
    return Array.isArray(xs) || ArrayBuffer.isView(xs) ? xs.length : fold(function (acc, x) {
        return acc + 1;
    }, 0, xs);
}
function map$1(f, xs) {
    return delay(function () {
        return unfold(function (iter) {
            var cur = iter.next();
            return !cur.done ? [f(cur.value), iter] : null;
        }, xs[Symbol.iterator]());
    });
}
function mapIndexed$1(f, xs) {
    return delay(function () {
        var i = 0;
        return unfold(function (iter) {
            var cur = iter.next();
            return !cur.done ? [f(i++, cur.value), iter] : null;
        }, xs[Symbol.iterator]());
    });
}
function map2(f, xs, ys) {
    return delay(function () {
        var iter1 = xs[Symbol.iterator]();
        var iter2 = ys[Symbol.iterator]();
        return unfold(function () {
            var cur1 = iter1.next(),
                cur2 = iter2.next();
            return !cur1.done && !cur2.done ? [f(cur1.value, cur2.value), null] : null;
        });
    });
}










function rangeStep(first, step, last) {
    if (step === 0) throw new Error("Step cannot be 0");
    return delay(function () {
        return unfold(function (x) {
            return step > 0 && x <= last || step < 0 && x >= last ? [x, x + step] : null;
        }, first);
    });
}

function range(first, last) {
    return rangeStep(first, 1, last);
}

function reduce(f, xs) {
    if (Array.isArray(xs) || ArrayBuffer.isView(xs)) return xs.reduce(f);
    var iter = xs[Symbol.iterator]();
    var cur = iter.next();
    if (cur.done) throw new Error("Seq was empty");
    var acc = cur.value;
    for (;;) {
        cur = iter.next();
        if (cur.done) break;
        acc = f(acc, cur.value);
    }
    return acc;
}






function skip(n, xs) {
    return _defineProperty$1({}, Symbol.iterator, function () {
        var iter = xs[Symbol.iterator]();
        for (var i = 1; i <= n; i++) {
            if (iter.next().done) throw new Error("Seq has not enough elements");
        }return iter;
    });
}
function skipWhile(f, xs) {
    return delay(function () {
        var hasPassed = false;
        return filter$1(function (x) {
            return hasPassed || (hasPassed = !f(x));
        }, xs);
    });
}
function sortWith(f, xs) {
    var ys = Array.from(xs);
    return ofArray$1(ys.sort(f));
}



function take(n, xs) {
    var truncate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return delay(function () {
        var iter = xs[Symbol.iterator]();
        return unfold(function (i) {
            if (i < n) {
                var cur = iter.next();
                if (!cur.done) return [cur.value, i + 1];
                if (!truncate) throw new Error("Seq has not enough elements");
            }
            return void 0;
        }, 0);
    });
}

function takeWhile(f, xs) {
    return delay(function () {
        var iter = xs[Symbol.iterator]();
        return unfold(function (i) {
            var cur = iter.next();
            if (!cur.done && f(cur.value)) return [cur.value, null];
            return void 0;
        }, 0);
    });
}
function tryFind(f, xs, defaultValue) {
    for (var i = 0, iter = xs[Symbol.iterator]();; i++) {
        var cur = iter.next();
        if (cur.done) return defaultValue === void 0 ? null : defaultValue;
        if (f(cur.value, i)) return cur.value;
    }
}
function find(f, xs) {
    return __failIfNone(tryFind(f, xs));
}








function unfold(f, acc) {
    return _defineProperty$1({}, Symbol.iterator, function () {
        return {
            next: function next() {
                var res = f(acc);
                if (res != null) {
                    acc = res[1];
                    return { done: false, value: res[0] };
                }
                return { done: true };
            }
        };
    });
}

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenericComparer = function () {
    function GenericComparer(f) {
        _classCallCheck$3(this, GenericComparer);

        this.Compare = f || compare;
    }

    _createClass$3(GenericComparer, [{
        key: _Symbol.reflection,
        value: function value() {
            return { interfaces: ["System.IComparer"] };
        }
    }]);

    return GenericComparer;
}();

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var MapTree = function MapTree(caseName, fields) {
    _classCallCheck$2(this, MapTree);

    this.Case = caseName;
    this.Fields = fields;
};
function tree_sizeAux(acc, m) {
    return m.Case === "MapOne" ? acc + 1 : m.Case === "MapNode" ? tree_sizeAux(tree_sizeAux(acc + 1, m.Fields[2]), m.Fields[3]) : acc;
}
function tree_size(x) {
    return tree_sizeAux(0, x);
}
function tree_empty() {
    return new MapTree("MapEmpty", []);
}
function tree_height(_arg1) {
    return _arg1.Case === "MapOne" ? 1 : _arg1.Case === "MapNode" ? _arg1.Fields[4] : 0;
}
function tree_mk(l, k, v, r) {
    var matchValue = [l, r];
    var $target1 = function $target1() {
        var hl = tree_height(l);
        var hr = tree_height(r);
        var m = hl < hr ? hr : hl;
        return new MapTree("MapNode", [k, v, l, r, m + 1]);
    };
    if (matchValue[0].Case === "MapEmpty") {
        if (matchValue[1].Case === "MapEmpty") {
            return new MapTree("MapOne", [k, v]);
        } else {
            return $target1();
        }
    } else {
        return $target1();
    }
}

function tree_rebalance(t1, k, v, t2) {
    var t1h = tree_height(t1);
    var t2h = tree_height(t2);
    if (t2h > t1h + 2) {
        if (t2.Case === "MapNode") {
            if (tree_height(t2.Fields[2]) > t1h + 1) {
                if (t2.Fields[2].Case === "MapNode") {
                    return tree_mk(tree_mk(t1, k, v, t2.Fields[2].Fields[2]), t2.Fields[2].Fields[0], t2.Fields[2].Fields[1], tree_mk(t2.Fields[2].Fields[3], t2.Fields[0], t2.Fields[1], t2.Fields[3]));
                } else {
                    throw new Error("rebalance");
                }
            } else {
                return tree_mk(tree_mk(t1, k, v, t2.Fields[2]), t2.Fields[0], t2.Fields[1], t2.Fields[3]);
            }
        } else {
            throw new Error("rebalance");
        }
    } else {
        if (t1h > t2h + 2) {
            if (t1.Case === "MapNode") {
                if (tree_height(t1.Fields[3]) > t2h + 1) {
                    if (t1.Fields[3].Case === "MapNode") {
                        return tree_mk(tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], t1.Fields[3].Fields[2]), t1.Fields[3].Fields[0], t1.Fields[3].Fields[1], tree_mk(t1.Fields[3].Fields[3], k, v, t2));
                    } else {
                        throw new Error("rebalance");
                    }
                } else {
                    return tree_mk(t1.Fields[2], t1.Fields[0], t1.Fields[1], tree_mk(t1.Fields[3], k, v, t2));
                }
            } else {
                throw new Error("rebalance");
            }
        } else {
            return tree_mk(t1, k, v, t2);
        }
    }
}
function tree_add(comparer, k, v, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return new MapTree("MapNode", [k, v, new MapTree("MapEmpty", []), m, 2]);
        } else if (c === 0) {
            return new MapTree("MapOne", [k, v]);
        }
        return new MapTree("MapNode", [k, v, m, new MapTree("MapEmpty", []), 2]);
    } else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_rebalance(tree_add(comparer, k, v, m.Fields[2]), m.Fields[0], m.Fields[1], m.Fields[3]);
        } else if (c === 0) {
            return new MapTree("MapNode", [k, v, m.Fields[2], m.Fields[3], m.Fields[4]]);
        }
        return tree_rebalance(m.Fields[2], m.Fields[0], m.Fields[1], tree_add(comparer, k, v, m.Fields[3]));
    }
    return new MapTree("MapOne", [k, v]);
}
function tree_find(comparer, k, m) {
    var res = tree_tryFind(comparer, k, m);
    if (res != null) return res;
    throw new Error("key not found");
}
function tree_tryFind(comparer, k, m) {
    if (m.Case === "MapOne") {
        var c = comparer.Compare(k, m.Fields[0]);
        return c === 0 ? m.Fields[1] : null;
    } else if (m.Case === "MapNode") {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_tryFind(comparer, k, m.Fields[2]);
        } else {
            if (c === 0) {
                return m.Fields[1];
            } else {
                return tree_tryFind(comparer, k, m.Fields[3]);
            }
        }
    }
    return null;
}
function tree_mem(comparer, k, m) {
    return m.Case === "MapOne" ? comparer.Compare(k, m.Fields[0]) === 0 : m.Case === "MapNode" ? function () {
        var c = comparer.Compare(k, m.Fields[0]);
        if (c < 0) {
            return tree_mem(comparer, k, m.Fields[2]);
        } else {
            if (c === 0) {
                return true;
            } else {
                return tree_mem(comparer, k, m.Fields[3]);
            }
        }
    }() : false;
}
function tree_mkFromEnumerator(comparer, acc, e) {
    var cur = e.next();
    while (!cur.done) {
        acc = tree_add(comparer, cur.value[0], cur.value[1], acc);
        cur = e.next();
    }
    return acc;
}
// function tree_ofArray(comparer: IComparer<any>, arr: ArrayLike<[any,any]>) {
//   var res = tree_empty();
//   for (var i = 0; i <= arr.length - 1; i++) {
//     res = tree_add(comparer, arr[i][0], arr[i][1], res);
//   }
//   return res;
// }
function tree_ofSeq(comparer, c) {
    var ie = c[Symbol.iterator]();
    return tree_mkFromEnumerator(comparer, tree_empty(), ie);
}
// function tree_copyToArray(s: MapTree, arr: ArrayLike<any>, i: number) {
//   tree_iter((x, y) => { arr[i++] = [x, y]; }, s);
// }
function tree_collapseLHS(stack) {
    if (stack.tail != null) {
        if (stack.head.Case === "MapOne") {
            return stack;
        } else if (stack.head.Case === "MapNode") {
            return tree_collapseLHS(ofArray([stack.head.Fields[2], new MapTree("MapOne", [stack.head.Fields[0], stack.head.Fields[1]]), stack.head.Fields[3]], stack.tail));
        } else {
            return tree_collapseLHS(stack.tail);
        }
    } else {
        return new List$1();
    }
}
function tree_mkIterator(s) {
    return { stack: tree_collapseLHS(new List$1(s, new List$1())), started: false };
}
function tree_moveNext(i) {
    function current(i) {
        if (i.stack.tail == null) {
            return null;
        } else if (i.stack.head.Case === "MapOne") {
            return [i.stack.head.Fields[0], i.stack.head.Fields[1]];
        }
        throw new Error("Please report error: Map iterator, unexpected stack for current");
    }
    if (i.started) {
        if (i.stack.tail == null) {
            return { done: true, value: null };
        } else {
            if (i.stack.head.Case === "MapOne") {
                i.stack = tree_collapseLHS(i.stack.tail);
                return {
                    done: i.stack.tail == null,
                    value: current(i)
                };
            } else {
                throw new Error("Please report error: Map iterator, unexpected stack for moveNext");
            }
        }
    } else {
        i.started = true;
        return {
            done: i.stack.tail == null,
            value: current(i)
        };
    }
    
}

var FMap = function () {
    /** Do not call, use Map.create instead. */
    function FMap() {
        _classCallCheck$2(this, FMap);
    }

    _createClass$2(FMap, [{
        key: "ToString",
        value: function ToString() {
            return "map [" + Array.from(this).map(toString).join("; ") + "]";
        }
    }, {
        key: "Equals",
        value: function Equals(m2) {
            return this.CompareTo(m2) === 0;
        }
    }, {
        key: "CompareTo",
        value: function CompareTo(m2) {
            var _this = this;

            return this === m2 ? 0 : compareWith(function (kvp1, kvp2) {
                var c = _this.comparer.Compare(kvp1[0], kvp2[0]);
                return c !== 0 ? c : compare(kvp1[1], kvp2[1]);
            }, this, m2);
        }
    }, {
        key: Symbol.iterator,
        value: function value() {
            var i = tree_mkIterator(this.tree);
            return {
                next: function next() {
                    return tree_moveNext(i);
                }
            };
        }
    }, {
        key: "entries",
        value: function entries() {
            return this[Symbol.iterator]();
        }
    }, {
        key: "keys",
        value: function keys() {
            return map$1(function (kv) {
                return kv[0];
            }, this);
        }
    }, {
        key: "values",
        value: function values() {
            return map$1(function (kv) {
                return kv[1];
            }, this);
        }
    }, {
        key: "get",
        value: function get(k) {
            return tree_find(this.comparer, k, this.tree);
        }
    }, {
        key: "has",
        value: function has(k) {
            return tree_mem(this.comparer, k, this.tree);
        }
        /** Not supported */

    }, {
        key: "set",
        value: function set(k, v) {
            throw new Error("not supported");
        }
        /** Not supported */

    }, {
        key: "delete",
        value: function _delete(k) {
            throw new Error("not supported");
        }
        /** Not supported */

    }, {
        key: "clear",
        value: function clear() {
            throw new Error("not supported");
        }
    }, {
        key: _Symbol.reflection,
        value: function value() {
            return {
                type: "Microsoft.FSharp.Collections.FSharpMap",
                interfaces: ["System.IEquatable", "System.IComparable"]
            };
        }
    }, {
        key: "size",
        get: function get() {
            return tree_size(this.tree);
        }
    }]);

    return FMap;
}();

function from(comparer, tree) {
    var map$$1 = new FMap();
    map$$1.tree = tree;
    map$$1.comparer = comparer || new GenericComparer();
    return map$$1;
}
function create$3(ie, comparer) {
    comparer = comparer || new GenericComparer();
    return from(comparer, ie ? tree_ofSeq(comparer, ie) : tree_empty());
}
function add$2(k, v, map$$1) {
    return from(map$$1.comparer, tree_add(map$$1.comparer, k, v, map$$1.tree));
}





function tryFind$1(k, map$$1) {
    return tree_tryFind(map$$1.comparer, k, map$$1.tree);
}

function append$$1(xs, ys) {
    return fold(function (acc, x) {
        return new List$1(x, acc);
    }, ys, reverse$$1(xs));
}


// TODO: should be xs: Iterable<List<T>>

function filter$$1(f, xs) {
    return reverse$$1(fold(function (acc, x) {
        return f(x) ? new List$1(x, acc) : acc;
    }, new List$1(), xs));
}


function map$$1(f, xs) {
    return reverse$$1(fold(function (acc, x) {
        return new List$1(f(x), acc);
    }, new List$1(), xs));
}
function mapIndexed$$1(f, xs) {
    return reverse$$1(fold(function (acc, x, i) {
        return new List$1(f(i, x), acc);
    }, new List$1(), xs));
}


function reverse$$1(xs) {
    return fold(function (acc, x) {
        return new List$1(x, acc);
    }, new List$1(), xs);
}


/* ToDo: instance unzip() */

/* ToDo: instance unzip3() */

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var classCallCheck = createCommonjsModule(function (module, exports) {
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
});

var _classCallCheck$4 = unwrapExports(classCallCheck);

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
});

var _aFunction = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};

var aFunction = _aFunction;
var _ctx = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};

var _isObject = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var isObject = _isObject;
var _anObject = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};

var _descriptors = !_fails(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});

var isObject$1 = _isObject;
var document = _global.document;
var is = isObject$1(document) && isObject$1(document.createElement);
var _domCreate = function(it){
  return is ? document.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function(){
  return Object.defineProperty(_domCreate('div'), 'a', {get: function(){ return 7; }}).a != 7;
});

var isObject$2 = _isObject;
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function(it, S){
  if(!isObject$2(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject$2(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject$2(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject$2(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};

var anObject       = _anObject;
var IE8_DOM_DEFINE = _ie8DomDefine;
var toPrimitive    = _toPrimitive;
var dP$1             = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP$1(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};

var dP         = _objectDp;
var createDesc = _propertyDesc;
var _hide = _descriptors ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};

var global$1    = _global;
var core      = _core;
var ctx       = _ctx;
var hide      = _hide;
var PROTOTYPE = 'prototype';

var $export$1 = function(type, name, source){
  var IS_FORCED = type & $export$1.F
    , IS_GLOBAL = type & $export$1.G
    , IS_STATIC = type & $export$1.S
    , IS_PROTO  = type & $export$1.P
    , IS_BIND   = type & $export$1.B
    , IS_WRAP   = type & $export$1.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global$1 : IS_STATIC ? global$1[name] : (global$1[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global$1)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export$1.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export$1.F = 1;   // forced
$export$1.G = 2;   // global
$export$1.S = 4;   // static
$export$1.P = 8;   // proto
$export$1.B = 16;  // bind
$export$1.W = 32;  // wrap
$export$1.U = 64;  // safe
$export$1.R = 128; // real proto method for `library` 
var _export = $export$1;

var $export = _export;
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !_descriptors, 'Object', {defineProperty: _objectDp.f});

var $Object = _core.Object;
var defineProperty$3 = function defineProperty$3(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};

var defineProperty$1 = createCommonjsModule(function (module) {
module.exports = { "default": defineProperty$3, __esModule: true };
});

var createClass = createCommonjsModule(function (module, exports) {
"use strict";

exports.__esModule = true;

var _defineProperty = defineProperty$1;

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
});

var _createClass$4 = unwrapExports(createClass);

var Infrastructure = function (__exports) {
    var rotateByOne = __exports.rotateByOne = function (list) {
        return list.tail != null ? append$$1(list.tail, ofArray([list.head])) : new List$1();
    };

    var swapFirstTwo = __exports.swapFirstTwo = function (list) {
        return list.tail != null ? list.tail.tail != null ? function () {
            var f = list.head;
            var r = list.tail.tail;
            var s = list.tail.head;
            return ofArray([s, f], r);
        }() : function () {
            var f = list;
            return f;
        }() : new List$1();
    };

    var swapSecondTwo = __exports.swapSecondTwo = function (list) {
        return list.tail != null ? list.tail.tail != null ? list.tail.tail.tail != null ? function () {
            var f = list.head;
            var r = list.tail.tail.tail;
            var s = list.tail.head;
            var t = list.tail.tail.head;
            return ofArray([f, t, s], r);
        }() : function () {
            var f = list.head;
            var s = list.tail.head;
            var t = list.tail.tail;
            return ofArray([f, s], t);
        }() : function () {
            var f = list;
            return f;
        }() : new List$1();
    };

    var circularSequenceFromList = __exports.circularSequenceFromList = function (lst) {
        var next = function next() {
            return delay(function () {
                return append$1(map$1(function (element) {
                    return element;
                }, lst), delay(function () {
                    return next();
                }));
            });
        };

        return next();
    };

    var min$$1 = __exports.min = function (minOf, list) {
        return list.tail != null ? list.tail.tail != null ? function () {
            var c1 = list.head;
            var c2 = list.tail.head;
            var rest = list.tail.tail;
            return min$$1(minOf, new List$1(minOf(c1)(c2), rest));
        }() : function () {
            var x = list.head;
            return x;
        }() : null;
    };

    var cappedMinimum = __exports.cappedMinimum = function (number, cap) {
        return compare(number, cap) < 0 ? cap : number;
    };

    var cappedMaximum = __exports.cappedMaximum = function (number, cap) {
        return compare(number, cap) > 0 ? cap : number;
    };

    return __exports;
}({});
var Notes = function (__exports) {
    var Note = __exports.Note = function () {
        function Note(caseName, fields) {
            _classCallCheck$4(this, Note);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(Note, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Notes.Note",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        A: [],
                        AFlat: [],
                        ASharp: [],
                        B: [],
                        BFlat: [],
                        C: [],
                        CSharp: [],
                        D: [],
                        DFlat: [],
                        DSharp: [],
                        E: [],
                        EFlat: [],
                        F: [],
                        FSharp: [],
                        G: [],
                        GFlat: [],
                        GSharp: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return Note;
    }();

    setType("Vaughan.Notes.Note", Note);

    var Interval = __exports.Interval = function () {
        function Interval(caseName, fields) {
            _classCallCheck$4(this, Interval);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(Interval, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Notes.Interval",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        AugmentedFifth: [],
                        AugmentedForth: [],
                        AugmentedSecond: [],
                        DiminishedFifth: [],
                        MajorSecond: [],
                        MajorSeventh: [],
                        MajorSixth: [],
                        MajorThird: [],
                        MinorSecond: [],
                        MinorSeventh: [],
                        MinorSixth: [],
                        MinorThird: [],
                        PerfectFifth: [],
                        PerfectForth: [],
                        PerfectOctave: [],
                        Unisson: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return Interval;
    }();

    setType("Vaughan.Notes.Interval", Interval);

    var NoteAttributes = function () {
        function NoteAttributes(name, sharp, flat, pitch) {
            _classCallCheck$4(this, NoteAttributes);

            this.Name = name;
            this.Sharp = sharp;
            this.Flat = flat;
            this.Pitch = pitch;
        }

        _createClass$4(NoteAttributes, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Notes.NoteAttributes",
                    interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                    properties: {
                        Name: "string",
                        Sharp: Note,
                        Flat: Note,
                        Pitch: "number"
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsRecords(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareRecords(this, other);
            }
        }]);

        return NoteAttributes;
    }();

    setType("Vaughan.Notes.NoteAttributes", NoteAttributes);

    var IntervalAttributes = function () {
        function IntervalAttributes(name, distance) {
            _classCallCheck$4(this, IntervalAttributes);

            this.Name = name;
            this.Distance = distance;
        }

        _createClass$4(IntervalAttributes, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Notes.IntervalAttributes",
                    interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                    properties: {
                        Name: "string",
                        Distance: "number"
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsRecords(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareRecords(this, other);
            }
        }]);

        return IntervalAttributes;
    }();

    setType("Vaughan.Notes.IntervalAttributes", IntervalAttributes);

    var noteAttributes = function noteAttributes(note) {
        return note.Case === "CSharp" ? new NoteAttributes("C#", new Note("D", []), new Note("C", []), 1) : note.Case === "DFlat" ? new NoteAttributes("Db", new Note("D", []), new Note("C", []), 1) : note.Case === "D" ? new NoteAttributes("D", new Note("DSharp", []), new Note("DFlat", []), 2) : note.Case === "DSharp" ? new NoteAttributes("D#", new Note("E", []), new Note("D", []), 3) : note.Case === "EFlat" ? new NoteAttributes("Eb", new Note("E", []), new Note("D", []), 3) : note.Case === "E" ? new NoteAttributes("E", new Note("F", []), new Note("EFlat", []), 4) : note.Case === "F" ? new NoteAttributes("F", new Note("FSharp", []), new Note("E", []), 5) : note.Case === "FSharp" ? new NoteAttributes("F#", new Note("G", []), new Note("F", []), 6) : note.Case === "GFlat" ? new NoteAttributes("Gb", new Note("G", []), new Note("F", []), 6) : note.Case === "G" ? new NoteAttributes("G", new Note("GSharp", []), new Note("GFlat", []), 7) : note.Case === "GSharp" ? new NoteAttributes("G#", new Note("A", []), new Note("G", []), 8) : note.Case === "AFlat" ? new NoteAttributes("Ab", new Note("A", []), new Note("G", []), 8) : note.Case === "A" ? new NoteAttributes("A", new Note("ASharp", []), new Note("AFlat", []), 9) : note.Case === "ASharp" ? new NoteAttributes("A#", new Note("B", []), new Note("A", []), 10) : note.Case === "BFlat" ? new NoteAttributes("Bb", new Note("B", []), new Note("A", []), 10) : note.Case === "B" ? new NoteAttributes("B", new Note("C", []), new Note("BFlat", []), 11) : new NoteAttributes("C", new Note("CSharp", []), new Note("B", []), 0);
    };

    var noteName = __exports.noteName = function (note) {
        return noteAttributes(note).Name;
    };

    var sharp = __exports.sharp = function (note) {
        return noteAttributes(note).Sharp;
    };

    var flat = __exports.flat = function (note) {
        return noteAttributes(note).Flat;
    };

    var pitch = __exports.pitch = function (note) {
        return noteAttributes(note).Pitch;
    };

    var intervalAttributes = function intervalAttributes(interval) {
        return interval.Case === "MinorSecond" ? new IntervalAttributes("MinorSecond", 1) : interval.Case === "MajorSecond" ? new IntervalAttributes("MajorSecond", 2) : interval.Case === "AugmentedSecond" ? new IntervalAttributes("AugmentedSecond", 3) : interval.Case === "MinorThird" ? new IntervalAttributes("MinorThird", 3) : interval.Case === "MajorThird" ? new IntervalAttributes("MajorThird", 4) : interval.Case === "PerfectForth" ? new IntervalAttributes("PerfectForth", 5) : interval.Case === "AugmentedForth" ? new IntervalAttributes("AugmentedForth", 6) : interval.Case === "DiminishedFifth" ? new IntervalAttributes("DiminishedFifth", 6) : interval.Case === "PerfectFifth" ? new IntervalAttributes("PerfectFifth", 7) : interval.Case === "AugmentedFifth" ? new IntervalAttributes("AugmentedFifth", 8) : interval.Case === "MinorSixth" ? new IntervalAttributes("MinorSixth", 8) : interval.Case === "MajorSixth" ? new IntervalAttributes("MajorSixth", 9) : interval.Case === "MinorSeventh" ? new IntervalAttributes("MinorSeventh", 10) : interval.Case === "MajorSeventh" ? new IntervalAttributes("MajorSeventh", 11) : interval.Case === "PerfectOctave" ? new IntervalAttributes("PerfectOctave", 12) : new IntervalAttributes("Unisson", 0);
    };

    var intervalName = __exports.intervalName = function (interval) {
        return intervalAttributes(interval).Name;
    };

    var toDistance = __exports.toDistance = function (interval) {
        return intervalAttributes(interval).Distance;
    };

    var fromDistance = __exports.fromDistance = function (distance) {
        var $var1 = null;

        switch (distance) {
            case 0:
                {
                    $var1 = new Interval("Unisson", []);
                    break;
                }

            case 1:
                {
                    $var1 = new Interval("MinorSecond", []);
                    break;
                }

            case 2:
                {
                    $var1 = new Interval("MajorSecond", []);
                    break;
                }

            case 3:
                {
                    $var1 = new Interval("MinorThird", []);
                    break;
                }

            case 4:
                {
                    $var1 = new Interval("MajorThird", []);
                    break;
                }

            case 5:
                {
                    $var1 = new Interval("PerfectForth", []);
                    break;
                }

            case 6:
                {
                    $var1 = new Interval("DiminishedFifth", []);
                    break;
                }

            case 7:
                {
                    $var1 = new Interval("PerfectFifth", []);
                    break;
                }

            case 8:
                {
                    $var1 = new Interval("AugmentedFifth", []);
                    break;
                }

            case 9:
                {
                    $var1 = new Interval("MajorSixth", []);
                    break;
                }

            case 10:
                {
                    $var1 = new Interval("MinorSeventh", []);
                    break;
                }

            case 11:
                {
                    $var1 = new Interval("MajorSeventh", []);
                    break;
                }

            case 12:
                {
                    $var1 = new Interval("PerfectOctave", []);
                    break;
                }

            default:
                {
                    $var1 = new Interval("Unisson", []);
                }
        }

        return $var1;
    };

    var measureAbsoluteSemitones = __exports.measureAbsoluteSemitones = function (note, other) {
        var distance = pitch(other) - pitch(note);

        if (distance < toDistance(new Interval("Unisson", []))) {
            return toDistance(new Interval("PerfectOctave", [])) - distance * -1;
        } else {
            return distance;
        }
    };

    var transposeDirection = function transposeDirection(note, interval) {
        var _target1 = function _target1() {
            return sharp(note);
        };

        var _target2 = function _target2() {
            return flat(note);
        };

        if (interval.Case === "MajorSecond") {
            return _target1();
        } else {
            if (interval.Case === "AugmentedSecond") {
                return _target1();
            } else {
                if (interval.Case === "PerfectFifth") {
                    return _target1();
                } else {
                    if (interval.Case === "MajorThird") {
                        return _target1();
                    } else {
                        if (interval.Case === "PerfectForth") {
                            return _target1();
                        } else {
                            if (interval.Case === "AugmentedFifth") {
                                return _target1();
                            } else {
                                if (interval.Case === "MajorSixth") {
                                    return _target1();
                                } else {
                                    if (interval.Case === "PerfectOctave") {
                                        return _target1();
                                    } else {
                                        if (interval.Case === "AugmentedForth") {
                                            return _target1();
                                        } else {
                                            if (interval.Case === "MajorSeventh") {
                                                return _target1();
                                            } else {
                                                if (interval.Case === "MinorSecond") {
                                                    return _target2();
                                                } else {
                                                    if (interval.Case === "DiminishedFifth") {
                                                        return _target2();
                                                    } else {
                                                        if (interval.Case === "MinorThird") {
                                                            return _target2();
                                                        } else {
                                                            if (interval.Case === "MinorSixth") {
                                                                return _target2();
                                                            } else {
                                                                if (interval.Case === "MinorSeventh") {
                                                                    return _target2();
                                                                } else {
                                                                    return note;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var intervalBetween = __exports.intervalBetween = function (note, other) {
        return fromDistance(measureAbsoluteSemitones(note, other));
    };

    var transpose = __exports.transpose = function (noteToTranspose, transposingInterval) {
        var loop = function loop(note) {
            var newNote = transposeDirection(note, transposingInterval);
            var newInterval = intervalBetween(noteToTranspose, newNote);

            if (toDistance(newInterval) === toDistance(transposingInterval)) {
                return newNote;
            } else {
                return loop(newNote);
            }
        };

        return loop(noteToTranspose);
    };

    return __exports;
}({});
var Scales = function (__exports) {
    var Scales = __exports.Scales = function () {
        function Scales(caseName, fields) {
            _classCallCheck$4(this, Scales);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(Scales, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Scales.Scales",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        AlteredDominant: [],
                        Aolian: [],
                        Blues: [],
                        Dorian: [],
                        Dorianb2: [],
                        HalfWholeDiminished: [],
                        HarmonicMinor: [],
                        Ionian: [],
                        Locrian: [],
                        LocrianSharp2: [],
                        Lydian: [],
                        LydianAugmented: [],
                        LydianDominant: [],
                        MajorPentatonic: [],
                        MelodicMinor: [],
                        MinorPentatonic: [],
                        Mixolydian: [],
                        Mixolydianb6: [],
                        Phrygian: [],
                        WholeTone: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return Scales;
    }();

    setType("Vaughan.Scales.Scales", Scales);

    var formula = __exports.formula = function (scale) {
        return scale.Case === "Dorian" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "Phrygian" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MinorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "Lydian" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("AugmentedForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MajorSeventh", [])]) : scale.Case === "Mixolydian" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "Aolian" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "Locrian" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MinorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("DiminishedFifth", []), new Notes.Interval("MinorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "MajorPentatonic" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", [])]) : scale.Case === "MinorPentatonic" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "Blues" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("DiminishedFifth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "HarmonicMinor" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSixth", []), new Notes.Interval("MajorSeventh", [])]) : scale.Case === "MelodicMinor" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MajorSeventh", [])]) : scale.Case === "Dorianb2" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MinorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "LydianAugmented" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("AugmentedForth", []), new Notes.Interval("AugmentedFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MajorSeventh", [])]) : scale.Case === "LydianDominant" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("AugmentedForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "Mixolydianb6" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "LocrianSharp2" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("DiminishedFifth", []), new Notes.Interval("MinorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "AlteredDominant" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MinorSecond", []), new Notes.Interval("AugmentedSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("DiminishedFifth", []), new Notes.Interval("AugmentedFifth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "HalfWholeDiminished" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MinorSecond", []), new Notes.Interval("MinorThird", []), new Notes.Interval("MajorThird", []), new Notes.Interval("AugmentedForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MinorSeventh", [])]) : scale.Case === "WholeTone" ? ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("DiminishedFifth", []), new Notes.Interval("AugmentedFifth", []), new Notes.Interval("MinorSeventh", [])]) : ofArray([new Notes.Interval("Unisson", []), new Notes.Interval("MajorSecond", []), new Notes.Interval("MajorThird", []), new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSixth", []), new Notes.Interval("MajorSeventh", [])]);
    };

    var createScale = __exports.createScale = function (scale, root) {
        return map$$1(function (interval) {
            return Notes.transpose(root, interval);
        }, formula(scale));
    };

    return __exports;
}({});
var Keys = function (__exports) {
    var Key = __exports.Key = function () {
        function Key(caseName, fields) {
            _classCallCheck$4(this, Key);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(Key, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Keys.Key",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        AFlatMajor: [],
                        AMajor: [],
                        AMinor: [],
                        BFlatMajor: [],
                        BFlatMinor: [],
                        BMajor: [],
                        BMinor: [],
                        CMajor: [],
                        CMinor: [],
                        CSharpMinor: [],
                        DFlatMajor: [],
                        DMajor: [],
                        DMinor: [],
                        EFlatMajor: [],
                        EFlatMinor: [],
                        EMajor: [],
                        EMinor: [],
                        FMajor: [],
                        FMinor: [],
                        FSharpMajor: [],
                        FSharpMinor: [],
                        GFlatMajor: [],
                        GMajor: [],
                        GMinor: [],
                        GSharpMinor: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return Key;
    }();

    setType("Vaughan.Keys.Key", Key);

    var KeyAttributes = function () {
        function KeyAttributes(root, accidentals) {
            _classCallCheck$4(this, KeyAttributes);

            this.Root = root;
            this.Accidentals = accidentals;
        }

        _createClass$4(KeyAttributes, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Keys.KeyAttributes",
                    interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                    properties: {
                        Root: Notes.Note,
                        Accidentals: "number"
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsRecords(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareRecords(this, other);
            }
        }]);

        return KeyAttributes;
    }();

    setType("Vaughan.Keys.KeyAttributes", KeyAttributes);

    var keyAttributes = function keyAttributes(key) {
        return key.Case === "AFlatMajor" ? new KeyAttributes(new Notes.Note("AFlat", []), -4) : key.Case === "BMajor" ? new KeyAttributes(new Notes.Note("B", []), 5) : key.Case === "BFlatMajor" ? new KeyAttributes(new Notes.Note("BFlat", []), -2) : key.Case === "CMajor" ? new KeyAttributes(new Notes.Note("C", []), 0) : key.Case === "DMajor" ? new KeyAttributes(new Notes.Note("D", []), 2) : key.Case === "DFlatMajor" ? new KeyAttributes(new Notes.Note("DFlat", []), -5) : key.Case === "EMajor" ? new KeyAttributes(new Notes.Note("E", []), 4) : key.Case === "EFlatMajor" ? new KeyAttributes(new Notes.Note("EFlat", []), -3) : key.Case === "FMajor" ? new KeyAttributes(new Notes.Note("F", []), -1) : key.Case === "FSharpMajor" ? new KeyAttributes(new Notes.Note("FSharp", []), 6) : key.Case === "GMajor" ? new KeyAttributes(new Notes.Note("G", []), 1) : key.Case === "GFlatMajor" ? new KeyAttributes(new Notes.Note("GFlat", []), -6) : key.Case === "AMinor" ? new KeyAttributes(new Notes.Note("A", []), 0) : key.Case === "BMinor" ? new KeyAttributes(new Notes.Note("B", []), 2) : key.Case === "BFlatMinor" ? new KeyAttributes(new Notes.Note("BFlat", []), -5) : key.Case === "CMinor" ? new KeyAttributes(new Notes.Note("C", []), -3) : key.Case === "CSharpMinor" ? new KeyAttributes(new Notes.Note("CSharp", []), 4) : key.Case === "DMinor" ? new KeyAttributes(new Notes.Note("D", []), -1) : key.Case === "EMinor" ? new KeyAttributes(new Notes.Note("E", []), 1) : key.Case === "FMinor" ? new KeyAttributes(new Notes.Note("F", []), -4) : key.Case === "FSharpMinor" ? new KeyAttributes(new Notes.Note("FSharp", []), 3) : key.Case === "GMinor" ? new KeyAttributes(new Notes.Note("G", []), -2) : key.Case === "GSharpMinor" ? new KeyAttributes(new Notes.Note("GSharp", []), 5) : key.Case === "EFlatMinor" ? new KeyAttributes(new Notes.Note("EFlat", []), -6) : new KeyAttributes(new Notes.Note("A", []), 3);
    };

    var root = __exports.root = function (key) {
        return keyAttributes(key).Root;
    };

    var accidentals = function accidentals(key) {
        return keyAttributes(key).Accidentals;
    };

    var flatedKey = function flatedKey(fifths, keyAccidents) {
        return append$$1(toList(skip(-keyAccidents, reverse$$1(fifths))), function (list) {
            return map$$1(function (note) {
                return Notes.flat(note);
            }, list);
        }(toList(take(-keyAccidents, reverse$$1(fifths)))));
    };

    var sharpedKey = function sharpedKey(fifths, keyAccidents) {
        return append$$1(function (list) {
            return toList(skip(keyAccidents, list));
        }(fifths), function (list) {
            return map$$1(function (note) {
                return Notes.sharp(note);
            }, list);
        }(function (list) {
            return toList(take(keyAccidents, list));
        }(fifths)));
    };

    var rawNotes = function rawNotes(scale) {
        var fifths = ofArray([new Notes.Note("F", []), new Notes.Note("C", []), new Notes.Note("G", []), new Notes.Note("D", []), new Notes.Note("A", []), new Notes.Note("E", []), new Notes.Note("B", [])]);
        var keyAccidents = accidentals(scale);

        if (keyAccidents === 0) {
            return fifths;
        } else {
            if (keyAccidents < 0) {
                return flatedKey(fifths, keyAccidents);
            } else {
                return sharpedKey(fifths, keyAccidents);
            }
        }
    };

    var notes = __exports.notes = function (scale) {
        return append$$1(toList(skipWhile(function (n) {
            return !n.Equals(root(scale));
        }, function (list) {
            return toList(sortWith(function (x, y) {
                return compare(function (note) {
                    return Notes.pitch(note);
                }(x), function (note) {
                    return Notes.pitch(note);
                }(y));
            }, list));
        }(rawNotes(scale)))), toList(takeWhile(function (n) {
            return !n.Equals(root(scale));
        }, function (list) {
            return toList(sortWith(function (x, y) {
                return compare(function (note) {
                    return Notes.pitch(note);
                }(x), function (note) {
                    return Notes.pitch(note);
                }(y));
            }, list));
        }(rawNotes(scale)))));
    };

    return __exports;
}({});
var Chords = function (__exports) {
    var ChordFunction = __exports.ChordFunction = function () {
        function ChordFunction(caseName, fields) {
            _classCallCheck$4(this, ChordFunction);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(ChordFunction, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Chords.ChordFunction",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        Augmented: [],
                        Augmented7: [],
                        Diminished: [],
                        Diminished7: [],
                        Dominant7: [],
                        Major: [],
                        Major7: [],
                        Minor: [],
                        Minor7: [],
                        Minor7b5: [],
                        MinorMaj7: [],
                        Sus2: [],
                        Sus2Augmented: [],
                        Sus2Diminished: [],
                        Sus4: [],
                        Sus4Augmented: [],
                        Sus4Diminished: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return ChordFunction;
    }();

    setType("Vaughan.Chords.ChordFunction", ChordFunction);

    var ChordNoteFunction = __exports.ChordNoteFunction = function () {
        function ChordNoteFunction(caseName, fields) {
            _classCallCheck$4(this, ChordNoteFunction);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(ChordNoteFunction, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Chords.ChordNoteFunction",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        Eleventh: [],
                        Fifth: [],
                        Ninth: [],
                        Root: [],
                        Seventh: [],
                        Third: [],
                        Thirteenth: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return ChordNoteFunction;
    }();

    setType("Vaughan.Chords.ChordNoteFunction", ChordNoteFunction);

    var ChordType = __exports.ChordType = function () {
        function ChordType(caseName, fields) {
            _classCallCheck$4(this, ChordType);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(ChordType, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Chords.ChordType",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        Closed: [],
                        Drop2: [],
                        Drop3: [],
                        Open: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return ChordType;
    }();

    setType("Vaughan.Chords.ChordType", ChordType);

    var Chord = __exports.Chord = function () {
        function Chord(notes, chordType) {
            _classCallCheck$4(this, Chord);

            this.notes = notes;
            this.chordType = chordType;
        }

        _createClass$4(Chord, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Chords.Chord",
                    interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                    properties: {
                        notes: makeGeneric(List$1, {
                            T: Tuple([Notes.Note, ChordNoteFunction])
                        }),
                        chordType: ChordType
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsRecords(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareRecords(this, other);
            }
        }]);

        return Chord;
    }();

    setType("Vaughan.Chords.Chord", Chord);

    var functionForInterval = __exports.functionForInterval = function (interval) {
        var _target1 = function _target1() {
            return new ChordNoteFunction("Third", []);
        };

        var _target2 = function _target2() {
            return new ChordNoteFunction("Fifth", []);
        };

        var _target3 = function _target3() {
            return new ChordNoteFunction("Seventh", []);
        };

        if (interval.Case === "Unisson") {
            return new ChordNoteFunction("Root", []);
        } else {
            if (interval.Case === "MajorThird") {
                return _target1();
            } else {
                if (interval.Case === "MinorThird") {
                    return _target1();
                } else {
                    if (interval.Case === "PerfectFifth") {
                        return _target2();
                    } else {
                        if (interval.Case === "DiminishedFifth") {
                            return _target2();
                        } else {
                            if (interval.Case === "AugmentedFifth") {
                                return _target2();
                            } else {
                                if (interval.Case === "MajorSeventh") {
                                    return _target3();
                                } else {
                                    if (interval.Case === "MinorSeventh") {
                                        return _target3();
                                    } else {
                                        if (interval.Case === "MajorSixth") {
                                            return _target3();
                                        } else {
                                            return new ChordNoteFunction("Root", []);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var intervalsForFunction = __exports.intervalsForFunction = function (chordFunction) {
        return chordFunction.Case === "Augmented" ? ofArray([new Notes.Interval("MajorThird", []), new Notes.Interval("AugmentedFifth", [])]) : chordFunction.Case === "Minor" ? ofArray([new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectFifth", [])]) : chordFunction.Case === "Diminished" ? ofArray([new Notes.Interval("MinorThird", []), new Notes.Interval("DiminishedFifth", [])]) : chordFunction.Case === "Major7" ? ofArray([new Notes.Interval("MajorThird", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSeventh", [])]) : chordFunction.Case === "Augmented7" ? ofArray([new Notes.Interval("MajorThird", []), new Notes.Interval("AugmentedFifth", []), new Notes.Interval("MajorSeventh", [])]) : chordFunction.Case === "Minor7" ? ofArray([new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSeventh", [])]) : chordFunction.Case === "Diminished7" ? ofArray([new Notes.Interval("MinorThird", []), new Notes.Interval("DiminishedFifth", []), new Notes.Interval("MajorSixth", [])]) : chordFunction.Case === "Dominant7" ? ofArray([new Notes.Interval("MajorThird", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MinorSeventh", [])]) : chordFunction.Case === "Minor7b5" ? ofArray([new Notes.Interval("MinorThird", []), new Notes.Interval("DiminishedFifth", []), new Notes.Interval("MinorSeventh", [])]) : chordFunction.Case === "MinorMaj7" ? ofArray([new Notes.Interval("MinorThird", []), new Notes.Interval("PerfectFifth", []), new Notes.Interval("MajorSeventh", [])]) : chordFunction.Case === "Sus2" ? ofArray([new Notes.Interval("MajorSecond", []), new Notes.Interval("PerfectFifth", [])]) : chordFunction.Case === "Sus2Diminished" ? ofArray([new Notes.Interval("MajorSecond", []), new Notes.Interval("DiminishedFifth", [])]) : chordFunction.Case === "Sus2Augmented" ? ofArray([new Notes.Interval("MajorSecond", []), new Notes.Interval("AugmentedFifth", [])]) : chordFunction.Case === "Sus4" ? ofArray([new Notes.Interval("PerfectForth", []), new Notes.Interval("PerfectFifth", [])]) : chordFunction.Case === "Sus4Diminished" ? ofArray([new Notes.Interval("PerfectForth", []), new Notes.Interval("DiminishedFifth", [])]) : chordFunction.Case === "Sus4Augmented" ? ofArray([new Notes.Interval("PerfectForth", []), new Notes.Interval("AugmentedFifth", [])]) : ofArray([new Notes.Interval("MajorThird", []), new Notes.Interval("PerfectFifth", [])]);
    };

    var functionForIntervals = __exports.functionForIntervals = function (intervals) {
        var _target17 = function _target17() {
            return new ChordFunction("Major", []);
        };

        if (intervals.tail != null) {
            if (intervals.head.Case === "MajorThird") {
                if (intervals.tail.tail != null) {
                    if (intervals.tail.head.Case === "PerfectFifth") {
                        if (intervals.tail.tail.tail != null) {
                            if (intervals.tail.tail.head.Case === "MajorSeventh") {
                                if (intervals.tail.tail.tail.tail == null) {
                                    return new ChordFunction("Major7", []);
                                } else {
                                    return _target17();
                                }
                            } else {
                                if (intervals.tail.tail.head.Case === "MinorSeventh") {
                                    if (intervals.tail.tail.tail.tail == null) {
                                        return new ChordFunction("Dominant7", []);
                                    } else {
                                        return _target17();
                                    }
                                } else {
                                    return _target17();
                                }
                            }
                        } else {
                            return new ChordFunction("Major", []);
                        }
                    } else {
                        if (intervals.tail.head.Case === "AugmentedFifth") {
                            if (intervals.tail.tail.tail != null) {
                                if (intervals.tail.tail.head.Case === "MajorSeventh") {
                                    if (intervals.tail.tail.tail.tail == null) {
                                        return new ChordFunction("Augmented7", []);
                                    } else {
                                        return _target17();
                                    }
                                } else {
                                    return _target17();
                                }
                            } else {
                                return new ChordFunction("Augmented", []);
                            }
                        } else {
                            return _target17();
                        }
                    }
                } else {
                    return _target17();
                }
            } else {
                if (intervals.head.Case === "MinorThird") {
                    if (intervals.tail.tail != null) {
                        if (intervals.tail.head.Case === "PerfectFifth") {
                            if (intervals.tail.tail.tail != null) {
                                if (intervals.tail.tail.head.Case === "MinorSeventh") {
                                    if (intervals.tail.tail.tail.tail == null) {
                                        return new ChordFunction("Minor7", []);
                                    } else {
                                        return _target17();
                                    }
                                } else {
                                    if (intervals.tail.tail.head.Case === "MajorSeventh") {
                                        if (intervals.tail.tail.tail.tail == null) {
                                            return new ChordFunction("MinorMaj7", []);
                                        } else {
                                            return _target17();
                                        }
                                    } else {
                                        return _target17();
                                    }
                                }
                            } else {
                                return new ChordFunction("Minor", []);
                            }
                        } else {
                            if (intervals.tail.head.Case === "DiminishedFifth") {
                                if (intervals.tail.tail.tail != null) {
                                    if (intervals.tail.tail.head.Case === "MajorSixth") {
                                        if (intervals.tail.tail.tail.tail == null) {
                                            return new ChordFunction("Diminished7", []);
                                        } else {
                                            return _target17();
                                        }
                                    } else {
                                        if (intervals.tail.tail.head.Case === "MinorSeventh") {
                                            if (intervals.tail.tail.tail.tail == null) {
                                                return new ChordFunction("Minor7b5", []);
                                            } else {
                                                return _target17();
                                            }
                                        } else {
                                            return _target17();
                                        }
                                    }
                                } else {
                                    return new ChordFunction("Diminished", []);
                                }
                            } else {
                                return _target17();
                            }
                        }
                    } else {
                        return _target17();
                    }
                } else {
                    if (intervals.head.Case === "MajorSecond") {
                        if (intervals.tail.tail != null) {
                            if (intervals.tail.head.Case === "PerfectFifth") {
                                if (intervals.tail.tail.tail == null) {
                                    return new ChordFunction("Sus2", []);
                                } else {
                                    return _target17();
                                }
                            } else {
                                if (intervals.tail.head.Case === "DiminishedFifth") {
                                    if (intervals.tail.tail.tail == null) {
                                        return new ChordFunction("Sus2Diminished", []);
                                    } else {
                                        return _target17();
                                    }
                                } else {
                                    if (intervals.tail.head.Case === "AugmentedFifth") {
                                        if (intervals.tail.tail.tail == null) {
                                            return new ChordFunction("Sus2Augmented", []);
                                        } else {
                                            return _target17();
                                        }
                                    } else {
                                        return _target17();
                                    }
                                }
                            }
                        } else {
                            return _target17();
                        }
                    } else {
                        if (intervals.head.Case === "PerfectForth") {
                            if (intervals.tail.tail != null) {
                                if (intervals.tail.head.Case === "PerfectFifth") {
                                    if (intervals.tail.tail.tail == null) {
                                        return new ChordFunction("Sus4", []);
                                    } else {
                                        return _target17();
                                    }
                                } else {
                                    if (intervals.tail.head.Case === "DiminishedFifth") {
                                        if (intervals.tail.tail.tail == null) {
                                            return new ChordFunction("Sus4Diminished", []);
                                        } else {
                                            return _target17();
                                        }
                                    } else {
                                        if (intervals.tail.head.Case === "AugmentedFifth") {
                                            if (intervals.tail.tail.tail == null) {
                                                return new ChordFunction("Sus4Augmented", []);
                                            } else {
                                                return _target17();
                                            }
                                        } else {
                                            return _target17();
                                        }
                                    }
                                }
                            } else {
                                return _target17();
                            }
                        } else {
                            return _target17();
                        }
                    }
                }
            }
        } else {
            return _target17();
        }
    };

    var abreviatedName = __exports.abreviatedName = function (chordFunction) {
        return chordFunction.Case === "Augmented" ? "Aug" : chordFunction.Case === "Minor" ? "Min" : chordFunction.Case === "Diminished" ? "Dim" : chordFunction.Case === "Major7" ? "Maj7" : chordFunction.Case === "Augmented7" ? "Aug7" : chordFunction.Case === "Minor7" ? "Min7" : chordFunction.Case === "Diminished7" ? "Dim7" : chordFunction.Case === "Dominant7" ? "Dom7" : chordFunction.Case === "Minor7b5" ? "Min7b5" : chordFunction.Case === "MinorMaj7" ? "MinMaj7" : chordFunction.Case === "Sus2" ? "Sus2" : chordFunction.Case === "Sus2Diminished" ? "Sus2Dim" : chordFunction.Case === "Sus2Augmented" ? "Sus2Aug" : chordFunction.Case === "Sus4" ? "Sus4" : chordFunction.Case === "Sus4Diminished" ? "SusDim" : chordFunction.Case === "Sus4Augmented" ? "Sus4Aug" : "Maj";
    };

    var note = __exports.note = function (chordNote_0, chordNote_1) {
        var chordNote = [chordNote_0, chordNote_1];
        return chordNote[0];
    };

    var rawNotes = function rawNotes(chord) {
        return map$$1(function (tupledArg) {
            return note(tupledArg[0], tupledArg[1]);
        }, chord.notes);
    };

    var rawNoteForIndex = __exports.rawNoteForIndex = function (nth, chord) {
        return item(nth, rawNotes(chord));
    };

    var noteFunction = __exports.noteFunction = function (chordNote_0, chordNote_1) {
        var chordNote = [chordNote_0, chordNote_1];
        return chordNote[1];
    };

    var noteForFunction = __exports.noteForFunction = function (chord, chordNoteFunction) {
        var tupledArg = find(function (n) {
            return noteFunction(n[0], n[1]).Equals(chordNoteFunction);
        }, chord.notes);
        return note(tupledArg[0], tupledArg[1]);
    };

    var bass = __exports.bass = function (chord) {
        var tupledArg = chord.notes.head;
        return note(tupledArg[0], tupledArg[1]);
    };

    var lead = __exports.lead = function (chord) {
        var tupledArg = last(chord.notes);
        return note(tupledArg[0], tupledArg[1]);
    };

    var intervalsForChord = __exports.intervalsForChord = function (chord) {
        var root = noteForFunction(chord, new ChordNoteFunction("Root", []));
        return toList(skip(1, function (list) {
            return toList(sortWith(function (x, y) {
                return compare(function (interval) {
                    return Notes.toDistance(interval);
                }(x), function (interval) {
                    return Notes.toDistance(interval);
                }(y));
            }, list));
        }(map$$1(function (n) {
            return Notes.intervalBetween(root, note(n[0], n[1]));
        }, chord.notes))));
    };

    var name = __exports.name = function (chord) {
        return Notes.noteName(noteForFunction(chord, new ChordNoteFunction("Root", []))) + abreviatedName(functionForIntervals(intervalsForChord(chord)));
    };

    var noteNames = __exports.noteNames = function (chord) {
        return map$$1(function (n) {
            return Notes.noteName(note(n[0], n[1]));
        }, chord.notes);
    };

    var invertOpenOrClosed = __exports.invertOpenOrClosed = function (chord) {
        return new Chord(Infrastructure.rotateByOne(chord.notes), chord.chordType);
    };

    var invertDrop2 = __exports.invertDrop2 = function (chord) {
        return new Chord(append$$1(ofArray([last(chord.notes)]), Infrastructure.rotateByOne(Infrastructure.rotateByOne(toList(take(chord.notes.length - 1, chord.notes))))), chord.chordType);
    };

    var invertDrop3 = __exports.invertDrop3 = function (chord) {
        return new Chord(Infrastructure.swapSecondTwo(Infrastructure.rotateByOne(Infrastructure.rotateByOne(chord.notes))), chord.chordType);
    };

    var invert = __exports.invert = function (chord) {
        var _target0 = function _target0() {
            return invertOpenOrClosed(chord);
        };

        if (chord.chordType.Case === "Open") {
            return _target0();
        } else {
            if (chord.chordType.Case === "Drop2") {
                return invertDrop2(chord);
            } else {
                if (chord.chordType.Case === "Drop3") {
                    return invertDrop3(chord);
                } else {
                    return _target0();
                }
            }
        }
    };

    var toDrop2 = __exports.toDrop2 = function (chord) {
        return new Chord(Infrastructure.rotateByOne(Infrastructure.swapFirstTwo(chord.notes)), new ChordType("Drop2", []));
    };

    var toDrop3 = __exports.toDrop3 = function (chord) {
        return new Chord(toDrop2(toDrop2(chord)).notes, new ChordType("Drop3", []));
    };

    var repeatInversion = function repeatInversion(chord, times) {
        return times === 0 ? chord : repeatInversion(invert(chord), times - 1);
    };

    var generateChordInversions = function generateChordInversions(chord) {
        var notesInChord = chord.notes.length;
        return toList(delay(function () {
            return map$1(function (index) {
                return repeatInversion(chord, index);
            }, range(1, notesInChord));
        }));
    };

    var isLeadFunctionOnChordDesiredFunction = function isLeadFunctionOnChordDesiredFunction(chord, desiredNoteFunction, listFilter) {
        return equals(function () {
            var tupledArg = listFilter(chord.notes);
            return noteFunction(tupledArg[0], tupledArg[1]);
        }(), desiredNoteFunction);
    };

    var inversionForFunction = function inversionForFunction(chord, desiredNoteFunction, listFilter) {
        return filter$$1(function (c) {
            return isLeadFunctionOnChordDesiredFunction(c, desiredNoteFunction, listFilter);
        }, generateChordInversions(chord)).head;
    };

    var invertionWithNoteClosestToNote = function invertionWithNoteClosestToNote(chord, note_1, chordNote) {
        return Infrastructure.min(function (c1) {
            return function (c2) {
                return Notes.measureAbsoluteSemitones(chordNote(c1), note_1) < Notes.measureAbsoluteSemitones(chordNote(c2), note_1) ? c1 : c2;
            };
        }, generateChordInversions(chord));
    };

    var inversionForFunctionAsLead = __exports.inversionForFunctionAsLead = function (chord, desiredNoteFunction) {
        return inversionForFunction(chord, desiredNoteFunction, function (list) {
            return last(list);
        });
    };

    var inversionForFunctionAsBass = __exports.inversionForFunctionAsBass = function (chord, desiredNoteFunction) {
        return inversionForFunction(chord, desiredNoteFunction, function (list) {
            return list.head;
        });
    };

    var invertionWithLeadClosestToNote = __exports.invertionWithLeadClosestToNote = function (chord, note_1) {
        return invertionWithNoteClosestToNote(chord, note_1, function (chord_1) {
            return lead(chord_1);
        });
    };

    var invertionWithBassClosestToNote = __exports.invertionWithBassClosestToNote = function (chord, note_1) {
        return invertionWithNoteClosestToNote(chord, note_1, function (chord_1) {
            return bass(chord_1);
        });
    };

    return __exports;
}({});
var ScaleHarmonizer = function (__exports) {
    var thirds = __exports.thirds = function (fromPosition, scale) {
        return toList(map$1(function (tuple) {
            return tuple[1];
        }, filter$1(function (tupledArg) {
            return tupledArg[0] % 2 === 0;
        }, mapIndexed$1(function (i, v) {
            return [i, v];
        }, take(16, skip(fromPosition, Infrastructure.circularSequenceFromList(scale)))))));
    };

    var harmonizer = __exports.harmonizer = function (forDegree, scale) {
        var thirdsList = toList(take(7, function (scale_1) {
            return thirds(forDegree, scale_1);
        }(scale)));
        return new Chords.Chord(ofArray([[item(0, thirdsList), new Chords.ChordNoteFunction("Root", [])], [item(1, thirdsList), new Chords.ChordNoteFunction("Third", [])], [item(2, thirdsList), new Chords.ChordNoteFunction("Fifth", [])], [item(3, thirdsList), new Chords.ChordNoteFunction("Seventh", [])], [item(4, thirdsList), new Chords.ChordNoteFunction("Ninth", [])], [item(5, thirdsList), new Chords.ChordNoteFunction("Eleventh", [])], [item(6, thirdsList), new Chords.ChordNoteFunction("Thirteenth", [])]]), new Chords.ChordType("Closed", []));
    };

    var reducedHarmonizer = __exports.reducedHarmonizer = function (forDegree, scale, notes) {
        var complete = harmonizer(forDegree, scale);
        return new Chords.Chord(function (list) {
            return toList(take(notes, list));
        }(complete.notes), complete.chordType);
    };

    var seventhsHarmonizer = __exports.seventhsHarmonizer = function (forDegree, scale) {
        return reducedHarmonizer(forDegree, scale, 4);
    };

    var triadsHarmonizer = __exports.triadsHarmonizer = function (forDegree, scale) {
        return reducedHarmonizer(forDegree, scale, 3);
    };

    return __exports;
}({});
var Guitar = function (__exports) {
    var maxStrech = __exports.maxStrech = 5;

    var GuitarString = __exports.GuitarString = function () {
        function GuitarString(caseName, fields) {
            _classCallCheck$4(this, GuitarString);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(GuitarString, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Guitar.GuitarString",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        FifthString: [],
                        FirstString: [],
                        FourthString: [],
                        SecondString: [],
                        SixthString: [],
                        ThirdString: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return GuitarString;
    }();

    setType("Vaughan.Guitar.GuitarString", GuitarString);

    var GuitarStringAttributes = __exports.GuitarStringAttributes = function () {
        function GuitarStringAttributes(name, openStringNote, index) {
            _classCallCheck$4(this, GuitarStringAttributes);

            this.Name = name;
            this.OpenStringNote = openStringNote;
            this.Index = index;
        }

        _createClass$4(GuitarStringAttributes, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Guitar.GuitarStringAttributes",
                    interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                    properties: {
                        Name: "string",
                        OpenStringNote: Notes.Note,
                        Index: "number"
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsRecords(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareRecords(this, other);
            }
        }]);

        return GuitarStringAttributes;
    }();

    setType("Vaughan.Guitar.GuitarStringAttributes", GuitarStringAttributes);

    var StringFret = __exports.StringFret = function () {
        function StringFret(caseName, fields) {
            _classCallCheck$4(this, StringFret);

            this.Case = caseName;
            this.Fields = fields;
        }

        _createClass$4(StringFret, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Guitar.StringFret",
                    interfaces: ["FSharpUnion", "System.IEquatable", "System.IComparable"],
                    cases: {
                        Freted: ["number"],
                        Muted: []
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsUnions(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareUnions(this, other);
            }
        }]);

        return StringFret;
    }();

    setType("Vaughan.Guitar.StringFret", StringFret);

    var GuitarChordNote = __exports.GuitarChordNote = function () {
        function GuitarChordNote(guitarString, fret, note) {
            _classCallCheck$4(this, GuitarChordNote);

            this.GuitarString = guitarString;
            this.Fret = fret;
            this.Note = note;
        }

        _createClass$4(GuitarChordNote, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Guitar.GuitarChordNote",
                    interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                    properties: {
                        GuitarString: GuitarString,
                        Fret: "number",
                        Note: Notes.Note
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsRecords(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareRecords(this, other);
            }
        }]);

        return GuitarChordNote;
    }();

    setType("Vaughan.Guitar.GuitarChordNote", GuitarChordNote);

    var GuitarChord = __exports.GuitarChord = function () {
        function GuitarChord(chord, frets) {
            _classCallCheck$4(this, GuitarChord);

            this.Chord = chord;
            this.Frets = frets;
        }

        _createClass$4(GuitarChord, [{
            key: _Symbol.reflection,
            value: function () {
                return {
                    type: "Vaughan.Guitar.GuitarChord",
                    interfaces: ["FSharpRecord", "System.IEquatable", "System.IComparable"],
                    properties: {
                        Chord: Chords.Chord,
                        Frets: makeGeneric(List$1, {
                            T: GuitarChordNote
                        })
                    }
                };
            }
        }, {
            key: "Equals",
            value: function (other) {
                return equalsRecords(this, other);
            }
        }, {
            key: "CompareTo",
            value: function (other) {
                return compareRecords(this, other);
            }
        }]);

        return GuitarChord;
    }();

    setType("Vaughan.Guitar.GuitarChord", GuitarChord);

    var guitarStringAttributes = __exports.guitarStringAttributes = function (guitarString) {
        return guitarString.Case === "FifthString" ? new GuitarStringAttributes("Fifth", new Notes.Note("A", []), 5) : guitarString.Case === "FourthString" ? new GuitarStringAttributes("Fourth", new Notes.Note("D", []), 4) : guitarString.Case === "ThirdString" ? new GuitarStringAttributes("Third", new Notes.Note("G", []), 3) : guitarString.Case === "SecondString" ? new GuitarStringAttributes("Second", new Notes.Note("B", []), 2) : guitarString.Case === "FirstString" ? new GuitarStringAttributes("First", new Notes.Note("E", []), 1) : new GuitarStringAttributes("Sixth", new Notes.Note("E", []), 6);
    };

    var guitarStringIndex = __exports.guitarStringIndex = function (guitarString) {
        return guitarStringAttributes(guitarString).Index;
    };

    var indexToGuitarString = function indexToGuitarString(nth) {
        var $var2 = null;

        switch (nth) {
            case 6:
                {
                    $var2 = new GuitarString("SixthString", []);
                    break;
                }

            case 5:
                {
                    $var2 = new GuitarString("FifthString", []);
                    break;
                }

            case 4:
                {
                    $var2 = new GuitarString("FourthString", []);
                    break;
                }

            case 3:
                {
                    $var2 = new GuitarString("ThirdString", []);
                    break;
                }

            case 2:
                {
                    $var2 = new GuitarString("SecondString", []);
                    break;
                }

            default:
                {
                    $var2 = new GuitarString("FirstString", []);
                }
        }

        return $var2;
    };

    var defaultGuitarChordForChord = function defaultGuitarChordForChord(bassString, chord) {
        var bassStringIndex = guitarStringIndex(bassString);
        var notesInChord = chord.notes.length - 1;
        var leadStringIndex = guitarStringIndex(bassString) - notesInChord;
        return toList(delay(function () {
            return map$1(function (guitarStringIndex_1) {
                return new GuitarChordNote(indexToGuitarString(guitarStringIndex_1), 0, new Notes.Note("A", []));
            }, rangeStep(bassStringIndex, -1, leadStringIndex));
        }));
    };

    var isOpenFret = function isOpenFret(fret) {
        return fret.Fret === 0;
    };

    var raiseOctave = function raiseOctave(fret) {
        var Fret = fret.Fret + 12;
        return new GuitarChordNote(fret.GuitarString, Fret, fret.Note);
    };

    var fretDistance = function fretDistance(fret, other) {
        return Math.abs(fret.Fret - other.Fret);
    };

    var isStretching = function isStretching(fret, other) {
        return fretDistance(fret, other) > maxStrech;
    };

    var raiseOctaveOnStretch = function raiseOctaveOnStretch(previous, current, next) {
        return (isStretching(current, previous) ? true : isStretching(current, next)) ? function () {
            var Fret = current.Fret + 12;
            return new GuitarChordNote(current.GuitarString, Fret, current.Note);
        }() : current;
    };

    var isRaised = function isRaised(fret) {
        return fret.Fret > 11;
    };

    var hasRaised = function hasRaised(frets) {
        return function (list) {
            return exists(function (fret) {
                return isRaised(fret);
            }, list);
        }(frets);
    };

    var raiseOpenFrets = function raiseOpenFrets(frets) {
        return map$$1(function (fret) {
            return isOpenFret(fret) ? raiseOctave(fret) : fret;
        }, frets);
    };

    var raiseUnraisedFrets = function raiseUnraisedFrets(frets) {
        return hasRaised(frets) ? mapIndexed$$1(function (i, fret) {
            var matchValue = isRaised(fret);

            if (matchValue) {
                return fret;
            } else {
                var minimumIndex = Infrastructure.cappedMinimum(i - 1, 0);
                var maxIndex = frets.length - 1;
                var maximumIndex = Infrastructure.cappedMaximum(i + 1, maxIndex);
                return raiseOctaveOnStretch(item(minimumIndex, frets), fret, item(maximumIndex, frets));
            }
        }, frets) : frets;
    };

    var unstretch = function unstretch(frets) {
        var loop = function loop(frets_1) {
            return function (i) {
                return i === 0 ? frets_1 : loop(raiseUnraisedFrets(frets_1))(i - 1);
            };
        };

        return loop(frets)(frets.length - 1);
    };

    var fretForNote = __exports.fretForNote = function (note, guitarString) {
        return Notes.measureAbsoluteSemitones(guitarStringAttributes(guitarString).OpenStringNote, note);
    };

    var chordToGuitarChord = __exports.chordToGuitarChord = function (bassString, chord) {
        return new GuitarChord(chord, map$$1(function (fret) {
            var Fret = fretForNote(fret.Note, fret.GuitarString);
            return new GuitarChordNote(fret.GuitarString, Fret, fret.Note);
        }, mapIndexed$$1(function (i, fret) {
            var Note = Chords.rawNoteForIndex(i, chord);
            return new GuitarChordNote(fret.GuitarString, fret.Fret, Note);
        }, defaultGuitarChordForChord(bassString, chord))));
    };

    var chordToGuitarClosedChord = __exports.chordToGuitarClosedChord = function (bassString, chord) {
        var guitarChord = chordToGuitarChord(bassString, chord);

        var closedChord = function () {
            var Frets = raiseOpenFrets(guitarChord.Frets);
            return new GuitarChord(guitarChord.Chord, Frets);
        }();

        var Frets = unstretch(closedChord.Frets);
        return new GuitarChord(closedChord.Chord, Frets);
    };

    return __exports;
}({});
var GuitarTab = function (__exports) {
    var guitarStringOpenNote = function guitarStringOpenNote(guitarString) {
        return Guitar.guitarStringAttributes(guitarString).OpenStringNote;
    };

    var openStringNoteName = function openStringNoteName(fret) {
        return Notes.noteName(guitarStringOpenNote(fret.GuitarString));
    };

    var doubleDigitFret = function doubleDigitFret(guitarChord) {
        return exists(function (f) {
            return f.Fret > 9;
        }, guitarChord.Frets);
    };

    var padDashes = function padDashes(guitarChord) {
        return doubleDigitFret(guitarChord) ? "----" : "---";
    };

    var drawTabHigherString = function drawTabHigherString(guitarChord) {
        var dashes = padDashes(guitarChord);
        var matchValue = last(guitarChord.Frets).GuitarString;

        if (matchValue.Case === "SecondString") {
            return "E|" + dashes + "|\r\n";
        } else {
            if (matchValue.Case === "ThirdString") {
                return "E|" + dashes + "|\r\n" + "B|" + dashes + "|\r\n";
            } else {
                if (matchValue.Case === "FourthString") {
                    return "E|" + dashes + "|\r\n" + "B|" + dashes + "|\r\n" + "G|" + dashes + "|\r\n";
                } else {
                    return "";
                }
            }
        }
    };

    var drawTabLowerString = function drawTabLowerString(guitarChord) {
        var dashes = padDashes(guitarChord);
        var matchValue = guitarChord.Frets.head.GuitarString;

        if (matchValue.Case === "FifthString") {
            return "E|" + dashes + "|\r\n";
        } else {
            if (matchValue.Case === "FourthString") {
                return "A|" + dashes + "|\r\n" + "E|" + dashes + "|\r\n";
            } else {
                if (matchValue.Case === "ThirdString") {
                    return "D|" + dashes + "|\r\n" + "A|" + dashes + "|\r\n" + "E|" + dashes + "|\r\n";
                } else {
                    return "";
                }
            }
        }
    };

    var drawTabForGuitarChord = function drawTabForGuitarChord(guitarChord) {
        return fold(function (x, y) {
            return x + y;
        }, "", reverse$$1(map$$1(function (fret) {
            return fret.Fret < 10 ? fsFormat("%s|-%i-|\r\n")(function (x) {
                return x;
            })(openStringNoteName(fret))(fret.Fret) : fsFormat("%s|-%i-|\r\n")(function (x) {
                return x;
            })(openStringNoteName(fret))(fret.Fret);
        }, guitarChord.Frets)));
    };

    var drawGuitarChordTab = __exports.drawGuitarChordTab = function (guitarChord) {
        return fsFormat("  %s\r\n")(function (x) {
            return x;
        })(Chords.name(guitarChord.Chord)) + drawTabHigherString(guitarChord) + drawTabForGuitarChord(guitarChord) + drawTabLowerString(guitarChord);
    };

    return __exports;
}({});

var SonicPiConverter = function (__exports) {
  var replace$$1 = function replace$$1(f, r, s) {
    return replace$$1(s, f, r);
  };

  var convertNote = __exports.convertNote = function (note) {
    return function ($var7) {
      return replace$$1("Sharp", "s", replace$$1("Flat", "b", $var7));
    }(fsFormat("%A")(function (x) {
      return x;
    })(note));
  };

  var isMinor = __exports.isMinor = function (chord) {
    return isMatch(chord, "Min", 1);
  };

  var extractNoteFromChord = __exports.extractNoteFromChord = function (chord) {
    return chord.substr(0, 1);
  };

  var getTone = __exports.getTone = function (chord) {
    var tone = isMinor(chord) ? "minor" : "major";
    return tone;
  };

  var toChord = __exports.toChord = function (chord) {
    return fsFormat("chord(:%s,:%s)")(function (x) {
      return x;
    })(extractNoteFromChord(chord))(getTone(chord));
  };

  var toSonicPiNotation = __exports.toSonicPiNotation = function (noteList) {
    return map$$1(function (note) {
      return convertNote(note);
    }, noteList);
  };

  var output = __exports.output = function (lines) {
    return fold(function (x, y) {
      return x + y;
    }, "\n", lines);
  };

  return __exports;
}({});
var Progression = function (__exports) {
  var ThreeChordsProgression1 = __exports.ThreeChordsProgression1 = ofArray([0, 5, 4, 4]);
  var ThreeChordsProgression2 = __exports.ThreeChordsProgression2 = ofArray([0, 0, 3, 4]);
  var ThreeChordsProgression3 = __exports.ThreeChordsProgression3 = ofArray([0, 5, 0, 4]);
  var ThreeChordsProgression4 = __exports.ThreeChordsProgression4 = ofArray([0, 3, 4, 3]);
  var Anatole = __exports.Anatole = ofArray([0, 5, 1, 4]);
  var Circle = __exports.Circle = ofArray([5, 1, 4, 0]);
  var Pop1 = __exports.Pop1 = ofArray([0, 5, 3, 4]);
  var Pop2 = __exports.Pop2 = ofArray([0, 5, 3, 4]);
  var Otherside = __exports.Otherside = ofArray([0, 5, 2, 6]);
  var Andalusia = __exports.Andalusia = ofArray([0, 6, 5, 4]);

  var getRandom = __exports.getRandom = function () {
    var p = [ThreeChordsProgression1, ThreeChordsProgression2, ThreeChordsProgression3, ThreeChordsProgression4, Anatole, Circle, Pop1, Pop2, Otherside, Andalusia];
    var index = Math.floor(Math.random() * (p.length - 0)) + 0;
    return p[index];
  };

  return __exports;
}({});
var Composer = function (__exports) {
  var getSonicChord = function getSonicChord(chord, degree) {
    return SonicPiConverter.toChord(Chords.name(function (scale) {
      return ScaleHarmonizer.triadsHarmonizer(degree, scale);
    }(chord)));
  };

  var getChords = __exports.getChords = function (suite, baseChord) {
    return map$$1(function (d) {
      return function (degree) {
        return getSonicChord(baseChord, degree);
      }(d);
    }, suite);
  };

  return __exports;
}({});
var s = Scales.createScale(new Scales.Scales("Ionian", []), new Notes.Note("C", []));
var chords = Composer.getChords(Progression.getRandom(), s);
var output = SonicPiConverter.output(chords);
console.log(output);
window.document.getElementById("output").innerHTML = output;

exports.SonicPiConverter = SonicPiConverter;
exports.Progression = Progression;
exports.Composer = Composer;
exports.s = s;
exports.chords = chords;
exports.output = output;

}((this.index = this.index || {})));

//# sourceMappingURL=bundle.js.map