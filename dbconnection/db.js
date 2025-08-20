require('dotenv').config();
const { Sequelize } = require('sequelize');

// Determinar si estamos en un entorno local o remoto
const isLocal = process.env.DB_HOST === 'localhost' || 
                process.env.DB_HOST === '127.0.0.1';

// Configuración adaptable para diferentes entornos
const sequelizeConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: msg => console.log(msg), // Solo para depuración
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 5,
    match: [
      /Connection terminated unexpectedly/,
      /ETIMEDOUT/,
      /ECONNRESET/,
      /SequelizeConnectionError/
    ]
  }
};

// Añadir configuración SSL solo para entornos no locales
if (!isLocal) {
  sequelizeConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    keepAlive: true,
    statement_timeout: 10000,
    connectionTimeoutMillis: 10000
  };
}

const sequelize = new Sequelize(process.env.DATABASE_URL || sequelizeConfig);

// Verificación mejorada de conexión con mensajes específicos por entorno
(async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Conexión exitosa a PostgreSQL (${isLocal ? 'Local' : 'Remoto'})`);
    
    const [result] = await sequelize.query('SELECT version() as postgres_version');
    console.log(`🔍 Versión de PostgreSQL: ${result[0].postgres_version}`);
    console.log(`🔧 Modo SSL: ${!isLocal ? 'ACTIVADO' : 'DESACTIVADO'}`);
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error(error.original?.message || error.message);
    
    console.error('\n🔍 Pasos para solucionar:');
    if (isLocal) {
      console.error('1. Verifica que PostgreSQL esté corriendo localmente:');
      console.error('   sudo service postgresql status');
      console.error('2. Prueba conectarte manualmente con:');
      console.error(`   psql -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME}`);
    } else {
      console.error('1. Verifica EN RENDER/AWS que:');
      console.error('   - La base de datos está ACTIVA (no pausada)');
      console.error('   - Las credenciales coinciden EXACTAMENTE');
      console.error('2. Prueba conectarte manualmente con:');
      console.error(`   psql "${process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`}"`);
    }
    
    console.error('\n💡 Consejo adicional:');
    console.error('   - Para desarrollo local, asegúrate de que tu .env tenga DB_HOST=localhost');
    console.error('   - Para producción, verifica que DATABASE_URL esté correctamente configurada');
  }
})();

module.exports = sequelize;