/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: {
      stream:         require.resolve('stream-browserify'),
      string_decoder: require.resolve('string_decoder'),
      buffer:         require.resolve('buffer'),
      process:        require.resolve('process'),
      crypto:         require.resolve('react-native-crypto'),
      vm:             require.resolve('vm-browserify'),
      events:         require.resolve('events'),   // ← add this
    },
  },
};
