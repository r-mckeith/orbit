process.env.TAMAGUI_TARGET = 'native';

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          targets: {
            esmodules: true,
          },
        },
      ],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './components',
            '@screens': './app/screens',
            '@src': './src',
            '@hooks': './src/hooks',
            '@contexts': './src/contexts',
            '@api': './src/api',
            '@types': './types',
          },
        },
    ],
      // has to be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
