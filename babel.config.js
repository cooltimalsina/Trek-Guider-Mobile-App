module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Required when `import 'react-native-reanimated'` is used — omitting this often causes a blank white screen on iOS.
    plugins: ["react-native-reanimated/plugin"],
  };
};
