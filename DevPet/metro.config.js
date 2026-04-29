const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  'react-native-fs': require.resolve('expo-file-system'),
};

module.exports = config;
