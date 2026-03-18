require("dotenv").config();
const { defineConfig } = require("cypress");

const REQUIRED_VARS = [
  "CLOUDASSISTANT_URL",
  "CLOUDASSISTANT_USER",
  "CLOUDASSISTANT_PASSWORD",
];

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      const missing = REQUIRED_VARS.filter((k) => !process.env[k]);
      if (missing.length) {
        throw new Error(
          `Variables de entorno requeridas no definidas: ${missing.join(", ")}`
        );
      }

      config.baseUrl = process.env.CLOUDASSISTANT_URL;

      config.env.cloudassistantUrl = process.env.CLOUDASSISTANT_URL;
      config.env.cloudassistantUser = process.env.CLOUDASSISTANT_USER;
      config.env.cloudassistantPassword = process.env.CLOUDASSISTANT_PASSWORD;

      return config;
    },
  },
});
