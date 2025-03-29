import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function JobList({ jobs, currentPage, totalPages, onPageChange, favorites, setFavorites, trendingKeywords, allCompanies, allLocations }) {
  const [filterCompany, setFilterCompany] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [alertKeyword, setAlertKeyword] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [previewJob, setPreviewJob] = useState(null);
  const [sortBy, setSortBy] = useState("title");
  const [compareJobs, setCompareJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // New tab state

  // Filter jobs based on search criteria
  const filteredJobs = jobs.filter(job => {
    const companyMatch = (job.company || "").toLowerCase().includes(filterCompany.toLowerCase());
    const locationMatch = (job.location || "").toLowerCase().includes(filterLocation.toLowerCase());
    const keywordMatch = job.keywords.some(kw => kw.toLowerCase().includes(filterKeyword.toLowerCase()));
    return companyMatch && locationMatch && keywordMatch;
  });

  // Sort jobs based on selected criteria
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "company") return a.company.localeCompare(b.company);
    if (sortBy === "location") return a.location.localeCompare(b.location);
    return 0;
  });

  // Toggle favorite status for a job
  const toggleFavorite = (job) => {
    setFavorites(prev => 
      prev.some(fav => fav.url === job.url) 
        ? prev.filter(fav => fav.url !== job.url) 
        : [...prev, job]
    );
  };

  // Toggle job comparison
  const toggleCompare = (job) => {
    setCompareJobs(prev => 
      prev.some(j => j.url === job.url) 
        ? prev.filter(j => j.url !== job.url) 
        : [...prev, job].slice(0, 3)
    );
  };

  // Add new alert keyword
  const addAlert = () => {
    if (alertKeyword && !alerts.includes(alertKeyword)) {
      setAlerts([...alerts, alertKeyword]);
      setAlertKeyword("");
    }
  };

  // Remove alert keyword
  const removeAlert = (alertToRemove) => {
    setAlerts(alerts.filter(alert => alert !== alertToRemove));
  };

  // Chart data preparation
  const companyCount = filteredJobs.reduce((acc, job) => {
    const shortName = job.company.length > 10 ? job.company.slice(0, 7) + "..." : job.company;
    acc[shortName] = (acc[shortName] || 0) + 1;
    return acc;
  }, {});
  const topCompanies = Object.entries(companyCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const barData = {
    labels: topCompanies.map(([company]) => company),
    datasets: [
      {
        label: "Job Openings",
        data: topCompanies.map(([, count]) => count),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 35,
      },
    ],
  };

  const locationCount = filteredJobs.reduce((acc, job) => {
    const shortLoc = job.location.length > 10 ? job.location.slice(0, 7) + "..." : job.location;
    acc[shortLoc] = (acc[shortLoc] || 0) + 1;
    return acc;
  }, {});
  const topLocations = Object.entries(locationCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const pieData = {
    labels: topLocations.map(([location]) => location),
    datasets: [
      {
        data: topLocations.map(([, count]) => count),
        backgroundColor: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Top Companies", font: { size: 18, weight: "bold" }, padding: { bottom: 20 } },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: { size: 12 },
          padding: 15,
          autoSkip: false,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Jobs", font: { size: 14 } },
        grid: { color: "#e5e7eb" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 15, font: { size: 12 }, padding: 20 } },
      title: { display: true, text: "Top Locations", font: { size: 18, weight: "bold" }, padding: { bottom: 20 } },
    },
  };

  // Jobs to display based on active tab
  const jobsToDisplay = activeTab === "favorites" ? favorites : sortedJobs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </h2>
              
              <div className="space-y-5">
                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={filterCompany}
                      onChange={(e) => setFilterCompany(e.target.value)}
                      list="companies"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <datalist id="companies">
                    {allCompanies.map((company, idx) => <option key={idx} value={company} />)}
                  </datalist>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search locations..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      list="locations"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <datalist id="locations">
                    {allLocations.map((loc, idx) => <option key={idx} value={loc} />)}
                  </datalist>
                </div>

                {/* Keyword Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keyword</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by keyword..."
                      value={filterKeyword}
                      onChange={(e) => setFilterKeyword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 appearance-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="title">Job Title</option>
                      <option value="company">Company</option>
                      <option value="location">Location</option>
                    </select>
                    <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  </div>
                </div>

                {/* Job Alerts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Alerts</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Add alert keyword..."
                        value={alertKeyword}
                        onChange={(e) => setAlertKeyword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <button
                      onClick={addAlert}
                      className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center"
                      title="Add alert"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alerts.map((alert, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {alert}
                        <button 
                          onClick={() => removeAlert(alert)}
                          className="ml-1.5 inline-flex items-center justify-center w-3 h-3 text-blue-400 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clear Filters Button */}
                <button
                  onClick={() => {
                    setFilterCompany("");
                    setFilterLocation("");
                    setFilterKeyword("");
                  }}
                  className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-all flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear all filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Stats Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Job Opportunities</h1>
                  <p className="text-gray-600 mt-1">Find your dream job today</p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {filteredJobs.length} jobs found
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Trending: {trendingKeywords.slice(0, 2).join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 h-80">
                <Bar data={barData} options={barOptions} />
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 h-80">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>

            {/* Job Listings Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "all" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    All Jobs ({sortedJobs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "favorites" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                  >
                    Favorites ({favorites.length})
                    {favorites.length > 0 && (
                      <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </nav>
              </div>

              {/* Job Listings */}
              <div className="divide-y divide-gray-200">
                {jobsToDisplay.length > 0 ? (
                  jobsToDisplay.map((job, index) => (
                    <div
                      key={index}
                      className="p-6 hover:bg-gray-50 transition-colors duration-150"
                      onMouseEnter={() => setPreviewJob(job)}
                      onMouseLeave={() => setPreviewJob(null)}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start">
                        {/* Job Content */}
                        <div className="flex-1">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                              <span className="text-blue-600 font-medium text-lg">
                                {job.company ? job.company.charAt(0).toUpperCase() : '?'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                <a 
                                  href={job.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="hover:text-blue-600 hover:underline focus:outline-none"
                                >
                                  {job.title}
                                </a>
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {job.company || "N/A"} • {job.location}
                              </p>
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                {job.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {job.keywords.slice(0, 4).map((kw, idx) => (
                                  <span 
                                    key={idx} 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Job Actions */}
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center sm:items-start space-x-3">
                          <button
                            onClick={() => toggleFavorite(job)}
                            className={`p-2 rounded-full ${favorites.some(fav => fav.url === job.url) ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"} transition-colors`}
                            title={favorites.some(fav => fav.url === job.url) ? "Remove from favorites" : "Add to favorites"}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => toggleCompare(job)}
                            className={`p-2 rounded-full ${compareJobs.some(j => j.url === job.url) ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"} transition-colors`}
                            title={compareJobs.some(j => j.url === job.url) ? "Remove from comparison" : "Add to comparison"}
                            disabled={compareJobs.length >= 3 && !compareJobs.some(j => j.url === job.url)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {activeTab === "favorites" 
                        ? "You haven't saved any favorites yet." 
                        : "Try adjusting your search or filter to find what you're looking for."}
                    </p>
                    {activeTab === "favorites" && (
                      <button
                        onClick={() => setActiveTab("all")}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Browse all jobs
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 0 && !infiniteScroll && jobsToDisplay.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl shadow-sm p-4">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{' '}
                    <span className="font-medium">{totalPages * 10}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Infinite Scroll Toggle */}
            <div className="text-center">
              <button
                onClick={() => setInfiniteScroll(!infiniteScroll)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {infiniteScroll ? (
                  <>
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Switch to Pagination
                  </>
                ) : (
                  <>
                    <svg className="mr-2 -ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Switch to Infinite Scroll
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Job Preview Card */}
        {previewJob && (
          <div className="fixed right-6 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform transition-all duration-200 ease-in-out">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium">
                    {previewJob.company ? previewJob.company.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">{previewJob.title}</h3>
                  <p className="text-sm text-gray-500">{previewJob.company} • {previewJob.location}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{previewJob.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {previewJob.keywords.slice(0, 3).map((kw, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {kw}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <a 
                  href={previewJob.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Job
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-600 mt-1">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Job Description</h3>
                    <p className="mt-1 text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Requirements</h3>
                    <ul className="mt-2 space-y-2 text-gray-600">
                      {selectedJob.requirements?.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {req}
                        </li>
                      )) || <li className="text-gray-500">No specific requirements listed</li>}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedJob.keywords.map((kw, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleFavorite(selectedJob)}
                      className={`p-2 rounded-full ${favorites.some(fav => fav.url === selectedJob.url) ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"} transition-colors`}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <span className="text-sm text-gray-500">
                      {favorites.some(fav => fav.url === selectedJob.url) ? "Saved to favorites" : "Add to favorites"}
                    </span>
                  </div>
                  <a
                    href={selectedJob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Apply Now
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        {compareJobs.length > 1 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Compare Jobs ({compareJobs.length})</h2>
                  <button
                    onClick={() => setCompareJobs([])}
                    className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {compareJobs.map((job, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-medium">
                            {job.company ? job.company.charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Description</h4>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-3">{job.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Key Skills</h4>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {job.keywords.slice(0, 5).map((kw, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Job
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobList;