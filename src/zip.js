/**
 * Minimal ZIP writer.
 *
 * The 3D export ships a whole Vite project, which means many files in one
 * download. Workers have no zlib and this project has no runtime dependencies,
 * so archives are written store-only (compression method 0). A scaffold is a
 * few dozen KB of text; the size we give up is not worth pulling in a deflate
 * implementation.
 *
 * Produces a standard archive: local file headers, then the central directory,
 * then the end-of-central-directory record.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/**
 * DOS time/date, the only timestamp format the base ZIP header has. Seconds
 * carry one bit less precision, and the epoch is 1980.
 */
function dosDateTime(date) {
  const year = Math.max(1980, date.getUTCFullYear());
  return {
    time: (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | (date.getUTCSeconds() >> 1),
    date: ((year - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate(),
  };
}

/**
 * @param {Record<string,string>} files  path -> UTF-8 text content.
 * @param {Date} [now]                   archive timestamp.
 * @returns {Uint8Array}
 */
export function zipSync(files, now = new Date()) {
  const encoder = new TextEncoder();
  const { time, date } = dosDateTime(now);
  const entries = [];
  const chunks = [];
  let offset = 0;

  for (const [path, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(path);
    const data = encoder.encode(content);
    const crc = crc32(data);

    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true);   // local file header signature
    view.setUint16(4, 20, true);           // version needed
    view.setUint16(6, 0x0800, true);       // flags: UTF-8 filenames
    view.setUint16(8, 0, true);            // method: stored
    view.setUint16(10, time, true);
    view.setUint16(12, date, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true); // compressed size
    view.setUint32(22, data.length, true); // uncompressed size
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);           // extra field length
    header.set(nameBytes, 30);

    entries.push({ nameBytes, crc, size: data.length, offset });
    chunks.push(header, data);
    offset += header.length + data.length;
  }

  const centralStart = offset;
  for (const e of entries) {
    const rec = new Uint8Array(46 + e.nameBytes.length);
    const view = new DataView(rec.buffer);
    view.setUint32(0, 0x02014b50, true);   // central directory signature
    view.setUint16(4, 20, true);           // version made by
    view.setUint16(6, 20, true);           // version needed
    view.setUint16(8, 0x0800, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, time, true);
    view.setUint16(14, date, true);
    view.setUint32(16, e.crc, true);
    view.setUint32(20, e.size, true);
    view.setUint32(24, e.size, true);
    view.setUint16(28, e.nameBytes.length, true);
    view.setUint32(42, e.offset, true);    // offset of local header
    rec.set(e.nameBytes, 46);
    chunks.push(rec);
    offset += rec.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);  // end of central directory
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, offset - centralStart, true);
  endView.setUint32(16, centralStart, true);
  chunks.push(end);

  const out = new Uint8Array(offset + end.length);
  let pos = 0;
  for (const c of chunks) { out.set(c, pos); pos += c.length; }
  return out;
}
