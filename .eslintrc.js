module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
};
