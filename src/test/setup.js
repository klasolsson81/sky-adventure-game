import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Web Audio API (required for Phaser audio)
global.AudioContext = vi.fn().mockImplementation(() => ({
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: { value: 1 },
  }),
  createBufferSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }),
  destination: {},
}));

// Mock matchMedia (for responsive design tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;
