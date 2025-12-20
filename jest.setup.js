
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for Node.js environment (needed for jose/JWT)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


// Restore matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Access globalThis for Node.js built-ins
const globalObject = typeof globalThis !== 'undefined' ? globalThis : global;

if (typeof global.Request === 'undefined') {
  if (globalObject.Request) {
    global.Request = globalObject.Request;
  } else {
    // Fallback polyfill if Node's Request is hidden/missing
    global.Request = class Request {
      constructor(input, init) {
        this.url = input;
        this.method = init?.method || 'GET';
        this.headers = new Headers(init?.headers);
      }
    };
  }
}

if (typeof global.Response === 'undefined') {
  if (globalObject.Response) {
    global.Response = globalObject.Response;
  } else {
    global.Response = class Response {
      constructor(body, init) {
        this.status = init?.status || 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new Headers(init?.headers);
        this.json = async () => JSON.parse(body);
      }
    };
  }
}

if (typeof global.Headers === 'undefined') {
  if (globalObject.Headers) {
    global.Headers = globalObject.Headers;
  } else {
    global.Headers = class Headers extends Map { };
  }
}

const originalConsoleError = console.error;
console.error = (...args) => {
  // Robust check for the action prop warning
  const msg = args[0];
  if (typeof msg === 'string' &&
    (/Invalid value for prop [`']action[`']/.test(msg) ||
      /Warning: Invalid value for prop [`']action[`']/.test(msg))) {
    return;
  }
  originalConsoleError(...args);
};


