const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  salary: String,
  description: String,
  url: String,
  keywords: [String], // For trending jobs
});

module.exports = mongoose.model('Job', jobSchema);