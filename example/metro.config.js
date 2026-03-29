const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const libraryRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the parent library source
config.watchFolders = [libraryRoot];

// Resolve from both example and root node_modules (workspace hoisting)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(libraryRoot, "node_modules"),
];

module.exports = config;
