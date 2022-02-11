import { Response as ExResponse } from 'express';
import sharp from 'sharp';
import { Readable } from 'stream';

const mimeNames = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.ogg': 'application/ogg',
  '.ogv': 'video/ogg',
  '.oga': 'audio/ogg',
  '.png': 'image/png',
  '.txt': 'text/plain',
  '.wav': 'audio/x-wav',
  '.webm': 'video/webm',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
};

export function readRangeHeader (range: any, totalLength: number) {
  /*
   * Example of the method 'split' with regular expression.
   *
   * Input: bytes=100-200
   * Output: [null, 100, 200, null]
   *
   * Input: bytes=-200
   * Output: [null, null, 200, null]
   */

  if (range == null || range.length === 0) {
    return null;
  }

  const array = range.split(/bytes=([0-9]*)-([0-9]*)/);
  const start = parseInt(array[1]);
  const end = parseInt(array[2]);
  const result = {
    Start: isNaN(start) ? 0 : start,
    End: isNaN(end) ? (totalLength - 1) : end
  };

  if (!isNaN(start) && isNaN(end)) {
    result.Start = start;
    result.End = totalLength - 1;
  }

  if (isNaN(start) && !isNaN(end)) {
    result.Start = totalLength - end;
    result.End = totalLength - 1;
  }

  return result;
}

export function sendResponse (response: ExResponse, responseStatus: number, responseHeaders: any, readable: Readable | null): void {
  response.writeHead(responseStatus, responseHeaders);
  if (readable == null) {
    response.end();
  } else {
    readable.pipe(response);
  }
}

export function getMimeNameFromExt (ext: string) {
  let result = prop(mimeNames, ext.toLowerCase());

  // It's better to give a default value.
  if (result == null) {
    result = 'application/octet-stream';
  }
  return result;
}

function prop (obj:any, key: string) {
  return obj[key];
}

export function bufferToReadable (buffer: Buffer, range: any): Readable {
  const rangeRequest = readRangeHeader(range, buffer.length);
  // full file
  if (rangeRequest == null) {
    return new Readable({
      read () {
        this.push(buffer);
      },
    });
  }

  // Partial Content requested
  const start = rangeRequest ? rangeRequest.Start : 0;
  const end = rangeRequest ? rangeRequest.End : buffer.length;
  return new Readable({
    read () {
      this.push(buffer.slice(start, end));
    },
  });
}

// https://www.codeproject.com/Articles/813480/HTTP-Partial-Content-In-Node-js
export function sendBuffer (readable: Readable, size : number, range: any, response: ExResponse, mimeType: string): void {
  const responseHeaders: any = {};
  const rangeRequest = readRangeHeader(range, size);
  let responseCode;

  if (rangeRequest == null) {
    //  If not, will return file directly.
    responseHeaders['Content-Type'] = mimeType;
    responseHeaders['Content-Length'] = size; // File size.
    responseHeaders['Accept-Ranges'] = 'bytes';
    responseCode = 200;
  } else {
    const start = rangeRequest ? rangeRequest.Start : 0;
    const end = rangeRequest ? rangeRequest.End : size;

    // If the range can't be fulfilled.
    if (start >= size || end >= size) {
      // Indicate the acceptable range.
      responseHeaders['Content-Range'] = 'bytes */' + size; // File size.
      responseCode = 416;
    } else {
      responseHeaders['Content-Range'] = `bytes ${start}-${end}/${size}`;
      responseHeaders['Content-Length'] = String(start === end ? 0 : (end - start) + 1);
      responseHeaders['Content-Type'] = mimeType;
      responseHeaders['Accept-Ranges'] = 'bytes';
      responseHeaders['Cache-Control'] = 'no-cache';
      responseCode = 206;
    }
  }

  sendResponse(response, responseCode, responseHeaders, (responseCode !== 416 ? readable : null));
}

export const circleBuffer = sharp(
  Buffer.from(
    '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#000" /></svg>',
    'utf-8'
  )
).toBuffer();
