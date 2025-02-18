import validate from './validate.js';

function parse(uuid: string): Uint8Array;
function parse<TBuf extends Uint8Array = Uint8Array>(
  uuid: string,
  buf: TBuf,
  offset?: number
): TBuf;
function parse<TBuf extends Uint8Array = Uint8Array>(
  uuid: string,
  buf?: TBuf,
  offset: number = 0
): TBuf {
  if (!validate(uuid)) {
    throw TypeError('Invalid UUID');
  }
  if (!buf) {
    buf = new Uint8Array(16) as TBuf;
  } else if (offset < 0 || offset + 16 > buf.length) {
    throw RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
  }

  let v;

  buf[offset] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  buf[offset + 1] = (v >>> 16) & 0xff;
  buf[offset + 2] = (v >>> 8) & 0xff;
  buf[offset + 3] = v & 0xff;

  // Parse ........-####-....-....-............
  buf[offset + 4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  buf[offset + 5] = v & 0xff;
  // Parse ........-....-####-....-............
  buf[offset + 6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  buf[offset + 7] = v & 0xff;

  // Parse ........-....-....-####-............
  buf[offset + 8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  buf[offset + 9] = v & 0xff;

  // Parse ........-....-....-....-############
  // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)
  buf[offset + 10] = ((v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000) & 0xff;
  buf[offset + 11] = (v / 0x100000000) & 0xff;
  buf[offset + 12] = (v >>> 24) & 0xff;
  buf[offset + 13] = (v >>> 16) & 0xff;
  buf[offset + 14] = (v >>> 8) & 0xff;
  buf[offset + 15] = v & 0xff;

  return buf;
}

export default parse;
