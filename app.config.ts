import type { ExpoConfig } from "expo/config";
const appJson = require("./app.json");

// Variáveis de versão com fallback seguro
const version = process.env.APP_VERSION ?? "1.0.0";
const buildNumber = process.env.APP_BUILD_NUMBER ?? "1";

const config: ExpoConfig = {
  ...appJson.expo,
  name: "Revvy",
  slug: "revvy",
  version,
  icon: "./assets/ios-dark.png",
  ios: {
    ...appJson.expo?.ios,
    supportsTablet: false,
    bundleIdentifier: "com.beecodeit.revy",
    buildNumber,
    icon: {
      light: "./assets/ios-light.png",
      dark: "./assets/ios-dark.png",
      tinted: "./assets/ios-tinted.png",
    },
  },
  android: {
    ...appJson.expo?.android,
    package: "com.beecodeit.revy",
    versionCode: parseInt(buildNumber, 10),
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
  },
  plugins: [
    ...(appJson.expo?.plugins ?? []),
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff",
        image: "./assets/splash-icon-light.png",
        imageWidth: 200,
        dark: {
          backgroundColor: "#000000",
          image: "./assets/splash-icon-dark.png",
          imageWidth: 200,
        },
      },
    ],
  ],
  extra: {
    revenueCatIosKey: process.env.EXPO_PUBLIC_RC_KEY_IOS_PROD,
    revenueCatAndroidKey: process.env.EXPO_PUBLIC_RC_KEY_ANDROID_PROD,
  },
};

export default config;
