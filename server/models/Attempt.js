const mongoose = require('mongoose');
const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  score: Number,
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  metrics: [{
    eventType: { type: String }, // 'tab-switch', 'copy-paste', 'context-menu', 'time-anomaly'
    timestamp: { type: Date, default: Date.now },
    details: String
  }]
});
module.exports = mongoose.model('Attempt', attemptSchema);