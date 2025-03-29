const express = require("express");
const router = express.Router();
const axios = require("axios");
const Job = require("../models/Job");

router.get('/fetch', async (req, res) => {
  try {
    const { location, role, page = 1, limit = 10 } = req.query;

    const indianLocations = [
       // Andhra Pradesh
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru","srikakulam",
    // Telangana
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Adilabad", "Suryapet", "Medak", "Rangareddy",
    // Maharashtra
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Thane", "Kolhapur", "Ahmednagar", "Latur",
    // Karnataka
    "Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Davangere", "Shimoga", "Tumkur", "Bijapur", "Bellary",
    // Tamil Nadu
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode", "Vellore", "Thanjavur", "Dindigul", "Tirunelveli",
    // Kerala
    "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur", "Kottayam", "Malappuram",
    // Gujarat
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Mehsana",
    // Rajasthan
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara", "Sikar", "Pali",
    // Uttar Pradesh
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Noida", "Bareilly", "Moradabad",
    // Madhya Pradesh
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna", "Ratlam", "Dewas",
    // West Bengal
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Darjeeling", "Malda", "Jalpaiguri", "Bardhaman", "Kharagpur",
    // Bihar
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger",
    // Haryana
    "Gurugram", "Faridabad", "Hisar", "Rohtak", "Panipat", "Karnal", "Sonipat", "Yamunanagar", "Ambala", "Bhiwani",
    // Punjab
    "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga",
    // Odisha
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Jharsuguda", "Baripada", "Keonjhar",
    // Jharkhand
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Phusro", "Medininagar",
    // Assam
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Diphu",
    // Other States and UTs
    "Delhi", "New Delhi", "Goa", "Panaji", "Puducherry", "Imphal", "Shillong", "Aizawl", "Kohima", "Itanagar", "Gangtok", "Agartala", "Port Blair", "Srinagar", "Jammu", "Leh",
      ];
    const usLocations = ["new york"];
    const ukLocations = ["london"];
    const singaporeLocations = ["singapore"];
    const uaeLocations = ["dubai"];
    const australiaLocations = ["sydney"];

    const locLower = location.toLowerCase();
    let countryCode = indianLocations.includes(locLower) ? "in" : ukLocations.includes(locLower) ? "gb" : usLocations.includes(locLower) ? "us" : singaporeLocations.includes(locLower) ? "sg" : uaeLocations.includes(locLower) ? "ae" : australiaLocations.includes(locLower) ? "au" : "in";

    console.log(`Fetching jobs for ${location}, page ${page}, limit ${limit}`);

    let allJobs = [];
    for (let i = 1; i <= 2 && allJobs.length < 100; i++) {
      const response = await axios.get(
        `http://api.adzuna.com/v1/api/jobs/${countryCode}/search/${i}?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&what=${role}&where=${location}&results_per_page=50&content-type=application/json`
      );
      allJobs = allJobs.concat(response.data.results);
    }

    console.log("Total jobs fetched:", allJobs.length);

    const jobs = allJobs.map(job => ({
      title: job.title,
      company: job.company?.display_name || "Unknown Company",
      location: job.location?.display_name || "Unknown Location",
      description: job.description || "No description available",
      url: job.redirect_url || "#",
      keywords: job.title.split(" ").concat(job.description?.split(" ").slice(0, 10) || []),
    }));

    await Job.insertMany(jobs.slice(0, 100), { ordered: false }).catch(() => console.log("Duplicates skipped"));

    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginatedJobs = jobs.slice(start, end);

    const keywordFreq = {};
    const companies = new Set();
    const locations = new Set();
    jobs.forEach(job => {
      job.keywords.forEach(kw => keywordFreq[kw] = (keywordFreq[kw] || 0) + 1);
      companies.add(job.company);
      locations.add(job.location);
    });
    const trendingKeywords = Object.entries(keywordFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([kw]) => kw);

    res.json({
      jobs: paginatedJobs,
      totalJobs: Math.min(allJobs.length, 100),
      totalPages: Math.ceil(Math.min(allJobs.length, 100) / limit),
      trendingKeywords,
      allCompanies: Array.from(companies),
      allLocations: Array.from(locations),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error.message);
    res.status(500).json({ jobs: [], totalJobs: 0, totalPages: 0, trendingKeywords: [], allCompanies: [], allLocations: [] });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const jobs = await Job.find();
    const keywordFreq = {};
    jobs.forEach(job => {
      job.keywords.forEach(keyword => {
        keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
      });
    });
    const trending = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword);
    const trendingJobs = await Job.find({ keywords: { $in: trending } }).limit(10);
    res.json(trendingJobs);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
});

module.exports = router;