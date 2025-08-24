require("dotenv").config();
const app = require("./app");
const { sequelize, testConnection } = require("./config/db.js");
const { sequelize: modelsSequelize } = require("./models");
const { syncModels } = require("./models");

const PORT = process.env.PORT || 3001;

// (async () => {
//   await testConnection();
//   await modelsSequelize.sync();
//   app.listen(PORT, () => console.log(`🚀 API rodando em http://localhost:${PORT}`));
// })();

async function startServer() {
  await testConnection();
  await syncModels();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🚀 Backend rodando e acessível na rede em http://192.168.0.40:${PORT}`
    );
  });
}
startServer();
