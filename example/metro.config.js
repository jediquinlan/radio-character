const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the parent library source
config.watchFolders = [libraryRoot];

// Only resolve from the example's node_modules — prevents duplicate React
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

// Block the parent's node_modules so metro never picks up a second React
config.resolver.blockList = [
  new RegExp(
    path.resolve(libraryRoot, "node_modules").replace(/[/\\]/g, "[/\\\\]") +
      ".*"
  ),
];

module.exports = config;
