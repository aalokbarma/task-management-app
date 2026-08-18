module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    test: {
      plugins: ['dynamic-import-node'],
    },
  },
};
