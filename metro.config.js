const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Prevent Metro from crashing on Windows when watching Android C++ temp build files
config.resolver.blockList = [
  ...Array.from(config.resolver.blockList || []),
  /.*\/android\/\.cxx\/.*/,
];

module.exports = withNativeWind(config, { input: "./global.css" });
