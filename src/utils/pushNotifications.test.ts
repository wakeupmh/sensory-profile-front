import { afterEach, describe, expect, it } from 'vitest';
import { arrayBufferToBase64Url, isPushSupported, urlBase64ToUint8Array } from './pushNotifications';

describe('urlBase64ToUint8Array', () => {
  it('decodes a standard base64url string (no padding) into the correct bytes', () => {
    // "hello" in base64 is "aGVsbG8=" — url-safe/unpadded form is "aGVsbG8"
    const result = urlBase64ToUint8Array('aGVsbG8');
    expect(Array.from(result)).toEqual([104, 101, 108, 108, 111]);
  });

  it('replaces URL-safe characters (-, _) back to standard base64 (+, /) before decoding', () => {
    // Bytes [251, 255, 191] encode to standard base64 "-/-/" territory —
    // construct a case that forces both substitutions to matter.
    const bytes = new Uint8Array([251, 239, 190]);
    const urlSafe = arrayBufferToBase64Url(bytes.buffer);
    expect(urlSafe).not.toContain('+');
    expect(urlSafe).not.toContain('/');
    expect(Array.from(urlBase64ToUint8Array(urlSafe))).toEqual(Array.from(bytes));
  });

  it('handles all four padding-length cases (0-3 chars of missing "=")', () => {
    for (let len = 1; len <= 8; len++) {
      const bytes = new Uint8Array(Array.from({ length: len }, (_, i) => i * 7));
      const encoded = arrayBufferToBase64Url(bytes.buffer);
      expect(Array.from(urlBase64ToUint8Array(encoded))).toEqual(Array.from(bytes));
    }
  });
});

describe('arrayBufferToBase64Url', () => {
  it('produces a string with no "+", "/", or "=" characters (URL-safe, unpadded)', () => {
    const bytes = new Uint8Array([255, 254, 253, 252, 251, 250]);
    const result = arrayBufferToBase64Url(bytes.buffer);
    expect(result).not.toMatch(/[+/=]/);
  });

  it('round-trips through urlBase64ToUint8Array for arbitrary byte sequences', () => {
    const bytes = new Uint8Array([0, 1, 2, 127, 128, 255, 16, 32]);
    const encoded = arrayBufferToBase64Url(bytes.buffer);
    const decoded = urlBase64ToUint8Array(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(bytes));
  });
});

describe('isPushSupported', () => {
  afterEach(() => {
    // @ts-expect-error test-only cleanup of a property we may have added
    delete window.PushManager;
    // @ts-expect-error test-only cleanup of a property we may have added
    delete window.Notification;
    // @ts-expect-error test-only cleanup of a property we may have added
    delete navigator.serviceWorker;
  });

  it('returns false in a jsdom environment, which implements none of the Push API', () => {
    expect(isPushSupported()).toBe(false);
  });

  it('returns true once serviceWorker, PushManager, and Notification are all present', () => {
    Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true });
    // @ts-expect-error stubbing a browser global not present in jsdom
    window.PushManager = function () {};
    // @ts-expect-error stubbing a browser global not present in jsdom
    window.Notification = { permission: 'default' };

    expect(isPushSupported()).toBe(true);
  });

  it('returns false when only some of the three APIs are present', () => {
    Object.defineProperty(navigator, 'serviceWorker', { value: {}, configurable: true });
    // @ts-expect-error stubbing a browser global not present in jsdom
    window.PushManager = function () {};
    // Notification intentionally left undefined

    expect(isPushSupported()).toBe(false);
  });
});
