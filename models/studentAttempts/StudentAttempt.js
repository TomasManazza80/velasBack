const Sequelize = require("sequelize");
const db = require("../../dbconnection/db");

const StudentAttempt = db.define("StudentAttempt", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  task_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  transcribed_text: {
    type: Sequelize.TEXT,
  },
  score: {
    type: Sequelize.INTEGER,
  },
  feedback_json: {
    type: Sequelize.JSON,
  },
  sentence_index: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = StudentAttempt;
