#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

function uint32BE(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n, 0)
  return b
}

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })())
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = uint32BE(data.length)
  const crcData = Buffer.concat([t, data])
  const crcBuf = uint32BE(crc32(crcData))
  return Buffer.concat([len, t, data, crcBuf])
}

function createPNG(size, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdrData = Buffer.concat([
    uint32BE(size), uint32BE(size),
    Buffer.from([8, 2, 0, 0, 0]), // 8-bit RGB
  ])
  const ihdr = chunk('IHDR', ihdrData)

  // Raw image data
  const rowLen = size * 3
  const raw = Buffer.alloc(size * (1 + rowLen))
  for (let y = 0; y < size; y++) {
    raw[y * (1 + rowLen)] = 0 // filter none
    for (let x = 0; x < size; x++) {
      const off = y * (1 + rowLen) + 1 + x * 3
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b
    }
  }

  const compressed = zlib.deflateSync(raw)
  const idat = chunk('IDAT', compressed)
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

const publicDir = path.join(__dirname, '..', 'public')

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 61, 43, 26))
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, 61, 43, 26))

console.log('Icons generated.')
