const Sequelize = require("sequelize");
const db = require("../../dbconnection/db");

const PronunciationTask = db.define("PronunciationTask", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  instruction: {
    type: Sequelize.TEXT,
  },
  expected_text: {
    type: Sequelize.JSON,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = PronunciationTask;
