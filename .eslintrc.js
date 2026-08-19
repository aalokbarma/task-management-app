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
        {
          files: ['scripts/**/*.js'],
          env: {
            node: true,
          },
        },
  ],
};
