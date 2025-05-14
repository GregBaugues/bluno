// Mock browser globals needed for tests
global.Audio = class {
  constructor() {
    this.play = jest.fn();
    this.pause = jest.fn();
  }
};

// Clear mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});