export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\.(css|less|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\.(js|jsx|mjs)$': 'babel-jest'
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom']
};