// Configuration Metro pour Expo.
// On se contente d'étendre la config par défaut : Expo/Metro active alors
// automatiquement son cache disque (node_modules/.cache/metro), ce qui
// accélère fortement les démarrages suivants de `npm start`.
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
