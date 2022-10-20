import require$$0 from 'stream';
import require$$0$1 from 'tty';
import require$$1 from 'util';
import require$$0$2, { readFileSync } from 'fs';
import * as path$1 from 'path';
import path__default from 'path';
import require$$2 from 'os';
import require$$1$1, { EventEmitter as EventEmitter$1 } from 'events';
import require$$0$3, { fork } from 'child_process';
import { EventEmitter } from 'node:events';
import { fileURLToPath } from 'url';
import * as readline from 'node:readline';
import { stdin, stdout } from 'node:process';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var dist$e = {};

var dist$d = {};

Object.defineProperty(dist$d, "__esModule", { value: true });
dist$d.ByteLengthParser = void 0;
const stream_1$c = require$$0;
/**
 * Emit data every number of bytes
 *
 * A transform stream that emits data as a buffer after a specific number of bytes are received. Runs in O(n) time.
 */
class ByteLengthParser extends stream_1$c.Transform {
    constructor(options) {
        super(options);
        if (typeof options.length !== 'number') {
            throw new TypeError('"length" is not a number');
        }
        if (options.length < 1) {
            throw new TypeError('"length" is not greater than 0');
        }
        this.length = options.length;
        this.position = 0;
        this.buffer = Buffer.alloc(this.length);
    }
    _transform(chunk, _encoding, cb) {
        let cursor = 0;
        while (cursor < chunk.length) {
            this.buffer[this.position] = chunk[cursor];
            cursor++;
            this.position++;
            if (this.position === this.length) {
                this.push(this.buffer);
                this.buffer = Buffer.alloc(this.length);
                this.position = 0;
            }
        }
        cb();
    }
    _flush(cb) {
        this.push(this.buffer.slice(0, this.position));
        this.buffer = Buffer.alloc(this.length);
        cb();
    }
}
dist$d.ByteLengthParser = ByteLengthParser;

var dist$c = {};

Object.defineProperty(dist$c, "__esModule", { value: true });
dist$c.CCTalkParser = void 0;
const stream_1$b = require$$0;
/**
 * Parse the CCTalk protocol
 * @extends Transform
 *
 * A transform stream that emits CCTalk packets as they are received.
 */
class CCTalkParser extends stream_1$b.Transform {
    constructor(maxDelayBetweenBytesMs = 50) {
        super();
        this.array = [];
        this.cursor = 0;
        this.lastByteFetchTime = 0;
        this.maxDelayBetweenBytesMs = maxDelayBetweenBytesMs;
    }
    _transform(buffer, encoding, cb) {
        if (this.maxDelayBetweenBytesMs > 0) {
            const now = Date.now();
            if (now - this.lastByteFetchTime > this.maxDelayBetweenBytesMs) {
                this.array = [];
                this.cursor = 0;
            }
            this.lastByteFetchTime = now;
        }
        this.cursor += buffer.length;
        // TODO: Better Faster es7 no supported by node 4
        // ES7 allows directly push [...buffer]
        // this.array = this.array.concat(Array.from(buffer)) //Slower ?!?
        Array.from(buffer).map(byte => this.array.push(byte));
        while (this.cursor > 1 && this.cursor >= this.array[1] + 5) {
            // full frame accumulated
            // copy command from the array
            const FullMsgLength = this.array[1] + 5;
            const frame = Buffer.from(this.array.slice(0, FullMsgLength));
            // Preserve Extra Data
            this.array = this.array.slice(frame.length, this.array.length);
            this.cursor -= FullMsgLength;
            this.push(frame);
        }
        cb();
    }
}
dist$c.CCTalkParser = CCTalkParser;

var dist$b = {};

Object.defineProperty(dist$b, "__esModule", { value: true });
dist$b.DelimiterParser = void 0;
const stream_1$a = require$$0;
/**
 * A transform stream that emits data each time a byte sequence is received.
 * @extends Transform
 *
 * To use the `Delimiter` parser, provide a delimiter as a string, buffer, or array of bytes. Runs in O(n) time.
 */
class DelimiterParser extends stream_1$a.Transform {
    constructor({ delimiter, includeDelimiter = false, ...options }) {
        super(options);
        if (delimiter === undefined) {
            throw new TypeError('"delimiter" is not a bufferable object');
        }
        if (delimiter.length === 0) {
            throw new TypeError('"delimiter" has a 0 or undefined length');
        }
        this.includeDelimiter = includeDelimiter;
        this.delimiter = Buffer.from(delimiter);
        this.buffer = Buffer.alloc(0);
    }
    _transform(chunk, encoding, cb) {
        let data = Buffer.concat([this.buffer, chunk]);
        let position;
        while ((position = data.indexOf(this.delimiter)) !== -1) {
            this.push(data.slice(0, position + (this.includeDelimiter ? this.delimiter.length : 0)));
            data = data.slice(position + this.delimiter.length);
        }
        this.buffer = data;
        cb();
    }
    _flush(cb) {
        this.push(this.buffer);
        this.buffer = Buffer.alloc(0);
        cb();
    }
}
dist$b.DelimiterParser = DelimiterParser;

var dist$a = {};

Object.defineProperty(dist$a, "__esModule", { value: true });
dist$a.InterByteTimeoutParser = void 0;
const stream_1$9 = require$$0;
/**
 * A transform stream that buffers data and emits it after not receiving any bytes for the specified amount of time or hitting a max buffer size.
 */
class InterByteTimeoutParser extends stream_1$9.Transform {
    constructor({ maxBufferSize = 65536, interval, ...transformOptions }) {
        super(transformOptions);
        if (!interval) {
            throw new TypeError('"interval" is required');
        }
        if (typeof interval !== 'number' || Number.isNaN(interval)) {
            throw new TypeError('"interval" is not a number');
        }
        if (interval < 1) {
            throw new TypeError('"interval" is not greater than 0');
        }
        if (typeof maxBufferSize !== 'number' || Number.isNaN(maxBufferSize)) {
            throw new TypeError('"maxBufferSize" is not a number');
        }
        if (maxBufferSize < 1) {
            throw new TypeError('"maxBufferSize" is not greater than 0');
        }
        this.maxBufferSize = maxBufferSize;
        this.currentPacket = [];
        this.interval = interval;
    }
    _transform(chunk, encoding, cb) {
        if (this.intervalID) {
            clearTimeout(this.intervalID);
        }
        for (let offset = 0; offset < chunk.length; offset++) {
            this.currentPacket.push(chunk[offset]);
            if (this.currentPacket.length >= this.maxBufferSize) {
                this.emitPacket();
            }
        }
        this.intervalID = setTimeout(this.emitPacket.bind(this), this.interval);
        cb();
    }
    emitPacket() {
        if (this.intervalID) {
            clearTimeout(this.intervalID);
        }
        if (this.currentPacket.length > 0) {
            this.push(Buffer.from(this.currentPacket));
        }
        this.currentPacket = [];
    }
    _flush(cb) {
        this.emitPacket();
        cb();
    }
}
dist$a.InterByteTimeoutParser = InterByteTimeoutParser;

var dist$9 = {};

Object.defineProperty(dist$9, "__esModule", { value: true });
dist$9.PacketLengthParser = void 0;
const stream_1$8 = require$$0;
/**
 * A transform stream that decodes packets with a delimiter and length of payload
 * specified within the data stream.
 * @extends Transform
 * @summary Decodes packets of the general form:
 *       [delimiter][len][payload0] ... [payload0 + len]
 *
 * The length field can be up to 4 bytes and can be at any offset within the packet
 *       [delimiter][header0][header1][len0][len1[payload0] ... [payload0 + len]
 *
 * The offset and number of bytes of the length field need to be provided in options
 * if not 1 byte immediately following the delimiter.
 */
class PacketLengthParser extends stream_1$8.Transform {
    constructor(options = {}) {
        super(options);
        const { delimiter = 0xaa, packetOverhead = 2, lengthBytes = 1, lengthOffset = 1, maxLen = 0xff } = options;
        this.opts = {
            delimiter,
            packetOverhead,
            lengthBytes,
            lengthOffset,
            maxLen,
        };
        this.buffer = Buffer.alloc(0);
        this.start = false;
    }
    _transform(chunk, encoding, cb) {
        for (let ndx = 0; ndx < chunk.length; ndx++) {
            const byte = chunk[ndx];
            if (byte === this.opts.delimiter) {
                this.start = true;
            }
            if (true === this.start) {
                this.buffer = Buffer.concat([this.buffer, Buffer.from([byte])]);
                if (this.buffer.length >= this.opts.lengthOffset + this.opts.lengthBytes) {
                    const len = this.buffer.readUIntLE(this.opts.lengthOffset, this.opts.lengthBytes);
                    if (this.buffer.length == len + this.opts.packetOverhead || len > this.opts.maxLen) {
                        this.push(this.buffer);
                        this.buffer = Buffer.alloc(0);
                        this.start = false;
                    }
                }
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
dist$9.PacketLengthParser = PacketLengthParser;

var dist$8 = {};

Object.defineProperty(dist$8, "__esModule", { value: true });
dist$8.ReadlineParser = void 0;
const parser_delimiter_1 = dist$b;
/**
 *  A transform stream that emits data after a newline delimiter is received.
 * @summary To use the `Readline` parser, provide a delimiter (defaults to `\n`). Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 */
class ReadlineParser extends parser_delimiter_1.DelimiterParser {
    constructor(options) {
        const opts = {
            delimiter: Buffer.from('\n', 'utf8'),
            encoding: 'utf8',
            ...options,
        };
        if (typeof opts.delimiter === 'string') {
            opts.delimiter = Buffer.from(opts.delimiter, opts.encoding);
        }
        super(opts);
    }
}
dist$8.ReadlineParser = ReadlineParser;

var dist$7 = {};

Object.defineProperty(dist$7, "__esModule", { value: true });
dist$7.ReadyParser = void 0;
const stream_1$7 = require$$0;
/**
 * A transform stream that waits for a sequence of "ready" bytes before emitting a ready event and emitting data events
 *
 * To use the `Ready` parser provide a byte start sequence. After the bytes have been received a ready event is fired and data events are passed through.
 */
class ReadyParser extends stream_1$7.Transform {
    constructor({ delimiter, ...options }) {
        if (delimiter === undefined) {
            throw new TypeError('"delimiter" is not a bufferable object');
        }
        if (delimiter.length === 0) {
            throw new TypeError('"delimiter" has a 0 or undefined length');
        }
        super(options);
        this.delimiter = Buffer.from(delimiter);
        this.readOffset = 0;
        this.ready = false;
    }
    _transform(chunk, encoding, cb) {
        if (this.ready) {
            this.push(chunk);
            return cb();
        }
        const delimiter = this.delimiter;
        let chunkOffset = 0;
        while (this.readOffset < delimiter.length && chunkOffset < chunk.length) {
            if (delimiter[this.readOffset] === chunk[chunkOffset]) {
                this.readOffset++;
            }
            else {
                this.readOffset = 0;
            }
            chunkOffset++;
        }
        if (this.readOffset === delimiter.length) {
            this.ready = true;
            this.emit('ready');
            const chunkRest = chunk.slice(chunkOffset);
            if (chunkRest.length > 0) {
                this.push(chunkRest);
            }
        }
        cb();
    }
}
dist$7.ReadyParser = ReadyParser;

var dist$6 = {};

Object.defineProperty(dist$6, "__esModule", { value: true });
dist$6.RegexParser = void 0;
const stream_1$6 = require$$0;
/**
 * A transform stream that uses a regular expression to split the incoming text upon.
 *
 * To use the `Regex` parser provide a regular expression to split the incoming text upon. Data is emitted as string controllable by the `encoding` option (defaults to `utf8`).
 */
class RegexParser extends stream_1$6.Transform {
    constructor({ regex, ...options }) {
        const opts = {
            encoding: 'utf8',
            ...options,
        };
        if (regex === undefined) {
            throw new TypeError('"options.regex" must be a regular expression pattern or object');
        }
        if (!(regex instanceof RegExp)) {
            regex = new RegExp(regex.toString());
        }
        super(opts);
        this.regex = regex;
        this.data = '';
    }
    _transform(chunk, encoding, cb) {
        const data = this.data + chunk;
        const parts = data.split(this.regex);
        this.data = parts.pop() || '';
        parts.forEach(part => {
            this.push(part);
        });
        cb();
    }
    _flush(cb) {
        this.push(this.data);
        this.data = '';
        cb();
    }
}
dist$6.RegexParser = RegexParser;

var dist$5 = {};

var decoder = {};

Object.defineProperty(decoder, "__esModule", { value: true });
decoder.SlipDecoder = void 0;
const stream_1$5 = require$$0;
/**
 * A transform stream that decodes slip encoded data.
 * @extends Transform
 *
 * Runs in O(n) time, stripping out slip encoding and emitting decoded data. Optionally custom slip escape and delimiters can be provided.
 */
class SlipDecoder extends stream_1$5.Transform {
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
const stream_1$4 = require$$0;
/**
 * A transform stream that emits SLIP-encoded data for each incoming packet.
 *
 * Runs in O(n) time, adding a 0xC0 character at the end of each
 * received packet and escaping characters, according to RFC 1055.
 */
class SlipEncoder extends stream_1$4.Transform {
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
} (dist$5));

var dist$4 = {};

var utils = {};

(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.convertHeaderBufferToObj = exports.HEADER_LENGTH = void 0;
	exports.HEADER_LENGTH = 6;
	/**
	 * For numbers less than 255, will ensure that their string representation is at least 8 characters long.
	 */
	const toOctetStr = (num) => {
	    let str = Number(num).toString(2);
	    while (str.length < 8) {
	        str = `0${str}`;
	    }
	    return str;
	};
	/**
	 * Converts a Buffer of any length to an Object representation of a Space Packet header, provided
	 * the received data is in the correct format.
	 * @param buf - The buffer containing the Space Packet Header Data
	 */
	const convertHeaderBufferToObj = (buf) => {
	    const headerStr = Array.from(buf.slice(0, exports.HEADER_LENGTH)).reduce((accum, curr) => `${accum}${toOctetStr(curr)}`, '');
	    const isVersion1 = headerStr.slice(0, 3) === '000';
	    const versionNumber = isVersion1 ? 1 : 'UNKNOWN_VERSION';
	    const type = Number(headerStr[3]);
	    const secondaryHeader = Number(headerStr[4]);
	    const apid = parseInt(headerStr.slice(5, 16), 2);
	    const sequenceFlags = parseInt(headerStr.slice(16, 18), 2);
	    const packetName = parseInt(headerStr.slice(18, 32), 2);
	    const dataLength = parseInt(headerStr.slice(-16), 2) + 1;
	    return {
	        versionNumber,
	        identification: {
	            apid,
	            secondaryHeader,
	            type,
	        },
	        sequenceControl: {
	            packetName,
	            sequenceFlags,
	        },
	        dataLength,
	    };
	};
	exports.convertHeaderBufferToObj = convertHeaderBufferToObj;
} (utils));

Object.defineProperty(dist$4, "__esModule", { value: true });
dist$4.SpacePacketParser = void 0;
const stream_1$3 = require$$0;
const utils_1 = utils;
/**
 * A Transform stream that accepts a stream of octet data and converts it into an object
 * representation of a CCSDS Space Packet. See https://public.ccsds.org/Pubs/133x0b2e1.pdf for a
 * description of the Space Packet format.
 */
class SpacePacketParser extends stream_1$3.Transform {
    /**
     * A Transform stream that accepts a stream of octet data and emits object representations of
     * CCSDS Space Packets once a packet has been completely received.
     * @param {Object} [options] Configuration options for the stream
     * @param {Number} options.timeCodeFieldLength The length of the time code field within the data
     * @param {Number} options.ancillaryDataFieldLength The length of the ancillary data field within the data
     */
    constructor(options = {}) {
        super({ ...options, objectMode: true });
        // Set the constants for this Space Packet Connection; these will help us parse incoming data
        // fields:
        this.timeCodeFieldLength = options.timeCodeFieldLength || 0;
        this.ancillaryDataFieldLength = options.ancillaryDataFieldLength || 0;
        this.dataSlice = this.timeCodeFieldLength + this.ancillaryDataFieldLength;
        // These are stateful based on the current packet being received:
        this.dataBuffer = Buffer.alloc(0);
        this.headerBuffer = Buffer.alloc(0);
        this.dataLength = 0;
        this.expectingHeader = true;
    }
    /**
     * Bundle the header, secondary header if present, and the data into a JavaScript object to emit.
     * If more data has been received past the current packet, begin the process of parsing the next
     * packet(s).
     */
    pushCompletedPacket() {
        if (!this.header) {
            throw new Error('Missing header');
        }
        const timeCode = Buffer.from(this.dataBuffer.slice(0, this.timeCodeFieldLength));
        const ancillaryData = Buffer.from(this.dataBuffer.slice(this.timeCodeFieldLength, this.timeCodeFieldLength + this.ancillaryDataFieldLength));
        const data = Buffer.from(this.dataBuffer.slice(this.dataSlice, this.dataLength));
        const completedPacket = {
            header: { ...this.header },
            data: data.toString(),
        };
        if (timeCode.length > 0 || ancillaryData.length > 0) {
            completedPacket.secondaryHeader = {};
            if (timeCode.length) {
                completedPacket.secondaryHeader.timeCode = timeCode.toString();
            }
            if (ancillaryData.length) {
                completedPacket.secondaryHeader.ancillaryData = ancillaryData.toString();
            }
        }
        this.push(completedPacket);
        // If there is an overflow (i.e. we have more data than the packet we just pushed) begin parsing
        // the next packet.
        const nextChunk = Buffer.from(this.dataBuffer.slice(this.dataLength));
        if (nextChunk.length >= utils_1.HEADER_LENGTH) {
            this.extractHeader(nextChunk);
        }
        else {
            this.headerBuffer = nextChunk;
            this.dataBuffer = Buffer.alloc(0);
            this.expectingHeader = true;
            this.dataLength = 0;
            this.header = undefined;
        }
    }
    /**
     * Build the Stream's headerBuffer property from the received Buffer chunk; extract data from it
     * if it's complete. If there's more to the chunk than just the header, initiate handling the
     * packet data.
     * @param chunk -  Build the Stream's headerBuffer property from
     */
    extractHeader(chunk) {
        const headerAsBuffer = Buffer.concat([this.headerBuffer, chunk]);
        const startOfDataBuffer = headerAsBuffer.slice(utils_1.HEADER_LENGTH);
        if (headerAsBuffer.length >= utils_1.HEADER_LENGTH) {
            this.header = (0, utils_1.convertHeaderBufferToObj)(headerAsBuffer);
            this.dataLength = this.header.dataLength;
            this.headerBuffer = Buffer.alloc(0);
            this.expectingHeader = false;
        }
        else {
            this.headerBuffer = headerAsBuffer;
        }
        if (startOfDataBuffer.length > 0) {
            this.dataBuffer = Buffer.from(startOfDataBuffer);
            if (this.dataBuffer.length >= this.dataLength) {
                this.pushCompletedPacket();
            }
        }
    }
    _transform(chunk, encoding, cb) {
        if (this.expectingHeader) {
            this.extractHeader(chunk);
        }
        else {
            this.dataBuffer = Buffer.concat([this.dataBuffer, chunk]);
            if (this.dataBuffer.length >= this.dataLength) {
                this.pushCompletedPacket();
            }
        }
        cb();
    }
    _flush(cb) {
        const remaining = Buffer.concat([this.headerBuffer, this.dataBuffer]);
        const remainingArray = Array.from(remaining);
        this.push(remainingArray);
        cb();
    }
}
dist$4.SpacePacketParser = SpacePacketParser;

var serialportMock = {};

var dist$3 = {};

var src = {exports: {}};

var browser = {exports: {}};

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

/* eslint-env browser */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug');
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof process !== 'undefined' && 'env' in process) {
				r = process.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		};
} (browser, browser.exports));
	return browser.exports;
}

var node = {exports: {}};

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		const tty = require$$0$1;
		const util = require$$1;

		/**
		 * This is the Node.js implementation of `debug()`.
		 */

		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.destroy = util.deprecate(
			() => {},
			'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
		);

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		try {
			// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
			// eslint-disable-next-line import/no-extraneous-dependencies
			const supportsColor = require('supports-color');

			if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
				exports.colors = [
					20,
					21,
					26,
					27,
					32,
					33,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					56,
					57,
					62,
					63,
					68,
					69,
					74,
					75,
					76,
					77,
					78,
					79,
					80,
					81,
					92,
					93,
					98,
					99,
					112,
					113,
					128,
					129,
					134,
					135,
					148,
					149,
					160,
					161,
					162,
					163,
					164,
					165,
					166,
					167,
					168,
					169,
					170,
					171,
					172,
					173,
					178,
					179,
					184,
					185,
					196,
					197,
					198,
					199,
					200,
					201,
					202,
					203,
					204,
					205,
					206,
					207,
					208,
					209,
					214,
					215,
					220,
					221
				];
			}
		} catch (error) {
			// Swallow - we only care if `supports-color` is available; it doesn't have to be.
		}

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(key => {
			return /^debug_/i.test(key);
		}).reduce((obj, key) => {
			// Camel-case
			const prop = key
				.substring(6)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, k) => {
					return k.toUpperCase();
				});

			// Coerce string value into JS value
			let val = process.env[key];
			if (/^(yes|on|true|enabled)$/i.test(val)) {
				val = true;
			} else if (/^(no|off|false|disabled)$/i.test(val)) {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else {
				val = Number(val);
			}

			obj[prop] = val;
			return obj;
		}, {});

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
			return 'colors' in exports.inspectOpts ?
				Boolean(exports.inspectOpts.colors) :
				tty.isatty(process.stderr.fd);
		}

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			const {namespace: name, useColors} = this;

			if (useColors) {
				const c = this.color;
				const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split('\n').join('\n' + prefix);
				args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
			} else {
				args[0] = getDate() + name + ' ' + args[0];
			}
		}

		function getDate() {
			if (exports.inspectOpts.hideDate) {
				return '';
			}
			return new Date().toISOString() + ' ';
		}

		/**
		 * Invokes `util.format()` with the specified arguments and writes to stderr.
		 */

		function log(...args) {
			return process.stderr.write(util.format(...args) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			if (namespaces) {
				process.env.DEBUG = namespaces;
			} else {
				// If you set a process.env field to null or undefined, it gets cast to the
				// string 'null' or 'undefined'. Just delete instead.
				delete process.env.DEBUG;
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
			return process.env.DEBUG;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init(debug) {
			debug.inspectOpts = {};

			const keys = Object.keys(exports.inspectOpts);
			for (let i = 0; i < keys.length; i++) {
				debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		formatters.o = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts)
				.split('\n')
				.map(str => str.trim())
				.join(' ');
		};

		/**
		 * Map %O to `util.inspect()`, allowing multiple lines if needed.
		 */

		formatters.O = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts);
		};
} (node, node.exports));
	return node.exports;
}

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

(function (module) {
	if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
		module.exports = requireBrowser();
	} else {
		module.exports = requireNode();
	}
} (src));

var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(dist$3, "__esModule", { value: true });
dist$3.SerialPortStream = dist$3.DisconnectedError = void 0;
const stream_1$2 = require$$0;
const debug_1$2 = __importDefault$3(src.exports);
const debug$3 = (0, debug_1$2.default)('serialport/stream');
class DisconnectedError extends Error {
    constructor(message) {
        super(message);
        this.disconnected = true;
    }
}
dist$3.DisconnectedError = DisconnectedError;
const defaultSetFlags = {
    brk: false,
    cts: false,
    dtr: true,
    rts: true,
};
function allocNewReadPool(poolSize) {
    const pool = Buffer.allocUnsafe(poolSize);
    pool.used = 0;
    return pool;
}
class SerialPortStream extends stream_1$2.Duplex {
    /**
     * Create a new serial port object for the `path`. In the case of invalid arguments or invalid options, when constructing a new SerialPort it will throw an error. The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in the next tick. You can disable this by setting the option `autoOpen` to `false`.
     * @emits open
     * @emits data
     * @emits close
     * @emits error
     */
    constructor(options, openCallback) {
        const settings = {
            autoOpen: true,
            endOnClose: false,
            highWaterMark: 64 * 1024,
            ...options,
        };
        super({
            highWaterMark: settings.highWaterMark,
        });
        if (!settings.binding) {
            throw new TypeError('"Bindings" is invalid pass it as `options.binding`');
        }
        if (!settings.path) {
            throw new TypeError(`"path" is not defined: ${settings.path}`);
        }
        if (typeof settings.baudRate !== 'number') {
            throw new TypeError(`"baudRate" must be a number: ${settings.baudRate}`);
        }
        this.settings = settings;
        this.opening = false;
        this.closing = false;
        this._pool = allocNewReadPool(this.settings.highWaterMark);
        this._kMinPoolSpace = 128;
        if (this.settings.autoOpen) {
            this.open(openCallback);
        }
    }
    get path() {
        return this.settings.path;
    }
    get baudRate() {
        return this.settings.baudRate;
    }
    get isOpen() {
        var _a, _b;
        return ((_b = (_a = this.port) === null || _a === void 0 ? void 0 : _a.isOpen) !== null && _b !== void 0 ? _b : false) && !this.closing;
    }
    _error(error, callback) {
        if (callback) {
            callback.call(this, error);
        }
        else {
            this.emit('error', error);
        }
    }
    _asyncError(error, callback) {
        process.nextTick(() => this._error(error, callback));
    }
    /**
     * Opens a connection to the given serial port.
     * @param {ErrorCallback=} openCallback - Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event.
     * @emits open
     */
    open(openCallback) {
        if (this.isOpen) {
            return this._asyncError(new Error('Port is already open'), openCallback);
        }
        if (this.opening) {
            return this._asyncError(new Error('Port is opening'), openCallback);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { highWaterMark, binding, autoOpen, endOnClose, ...openOptions } = this.settings;
        this.opening = true;
        debug$3('opening', `path: ${this.path}`);
        this.settings.binding.open(openOptions).then(port => {
            debug$3('opened', `path: ${this.path}`);
            this.port = port;
            this.opening = false;
            this.emit('open');
            if (openCallback) {
                openCallback.call(this, null);
            }
        }, err => {
            this.opening = false;
            debug$3('Binding #open had an error', err);
            this._error(err, openCallback);
        });
    }
    /**
     * Changes the baud rate for an open port. Emits an error or calls the callback if the baud rate isn't supported.
     * @param {object=} options Only supports `baudRate`.
     * @param {number=} [options.baudRate] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
     * @param {ErrorCallback=} [callback] Called once the port's baud rate changes. If `.update` is called without a callback, and there is an error, an error event is emitted.
     * @returns {undefined}
     */
    update(options, callback) {
        if (!this.isOpen || !this.port) {
            debug$3('update attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        debug$3('update', `baudRate: ${options.baudRate}`);
        this.port.update(options).then(() => {
            debug$3('binding.update', 'finished');
            this.settings.baudRate = options.baudRate;
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug$3('binding.update', 'error', err);
            return this._error(err, callback);
        });
    }
    write(data, encoding, callback) {
        if (Array.isArray(data)) {
            data = Buffer.from(data);
        }
        if (typeof encoding === 'function') {
            return super.write(data, encoding);
        }
        return super.write(data, encoding, callback);
    }
    _write(data, encoding, callback) {
        if (!this.isOpen || !this.port) {
            this.once('open', () => {
                this._write(data, encoding, callback);
            });
            return;
        }
        debug$3('_write', `${data.length} bytes of data`);
        this.port.write(data).then(() => {
            debug$3('binding.write', 'write finished');
            callback(null);
        }, err => {
            debug$3('binding.write', 'error', err);
            if (!err.canceled) {
                this._disconnected(err);
            }
            callback(err);
        });
    }
    _writev(data, callback) {
        debug$3('_writev', `${data.length} chunks of data`);
        const dataV = data.map(write => write.chunk);
        this._write(Buffer.concat(dataV), undefined, callback);
    }
    _read(bytesToRead) {
        if (!this.isOpen || !this.port) {
            debug$3('_read', 'queueing _read for after open');
            this.once('open', () => {
                this._read(bytesToRead);
            });
            return;
        }
        if (!this._pool || this._pool.length - this._pool.used < this._kMinPoolSpace) {
            debug$3('_read', 'discarding the read buffer pool because it is below kMinPoolSpace');
            this._pool = allocNewReadPool(this.settings.highWaterMark);
        }
        // Grab another reference to the pool in the case that while we're
        // in the thread pool another read() finishes up the pool, and
        // allocates a new one.
        const pool = this._pool;
        // Read the smaller of rest of the pool or however many bytes we want
        const toRead = Math.min(pool.length - pool.used, bytesToRead);
        const start = pool.used;
        // the actual read.
        debug$3('_read', `reading`, { start, toRead });
        this.port.read(pool, start, toRead).then(({ bytesRead }) => {
            debug$3('binding.read', `finished`, { bytesRead });
            // zero bytes means read means we've hit EOF? Maybe this should be an error
            if (bytesRead === 0) {
                debug$3('binding.read', 'Zero bytes read closing readable stream');
                this.push(null);
                return;
            }
            pool.used += bytesRead;
            this.push(pool.slice(start, start + bytesRead));
        }, err => {
            debug$3('binding.read', `error`, err);
            if (!err.canceled) {
                this._disconnected(err);
            }
            this._read(bytesToRead); // prime to read more once we're reconnected
        });
    }
    _disconnected(err) {
        if (!this.isOpen) {
            debug$3('disconnected aborted because already closed', err);
            return;
        }
        debug$3('disconnected', err);
        this.close(undefined, new DisconnectedError(err.message));
    }
    /**
     * Closes an open connection.
     *
     * If there are in progress writes when the port is closed the writes will error.
     * @param {ErrorCallback} callback Called once a connection is closed.
     * @param {Error} disconnectError used internally to propagate a disconnect error
     */
    close(callback, disconnectError = null) {
        if (!this.isOpen || !this.port) {
            debug$3('close attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        this.closing = true;
        debug$3('#close');
        this.port.close().then(() => {
            this.closing = false;
            debug$3('binding.close', 'finished');
            this.emit('close', disconnectError);
            if (this.settings.endOnClose) {
                this.emit('end');
            }
            if (callback) {
                callback.call(this, disconnectError);
            }
        }, err => {
            this.closing = false;
            debug$3('binding.close', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for OS X and Linux.
     *
     * All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options is used.
     */
    set(options, callback) {
        if (!this.isOpen || !this.port) {
            debug$3('set attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        const settings = { ...defaultSetFlags, ...options };
        debug$3('#set', settings);
        this.port.set(settings).then(() => {
            debug$3('binding.set', 'finished');
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug$3('binding.set', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Returns the control flags (CTS, DSR, DCD) on the open port.
     * Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
     */
    get(callback) {
        if (!this.isOpen || !this.port) {
            debug$3('get attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        debug$3('#get');
        this.port.get().then(status => {
            debug$3('binding.get', 'finished');
            callback.call(this, null, status);
        }, err => {
            debug$3('binding.get', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Flush discards data received but not read, and written but not transmitted by the operating system. For more technical details, see [`tcflush(fd, TCIOFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.
     */
    flush(callback) {
        if (!this.isOpen || !this.port) {
            debug$3('flush attempted, but port is not open');
            return this._asyncError(new Error('Port is not open'), callback);
        }
        debug$3('#flush');
        this.port.flush().then(() => {
            debug$3('binding.flush', 'finished');
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug$3('binding.flush', 'had an error', err);
            return this._error(err, callback);
        });
    }
    /**
     * Waits until all output data is transmitted to the serial port. After any pending write has completed it calls [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) to ensure it has been written to the device.
    * @example
    Write the `data` and wait until it has finished transmitting to the target serial port before calling the callback. This will queue until the port is open and writes are finished.
  
    ```js
    function writeAndDrain (data, callback) {
      port.write(data);
      port.drain(callback);
    }
    ```
    */
    drain(callback) {
        debug$3('drain');
        if (!this.isOpen || !this.port) {
            debug$3('drain queuing on port open');
            this.once('open', () => {
                this.drain(callback);
            });
            return;
        }
        this.port.drain().then(() => {
            debug$3('binding.drain', 'finished');
            if (callback) {
                callback.call(this, null);
            }
        }, err => {
            debug$3('binding.drain', 'had an error', err);
            return this._error(err, callback);
        });
    }
}
dist$3.SerialPortStream = SerialPortStream;

var dist$2 = {};

Object.defineProperty(dist$2, '__esModule', { value: true });

var debugFactory = src.exports;

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var debugFactory__default = /*#__PURE__*/_interopDefaultLegacy(debugFactory);

const debug$2 = debugFactory__default["default"]('serialport/binding-mock');
let ports = {};
let serialNumber = 0;
function resolveNextTick() {
    return new Promise(resolve => process.nextTick(() => resolve()));
}
class CanceledError extends Error {
    constructor(message) {
        super(message);
        this.canceled = true;
    }
}
const MockBinding = {
    reset() {
        ports = {};
        serialNumber = 0;
    },
    // Create a mock port
    createPort(path, options = {}) {
        serialNumber++;
        const optWithDefaults = Object.assign({ echo: false, record: false, manufacturer: 'The J5 Robotics Company', vendorId: undefined, productId: undefined, maxReadSize: 1024 }, options);
        ports[path] = {
            data: Buffer.alloc(0),
            echo: optWithDefaults.echo,
            record: optWithDefaults.record,
            readyData: optWithDefaults.readyData,
            maxReadSize: optWithDefaults.maxReadSize,
            info: {
                path,
                manufacturer: optWithDefaults.manufacturer,
                serialNumber: `${serialNumber}`,
                pnpId: undefined,
                locationId: undefined,
                vendorId: optWithDefaults.vendorId,
                productId: optWithDefaults.productId,
            },
        };
        debug$2(serialNumber, 'created port', JSON.stringify({ path, opt: options }));
    },
    async list() {
        debug$2(null, 'list');
        return Object.values(ports).map(port => port.info);
    },
    async open(options) {
        var _a;
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('"options" is not an object');
        }
        if (!options.path) {
            throw new TypeError('"path" is not a valid port');
        }
        if (!options.baudRate) {
            throw new TypeError('"baudRate" is not a valid baudRate');
        }
        const openOptions = Object.assign({ dataBits: 8, lock: true, stopBits: 1, parity: 'none', rtscts: false, xon: false, xoff: false, xany: false, hupcl: true }, options);
        const { path } = openOptions;
        debug$2(null, `open: opening path ${path}`);
        const port = ports[path];
        await resolveNextTick();
        if (!port) {
            throw new Error(`Port does not exist - please call MockBinding.createPort('${path}') first`);
        }
        const serialNumber = port.info.serialNumber;
        if ((_a = port.openOpt) === null || _a === void 0 ? void 0 : _a.lock) {
            debug$2(serialNumber, 'open: Port is locked cannot open');
            throw new Error('Port is locked cannot open');
        }
        debug$2(serialNumber, `open: opened path ${path}`);
        port.openOpt = Object.assign({}, openOptions);
        return new MockPortBinding(port, openOptions);
    },
};
/**
 * Mock bindings for pretend serialport access
 */
class MockPortBinding {
    constructor(port, openOptions) {
        this.port = port;
        this.openOptions = openOptions;
        this.pendingRead = null;
        this.isOpen = true;
        this.lastWrite = null;
        this.recording = Buffer.alloc(0);
        this.writeOperation = null; // in flight promise or null
        this.serialNumber = port.info.serialNumber;
        if (port.readyData) {
            const data = port.readyData;
            process.nextTick(() => {
                if (this.isOpen) {
                    debug$2(this.serialNumber, 'emitting ready data');
                    this.emitData(data);
                }
            });
        }
    }
    // Emit data on a mock port
    emitData(data) {
        if (!this.isOpen || !this.port) {
            throw new Error('Port must be open to pretend to receive data');
        }
        const bufferData = Buffer.isBuffer(data) ? data : Buffer.from(data);
        debug$2(this.serialNumber, 'emitting data - pending read:', Boolean(this.pendingRead));
        this.port.data = Buffer.concat([this.port.data, bufferData]);
        if (this.pendingRead) {
            process.nextTick(this.pendingRead);
            this.pendingRead = null;
        }
    }
    async close() {
        debug$2(this.serialNumber, 'close');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        const port = this.port;
        if (!port) {
            throw new Error('already closed');
        }
        port.openOpt = undefined;
        // reset data on close
        port.data = Buffer.alloc(0);
        debug$2(this.serialNumber, 'port is closed');
        this.serialNumber = undefined;
        this.isOpen = false;
        if (this.pendingRead) {
            this.pendingRead(new CanceledError('port is closed'));
        }
    }
    async read(buffer, offset, length) {
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError('"buffer" is not a Buffer');
        }
        if (typeof offset !== 'number' || isNaN(offset)) {
            throw new TypeError(`"offset" is not an integer got "${isNaN(offset) ? 'NaN' : typeof offset}"`);
        }
        if (typeof length !== 'number' || isNaN(length)) {
            throw new TypeError(`"length" is not an integer got "${isNaN(length) ? 'NaN' : typeof length}"`);
        }
        if (buffer.length < offset + length) {
            throw new Error('buffer is too small');
        }
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        debug$2(this.serialNumber, 'read', length, 'bytes');
        await resolveNextTick();
        if (!this.isOpen || !this.port) {
            throw new CanceledError('Read canceled');
        }
        if (this.port.data.length <= 0) {
            return new Promise((resolve, reject) => {
                this.pendingRead = err => {
                    if (err) {
                        return reject(err);
                    }
                    this.read(buffer, offset, length).then(resolve, reject);
                };
            });
        }
        const lengthToRead = this.port.maxReadSize > length ? length : this.port.maxReadSize;
        const data = this.port.data.slice(0, lengthToRead);
        const bytesRead = data.copy(buffer, offset);
        this.port.data = this.port.data.slice(lengthToRead);
        debug$2(this.serialNumber, 'read', bytesRead, 'bytes');
        return { bytesRead, buffer };
    }
    async write(buffer) {
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError('"buffer" is not a Buffer');
        }
        if (!this.isOpen || !this.port) {
            debug$2('write', 'error port is not open');
            throw new Error('Port is not open');
        }
        debug$2(this.serialNumber, 'write', buffer.length, 'bytes');
        if (this.writeOperation) {
            throw new Error('Overlapping writes are not supported and should be queued by the serialport object');
        }
        this.writeOperation = (async () => {
            await resolveNextTick();
            if (!this.isOpen || !this.port) {
                throw new Error('Write canceled');
            }
            const data = (this.lastWrite = Buffer.from(buffer)); // copy
            if (this.port.record) {
                this.recording = Buffer.concat([this.recording, data]);
            }
            if (this.port.echo) {
                process.nextTick(() => {
                    if (this.isOpen) {
                        this.emitData(data);
                    }
                });
            }
            this.writeOperation = null;
            debug$2(this.serialNumber, 'writing finished');
        })();
        return this.writeOperation;
    }
    async update(options) {
        if (typeof options !== 'object') {
            throw TypeError('"options" is not an object');
        }
        if (typeof options.baudRate !== 'number') {
            throw new TypeError('"options.baudRate" is not a number');
        }
        debug$2(this.serialNumber, 'update');
        if (!this.isOpen || !this.port) {
            throw new Error('Port is not open');
        }
        await resolveNextTick();
        if (this.port.openOpt) {
            this.port.openOpt.baudRate = options.baudRate;
        }
    }
    async set(options) {
        if (typeof options !== 'object') {
            throw new TypeError('"options" is not an object');
        }
        debug$2(this.serialNumber, 'set');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await resolveNextTick();
    }
    async get() {
        debug$2(this.serialNumber, 'get');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await resolveNextTick();
        return {
            cts: true,
            dsr: false,
            dcd: false,
        };
    }
    async getBaudRate() {
        var _a;
        debug$2(this.serialNumber, 'getBaudRate');
        if (!this.isOpen || !this.port) {
            throw new Error('Port is not open');
        }
        await resolveNextTick();
        if (!((_a = this.port.openOpt) === null || _a === void 0 ? void 0 : _a.baudRate)) {
            throw new Error('Internal Error');
        }
        return {
            baudRate: this.port.openOpt.baudRate,
        };
    }
    async flush() {
        debug$2(this.serialNumber, 'flush');
        if (!this.isOpen || !this.port) {
            throw new Error('Port is not open');
        }
        await resolveNextTick();
        this.port.data = Buffer.alloc(0);
    }
    async drain() {
        debug$2(this.serialNumber, 'drain');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await this.writeOperation;
        await resolveNextTick();
    }
}

dist$2.CanceledError = CanceledError;
dist$2.MockBinding = MockBinding;
dist$2.MockPortBinding = MockPortBinding;

Object.defineProperty(serialportMock, "__esModule", { value: true });
serialportMock.SerialPortMock = void 0;
const stream_1$1 = dist$3;
const binding_mock_1 = dist$2;
class SerialPortMock extends stream_1$1.SerialPortStream {
    constructor(options, openCallback) {
        const opts = {
            binding: binding_mock_1.MockBinding,
            ...options,
        };
        super(opts, openCallback);
    }
}
serialportMock.SerialPortMock = SerialPortMock;
SerialPortMock.list = binding_mock_1.MockBinding.list;
SerialPortMock.binding = binding_mock_1.MockBinding;

var serialport = {};

var dist$1 = {};

var darwin = {};

var loadBindings = {};

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var fs = require$$0$2;
var path = path__default;
var os = require$$2;

// Workaround to fix webpack's build warnings: 'the request of a dependency is an expression'
var runtimeRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : commonjsRequire; // eslint-disable-line

var vars = (process.config && process.config.variables) || {};
var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
var abi = process.versions.modules; // TODO: support old node where this is undef
var runtime = isElectron() ? 'electron' : (isNwjs() ? 'node-webkit' : 'node');

var arch = process.env.npm_config_arch || os.arch();
var platform = process.env.npm_config_platform || os.platform();
var libc = process.env.LIBC || (isAlpine(platform) ? 'musl' : 'glibc');
var armv = process.env.ARM_VERSION || (arch === 'arm64' ? '8' : vars.arm_version) || '';
var uv = (process.versions.uv || '').split('.')[0];

var nodeGypBuild = load;

function load (dir) {
  return runtimeRequire(load.path(dir))
}

load.path = function (dir) {
  dir = path.resolve(dir || '.');

  try {
    var name = runtimeRequire(path.join(dir, 'package.json')).name.toUpperCase().replace(/-/g, '_');
    if (process.env[name + '_PREBUILD']) dir = process.env[name + '_PREBUILD'];
  } catch (err) {}

  if (!prebuildsOnly) {
    var release = getFirst(path.join(dir, 'build/Release'), matchBuild);
    if (release) return release

    var debug = getFirst(path.join(dir, 'build/Debug'), matchBuild);
    if (debug) return debug
  }

  var prebuild = resolve(dir);
  if (prebuild) return prebuild

  var nearby = resolve(path.dirname(process.execPath));
  if (nearby) return nearby

  var target = [
    'platform=' + platform,
    'arch=' + arch,
    'runtime=' + runtime,
    'abi=' + abi,
    'uv=' + uv,
    armv ? 'armv=' + armv : '',
    'libc=' + libc,
    'node=' + process.versions.node,
    process.versions.electron ? 'electron=' + process.versions.electron : '',
    typeof __webpack_require__ === 'function' ? 'webpack=true' : '' // eslint-disable-line
  ].filter(Boolean).join(' ');

  throw new Error('No native build was found for ' + target + '\n    loaded from: ' + dir + '\n')

  function resolve (dir) {
    // Find matching "prebuilds/<platform>-<arch>" directory
    var tuples = readdirSync(path.join(dir, 'prebuilds')).map(parseTuple);
    var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
    if (!tuple) return

    // Find most specific flavor first
    var prebuilds = path.join(dir, 'prebuilds', tuple.name);
    var parsed = readdirSync(prebuilds).map(parseTags);
    var candidates = parsed.filter(matchTags(runtime, abi));
    var winner = candidates.sort(compareTags(runtime))[0];
    if (winner) return path.join(prebuilds, winner.file)
  }
};

function readdirSync (dir) {
  try {
    return fs.readdirSync(dir)
  } catch (err) {
    return []
  }
}

function getFirst (dir, filter) {
  var files = readdirSync(dir).filter(filter);
  return files[0] && path.join(dir, files[0])
}

function matchBuild (name) {
  return /\.node$/.test(name)
}

function parseTuple (name) {
  // Example: darwin-x64+arm64
  var arr = name.split('-');
  if (arr.length !== 2) return

  var platform = arr[0];
  var architectures = arr[1].split('+');

  if (!platform) return
  if (!architectures.length) return
  if (!architectures.every(Boolean)) return

  return { name, platform, architectures }
}

function matchTuple (platform, arch) {
  return function (tuple) {
    if (tuple == null) return false
    if (tuple.platform !== platform) return false
    return tuple.architectures.includes(arch)
  }
}

function compareTuples (a, b) {
  // Prefer single-arch prebuilds over multi-arch
  return a.architectures.length - b.architectures.length
}

function parseTags (file) {
  var arr = file.split('.');
  var extension = arr.pop();
  var tags = { file: file, specificity: 0 };

  if (extension !== 'node') return

  for (var i = 0; i < arr.length; i++) {
    var tag = arr[i];

    if (tag === 'node' || tag === 'electron' || tag === 'node-webkit') {
      tags.runtime = tag;
    } else if (tag === 'napi') {
      tags.napi = true;
    } else if (tag.slice(0, 3) === 'abi') {
      tags.abi = tag.slice(3);
    } else if (tag.slice(0, 2) === 'uv') {
      tags.uv = tag.slice(2);
    } else if (tag.slice(0, 4) === 'armv') {
      tags.armv = tag.slice(4);
    } else if (tag === 'glibc' || tag === 'musl') {
      tags.libc = tag;
    } else {
      continue
    }

    tags.specificity++;
  }

  return tags
}

function matchTags (runtime, abi) {
  return function (tags) {
    if (tags == null) return false
    if (tags.runtime !== runtime && !runtimeAgnostic(tags)) return false
    if (tags.abi !== abi && !tags.napi) return false
    if (tags.uv && tags.uv !== uv) return false
    if (tags.armv && tags.armv !== armv) return false
    if (tags.libc && tags.libc !== libc) return false

    return true
  }
}

function runtimeAgnostic (tags) {
  return tags.runtime === 'node' && tags.napi
}

function compareTags (runtime) {
  // Precedence: non-agnostic runtime, abi over napi, then by specificity.
  return function (a, b) {
    if (a.runtime !== b.runtime) {
      return a.runtime === runtime ? -1 : 1
    } else if (a.abi !== b.abi) {
      return a.abi ? -1 : 1
    } else if (a.specificity !== b.specificity) {
      return a.specificity > b.specificity ? -1 : 1
    } else {
      return 0
    }
  }
}

function isNwjs () {
  return !!(process.versions && process.versions.nw)
}

function isElectron () {
  if (process.versions && process.versions.electron) return true
  if (process.env.ELECTRON_RUN_AS_NODE) return true
  return typeof window !== 'undefined' && window.process && window.process.type === 'renderer'
}

function isAlpine (platform) {
  return platform === 'linux' && fs.existsSync('/etc/alpine-release')
}

// Exposed for unit tests
// TODO: move to lib
load.parseTags = parseTags;
load.matchTags = matchTags;
load.compareTags = compareTags;
load.parseTuple = parseTuple;
load.matchTuple = matchTuple;
load.compareTuples = compareTuples;

var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(loadBindings, "__esModule", { value: true });
loadBindings.asyncWrite = loadBindings.asyncRead = loadBindings.asyncUpdate = loadBindings.asyncSet = loadBindings.asyncOpen = loadBindings.asyncList = loadBindings.asyncGetBaudRate = loadBindings.asyncGet = loadBindings.asyncFlush = loadBindings.asyncDrain = loadBindings.asyncClose = void 0;
const node_gyp_build_1 = __importDefault$2(nodeGypBuild);
const util_1 = require$$1;
const path_1 = path__default;
const binding = (0, node_gyp_build_1.default)((0, path_1.join)(__dirname, '../'));
loadBindings.asyncClose = binding.close ? (0, util_1.promisify)(binding.close) : async () => { throw new Error('"binding.close" Method not implemented'); };
loadBindings.asyncDrain = binding.drain ? (0, util_1.promisify)(binding.drain) : async () => { throw new Error('"binding.drain" Method not implemented'); };
loadBindings.asyncFlush = binding.flush ? (0, util_1.promisify)(binding.flush) : async () => { throw new Error('"binding.flush" Method not implemented'); };
loadBindings.asyncGet = binding.get ? (0, util_1.promisify)(binding.get) : async () => { throw new Error('"binding.get" Method not implemented'); };
loadBindings.asyncGetBaudRate = binding.getBaudRate ? (0, util_1.promisify)(binding.getBaudRate) : async () => { throw new Error('"binding.getBaudRate" Method not implemented'); };
loadBindings.asyncList = binding.list ? (0, util_1.promisify)(binding.list) : async () => { throw new Error('"binding.list" Method not implemented'); };
loadBindings.asyncOpen = binding.open ? (0, util_1.promisify)(binding.open) : async () => { throw new Error('"binding.open" Method not implemented'); };
loadBindings.asyncSet = binding.set ? (0, util_1.promisify)(binding.set) : async () => { throw new Error('"binding.set" Method not implemented'); };
loadBindings.asyncUpdate = binding.update ? (0, util_1.promisify)(binding.update) : async () => { throw new Error('"binding.update" Method not implemented'); };
loadBindings.asyncRead = binding.read ? (0, util_1.promisify)(binding.read) : async () => { throw new Error('"binding.read" Method not implemented'); };
loadBindings.asyncWrite = binding.read ? (0, util_1.promisify)(binding.write) : async () => { throw new Error('"binding.write" Method not implemented'); };

var poller = {};

var errors = {};

Object.defineProperty(errors, "__esModule", { value: true });
errors.BindingsError = void 0;
class BindingsError extends Error {
    constructor(message, { canceled = false } = {}) {
        super(message);
        this.canceled = canceled;
    }
}
errors.BindingsError = BindingsError;

(function (exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Poller = exports.EVENTS = void 0;
	const debug_1 = __importDefault(src.exports);
	const events_1 = require$$1$1;
	const path_1 = path__default;
	const node_gyp_build_1 = __importDefault(nodeGypBuild);
	const errors_1 = errors;
	const { Poller: PollerBindings } = (0, node_gyp_build_1.default)((0, path_1.join)(__dirname, '../'));
	const logger = (0, debug_1.default)('serialport/bindings-cpp/poller');
	exports.EVENTS = {
	    UV_READABLE: 0b0001,
	    UV_WRITABLE: 0b0010,
	    UV_DISCONNECT: 0b0100,
	};
	function handleEvent(error, eventFlag) {
	    if (error) {
	        logger('error', error);
	        this.emit('readable', error);
	        this.emit('writable', error);
	        this.emit('disconnect', error);
	        return;
	    }
	    if (eventFlag & exports.EVENTS.UV_READABLE) {
	        logger('received "readable"');
	        this.emit('readable', null);
	    }
	    if (eventFlag & exports.EVENTS.UV_WRITABLE) {
	        logger('received "writable"');
	        this.emit('writable', null);
	    }
	    if (eventFlag & exports.EVENTS.UV_DISCONNECT) {
	        logger('received "disconnect"');
	        this.emit('disconnect', null);
	    }
	}
	/**
	 * Polls unix systems for readable or writable states of a file or serialport
	 */
	class Poller extends events_1.EventEmitter {
	    constructor(fd, FDPoller = PollerBindings) {
	        logger('Creating poller');
	        super();
	        this.poller = new FDPoller(fd, handleEvent.bind(this));
	    }
	    /**
	     * Wait for the next event to occur
	     * @param {string} event ('readable'|'writable'|'disconnect')
	     * @returns {Poller} returns itself
	     */
	    once(event, callback) {
	        switch (event) {
	            case 'readable':
	                this.poll(exports.EVENTS.UV_READABLE);
	                break;
	            case 'writable':
	                this.poll(exports.EVENTS.UV_WRITABLE);
	                break;
	            case 'disconnect':
	                this.poll(exports.EVENTS.UV_DISCONNECT);
	                break;
	        }
	        return super.once(event, callback);
	    }
	    /**
	     * Ask the bindings to listen for an event, it is recommend to use `.once()` for easy use
	     * @param {EVENTS} eventFlag polls for an event or group of events based upon a flag.
	     */
	    poll(eventFlag = 0) {
	        if (eventFlag & exports.EVENTS.UV_READABLE) {
	            logger('Polling for "readable"');
	        }
	        if (eventFlag & exports.EVENTS.UV_WRITABLE) {
	            logger('Polling for "writable"');
	        }
	        if (eventFlag & exports.EVENTS.UV_DISCONNECT) {
	            logger('Polling for "disconnect"');
	        }
	        this.poller.poll(eventFlag);
	    }
	    /**
	     * Stop listening for events and cancel all outstanding listening with an error
	     */
	    stop() {
	        logger('Stopping poller');
	        this.poller.stop();
	        this.emitCanceled();
	    }
	    destroy() {
	        logger('Destroying poller');
	        this.poller.destroy();
	        this.emitCanceled();
	    }
	    emitCanceled() {
	        const err = new errors_1.BindingsError('Canceled', { canceled: true });
	        this.emit('readable', err);
	        this.emit('writable', err);
	        this.emit('disconnect', err);
	    }
	}
	exports.Poller = Poller;
} (poller));

var unixRead = {};

(function (exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unixRead = void 0;
	const util_1 = require$$1;
	const fs_1 = require$$0$2;
	const errors_1 = errors;
	const debug_1 = __importDefault(src.exports);
	const logger = (0, debug_1.default)('serialport/bindings-cpp/unixRead');
	const readAsync = (0, util_1.promisify)(fs_1.read);
	const readable = (binding) => {
	    return new Promise((resolve, reject) => {
	        if (!binding.poller) {
	            throw new Error('No poller on bindings');
	        }
	        binding.poller.once('readable', err => (err ? reject(err) : resolve()));
	    });
	};
	const unixRead = async ({ binding, buffer, offset, length, fsReadAsync = readAsync, }) => {
	    logger('Starting read');
	    if (!binding.isOpen || !binding.fd) {
	        throw new errors_1.BindingsError('Port is not open', { canceled: true });
	    }
	    try {
	        const { bytesRead } = await fsReadAsync(binding.fd, buffer, offset, length, null);
	        if (bytesRead === 0) {
	            return (0, exports.unixRead)({ binding, buffer, offset, length, fsReadAsync });
	        }
	        logger('Finished read', bytesRead, 'bytes');
	        return { bytesRead, buffer };
	    }
	    catch (err) {
	        logger('read error', err);
	        if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
	            if (!binding.isOpen) {
	                throw new errors_1.BindingsError('Port is not open', { canceled: true });
	            }
	            logger('waiting for readable because of code:', err.code);
	            await readable(binding);
	            return (0, exports.unixRead)({ binding, buffer, offset, length, fsReadAsync });
	        }
	        const disconnectError = err.code === 'EBADF' || // Bad file number means we got closed
	            err.code === 'ENXIO' || // No such device or address probably usb disconnect
	            err.code === 'UNKNOWN' ||
	            err.errno === -1; // generic error
	        if (disconnectError) {
	            err.disconnect = true;
	            logger('disconnecting', err);
	        }
	        throw err;
	    }
	};
	exports.unixRead = unixRead;
} (unixRead));

var unixWrite = {};

(function (exports) {
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unixWrite = void 0;
	const fs_1 = require$$0$2;
	const debug_1 = __importDefault(src.exports);
	const util_1 = require$$1;
	const logger = (0, debug_1.default)('serialport/bindings-cpp/unixWrite');
	const writeAsync = (0, util_1.promisify)(fs_1.write);
	const writable = (binding) => {
	    return new Promise((resolve, reject) => {
	        binding.poller.once('writable', err => (err ? reject(err) : resolve()));
	    });
	};
	const unixWrite = async ({ binding, buffer, offset = 0, fsWriteAsync = writeAsync }) => {
	    const bytesToWrite = buffer.length - offset;
	    logger('Starting write', buffer.length, 'bytes offset', offset, 'bytesToWrite', bytesToWrite);
	    if (!binding.isOpen || !binding.fd) {
	        throw new Error('Port is not open');
	    }
	    try {
	        const { bytesWritten } = await fsWriteAsync(binding.fd, buffer, offset, bytesToWrite);
	        logger('write returned: wrote', bytesWritten, 'bytes');
	        if (bytesWritten + offset < buffer.length) {
	            if (!binding.isOpen) {
	                throw new Error('Port is not open');
	            }
	            return (0, exports.unixWrite)({ binding, buffer, offset: bytesWritten + offset, fsWriteAsync });
	        }
	        logger('Finished writing', bytesWritten + offset, 'bytes');
	    }
	    catch (err) {
	        logger('write errored', err);
	        if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
	            if (!binding.isOpen) {
	                throw new Error('Port is not open');
	            }
	            logger('waiting for writable because of code:', err.code);
	            await writable(binding);
	            return (0, exports.unixWrite)({ binding, buffer, offset, fsWriteAsync });
	        }
	        const disconnectError = err.code === 'EBADF' || // Bad file number means we got closed
	            err.code === 'ENXIO' || // No such device or address probably usb disconnect
	            err.code === 'UNKNOWN' ||
	            err.errno === -1; // generic error
	        if (disconnectError) {
	            err.disconnect = true;
	            logger('disconnecting', err);
	        }
	        logger('error', err);
	        throw err;
	    }
	};
	exports.unixWrite = unixWrite;
} (unixWrite));

var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(darwin, "__esModule", { value: true });
darwin.DarwinPortBinding = darwin.DarwinBinding = void 0;
const debug_1$1 = __importDefault$1(src.exports);
const load_bindings_1$1 = loadBindings;
const poller_1$1 = poller;
const unix_read_1$1 = unixRead;
const unix_write_1$1 = unixWrite;
const debug$1 = (0, debug_1$1.default)('serialport/bindings-cpp');
darwin.DarwinBinding = {
    list() {
        debug$1('list');
        return (0, load_bindings_1$1.asyncList)();
    },
    async open(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('"options" is not an object');
        }
        if (!options.path) {
            throw new TypeError('"path" is not a valid port');
        }
        if (!options.baudRate) {
            throw new TypeError('"baudRate" is not a valid baudRate');
        }
        debug$1('open');
        const openOptions = Object.assign({ vmin: 1, vtime: 0, dataBits: 8, lock: true, stopBits: 1, parity: 'none', rtscts: false, xon: false, xoff: false, xany: false, hupcl: true }, options);
        const fd = await (0, load_bindings_1$1.asyncOpen)(openOptions.path, openOptions);
        return new DarwinPortBinding(fd, openOptions);
    },
};
/**
 * The Darwin binding layer for OSX
 */
class DarwinPortBinding {
    constructor(fd, options) {
        this.fd = fd;
        this.openOptions = options;
        this.poller = new poller_1$1.Poller(fd);
        this.writeOperation = null;
    }
    get isOpen() {
        return this.fd !== null;
    }
    async close() {
        debug$1('close');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        const fd = this.fd;
        this.poller.stop();
        this.poller.destroy();
        this.fd = null;
        await (0, load_bindings_1$1.asyncClose)(fd);
    }
    async read(buffer, offset, length) {
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError('"buffer" is not a Buffer');
        }
        if (typeof offset !== 'number' || isNaN(offset)) {
            throw new TypeError(`"offset" is not an integer got "${isNaN(offset) ? 'NaN' : typeof offset}"`);
        }
        if (typeof length !== 'number' || isNaN(length)) {
            throw new TypeError(`"length" is not an integer got "${isNaN(length) ? 'NaN' : typeof length}"`);
        }
        debug$1('read');
        if (buffer.length < offset + length) {
            throw new Error('buffer is too small');
        }
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        return (0, unix_read_1$1.unixRead)({ binding: this, buffer, offset, length });
    }
    async write(buffer) {
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError('"buffer" is not a Buffer');
        }
        debug$1('write', buffer.length, 'bytes');
        if (!this.isOpen) {
            debug$1('write', 'error port is not open');
            throw new Error('Port is not open');
        }
        this.writeOperation = (async () => {
            if (buffer.length === 0) {
                return;
            }
            await (0, unix_write_1$1.unixWrite)({ binding: this, buffer });
            this.writeOperation = null;
        })();
        return this.writeOperation;
    }
    async update(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw TypeError('"options" is not an object');
        }
        if (typeof options.baudRate !== 'number') {
            throw new TypeError('"options.baudRate" is not a number');
        }
        debug$1('update');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await (0, load_bindings_1$1.asyncUpdate)(this.fd, options);
    }
    async set(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('"options" is not an object');
        }
        debug$1('set', options);
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await (0, load_bindings_1$1.asyncSet)(this.fd, options);
    }
    async get() {
        debug$1('get');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        return (0, load_bindings_1$1.asyncGet)(this.fd);
    }
    async getBaudRate() {
        debug$1('getBaudRate');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        throw new Error('getBaudRate is not implemented on darwin');
    }
    async flush() {
        debug$1('flush');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await (0, load_bindings_1$1.asyncFlush)(this.fd);
    }
    async drain() {
        debug$1('drain');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await this.writeOperation;
        await (0, load_bindings_1$1.asyncDrain)(this.fd);
    }
}
darwin.DarwinPortBinding = DarwinPortBinding;

var linux = {};

var linuxList$1 = {};

Object.defineProperty(linuxList$1, "__esModule", { value: true });
linuxList$1.linuxList = void 0;
const child_process_1 = require$$0$3;
const parser_readline_1 = dist$8;
// get only serial port names
function checkPathOfDevice(path) {
    return /(tty(S|WCH|ACM|USB|AMA|MFD|O|XRUSB)|rfcomm)/.test(path) && path;
}
function propName(name) {
    return {
        DEVNAME: 'path',
        ID_VENDOR_ENC: 'manufacturer',
        ID_SERIAL_SHORT: 'serialNumber',
        ID_VENDOR_ID: 'vendorId',
        ID_MODEL_ID: 'productId',
        DEVLINKS: 'pnpId',
    }[name.toUpperCase()];
}
function decodeHexEscape(str) {
    return str.replace(/\\x([a-fA-F0-9]{2})/g, (a, b) => {
        return String.fromCharCode(parseInt(b, 16));
    });
}
function propVal(name, val) {
    if (name === 'pnpId') {
        const match = val.match(/\/by-id\/([^\s]+)/);
        return (match === null || match === void 0 ? void 0 : match[1]) || undefined;
    }
    if (name === 'manufacturer') {
        return decodeHexEscape(val);
    }
    if (/^0x/.test(val)) {
        return val.substr(2);
    }
    return val;
}
function linuxList(spawnCmd = child_process_1.spawn) {
    const ports = [];
    const udevadm = spawnCmd('udevadm', ['info', '-e']);
    const lines = udevadm.stdout.pipe(new parser_readline_1.ReadlineParser());
    let skipPort = false;
    let port = {
        path: '',
        manufacturer: undefined,
        serialNumber: undefined,
        pnpId: undefined,
        locationId: undefined,
        vendorId: undefined,
        productId: undefined,
    };
    lines.on('data', (line) => {
        const lineType = line.slice(0, 1);
        const data = line.slice(3);
        // new port entry
        if (lineType === 'P') {
            port = {
                path: '',
                manufacturer: undefined,
                serialNumber: undefined,
                pnpId: undefined,
                locationId: undefined,
                vendorId: undefined,
                productId: undefined,
            };
            skipPort = false;
            return;
        }
        if (skipPort) {
            return;
        }
        // Check dev name and save port if it matches flag to skip the rest of the data if not
        if (lineType === 'N') {
            if (checkPathOfDevice(data)) {
                ports.push(port);
            }
            else {
                skipPort = true;
            }
            return;
        }
        // parse data about each port
        if (lineType === 'E') {
            const keyValue = data.match(/^(.+)=(.*)/);
            if (!keyValue) {
                return;
            }
            const key = propName(keyValue[1]);
            if (!key) {
                return;
            }
            port[key] = propVal(key, keyValue[2]);
        }
    });
    return new Promise((resolve, reject) => {
        udevadm.on('close', (code) => {
            if (code) {
                reject(new Error(`Error listing ports udevadm exited with error code: ${code}`));
            }
        });
        udevadm.on('error', reject);
        lines.on('error', reject);
        lines.on('finish', () => resolve(ports));
    });
}
linuxList$1.linuxList = linuxList;

var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(linux, "__esModule", { value: true });
linux.LinuxPortBinding = linux.LinuxBinding = void 0;
const debug_1 = __importDefault(src.exports);
const linux_list_1 = linuxList$1;
const poller_1 = poller;
const unix_read_1 = unixRead;
const unix_write_1 = unixWrite;
const load_bindings_1 = loadBindings;
const debug = (0, debug_1.default)('serialport/bindings-cpp');
linux.LinuxBinding = {
    list() {
        debug('list');
        return (0, linux_list_1.linuxList)();
    },
    async open(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('"options" is not an object');
        }
        if (!options.path) {
            throw new TypeError('"path" is not a valid port');
        }
        if (!options.baudRate) {
            throw new TypeError('"baudRate" is not a valid baudRate');
        }
        debug('open');
        const openOptions = Object.assign({ vmin: 1, vtime: 0, dataBits: 8, lock: true, stopBits: 1, parity: 'none', rtscts: false, xon: false, xoff: false, xany: false, hupcl: true }, options);
        const fd = await (0, load_bindings_1.asyncOpen)(openOptions.path, openOptions);
        this.fd = fd;
        return new LinuxPortBinding(fd, openOptions);
    },
};
/**
 * The linux binding layer
 */
class LinuxPortBinding {
    constructor(fd, openOptions) {
        this.fd = fd;
        this.openOptions = openOptions;
        this.poller = new poller_1.Poller(fd);
        this.writeOperation = null;
    }
    get isOpen() {
        return this.fd !== null;
    }
    async close() {
        debug('close');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        const fd = this.fd;
        this.poller.stop();
        this.poller.destroy();
        this.fd = null;
        await (0, load_bindings_1.asyncClose)(fd);
    }
    async read(buffer, offset, length) {
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError('"buffer" is not a Buffer');
        }
        if (typeof offset !== 'number' || isNaN(offset)) {
            throw new TypeError(`"offset" is not an integer got "${isNaN(offset) ? 'NaN' : typeof offset}"`);
        }
        if (typeof length !== 'number' || isNaN(length)) {
            throw new TypeError(`"length" is not an integer got "${isNaN(length) ? 'NaN' : typeof length}"`);
        }
        debug('read');
        if (buffer.length < offset + length) {
            throw new Error('buffer is too small');
        }
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        return (0, unix_read_1.unixRead)({ binding: this, buffer, offset, length });
    }
    async write(buffer) {
        if (!Buffer.isBuffer(buffer)) {
            throw new TypeError('"buffer" is not a Buffer');
        }
        debug('write', buffer.length, 'bytes');
        if (!this.isOpen) {
            debug('write', 'error port is not open');
            throw new Error('Port is not open');
        }
        this.writeOperation = (async () => {
            if (buffer.length === 0) {
                return;
            }
            await (0, unix_write_1.unixWrite)({ binding: this, buffer });
            this.writeOperation = null;
        })();
        return this.writeOperation;
    }
    async update(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw TypeError('"options" is not an object');
        }
        if (typeof options.baudRate !== 'number') {
            throw new TypeError('"options.baudRate" is not a number');
        }
        debug('update');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await (0, load_bindings_1.asyncUpdate)(this.fd, options);
    }
    async set(options) {
        if (!options || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('"options" is not an object');
        }
        debug('set');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await (0, load_bindings_1.asyncSet)(this.fd, options);
    }
    async get() {
        debug('get');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        return (0, load_bindings_1.asyncGet)(this.fd);
    }
    async getBaudRate() {
        debug('getBaudRate');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        return (0, load_bindings_1.asyncGetBaudRate)(this.fd);
    }
    async flush() {
        debug('flush');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await (0, load_bindings_1.asyncFlush)(this.fd);
    }
    async drain() {
        debug('drain');
        if (!this.isOpen) {
            throw new Error('Port is not open');
        }
        await this.writeOperation;
        await (0, load_bindings_1.asyncDrain)(this.fd);
    }
}
linux.LinuxPortBinding = LinuxPortBinding;

var win32 = {};

var win32SnParser = {};

Object.defineProperty(win32SnParser, "__esModule", { value: true });
win32SnParser.serialNumParser = void 0;
const PARSERS = [/USB\\(?:.+)\\(.+)/, /FTDIBUS\\(?:.+)\+(.+?)A?\\.+/];
const serialNumParser = (pnpId) => {
    if (!pnpId) {
        return null;
    }
    for (const parser of PARSERS) {
        const sn = pnpId.match(parser);
        if (sn) {
            return sn[1];
        }
    }
    return null;
};
win32SnParser.serialNumParser = serialNumParser;

var hasRequiredWin32;

function requireWin32 () {
	if (hasRequiredWin32) return win32;
	hasRequiredWin32 = 1;
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(win32, "__esModule", { value: true });
	win32.WindowsPortBinding = win32.WindowsBinding = void 0;
	const debug_1 = __importDefault(src.exports);
	const _1 = requireDist();
	const load_bindings_1 = loadBindings;
	const win32_sn_parser_1 = win32SnParser;
	const debug = (0, debug_1.default)('serialport/bindings-cpp');
	win32.WindowsBinding = {
	    async list() {
	        const ports = await (0, load_bindings_1.asyncList)();
	        // Grab the serial number from the pnp id
	        return ports.map(port => {
	            if (port.pnpId && !port.serialNumber) {
	                const serialNumber = (0, win32_sn_parser_1.serialNumParser)(port.pnpId);
	                if (serialNumber) {
	                    return Object.assign(Object.assign({}, port), { serialNumber });
	                }
	            }
	            return port;
	        });
	    },
	    async open(options) {
	        if (!options || typeof options !== 'object' || Array.isArray(options)) {
	            throw new TypeError('"options" is not an object');
	        }
	        if (!options.path) {
	            throw new TypeError('"path" is not a valid port');
	        }
	        if (!options.baudRate) {
	            throw new TypeError('"baudRate" is not a valid baudRate');
	        }
	        debug('open');
	        const openOptions = Object.assign({ dataBits: 8, lock: true, stopBits: 1, parity: 'none', rtscts: false, rtsMode: 'handshake', xon: false, xoff: false, xany: false, hupcl: true }, options);
	        const fd = await (0, load_bindings_1.asyncOpen)(openOptions.path, openOptions);
	        return new WindowsPortBinding(fd, openOptions);
	    },
	};
	/**
	 * The Windows binding layer
	 */
	class WindowsPortBinding {
	    constructor(fd, options) {
	        this.fd = fd;
	        this.openOptions = options;
	        this.writeOperation = null;
	    }
	    get isOpen() {
	        return this.fd !== null;
	    }
	    async close() {
	        debug('close');
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        const fd = this.fd;
	        this.fd = null;
	        await (0, load_bindings_1.asyncClose)(fd);
	    }
	    async read(buffer, offset, length) {
	        if (!Buffer.isBuffer(buffer)) {
	            throw new TypeError('"buffer" is not a Buffer');
	        }
	        if (typeof offset !== 'number' || isNaN(offset)) {
	            throw new TypeError(`"offset" is not an integer got "${isNaN(offset) ? 'NaN' : typeof offset}"`);
	        }
	        if (typeof length !== 'number' || isNaN(length)) {
	            throw new TypeError(`"length" is not an integer got "${isNaN(length) ? 'NaN' : typeof length}"`);
	        }
	        debug('read');
	        if (buffer.length < offset + length) {
	            throw new Error('buffer is too small');
	        }
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        try {
	            const bytesRead = await (0, load_bindings_1.asyncRead)(this.fd, buffer, offset, length);
	            return { bytesRead, buffer };
	        }
	        catch (err) {
	            if (!this.isOpen) {
	                throw new _1.BindingsError(err.message, { canceled: true });
	            }
	            throw err;
	        }
	    }
	    async write(buffer) {
	        if (!Buffer.isBuffer(buffer)) {
	            throw new TypeError('"buffer" is not a Buffer');
	        }
	        debug('write', buffer.length, 'bytes');
	        if (!this.isOpen) {
	            debug('write', 'error port is not open');
	            throw new Error('Port is not open');
	        }
	        this.writeOperation = (async () => {
	            if (buffer.length === 0) {
	                return;
	            }
	            await (0, load_bindings_1.asyncWrite)(this.fd, buffer);
	            this.writeOperation = null;
	        })();
	        return this.writeOperation;
	    }
	    async update(options) {
	        if (!options || typeof options !== 'object' || Array.isArray(options)) {
	            throw TypeError('"options" is not an object');
	        }
	        if (typeof options.baudRate !== 'number') {
	            throw new TypeError('"options.baudRate" is not a number');
	        }
	        debug('update');
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        await (0, load_bindings_1.asyncUpdate)(this.fd, options);
	    }
	    async set(options) {
	        if (!options || typeof options !== 'object' || Array.isArray(options)) {
	            throw new TypeError('"options" is not an object');
	        }
	        debug('set', options);
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        await (0, load_bindings_1.asyncSet)(this.fd, options);
	    }
	    async get() {
	        debug('get');
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        return (0, load_bindings_1.asyncGet)(this.fd);
	    }
	    async getBaudRate() {
	        debug('getBaudRate');
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        return (0, load_bindings_1.asyncGetBaudRate)(this.fd);
	    }
	    async flush() {
	        debug('flush');
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        await (0, load_bindings_1.asyncFlush)(this.fd);
	    }
	    async drain() {
	        debug('drain');
	        if (!this.isOpen) {
	            throw new Error('Port is not open');
	        }
	        await this.writeOperation;
	        await (0, load_bindings_1.asyncDrain)(this.fd);
	    }
	}
	win32.WindowsPortBinding = WindowsPortBinding;
	return win32;
}

var dist = {};

var hasRequiredDist;

function requireDist () {
	if (hasRequiredDist) return dist$1;
	hasRequiredDist = 1;
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
		var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.autoDetect = void 0;
		/* eslint-disable @typescript-eslint/no-var-requires */
		const debug_1 = __importDefault(src.exports);
		const darwin_1 = darwin;
		const linux_1 = linux;
		const win32_1 = requireWin32();
		const debug = (0, debug_1.default)('serialport/bindings-cpp');
		__exportStar(dist, exports);
		__exportStar(darwin, exports);
		__exportStar(linux, exports);
		__exportStar(requireWin32(), exports);
		__exportStar(errors, exports);
		/**
		 * This is an auto detected binding for your current platform
		 */
		function autoDetect() {
		    switch (process.platform) {
		        case 'win32':
		            debug('loading WindowsBinding');
		            return win32_1.WindowsBinding;
		        case 'darwin':
		            debug('loading DarwinBinding');
		            return darwin_1.DarwinBinding;
		        default:
		            debug('loading LinuxBinding');
		            return linux_1.LinuxBinding;
		    }
		}
		exports.autoDetect = autoDetect;
} (dist$1));
	return dist$1;
}

Object.defineProperty(serialport, "__esModule", { value: true });
serialport.SerialPort = void 0;
const stream_1 = dist$3;
const bindings_cpp_1 = requireDist();
const DetectedBinding = (0, bindings_cpp_1.autoDetect)();
class SerialPort extends stream_1.SerialPortStream {
    constructor(options, openCallback) {
        const opts = {
            binding: DetectedBinding,
            ...options,
        };
        super(opts, openCallback);
    }
}
serialport.SerialPort = SerialPort;
SerialPort.list = DetectedBinding.list;
SerialPort.binding = DetectedBinding;

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
	__exportStar(dist$d, exports);
	__exportStar(dist$c, exports);
	__exportStar(dist$b, exports);
	__exportStar(dist$a, exports);
	__exportStar(dist$9, exports);
	__exportStar(dist$8, exports);
	__exportStar(dist$7, exports);
	__exportStar(dist$6, exports);
	__exportStar(dist$5, exports);
	__exportStar(dist$4, exports);
	__exportStar(serialportMock, exports);
	__exportStar(serialport, exports);
} (dist$e));

const strfy = (o) => JSON.stringify(o, null, 2);
const Msg = (n) => {
    const name = n;
    return (loggable) => {
        process.stdout.write(`${name} ==> `);
        if (typeof loggable !== 'string') {
            console.dir(loggable);
        }
        else {
            console.log(loggable);
        }
    };
};

const msg$2 = Msg("MakeShiftPort");
let _connectedDevices = 0;
const MKSHFT_EV = {
    FOUND: 'makeshift-found',
    DISCONNECTED: 'makeshift-disconnect',
    CONNECTED: 'makeshift-connect',
    STATE_UPDATE: 'state-update',
};
const BUTTON_EV = {
    PRESSED: [
        'button-01-rise',
        'button-02-rise',
        'button-03-rise',
        'button-04-rise',
        'button-05-rise',
        'button-06-rise',
        'button-07-rise',
        'button-08-rise',
        'button-09-rise',
        'button-10-rise',
        'button-11-rise',
        'button-12-rise',
        'button-13-rise',
        'button-14-rise',
        'button-15-rise',
        'button-16-rise',
    ],
    RELEASED: [
        'button-01-fall',
        'button-02-fall',
        'button-03-fall',
        'button-04-fall',
        'button-05-fall',
        'button-06-fall',
        'button-07-fall',
        'button-08-fall',
        'button-09-fall',
        'button-10-fall',
        'button-11-fall',
        'button-12-fall',
        'button-13-fall',
        'button-14-fall',
        'button-15-fall',
        'button-16-fall',
    ]
};
const NumOfButtons = BUTTON_EV.PRESSED.length;
const DIAL_EV = [
    'dial-01',
    'dial-02',
    'dial-03',
    'dial-04',
];
const NumOfDials = DIAL_EV.length;
var PacketType;
(function (PacketType) {
    PacketType[PacketType["PING"] = 0] = "PING";
    PacketType[PacketType["ACK"] = 1] = "ACK";
    PacketType[PacketType["READY"] = 2] = "READY";
    PacketType[PacketType["STATE_UPDATE"] = 3] = "STATE_UPDATE";
    PacketType[PacketType["ERROR"] = 4] = "ERROR";
    PacketType[PacketType["STRING"] = 5] = "STRING";
    PacketType[PacketType["DISCONNECT"] = 6] = "DISCONNECT";
})(PacketType || (PacketType = {}));
const SLIP_OPTIONS = {
    ESC: 219,
    END: 192,
    ESC_END: 220,
    ESC_ESC: 221,
};
class MakeShiftPort extends EventEmitter {
    constructor() {
        super();
        this.slipEncoder = new dist$5.SlipEncoder(SLIP_OPTIONS);
        this.slipDecoder = new dist$5.SlipDecoder(SLIP_OPTIONS);
        this.timeSinceAck = 0;
        this.prevState = { buttons: [], dials: [] };
        this.deviceReady = false;
        this._pollDelayMs = 500;
        this._keepAliveTimeout = 5000;
        this._keepAliveDelayMs = 1500;
        this.prevState.buttons.fill(false);
        this.prevState.dials.fill(0);
        this.on(MKSHFT_EV.STATE_UPDATE, (currState) => {
            let edge;
            for (let id = 0; id < NumOfButtons; id++) {
                if (currState.buttons[id] != this.prevState.buttons[id]) {
                    if (currState.buttons[id]) {
                        edge = 'PRESSED';
                    }
                    else {
                        edge = 'RELEASED';
                    }
                    this.emit(BUTTON_EV[edge][id], currState.buttons[id]);
                }
            }
            for (let id = 0; id < NumOfDials; id++) {
                if (currState.dials[id] != this.prevState.dials[id]) {
                    this.emit(DIAL_EV[id], currState.dials[id]);
                }
            }
            this.prevState = currState;
        });
        this.on(MKSHFT_EV.CONNECTED, () => {
            msg$2("Device connect event");
            _connectedDevices++;
            this.deviceReady = true;
            this.timeSinceAck = Date.now();
            this.keepAliveTimer = setInterval(() => {
                const elapsedTime = Date.now() - this.timeSinceAck;
                if (elapsedTime >= this._keepAliveDelayMs - 40) {
                    // msg(`${this._keepAliveDelayMs}ms keepalive check`)
                    if (elapsedTime > this._keepAliveTimeout) {
                        msg$2(`Device unresponsive for ${this._keepAliveTimeout}ms, disconnecting`);
                        this.closePort();
                    }
                    else {
                        this.sendByte(PacketType.PING);
                    }
                }
            }, this._keepAliveDelayMs);
        });
        this.on(MKSHFT_EV.DISCONNECTED, () => {
            _connectedDevices--;
            this.deviceReady = true;
            msg$2(`Restart device scanning`);
            this.scanForDevice();
        });
        // The decoder is the endpoint which gets the 'raw' data from the makeshift
        // so all the work of parsing the raw data happens here
        this.slipDecoder.on('data', (data) => {
            this.timeSinceAck = Date.now();
            const header = data.slice(0, 1).at(0);
            const body = data.slice(1);
            switch (header) {
                case PacketType.STATE_UPDATE:
                    let newState = MakeShiftPort.parseStateFromBuffer(body);
                    this.emit(MKSHFT_EV.STATE_UPDATE, newState);
                    break;
                case PacketType.ACK:
                    // any packet will act as keepalive ACK, and is handled above
                    // msg(`Got ACK from MakeShift`)
                    break;
                case PacketType.STRING:
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
                case PacketType.PING:
                    msg$2(`Got PING from MakeShift, responding with ACK`);
                    this.sendByte(PacketType.ACK);
                    break;
                case PacketType.ERROR:
                    msg$2(`Got ERROR from MakeShift`);
                    break;
                case PacketType.READY:
                    msg$2(`Got READY from MakeShift`);
                    msg$2(body.toString());
                    this.emit(MKSHFT_EV.CONNECTED);
                    break;
                default:
                    msg$2(header);
                    msg$2(data.toString());
                    break;
            }
        }); // decoder -> console
        this.scanForDevice();
    } // constructor()
    sendByte(t) {
        if (this.serialPort.isOpen) {
            this.serialPort.flush();
            let buf = Buffer.from([t]);
            // msg(`Sending ping:`)
            // console.dir(buf)
            this.slipEncoder.write(buf);
        }
    }
    send(t, body) {
        if (this.serialPort.isOpen) {
            this.serialPort.flush();
            let h = Buffer.from([t]);
            let b = Buffer.from(body);
            const buf = Buffer.concat([h, b]);
            // msg(`Sending buffer:`)
            // console.dir(buf)
            this.slipEncoder.write(buf);
        }
    }
    static connectedDevices() { return _connectedDevices; }
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
    openPort(path) {
        this.serialPort = new dist$e.SerialPort({
            path: path,
            baudRate: 115200
        }, (e) => {
            if (e != null) {
                msg$2(`Something happened while opening port: `);
                console.dir(e);
                msg$2('Restarting scan for open ports...');
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
            else {
                msg$2('SerialPort opened, attaching SLIP translators');
                this.slipEncoder.pipe(this.serialPort); // node -> teensy
                this.serialPort.pipe(this.slipDecoder); // teensy -> decoder
                this.sendByte(PacketType.READY);
            }
        });
    }
    closePort() {
        msg$2(`Closing MakeShift port...`);
        msg$2(`Clearing keepalive timer`);
        clearInterval(this.keepAliveTimer);
        msg$2(`Unpiping encoders`);
        this.slipEncoder.unpipe();
        this.serialPort.unpipe();
        if (this.serialPort.isOpen) {
            msg$2(`Port object found open`);
            msg$2(`Sending disconnect packet`);
            this.sendByte(PacketType.DISCONNECT);
            msg$2(`Closing port`);
            this.serialPort.close();
        }
        msg$2(`Port closed, sending disconnect signal`);
        this.emit(MKSHFT_EV.DISCONNECTED);
    }
    write(line) {
        if (this.deviceReady) {
            this.send(PacketType.STRING, line);
        }
        else {
            msg$2("MakeShift disconnected, line not sent");
        }
    }
    scanForDevice() {
        dist$e.SerialPort.list().then((portList) => {
            // portList.forEach(portInfo => {
            //   msg(`port vid: ${typeof portInfo.vendorId} \n port pid: ${portInfo.productId}`)
            // })
            let makeShiftPortInfo = portList.filter((portInfo) => {
                return ((portInfo.vendorId === '16c0'
                    || portInfo.vendorId === '16C0')
                    && (portInfo.productId === '0483'));
            });
            // console.dir(makeShiftPortInfo.length)
            if (makeShiftPortInfo.length > 0) {
                msg$2(`Found MakeShift devices: ${strfy(makeShiftPortInfo)}`);
                let path = makeShiftPortInfo[0].path;
                this.emit(MKSHFT_EV.FOUND, path);
                msg$2(`Opening device with path '${path}'`);
                this.openPort(path);
            }
            else {
                msg$2(`No MakeShift devices found, continuing scan...`);
                setTimeout(() => { this.scanForDevice(); }, this.pollDelayMs);
            }
        }).catch((e) => {
            msg$2(e);
        });
    }
    get pollDelayMs() { return this._pollDelayMs; }
    set pollDelayMs(delay) { this._pollDelayMs = delay; }
}

function sendMessage(p, l, d) {
    const m = {
        label: l,
        data: d
    };
    p.send(m);
}

const msg$1 = Msg('PluginLoader');
const __filename = fileURLToPath(import.meta.url);
const __dirname$1 = path$1.dirname(__filename);
const __plugin_dir = path$1.join(__dirname$1, '../plugins');
class Plugin extends EventEmitter$1 {
    constructor(manifest) {
        super();
        this.id = manifest.name;
        this.manifest = manifest;
        this.functionsAvailable = manifest.functionsAvailable;
        this.msg = Msg(`Plugin object for ${this.id}`);
        this.msg('Creating new event emitter');
        this.msg('Sporking new pluginSock');
        this.sock = fork('./lib/pluginSock.js');
        this.sock.on('message', this.handleMessage.bind(this));
        this.msg('Initializing pluginSock');
        sendMessage(this.sock, 'init');
        this.sock.send({
            label: 'init',
            data: {
                name: this.manifest.name,
                root: './plugins/' + this.manifest.name,
                manifest: this.manifest,
            }
        });
    }
    handleMessage(m) {
        this.msg(`Message received from sock --> Label: ${m.label} | Data: ${strfy(m.data)}`);
        switch (m.label) {
            case 'status':
                if (m.data === 'ready') {
                    super.emit('ready');
                }
                else if (m.data === 'error loading') {
                    this.msg(m.data);
                }
                break;
        }
    }
    ;
    // TODO: get call working
    callFunction(name, message) {
        this.send('call', {
            name: name,
            args: message ? message : {}
        });
    }
    send(label, data) {
        this.sock.send({
            label: label,
            data: data
        });
    }
    runFunction(name, args) {
        this.send('run', {
            name: name,
            args: args ? args : []
        });
    }
}
function loadPlugins(pluginList) {
    for (let id of pluginList) {
        msg$1('reading manifest from - ' + id);
        let data = readFileSync(path$1.join(__plugin_dir, id, 'manifest.json'), { encoding: 'UTF8' });
        let manifest = JSON.parse(data);
        msg$1('Manifest loaded.');
        msg$1(manifest);
        msg$1('Forking plugin sock...');
        new Plugin(manifest);
    }
}

const msg = Msg("MakeShiftSerial");
const rl = readline.createInterface({ input: stdin, tabSize: 4, output: stdout });
rl.setPrompt("SEND => ");
let pluginList = [
// "dummyPlugin",
// "makeshiftctrl-obs",
];
loadPlugins(pluginList);
// plugins['makeshiftctrl-obs'].on('ready', () => {
// })
stdout.on('end', () => rl.prompt);
const makeShift = new MakeShiftPort();
// Initialize readline
// Initialize connection looper
makeShift.on(MKSHFT_EV.CONNECTED, () => {
    rl.on('line', (line) => {
        makeShift.write(line);
    });
});
makeShift.on(MKSHFT_EV.DISCONNECTED, () => {
    rl.removeAllListeners();
});
DIAL_EV.forEach((ev) => {
    makeShift.on(ev, (state) => {
        msg(`${ev} - ${state}`);
    });
});
BUTTON_EV.PRESSED.forEach((ev) => {
    makeShift.on(ev, () => {
        // do stuff you want
        // do this, then that, etc. et cetera ad nauseum
        msg(ev);
    });
});
BUTTON_EV.RELEASED.forEach((ev) => {
    makeShift.on(ev, () => {
        msg(ev);
    });
});

export { BUTTON_EV };
