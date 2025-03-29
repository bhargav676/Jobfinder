import React, { useState, useEffect } from "react";
import axios from "axios";

function TrendingJobs() {
  const [trendingJobs, setTrendingJobs] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        console.log("Fetching trending jobs...");
        const response = await axios.get(`${import.meta.env.VITE_BASE_trendapi}`);
        console.log("Trending jobs response:", response.data);
        setTrendingJobs(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching trending jobs:", error.response?.data || error.message);
        setTrendingJobs([]);
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Trending Jobs in India
      </h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        {Array.isArray(trendingJobs) && trendingJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingJobs.map((job, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 bg-white"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    {job.title}
                  </a>
                </h3>
                <p className="text-gray-600 text-sm">
                  {job.company || "Unknown Company"}
                </p>
                {job.location && (
                  <p className="text-gray-500 text-sm mt-1">
                    {job.location}
                  </p>
                )}
                {job.keywords && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.keywords.slice(0, 3).map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No trending jobs available at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrendingJobs;