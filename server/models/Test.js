const mongoose = require('mongoose');
const testSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: Number
  }]
});
module.exports = mongoose.model('Test', testSchema);