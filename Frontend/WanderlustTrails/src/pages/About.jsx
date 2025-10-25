// Frontend/WanderlustTrails/src/pages/About.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobeAltIcon, MapIcon, SparklesIcon, UserGroupIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function About() {
  const [githubData, setGithubData] = useState(null);
  const [userRepos, setUserRepos] = useState([]);
  const [totalStars, setTotalStars] = useState(0);
  const [totalCommits, setTotalCommits] = useState(0);
  const [languageStats, setLanguageStats] = useState([]);
  const [contributionStats, setContributionStats] = useState({ thisWeek: 0, thisMonth: 0, thisYear: 0, allTime: 0 });

  const [projectRepo, setProjectRepo] = useState(null);
  const [projectCommits, setProjectCommits] = useState(0);
  const [projectContributors, setProjectContributors] = useState([]);
  const [projectLanguages, setProjectLanguages] = useState({});
  const [projectContributionStats, setProjectContributionStats] = useState({ thisWeek: 0, thisMonth: 0, thisYear: 0, allTime: 0 });
  const [projectPackages, setProjectPackages] = useState({ total: 0 });
  const [recentProjectCommits, setRecentProjectCommits] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⚠️ IMPORTANT: Add your GitHub token here!
  // Get one from: https://github.com/settings/tokens
  // Select scope: 'repo' (for private repos) or leave empty for public only
  
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || "";
  
  const githubHeaders = GITHUB_TOKEN 
    ? { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
    : {};

  const fetchGitHub = async (url) => {
    try {
      const response = await fetch(url, { headers: githubHeaders });
      
      if (response.status === 403 || response.status === 429) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const resetDate = resetTime ? new Date(resetTime * 1000) : null;
        console.warn(`Rate limit hit. Add GitHub token. Resets at ${resetDate?.toLocaleTimeString()}`);
        throw new Error('Rate limit exceeded. Please add a GitHub token or wait.');
      }
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      // Silently fail individual requests to prevent spam
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true; // Prevent state updates after unmount

    const fetchAllData = async () => {
      try {
        // === USER DATA ===
        const userData = await fetchGitHub('https://api.github.com/users/vamshikittu22');
        if (!isMounted || !userData) return;
        setGithubData(userData);

        // === REPOS ===
        const reposData = await fetchGitHub('https://api.github.com/users/vamshikittu22/repos?per_page=100&sort=updated');
        if (!isMounted || !reposData) return;
        setUserRepos(reposData);

        const stars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        setTotalStars(stars);

        // === COMMITS - REDUCED API CALLS ===
        // Only check Wanderlusttrails for commits instead of all repos
        const wanderlustContributors = await fetchGitHub('https://api.github.com/repos/vamshikittu22/Wanderlusttrails/contributors');
        if (wanderlustContributors) {
          const userCommits = wanderlustContributors.find(c => c.login === 'vamshikittu22');
          if (userCommits) {
            setTotalCommits(userCommits.contributions);
          }
        }

        // === CONTRIBUTIONS - Use external API (no rate limit) ===
        try {
          const contributionResponse = await fetch(`https://github-contributions-api.jogruber.de/v4/vamshikittu22`);
          if (contributionResponse.ok) {
            const contributionData = await contributionResponse.json();
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            
            let thisWeek = 0, thisMonth = 0, thisYear = 0, allTime = 0;
            
            contributionData.contributions.forEach(day => {
              const dayDate = new Date(day.date);
              allTime += day.count;
              if (dayDate >= oneWeekAgo) thisWeek += day.count;
              if (dayDate >= oneMonthAgo) thisMonth += day.count;
              if (dayDate >= oneYearAgo) thisYear += day.count;
            });
            
            if (isMounted) {
              setContributionStats({ thisWeek, thisMonth, thisYear, allTime });
            }
          }
        } catch (err) {
          console.log('Contribution stats unavailable');
        }

        // === LANGUAGES - ONLY TOP 5 REPOS ===
        const topRepos = reposData.slice(0, 5); // REDUCED from 15
        const aggregatedLanguages = {};
        
        for (const repo of topRepos) {
          const langs = await fetchGitHub(`https://api.github.com/repos/${repo.full_name}/languages`);
          if (langs) {
            Object.entries(langs).forEach(([lang, bytes]) => {
              aggregatedLanguages[lang] = (aggregatedLanguages[lang] || 0) + bytes;
            });
          }
        }

        const totalBytes = Object.values(aggregatedLanguages).reduce((a, b) => a + b, 0);
        if (totalBytes > 0) {
          const languagePercentages = Object.entries(aggregatedLanguages)
            .map(([lang, bytes]) => ({
              language: lang,
              percentage: ((bytes / totalBytes) * 100).toFixed(1)
            }))
            .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
            .slice(0, 5);
          
          if (isMounted) {
            setLanguageStats(languagePercentages);
          }
        }

        // === WANDERLUSTTRAILS PROJECT ===
        const projectData = await fetchGitHub('https://api.github.com/repos/vamshikittu22/Wanderlusttrails');
        if (isMounted && projectData) {
          setProjectRepo(projectData);
        }

        const projectLangData = await fetchGitHub('https://api.github.com/repos/vamshikittu22/Wanderlusttrails/languages');
        if (isMounted && projectLangData) {
          setProjectLanguages(projectLangData);
        }

        if (wanderlustContributors && isMounted) {
          setProjectContributors(wanderlustContributors);
          const totalProjectCommits = wanderlustContributors.reduce((acc, c) => acc + c.contributions, 0);
          setProjectCommits(totalProjectCommits);
        }

        // Project contributions
        const projectCommitsData = await fetchGitHub('https://api.github.com/repos/vamshikittu22/Wanderlusttrails/commits?per_page=100');
        if (projectCommitsData && isMounted) {
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          
          let weekCommits = 0, monthCommits = 0, yearCommits = 0;
          
          projectCommitsData.forEach(commit => {
            const commitDate = new Date(commit.commit.author.date);
            if (commitDate >= oneWeekAgo) weekCommits++;
            if (commitDate >= oneMonthAgo) monthCommits++;
            if (commitDate >= oneYearAgo) yearCommits++;
          });
          
          setProjectContributionStats({
            thisWeek: weekCommits,
            thisMonth: monthCommits,
            thisYear: yearCommits,
            allTime: projectCommits
          });
        }

        // Recent commits
        const recentCommits = await fetchGitHub('https://api.github.com/repos/vamshikittu22/Wanderlusttrails/commits?per_page=3');
        if (recentCommits && isMounted) {
          setRecentProjectCommits(recentCommits);
        }

        // Package count
        try {
          let packageResponse = await fetch('https://raw.githubusercontent.com/vamshikittu22/Wanderlusttrails/main/Frontend/WanderlustTrails/package.json');
          if (!packageResponse.ok) {
            packageResponse = await fetch('https://raw.githubusercontent.com/vamshikittu22/Wanderlusttrails/main/package.json');
          }
          if (packageResponse.ok) {
            const packageData = await packageResponse.json();
            const depCount = Object.keys(packageData.dependencies || {}).length;
            const devDepCount = Object.keys(packageData.devDependencies || {}).length;
            if (isMounted) {
              setProjectPackages({ total: depCount + devDepCount });
            }
          }
        } catch (err) {
          console.log('Package.json not found');
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    fetchAllData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once

  const getProjectLanguagePercentages = () => {
    const totalBytes = Object.values(projectLanguages).reduce((a, b) => a + b, 0);
    if (totalBytes === 0) return [];
    
    return Object.entries(projectLanguages)
      .map(([lang, bytes]) => ({
        language: lang,
        percentage: ((bytes / totalBytes) * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
  };

  const languageColors = {
    JavaScript: 'bg-yellow-500',
    Python: 'bg-blue-500',
    Java: 'bg-red-500',
    TypeScript: 'bg-blue-600',
    HTML: 'bg-orange-500',
    CSS: 'bg-purple-500',
    Go: 'bg-cyan-500',
    Rust: 'bg-orange-600',
    PHP: 'bg-indigo-500',
  };

  const socialLinks = [
    { name: 'GitHub', icon: <FaGithub className="h-6 w-6" />, url: 'https://github.com/vamshikittu22', color: 'hover:text-green-500' },
    { name: 'Twitter', icon: <FaTwitter className="h-6 w-6" />, url: 'https://twitter.com/yourusername', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: <FaInstagram className="h-6 w-6" />, url: 'https://instagram.com/yourusername', color: 'hover:text-pink-500' },
    { name: 'LinkedIn', icon: <FaLinkedin className="h-6 w-6" />, url: 'https://linkedin.com/in/yourusername', color: 'hover:text-blue-600' }
  ];

  const features = [
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-orange-700" />,
      title: "Global Destinations",
      description: "Discover handpicked destinations across the globe, from bustling cities to serene landscapes."
    },
    {
      icon: <MapIcon className="h-8 w-8 text-orange-700" />,
      title: "Smart Itineraries",
      description: "AI-powered trip planning that adapts to your preferences and travel style."
    },
    {
      icon: <SparklesIcon className="h-8 w-8 text-orange-700" />,
      title: "Unique Experiences",
      description: "Go beyond tourist spots with our curated selection of local experiences."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-orange-700" />,
      title: "Community Driven",
      description: "Get insights from a community of passionate travelers and locals."
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-500 text-lg mb-2">Unable to Load Data</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <div className="bg-gray-800 border border-gray-700 p-4 rounded text-left text-sm mb-4">
            <p className="text-orange-500 font-semibold mb-2">To fix this:</p>
            <ol className="text-gray-300 space-y-1 list-decimal list-inside text-xs">
              <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">github.com/settings/tokens</a></li>
              <li>Click "Generate new token (classic)"</li>
              <li>Select 'repo' scope (optional, for private repos)</li>
              <li>Copy the token</li>
              <li>Add it to GITHUB_TOKEN in About.jsx (line 27)</li>
            </ol>
          </div>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-orange-700 hover:bg-orange-600 text-white rounded text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      {/* Rest of your JSX - same as before */}
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-orange-700 mb-4">About Wanderlust Trails</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your journey begins with a single step. We're here to make sure every step is an adventure.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-8">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg border border-red-900">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium text-orange-700 mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 border border-red-900 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-8">Meet the Creator</h2>
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-orange-700 flex-shrink-0">
                <img
                  src={githubData?.avatar_url || "https://github.com/vamshikittu22.png"}
                  alt="Vamshi Krishna P"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-orange-700 mb-2">
                {githubData?.name || 'Vamshi Krishna Pullaiahgari'}
                <span className="block text-lg text-indigo-300 mt-1">Founder & Developer</span>
              </h2>
              <p className="text-gray-300 mb-4">
                {githubData?.bio || "Passionate traveler and technology enthusiast creating seamless travel planning experiences."}
              </p>
              <div className="flex space-x-4 justify-center md:justify-start">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className={`text-gray-400 ${social.color} transition-colors`}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-indigo-300 mb-4 text-center">Developer Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{userRepos.length}</div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Repositories</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{githubData?.followers || 0}</div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Followers</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{totalStars}</div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Total Stars</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-500">{totalCommits}</div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Commits</div>
              </div>
            </div>
          </div>

          {contributionStats.allTime > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-indigo-300 mb-3 text-center uppercase tracking-wider">Contributions</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-500">{contributionStats.thisWeek}</div>
                  <div className="text-gray-400 text-xs">Week</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-500">{contributionStats.thisMonth}</div>
                  <div className="text-gray-400 text-xs">Month</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-500">{contributionStats.thisYear}</div>
                  <div className="text-gray-400 text-xs">Year</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-lg font-bold text-orange-500">{contributionStats.allTime}</div>
                  <div className="text-gray-400 text-xs">Total</div>
                </div>
              </div>
            </div>
          )}

          {languageStats.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-indigo-300 mb-3 text-center uppercase tracking-wider">Technical Expertise</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {languageStats.map((lang, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{lang.language}</span>
                      <span className="text-orange-500">{lang.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-1.5 rounded-full">
                      <div 
                        className={`${languageColors[lang.language] || 'bg-gray-500'} h-1.5 rounded-full`}
                        style={{ width: `${lang.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {projectRepo && (
          <div className="bg-gray-800 rounded-xl p-8 border border-red-900 mb-12">
            <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-8">Project By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-orange-900/30 rounded-full">
                    <CodeBracketIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-500">{projectCommits}</p>
                <p className="text-gray-300 text-sm">Total Commits</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-orange-900/30 rounded-full">
                    <UserGroupIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-500">{projectContributors.length}</p>
                <p className="text-gray-300 text-sm">Contributors</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-orange-900/30 rounded-full">
                    <FaGithub className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-500">{projectRepo?.stargazers_count || 0}</p>
                <p className="text-gray-300 text-sm">Stars</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-orange-900/30 rounded-full">
                    <CodeBracketIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-500">{projectPackages.total}</p>
                <p className="text-gray-300 text-sm">Packages</p>
              </div>
            </div>

            {projectContributionStats.allTime > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-indigo-300 mb-4 text-center uppercase tracking-wider">Project Activity</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-xl font-bold text-orange-500">{projectContributionStats.thisWeek}</div>
                    <div className="text-gray-400 text-xs uppercase">Week</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-xl font-bold text-orange-500">{projectContributionStats.thisMonth}</div>
                    <div className="text-gray-400 text-xs uppercase">Month</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-xl font-bold text-orange-500">{projectContributionStats.thisYear}</div>
                    <div className="text-gray-400 text-xs uppercase">Year</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                    <div className="text-xl font-bold text-orange-500">{projectContributionStats.allTime}</div>
                    <div className="text-gray-400 text-xs uppercase">Total</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-700 grid md:grid-cols-2 gap-8">
              {getProjectLanguagePercentages().length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-indigo-300 mb-4 uppercase tracking-wider">Tech Stack</h3>
                  <div className="space-y-3">
                    {getProjectLanguagePercentages().map((lang, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-300">{lang.language}</span>
                          <span className="text-orange-500">{lang.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1.5 rounded-full">
                          <div 
                            className={`${languageColors[lang.language] || 'bg-gray-500'} h-1.5 rounded-full`}
                            style={{ width: `${lang.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentProjectCommits.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-indigo-300 mb-4 uppercase tracking-wider">Recent Commits</h3>
                  <div className="space-y-3">
                    {recentProjectCommits.map((commit, index) => (
                      <div key={index} className="border-l-2 border-orange-700 pl-3 py-2 bg-gray-900/50 rounded-r">
                        <div className="text-gray-300 text-xs mb-1 line-clamp-2">
                          {commit.commit.message.split('\n')[0]}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="text-orange-500">{commit.commit.author.name.split(' ')[0]}</span>
                          <span>•</span>
                          <span>{new Date(commit.commit.author.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-8 border border-red-900 mb-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-8 w-8 text-orange-700 mr-2" />
                <h2 className="text-2xl font-semibold text-indigo-300">Open Source Project</h2>
              </div>
              <p className="text-gray-300 mb-6">
                WanderlustTrails is open-source. Explore the code, contribute, or report issues on GitHub.
              </p>
              <a
                href="https://github.com/vamshikittu22/Wanderlusttrails"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md text-white bg-orange-700 hover:bg-orange-800 transition-colors"
              >
                <FaGithub className="mr-2 h-5 w-5" />
                View on GitHub
              </a>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-950 p-4 rounded font-mono text-sm overflow-x-auto">
                  <span className="text-green-400"># Clone</span><br/>
                  <span className="text-gray-400">$</span> git clone https://github.com/vamshikittu22/Wanderlusttrails.git<br/><br/>
                  <span className="text-green-400"># Install & Run</span><br/>
                  <span className="text-gray-400">$</span> npm install && npm run dev
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/" className="px-6 py-3 bg-orange-700 hover:bg-orange-800 text-white font-medium rounded-lg text-center transition-colors">
            Explore Destinations
          </Link>
          <Link to="/contactUs" className="px-6 py-3 bg-transparent border-2 border-indigo-700 text-indigo-400 hover:bg-indigo-900/20 font-medium rounded-lg text-center transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
