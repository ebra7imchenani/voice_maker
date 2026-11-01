/**
 * Audio utilities for WAV parsing and handling
 */

export interface WavMetadata {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  durationSeconds: number;
}

export function parseWavMetadata(buffer: ArrayBuffer): WavMetadata | null {
  try {
    const dataView = new DataView(buffer);
    const riff = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );

    if (riff !== 'RIFF') return null;

    let numChannels = 1;
    let sampleRate = 24000;
    let bitsPerSample = 16;
    let dataLength = buffer.byteLength - 44;

    let offset = 12;
    while (offset < buffer.byteLength - 8) {
      const chunkId = String.fromCharCode(
        dataView.getUint8(offset),
        dataView.getUint8(offset + 1),
        dataView.getUint8(offset + 2),
        dataView.getUint8(offset + 3)
      );
      const chunkSize = dataView.getUint32(offset + 4, true);

      if (chunkId === 'fmt ') {
        numChannels = dataView.getUint16(offset + 8, true);
        sampleRate = dataView.getUint32(offset + 10, true);
        bitsPerSample = dataView.getUint16(offset + 22, true);
      } else if (chunkId === 'data') {
        dataLength = chunkSize;
        break;
      }
      offset += 8 + chunkSize;
    }

    const bytesPerSecond = sampleRate * numChannels * (bitsPerSample / 8);
    const durationSeconds = bytesPerSecond > 0 ? dataLength / bytesPerSecond : 0;

    return {
      sampleRate,
      numChannels,
      bitsPerSample,
      durationSeconds,
    };
  } catch (err) {
    console.error('Failed to parse WAV metadata:', err);
    return null;
  }
}
