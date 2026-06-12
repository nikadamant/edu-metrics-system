const mongoose = require('mongoose');
const Test = require('./models/Test');

mongoose.connect('mongodb://127.0.0.1:27017/edu-metrics');

const sampleTest = {
  title: "Advanced Web Development & Architecture",
  description: "Comprehensive assessment of JavaScript internals, HTTP protocols, and browser security layers.",
  questions: [
    { 
      questionText: "What is a closure in JavaScript?", 
      options: ["A function bundled with its lexical environment", "A method to close browser tabs", "A secure database connection encryptor"], 
      correctAnswer: 0,
      estimatedTime: 20
    },
    { 
      questionText: "Which HTTP status code represents 'Internal Server Error'?", 
      options: ["200 OK", "404 Not Found", "500 Internal Server Error", "403 Forbidden"], 
      correctAnswer: 2,
      estimatedTime: 10
    },
    { 
      questionText: "What is the primary purpose of the Same-Origin Policy (SOP) in browsers?", 
      options: ["To isolate potentially malicious documents", "To speed up image rendering", "To force users to use modern HTTPS networks"], 
      correctAnswer: 0,
      estimatedTime: 30
    },
    { 
      questionText: "Which event loop phase executes setTimeout callbacks?", 
      options: ["Poll phase", "Timers phase", "Check phase", "Close callbacks phase"], 
      correctAnswer: 1,
      estimatedTime: 25
    },
    { 
      questionText: "What does the 'use strict' directive achieve in modern JS?", 
      options: ["Enforces stricter parsing and error handling", "Compresses the code at runtime", "Prevents external API modifications"], 
      correctAnswer: 0,
      estimatedTime: 15
    }
  ]
};

async function seedDB() {
  await Test.deleteMany({});
  await Test.insertMany([sampleTest]);
  console.log("Database successfully updated!");
  process.exit();
}

seedDB();