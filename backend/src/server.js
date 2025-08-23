require('dotenv').config();
const app = require('./app');
const { sequelize, testConnection } = require('./config/db');
const { sequelize: modelsSequelize } = require('./models'); 

const PORT = process.env.PORT || 3001;

(async () => {
  await testConnection();
  await modelsSequelize.sync();
  app.listen(PORT, () => console.log(`🚀 API rodando em http://localhost:${PORT}`));
})();
