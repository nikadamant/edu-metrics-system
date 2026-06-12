const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Attempt = require('../models/Attempt');

router.get('/', async (req, res) => {
  const tests = await Test.find({}, 'title description');
  res.json(tests);
});

router.get('/:id', async (req, res) => {
  const test = await Test.findById(req.params.id);
  res.json(test);
});

router.post('/submit', async (req, res) => {
  try {
    const { userId, testId, score, metrics, startTime } = req.body;

    const newAttempt = new Attempt({
      userId: userId || null,
      testId,
      score: score || 0,
      startTime: startTime || new Date(Date.now() - 60000),
      endTime: new Date(),
      metrics: metrics || []
    });

    await newAttempt.save();
    res.status(201).json({ message: "Test transaction successfully saved", score: newAttempt.score });
  } catch (err) {
    console.error("Proctoring submission database error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/attempts/all', async (req, res) => {
  try {
    const attempts = await Attempt.find()
      .populate('testId', 'title')
      .populate('userId', 'email')
      .sort({ endTime: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;