'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serialport = require('serialport');
var require$$0 = require('stream');
var node_util = require('node:util');
var process = require('node:process');
var os = require('node:os');
var tty = require('node:tty');
var node_events = require('node:events');
var crypto = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var process__default = /*#__PURE__*/_interopDefaultLegacy(process);
var os__default = /*#__PURE__*/_interopDefaultLegacy(os);
var tty__default = /*#__PURE__*/_interopDefaultLegacy(tty);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist = {};

var decoder = {};

Object.defineProperty(decoder, "__esModule", { value: true });
decoder.SlipDecoder = void 0;
const stream_1$1 = require$$0__default["default"];
/**
 * A transform stream that decodes slip encoded data.
 * @extends Transform
 *
 * Runs in O(n) time, stripping out slip encoding and emitting decoded data. Optionally custom slip escape and delimiters can be provided.
 */
class SlipDecoder extends stream_1$1.Transform {
    constructor(options = {}) {
        super(options);
        const { START, ESC = 0xdb, END = 0xc0, ESC_START, ESC_END = 0xdc, ESC_ESC = 0xdd } = options;
        this.opts = {
            START,
            ESC,
            END,
            ESC_START,
            ESC_END,
            ESC_ESC,
        };
        this.buffer = Buffer.alloc(0);
        this.escape = false;
        this.start = false;
    }
    _transform(chunk, encoding, cb) {
        for (let ndx = 0; ndx < chunk.length; ndx++) {
            let byte = chunk[ndx];
            if (byte === this.opts.START) {
                this.start = true;
                continue;
            }
            else if (undefined == this.opts.START) {
                this.start = true;
            }
            if (this.escape) {
                if (byte === this.opts.ESC_START && this.opts.START) {
                    byte = this.opts.START;
                }
                else if (byte === this.opts.ESC_ESC) {
                    byte = this.opts.ESC;
                }
                else if (byte === this.opts.ESC_END) {
                    byte = this.opts.END;
                }
                else {
                    this.escape = false;
                    this.push(this.buffer);
                    this.buffer = Buffer.alloc(0);
                }
            }
            else {
                if (byte === this.opts.ESC) {
                    this.escape = true;
                    continue;
                }
                if (byte === this.opts.END) {
                    this.push(this.buffer);
                    this.buffer = Buffer.alloc(0);
                    this.escape = false;
                    this.start = false;
                    continue;
                }
            }
            this.escape = false;
            if (this.start) {
                this.buffer = Buffer.concat([this.buffer, Buffer.from([byte])]);
            }
        }
        cb();
    }
    _flush(cb) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        cb();
    }
}
decoder.SlipDecoder = SlipDecoder;

var encoder = {};

Object.defineProperty(encoder, "__esModule", { value: true });
encoder.SlipEncoder = void 0;
const stream_1 = require$$0__default["default"];
/**
 * A transform stream that emits SLIP-encoded data for each incoming packet.
 *
 * Runs in O(n) time, adding a 0xC0 character at the end of each
 * received packet and escaping characters, according to RFC 1055.
 */
class SlipEncoder extends stream_1.Transform {
    constructor(options = {}) {
        super(options);
        const { START, ESC = 0xdb, END = 0xc0, ESC_START, ESC_END = 0xdc, ESC_ESC = 0xdd, bluetoothQuirk = false } = options;
        this.opts = {
            START,
            ESC,
            END,
            ESC_START,
            ESC_END,
            ESC_ESC,
            bluetoothQuirk,
        };
    }
    _transform(chunk, encoding, cb) {
        const chunkLength = chunk.length;
        if (this.opts.bluetoothQuirk && chunkLength === 0) {
            // Edge case: push no data. Bluetooth-quirky SLIP parsers don't like
            // lots of 0xC0s together.
            return cb();
        }
        // Allocate memory for the worst-case scenario: all bytes are escaped,
        // plus start and end separators.
        const encoded = Buffer.alloc(chunkLength * 2 + 2);
        let j = 0;
        if (this.opts.bluetoothQuirk == true) {
            encoded[j++] = this.opts.END;
        }
        if (this.opts.START !== undefined) {
            encoded[j++] = this.opts.START;
        }
        for (let i = 0; i < chunkLength; i++) {
            let byte = chunk[i];
            if (byte === this.opts.START && this.opts.ESC_START) {
                encoded[j++] = this.opts.ESC;
                byte = this.opts.ESC_START;
            }
            else if (byte === this.opts.END) {
                encoded[j++] = this.opts.ESC;
                byte = this.opts.ESC_END;
            }
            else if (byte === this.opts.ESC) {
                encoded[j++] = this.opts.ESC;
                byte = this.opts.ESC_ESC;
            }
            encoded[j++] = byte;
        }
        encoded[j++] = this.opts.END;
        cb(null, encoded.slice(0, j));
    }
}
encoder.SlipEncoder = SlipEncoder;

(function (exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(decoder, exports);
	__exportStar(encoder, exports);
} (dist));

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

const styles$1 = {
	modifier: {
		reset: [0, 0],
		// 21 isn't widely supported and 22 does the same thing
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],

		// Bright color
		blackBright: [90, 39],
		gray: [90, 39], // Alias of `blackBright`
		grey: [90, 39], // Alias of `blackBright`
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],

		// Bright color
		bgBlackBright: [100, 49],
		bgGray: [100, 49], // Alias of `bgBlackBright`
		bgGrey: [100, 49], // Alias of `bgBlackBright`
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49],
	},
};

Object.keys(styles$1.modifier);
const foregroundColorNames = Object.keys(styles$1.color);
const backgroundColorNames = Object.keys(styles$1.bgColor);
[...foregroundColorNames, ...backgroundColorNames];

function assembleStyles() {
	const codes = new Map();

	for (const [groupName, group] of Object.entries(styles$1)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles$1[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

			group[styleName] = styles$1[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles$1, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles$1, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles$1.color.close = '\u001B[39m';
	styles$1.bgColor.close = '\u001B[49m';

	styles$1.color.ansi = wrapAnsi16();
	styles$1.color.ansi256 = wrapAnsi256();
	styles$1.color.ansi16m = wrapAnsi16m();
	styles$1.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles$1.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles$1.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles$1, {
		rgbToAnsi256: {
			value(red, green, blue) {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16
					+ (36 * Math.round(red / 255 * 5))
					+ (6 * Math.round(green / 255 * 5))
					+ Math.round(blue / 255 * 5);
			},
			enumerable: false,
		},
		hexToRgb: {
			value(hex) {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let [colorString] = matches;

				if (colorString.length === 3) {
					colorString = [...colorString].map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: hex => styles$1.rgbToAnsi256(...styles$1.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value(code) {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles$1.ansi256ToAnsi(styles$1.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: hex => styles$1.ansi256ToAnsi(styles$1.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles$1;
}

const ansiStyles = assembleStyles();

// From: https://github.com/sindresorhus/has-flag/blob/main/index.js
function hasFlag(flag, argv = process__default["default"].argv) {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

const {env} = process__default["default"];

let flagForceColor;
if (
	hasFlag('no-color')
	|| hasFlag('no-colors')
	|| hasFlag('color=false')
	|| hasFlag('color=never')
) {
	flagForceColor = 0;
} else if (
	hasFlag('color')
	|| hasFlag('colors')
	|| hasFlag('color=true')
	|| hasFlag('color=always')
) {
	flagForceColor = 1;
}

function envForceColor() {
	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			return 1;
		}

		if (env.FORCE_COLOR === 'false') {
			return 0;
		}

		return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3,
	};
}

function _supportsColor(haveStream, {streamIsTTY, sniffFlags = true} = {}) {
	const noFlagForceColor = envForceColor();
	if (noFlagForceColor !== undefined) {
		flagForceColor = noFlagForceColor;
	}

	const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

	if (forceColor === 0) {
		return 0;
	}

	if (sniffFlags) {
		if (hasFlag('color=16m')
			|| hasFlag('color=full')
			|| hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process__default["default"].platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os__default["default"].release().split('.');
		if (
			Number(osRelease[0]) >= 10
			&& Number(osRelease[2]) >= 10_586
		) {
			return Number(osRelease[2]) >= 14_931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE', 'DRONE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	// Check for Azure DevOps pipelines
	if ('TF_BUILD' in env && 'AGENT_NAME' in env) {
		return 1;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = Number.parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function createSupportsColor(stream, options = {}) {
	const level = _supportsColor(stream, {
		streamIsTTY: stream && stream.isTTY,
		...options,
	});

	return translateLevel(level);
}

const supportsColor = {
	stdout: createSupportsColor({isTTY: tty__default["default"].isatty(1)}),
	stderr: createSupportsColor({isTTY: tty__default["default"].isatty(2)}),
};

// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string, substring, replacer) {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.slice(endIndex, index) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.slice(endIndex, (gotCR ? index - 1 : index)) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

const {stdout: stdoutColor, stderr: stderrColor} = supportsColor;

const GENERATOR = Symbol('GENERATOR');
const STYLER = Symbol('STYLER');
const IS_EMPTY = Symbol('IS_EMPTY');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m',
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

const chalkFactory = options => {
	const chalk = (...strings) => strings.join(' ');
	applyOptions(chalk, options);

	Object.setPrototypeOf(chalk, createChalk.prototype);

	return chalk;
};

function createChalk(options) {
	return chalkFactory(options);
}

Object.setPrototypeOf(createChalk.prototype, Function.prototype);

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		},
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this[STYLER], true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	},
};

const getModelAnsi = (model, level, type, ...arguments_) => {
	if (model === 'rgb') {
		if (level === 'ansi16m') {
			return ansiStyles[type].ansi16m(...arguments_);
		}

		if (level === 'ansi256') {
			return ansiStyles[type].ansi256(ansiStyles.rgbToAnsi256(...arguments_));
		}

		return ansiStyles[type].ansi(ansiStyles.rgbToAnsi(...arguments_));
	}

	if (model === 'hex') {
		return getModelAnsi('rgb', level, type, ...ansiStyles.hexToRgb(...arguments_));
	}

	return ansiStyles[type][model](...arguments_);
};

const usedModels = ['rgb', 'hex', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...arguments_), ansiStyles.color.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'bgColor', ...arguments_), ansiStyles.bgColor.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this[GENERATOR].level;
		},
		set(level) {
			this[GENERATOR].level = level;
		},
	},
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent,
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	// Single argument is hot path, implicit coercion is faster than anything
	// eslint-disable-next-line no-implicit-coercion
	const builder = (...arguments_) => applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder[GENERATOR] = self;
	builder[STYLER] = _styler;
	builder[IS_EMPTY] = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self[IS_EMPTY] ? '' : string;
	}

	let styler = self[STYLER];

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.includes('\u001B')) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

Object.defineProperties(createChalk.prototype, styles);

const chalk = createChalk();
createChalk({level: stderrColor ? stderrColor.level : 0});

function filterName(input) {
    return input.replace(/[^A-Za-z0-9]/g, '').toLowerCase().replace(/-(.)/g, function (match, group1) {
        return group1.toUpperCase();
    });
}
const logRank = {
    'all': 0,
    'debug': 1,
    'info': 2,
    'warn': 3,
    'error': 4,
    'fatal': 5,
    'none': 99,
};
const colorize = {
    debug: chalk.gray,
    info: chalk.white,
    warn: chalk.yellow,
    error: chalk.red,
    fatal: chalk.redBright,
};
function setColorize(level, colorFn) {
    colorize[level] = colorFn;
}
function setWarn(warnFn) {
    colorize.warn = warnFn;
}
function strfy(o) { return JSON.stringify(o, null, 2); }
function oStr(o) {
    return node_util.inspect(o, {
        colors: true,
        depth: 2
    });
}
class Msg {
    _debug = () => { };
    _info = () => { };
    _warn = () => { };
    _error = () => { };
    _fatal = () => { };
    _defaultLogger(msg, lv) {
        console.log(msg);
    }
    prompt = ' => ';
    host = '';
    level = 'all';
    terminal = true;
    showTime = true;
    showMillis = false;
    get time() {
        const d = new Date();
        let hh = '', mm = '', ss = '';
        if (d.getHours() < 10) {
            hh = '0';
        }
        if (d.getMinutes() < 10) {
            mm = '0';
        }
        if (d.getSeconds() < 10) {
            ss = '0';
        }
        hh += d.getHours();
        mm += d.getMinutes();
        ss += d.getSeconds();
        let tt = hh + ':' + mm + ':' + ss;
        if (this.showMillis) {
            tt += ':' + d.getMilliseconds();
        }
        return chalk.grey(tt);
    }
    ps(calledLevel) {
        let _ps = '';
        if (this.showTime) {
            _ps += this.time + ' ';
        }
        if (this.symbol[calledLevel] !== '') {
            _ps += colorize[calledLevel](this.symbol[calledLevel]) + ' ';
        }
        _ps += colorize[calledLevel](this.host)
            + this.prompt;
        return _ps;
    }
    symbol = {
        debug: 'debug',
        info: '',
        warn: '(!)',
        error: '[!]',
        fatal: '{x_X}',
    };
    assignOptions(depth, opts) {
        for (const prop in opts) {
            if (typeof depth[prop] !== 'object') {
                depth[prop] = opts[prop] || depth[prop];
            }
            else {
                this.assignOptions(depth[prop], opts[prop]);
            }
        }
    }
    getLevelLoggers() {
        return {
            debug: this._debug,
            info: this._info,
            warn: this._warn,
            error: this._error,
            fatal: this._fatal,
        };
    }
    logger = this._defaultLogger;
    resetLogger() { this.logger = this._defaultLogger; }
    constructor(options) {
        this.assignOptions(this, options);
        // if (options.symbol) {
        //   for (let prop in this._symbol) {
        //     this._symbol[prop] = options.symbol[prop]
        //   }
        // }
        // if (options.logger) {
        //   this.logger = options.logger
        // }
        // options.prompt ? this.prompt = options.prompt : null
        // this.host = options.host
        // this.terminal = options.terminal
        this.spawnLevelLoggers();
    }
    spawnLevelLoggers() {
        for (let prop in this.symbol) {
            let calledLevel = prop;
            this['_' + prop] = (l) => {
                if (logRank[this.level] <= logRank[calledLevel]) {
                    this.logger(`${this.ps(calledLevel)}${l}`, calledLevel);
                }
            };
        }
    }
}

const urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const POOL_SIZE_MULTIPLIER = 128;
let pool, poolOffset;
let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
};
let nanoid = (size = 21) => {
  fillPool((size -= 0));
  let id = '';
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id
};

let _connectedDevices = 0;
exports.PacketType = void 0;
(function (PacketType) {
    PacketType[PacketType["PING"] = 0] = "PING";
    PacketType[PacketType["ACK"] = 1] = "ACK";
    PacketType[PacketType["READY"] = 2] = "READY";
    PacketType[PacketType["STATE_UPDATE"] = 3] = "STATE_UPDATE";
    PacketType[PacketType["ERROR"] = 4] = "ERROR";
    PacketType[PacketType["STRING"] = 5] = "STRING";
    PacketType[PacketType["DISCONNECT"] = 6] = "DISCONNECT";
})(exports.PacketType || (exports.PacketType = {}));
const makeShiftPortOptionsDefault = {
    logOptions: {
        level: 'all',
        host: 'MSP(D/C)',
    }
};
class MakeShiftPort extends node_events.EventEmitter {
    serialPort;
    slipEncoder = new dist.SlipEncoder(SLIP_OPTIONS);
    slipDecoder = new dist.SlipDecoder(SLIP_OPTIONS);
    timeSinceAck = 0;
    prevState = {
        buttons: [
            false, false, false, false,
            false, false, false, false,
            false, false, false, false,
            false, false, false, false,
        ],
        dials: [0, 0, 0, 0],
    };
    _deviceReady = false;
    _id = '';
    _deviceInfo;
    _devicePath = 'D/C';
    _msger;
    log;
    debug;
    info;
    error;
    warn;
    fatal;
    pollDelayMs = 500;
    _keepAliveTimeout = 5000;
    _keepAliveDelayMs = 1500;
    keepAliveTimer;
    _logLevel = 'all';
    get logLevel() { return this._logLevel; }
    set logLevel(l) {
        this._logLevel = l;
        this._msger.level = l;
    }
    get logTermFormat() { return this._msger.terminal; }
    set logTermFormat(tf) { this._msger.terminal = tf; }
    // static get/setters
    /**
     * This technically is a library global, it keeps track of the number of open ports
     */
    static get connectedDevices() { return _connectedDevices; }
    // Public get/setters
    /**
     * If device connected, returns the path as a string, else returns 'D/C'
     */
    get devicePath() { return this._devicePath; }
    /**
     * 23 character id assigned to port on instantiation
     */
    get portId() { return this._id; }
    emitLog = (msg, lv) => {
        this.emit('log', {
            level: lv,
            terminal: this._msger.terminal,
            message: msg,
        });
    };
    setLogToEmit() {
        this._msger.logger = this.emitLog.bind(this);
    }
    setLogToConsole() {
        this._msger.resetLogger();
    }
    constructor(options = makeShiftPortOptionsDefault) {
        super();
        this._id = nanoid(23);
        this._msger = new Msg(options.logOptions);
        this._msger.host = this.host();
        this.log = this._msger.getLevelLoggers();
        for (const ltype in this.log) {
            this[ltype] = this.log[ltype];
        }
        this.on(Events.DEVICE.STATE_UPDATE, (currState) => {
            for (let id = 0; id < NumOfButtons; id++) {
                if (currState.buttons[id] != this.prevState.buttons[id]) {
                    if (currState.buttons[id] === true) {
                        this.emit(Events.BUTTON[id].PRESSED, currState.buttons[id]);
                    }
                    else {
                        this.emit(Events.BUTTON[id].RELEASED, currState.buttons[id]);
                    }
                }
            }
            let delta;
            for (let id = 0; id < NumOfDials; id++) {
                delta = this.prevState.dials[id] = currState.dials[id];
                if (delta !== 0) {
                    this.emit(Events.DIAL[id].CHANGE, currState.dials[id]);
                    if (delta > 0) {
                        this.emit(Events.DIAL[id].INCREMENT, currState.dials[id]);
                    }
                    else {
                        this.emit(Events.DIAL[id].DECREMENT, currState.dials[id]);
                    }
                }
            }
            this.prevState = currState;
        });
        this.on(Events.DEVICE.CONNECTED, () => {
            _connectedDevices++;
            this._deviceReady = true;
            this.timeSinceAck = Date.now();
            this.info(`Device connection established`);
            this.keepAliveTimer = setInterval(() => {
                const elapsedTime = Date.now() - this.timeSinceAck;
                if (elapsedTime >= this._keepAliveDelayMs - 40) {
                    // this.msg(`${this._keepAliveDelayMs}ms keepalive check`)
                    if (elapsedTime > this._keepAliveTimeout) {
                        this.info(`Device unresponsive for ${this._keepAliveTimeout}ms, disconnecting`);
                        this.closePort();
                    }
                    else {
                        this.sendByte(exports.PacketType.PING);
                    }
                }
            }, this._keepAliveDelayMs);
        });
        this.on(Events.DEVICE.DISCONNECTED, () => {
            _connectedDevices--;
            this._deviceReady = false;
            this.info(`Restart device scanning`);
            this.scanForDevice();
        });
        // The decoder is the endpoint which gets the 'raw' data from the makeshift
        // so all the work of parsing the raw data happens here
        this.slipDecoder.on('data', (data) => {
            this.timeSinceAck = Date.now();
            const header = data.slice(0, 1).at(0);
            const body = data.slice(1);
            switch (header) {
                case exports.PacketType.STATE_UPDATE:
                    let newState = MakeShiftPort.parseStateFromBuffer(body);
                    this.emit(Events.DEVICE.STATE_UPDATE, newState);
                    break;
                case exports.PacketType.ACK:
                    // any packet will act as keepalive ACK, and is handled above
                    this.debug(`Got ACK from MakeShift`);
                    break;
                case exports.PacketType.STRING:
                    let d = new Date();
                    let s = "MKSHFT => ";
                    s += d.getUTCHours();
                    s += ":";
                    s += d.getUTCMinutes();
                    s += ":";
                    s += d.getUTCSeconds();
                    s += ":";
                    s += d.getUTCMilliseconds();
                    console.log(s + ": " + body.toString());
                    break;
                case exports.PacketType.PING:
                    this.debug(`Got PING from MakeShift, responding with ACK`);
                    this.sendByte(exports.PacketType.ACK);
                    break;
                case exports.PacketType.ERROR:
                    this.debug(`Got ERROR from MakeShift`);
                    break;
                case exports.PacketType.READY:
                    this.debug(`Got READY from MakeShift`);
                    this.debug(body.toString());
                    this.emit(Events.DEVICE.CONNECTED);
                    break;
                default:
                    this.debug(header);
                    this.debug(data.toString());
                    break;
            }
        }); // decoder -> console
        this.scanForDevice();
    } // constructor()
    sendByte(t) {
        if (this.serialPort.isOpen) {
            this.serialPort.flush();
            let buf = Buffer.from([t]);
            this.debug(`Sending byte: ${oStr(buf)}`);
            this.slipEncoder.write(buf);
        }
    }
    send(t, body) {
        if (this.serialPort.isOpen) {
            this.serialPort.flush();
            let h = Buffer.from([t]);
            let b = Buffer.from(body);
            const buf = Buffer.concat([h, b]);
            this.debug(`Sending buffer: ${oStr(buf)}`);
            // console.dir(buf)
            this.slipEncoder.write(buf);
        }
    }
    static parseStateFromBuffer(data) {
        let state = {
            buttons: [],
            dials: [],
        };
        const buttonsRaw = data.slice(0, 2).reverse();
        const dialsRaw = data.slice(2, 18);
        const bytesToBin = (button, bitCounter) => {
            if (bitCounter === 0) {
                return;
            }
            if (button % 2) {
                state.buttons.push(true);
            }
            else {
                state.buttons.push(false);
            }
            bytesToBin(Math.floor(button / 2), bitCounter - 1);
        };
        buttonsRaw.forEach((b) => bytesToBin(b, 8));
        state.dials.push(dialsRaw.readInt32BE(0));
        state.dials.push(dialsRaw.readInt32BE(4));
        state.dials.push(dialsRaw.readInt32BE(8));
        state.dials.push(dialsRaw.readInt32BE(12));
        return state;
    }
    openPort(path, info) {
        this.serialPort = new serialport.SerialPort({
            path: path,
            baudRate: 42069
        }, (e) => {
            if (e != null) {
                this.error(`Something happened while opening port: `);
                this.error(e);
                this.info('Restarting scan for open ports...');
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
            else {
                this._devicePath = path;
                this._msger.host = this.host();
                this.info('SerialPort opened, attaching SLIP translators');
                this.slipEncoder.pipe(this.serialPort); // node -> teensy
                this.serialPort.pipe(this.slipDecoder); // teensy -> decoder
                this.sendByte(exports.PacketType.READY);
            }
        });
    }
    closePort() {
        this.info(`Closing MakeShift port...`);
        this.info(`Clearing keepalive timer`);
        clearInterval(this.keepAliveTimer);
        this.info(`Unpiping encoders`);
        this.slipEncoder.unpipe();
        this.serialPort.unpipe();
        if (this.serialPort.isOpen) {
            this.info(`Port object found open`);
            this.info(`Sending disconnect packet`);
            this.sendByte(exports.PacketType.DISCONNECT);
            this.info(`Closing port`);
            this.serialPort.close();
        }
        this.info(`Port closed, sending disconnect signal`);
        this.emit(Events.DEVICE.DISCONNECTED);
        this.info(`Resetting devicePath`);
        this._devicePath = 'D/C';
        this._msger.host = this.host();
    }
    write(line) {
        if (this._deviceReady) {
            this.send(exports.PacketType.STRING, line);
        }
        else {
            this.info("MakeShift not ready, line not sent");
        }
    }
    scanForDevice() {
        serialport.SerialPort.list().then((portList) => {
            portList.forEach(portInfo => {
                this.debug(oStr(portInfo));
            });
            let makeShiftPortInfo = portList.filter((portInfo) => {
                return ((portInfo.vendorId === '16c0'
                    || portInfo.vendorId === '16C0')
                    && (portInfo.productId === '0483'));
            });
            // console.dir(makeShiftPortInfo.length)
            if (makeShiftPortInfo.length > 0) {
                this.debug(`Found MakeShift devices: ${strfy(makeShiftPortInfo)}`);
                let path = makeShiftPortInfo[0].path;
                this.emit(Events.DEVICE.FOUND, path);
                this.info(`Opening device with path '${path}'`);
                this.openPort(path, makeShiftPortInfo[0]);
            }
            else {
                this.debug(`No MakeShift devices found, continuing scan...`);
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
        }).catch((e) => {
            this.info(e);
        });
    }
    // TODO: figure if this is vestigal
    host() {
        let wrap = chalk.yellow;
        if (this._devicePath !== 'D/C') {
            wrap = chalk.green;
        }
        return `MSP::${wrap(this.devicePath)}`;
    }
}
// Long constants
/**
 * Events are organized so they are accessible as:
 *     Events.<EventSource>[?pseudo-id].SubType?
*/
const Events = {
    DIAL: [
        {
            INCREMENT: 'dial-01-increment',
            DECREMENT: 'dial-01-decrement',
            CHANGE: 'dial-01-change',
        },
        {
            INCREMENT: 'dial-02-increment',
            DECREMENT: 'dial-02-decrement',
            CHANGE: 'dial-02-change',
        },
        {
            INCREMENT: 'dial-03-increment',
            DECREMENT: 'dial-03-decrement',
            CHANGE: 'dial-03-change',
        },
        {
            INCREMENT: 'dial-04-increment',
            DECREMENT: 'dial-04-decrement',
            CHANGE: 'dial-04-change',
        },
    ],
    BUTTON: [
        {
            PRESSED: 'button-01-rise',
            RELEASED: 'button-01-fall',
            CHANGE: 'button-01-change',
        },
        {
            PRESSED: 'button-02-rise',
            RELEASED: 'button-02-fall',
            CHANGE: 'button-02-change',
        },
        {
            PRESSED: 'button-03-rise',
            RELEASED: 'button-03-fall',
            CHANGE: 'button-03-change',
        },
        {
            PRESSED: 'button-04-rise',
            RELEASED: 'button-04-fall',
            CHANGE: 'button-04-change',
        },
        {
            PRESSED: 'button-05-rise',
            RELEASED: 'button-05-fall',
            CHANGE: 'button-05-change',
        },
        {
            PRESSED: 'button-06-rise',
            RELEASED: 'button-06-fall',
            CHANGE: 'button-06-change',
        },
        {
            PRESSED: 'button-07-rise',
            RELEASED: 'button-07-fall',
            CHANGE: 'button-07-change',
        },
        {
            PRESSED: 'button-08-rise',
            RELEASED: 'button-08-fall',
            CHANGE: 'button-08-change',
        },
        {
            PRESSED: 'button-09-rise',
            RELEASED: 'button-09-fall',
            CHANGE: 'button-09-change',
        },
        {
            PRESSED: 'button-10-rise',
            RELEASED: 'button-10-fall',
            CHANGE: 'button-10-change',
        },
        {
            PRESSED: 'button-11-rise',
            RELEASED: 'button-11-fall',
            CHANGE: 'button-11-change',
        },
        {
            PRESSED: 'button-12-rise',
            RELEASED: 'button-12-fall',
            CHANGE: 'button-12-change',
        },
        {
            PRESSED: 'button-13-rise',
            RELEASED: 'button-13-fall',
            CHANGE: 'button-13-change',
        },
        {
            PRESSED: 'button-14-rise',
            RELEASED: 'button-14-fall',
            CHANGE: 'button-14-change',
        },
        {
            PRESSED: 'button-15-rise',
            RELEASED: 'button-15-fall',
            CHANGE: 'button-15-change',
        },
        {
            PRESSED: 'button-16-rise',
            RELEASED: 'button-16-fall',
            CHANGE: 'button-16-change',
        },
    ],
    DEVICE: {
        FOUND: 'makeshift-found',
        DISCONNECTED: 'makeshift-disconnect',
        CONNECTED: 'makeshift-connect',
        STATE_UPDATE: 'state-update',
    },
};
const NumOfButtons = Events.BUTTON.length;
const NumOfDials = Events.DIAL.length;
const SLIP_OPTIONS = {
    ESC: 219,
    END: 192,
    ESC_END: 220,
    ESC_ESC: 221,
};

exports.Events = Events;
exports.MakeShiftPort = MakeShiftPort;
exports.Msg = Msg;
exports.filterName = filterName;
exports.logRank = logRank;
exports.makeShiftPortOptionsDefault = makeShiftPortOptionsDefault;
exports.oStr = oStr;
exports.setColorize = setColorize;
exports.setWarn = setWarn;
exports.strfy = strfy;
