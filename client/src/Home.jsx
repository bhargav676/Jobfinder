import React, { useState, useEffect } from "react";
import axios from "axios";
import JobList from "./components/JobList";
import TrendingJobs from "./components/TrendingJobs";

function App() {
  const [jobs, setJobs] = useState([]);
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const fetchJobs = async (pageNum = 1) => {
    if (!location || !role) return;
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/jobs/fetch", {
        params: { location, role, page: pageNum, limit: 10 },
      });
      setJobs(response.data.jobs);
      setTotalPages(response.data.totalPages);
      setTrendingKeywords(response.data.trendingKeywords);
      setAllCompanies(response.data.allCompanies);
      setAllLocations(response.data.allLocations);
      setPage(pageNum);
      setSearchHistory(prev => [...new Set([`${role} in ${location}`, ...prev.slice(0, 4)])]);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobs([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) return alert("Voice search not supported.");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const [r, l] = transcript.split(" in ");
      setRole(r || transcript);
      setLocation(l || "");
      fetchJobs(1);
    };
    recognition.start();
  };

  useEffect(() => {
    document.body.className = "bg-gray-50";
  }, []);

  // Comprehensive list of Indian states and districts
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

  const filteredLocations = indianLocations.filter(loc => 
    loc.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            JobFinder
          </h1>
        </header>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Dual-Purpose Location Input */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setIsLocationDropdownOpen(true);
                }}
                onFocus={() => setIsLocationDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsLocationDropdownOpen(false), 200)}
                placeholder="Type or select a city..."
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {isLocationDropdownOpen && filteredLocations.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      onMouseDown={() => {
                        setLocation(loc);
                        setIsLocationDropdownOpen(false);
                      }}
                      className="p-2 hover:bg-blue-50 cursor-pointer text-gray-700 transition-colors"
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-5">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select Role</option>
                {["software engineer", "data analyst", "project manager", "graphic designer", "business consultant", "solution architect", "system administrator", "marketing specialist", "devops engineer", "product manager", "ui/ux designer", "financial analyst", "cloud engineer", "cybersecurity specialist", "sales manager", "hr manager", "web developer", "mobile developer"].map(r => (
                  <option key={r} value={r}>{r.replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                onClick={() => fetchJobs(1)}
                className="flex-1 p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
                disabled={!role || !location}
              >
                Search
              </button>
              <button
                onClick={handleVoiceSearch}
                className="p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                🎤
              </button>
            </div>
          </div>

          {searchHistory.length > 0 && (
            <div className="mt-4 bg-gray-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => { const [r, l] = search.split(" in "); setRole(r); setLocation(l); fetchJobs(1); }}
                    className="px-3 py-1 bg-white rounded-full text-sm hover:bg-blue-50 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
          </div>
        ) : (
          <JobList
            jobs={jobs}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={fetchJobs}
            favorites={favorites}
            setFavorites={setFavorites}
            trendingKeywords={trendingKeywords}
            allCompanies={allCompanies}
            allLocations={allLocations}
          />
        )}
        <TrendingJobs />
      </div>
    </div>
  );
}

export default App;