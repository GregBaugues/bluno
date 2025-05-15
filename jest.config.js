module.exports = {
  // Tell Jest to handle JavaScript modules
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  // Use jsdom environment for browser-like global variables
  testEnvironment: 'jsdom',
  // Collect coverage from src directory
  collectCoverageFrom: [
    'src/**/*.js',
    '!**/node_modules/**'
  ],
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // Handle static assets and CSS imports
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/unit/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/unit/__mocks__/styleMock.js'
  },
  // Set up a setup file for any global test setup
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.js'],
  // Automatically clear mock calls, instances and results before every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  // Updated test pattern to include simplified tests
  testMatch: [
    "**/tests/*.test.js",
    "**/tests/unit/**/*.test.js"
  ]
};