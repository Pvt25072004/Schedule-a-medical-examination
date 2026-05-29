import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import PostCard from '../components/fanpage/PostCard';
import FeaturedHospitals from '../components/fanpage/FeaturedHospitals';
import { API_BASE_URL } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPublicNews } from '../services/news.api';
import { normalizeForSearch } from '../utils/helpers';

const BannerCarousel = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/hospital-admin/banners/active`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setBanners(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div 
      className="relative w-full h-40 sm:h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-sm group cursor-pointer"
      onClick={() => {
        const banner = banners[currentIdx];
        if (!banner) return;
        if (banner.doctor_id) {
          if (!isAuthenticated) navigate('/login');
          else navigate('/book-doctor', { state: { doctorId: banner.doctor_id }});
        }
        else if (banner.hospital_id) navigate(`/fanpage/${banner.hospital_id}`);
        else if (banner.redirect_url) window.open(banner.redirect_url, "_blank");
      }}
    >
      {banners.map((banner, idx) => (
        <img
          key={banner.id || idx}
          src={banner.image_url}
          alt={`Banner ${idx + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:scale-105 ease-in-out ${
            idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 z-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white drop-shadow-md">
          {banners[currentIdx]?.title || "Cập nhật tin tức Y tế"}
        </h2>
        <p className="text-white/90 drop-shadow">
          {banners[currentIdx]?.description || "Những thông tin mới nhất từ các bệnh viện hàng đầu"}
        </p>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIdx(idx);
            }}
            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
              currentIdx === idx ? "w-8 bg-blue-500" : "w-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
};



const FanpagePage = () => {
  const [posts, setPosts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeHashtag, setActiveHashtag] = useState(null);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch posts (page 1)
        const postsRes = await fetch(`${API_BASE_URL}/posts?page=1&limit=10`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.data || postsData);
          setHasMore((postsData.page || 1) < (postsData.totalPages || 1));
        }

        // Fetch hospitals with fanpages for sidebar
        const fanpagesRes = await fetch(`${API_BASE_URL}/fanpages`);
        if (fanpagesRes.ok) {
          const fanpagesData = await fanpagesRes.json();
          // Extract hospital info from fanpages for the sidebar
          const hospitalsData = fanpagesData.map(f => ({
            id: f.hospital?.id,
            name: f.hospital?.name,
            city: f.hospital?.city,
            fanpage: f,
          })).filter(h => h.id);
          setHospitals(hospitalsData);
        }

        // Fetch news for sidebar search
        try {
          const newsData = await getPublicNews();
          const newsArray = Array.isArray(newsData) ? newsData : (newsData?.data || []);
          setNewsList(newsArray);
        } catch (err) {
          console.error('Error fetching news:', err);
        }
      } catch (error) {
        console.error('Error fetching fanpage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadMorePosts = async () => {
    if (!hasMore || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const postsRes = await fetch(`${API_BASE_URL}/posts?page=${nextPage}&limit=10`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(prev => [...prev, ...(postsData.data || postsData)]);
        setPage(nextPage);
        setHasMore(nextPage < (postsData.totalPages || 1));
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle clicking outside of search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to extract all hashtags from posts
  const allHashtags = useMemo(() => {
    const tags = new Set();
    posts.forEach(post => {
      if (post.content) {
        const words = post.content.split(/\s+/);
        words.forEach(word => {
          if (word.startsWith('#') && word.length > 1) {
            tags.add(word);
          }
        });
      }
    });
    return Array.from(tags);
  }, [posts]);

  // Filter logic with normalized comparison
  const searchResultsHospitals = hospitals.filter(h => 
    normalizeForSearch(h.name).includes(normalizeForSearch(searchQuery))
  );
  const searchResultsPosts = posts.filter(post => 
    normalizeForSearch(post.title).includes(normalizeForSearch(searchQuery)) ||
    normalizeForSearch(post.content).includes(normalizeForSearch(searchQuery))
  );
  const searchResultsNews = newsList.filter(item => 
    normalizeForSearch(item.title).includes(normalizeForSearch(searchQuery)) ||
    normalizeForSearch(item.summary).includes(normalizeForSearch(searchQuery))
  );
  const searchResultsHashtags = useMemo(() => {
    if (!searchQuery) return [];
    return allHashtags.filter(tag => 
      normalizeForSearch(tag).includes(normalizeForSearch(searchQuery))
    );
  }, [allHashtags, searchQuery]);

  // Main feed logic (filters only if a hashtag is clicked)
  const feedPosts = activeHashtag 
    ? posts.filter(post => post.content?.includes(activeHashtag))
    : posts;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Sliding Banner */}
        <BannerCarousel />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (Posts Feed) */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            {activeHashtag && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-blue-800 font-medium">Đang hiển thị các bài viết có gắn thẻ: </span>
                  <span className="font-bold text-blue-900">{activeHashtag}</span>
                </div>
                <button 
                  onClick={() => setActiveHashtag(null)}
                  className="text-blue-500 hover:text-blue-700 p-1 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : feedPosts.length > 0 ? (
              <>
                {feedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onHashtagClick={(tag) => {
                      setActiveHashtag(tag);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                  />
                ))}
                
                {hasMore && !activeHashtag && (
                  <div className="flex justify-center mt-2 mb-8">
                    <button 
                      onClick={loadMorePosts}
                      disabled={isLoadingMore}
                      className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 hover:text-blue-600 shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          Đang tải...
                        </>
                      ) : (
                        'Xem thêm bài viết'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-500">Không tìm thấy bài viết nào.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2 sticky top-[110px] self-start">
            {/* Search Bar in Sidebar with Dropdown Overlay */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative z-40" ref={searchRef}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm fanpage, bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>

              {/* Dropdown Results Overlay */}
              {isSearchFocused && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-96 overflow-y-auto">
                  <div className="p-2 divide-y divide-gray-100">
                    
                    {/* Hashtags */}
                    {searchResultsHashtags.length > 0 && (
                      <div className="py-2">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 pt-1">Thẻ Hashtag</div>
                        <div className="flex flex-wrap gap-2 px-2">
                          {searchResultsHashtags.map(tag => (
                            <span 
                              key={tag} 
                              onClick={() => {
                                setActiveHashtag(tag);
                                setIsSearchFocused(false);
                                setSearchQuery('');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full cursor-pointer transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hospitals */}
                    <div className="py-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Bệnh viện / Fanpage</div>
                      {searchResultsHospitals.length > 0 ? (
                        searchResultsHospitals.map(h => (
                          <div 
                            key={h.id} 
                            onClick={() => navigate(`/fanpage/${h.fanpage?.id}`)}
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <img src={h.fanpage?.avatar_url || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <span className="text-sm font-medium text-gray-800">{h.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 px-2 py-1">Không tìm thấy bệnh viện</div>
                      )}
                    </div>

                    {/* Posts */}
                    <div className="py-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Bài viết</div>
                      {searchResultsPosts.length > 0 ? (
                        searchResultsPosts.map(p => (
                          <div 
                            key={p.id} 
                            className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedPost(p);
                              setIsSearchFocused(false);
                              setSearchQuery('');
                            }}
                          >
                            <div className="text-sm font-semibold text-gray-800 truncate">{p.title || p.fanpage?.hospital?.name}</div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">{p.content}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 px-2 py-1">Không tìm thấy bài viết</div>
                      )}
                    </div>

                    {/* News */}
                    <div className="py-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Tin tức y khoa / Báo chí</div>
                      {searchResultsNews.length > 0 ? (
                        searchResultsNews.map(item => (
                          <div 
                            key={item.id} 
                            className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => {
                              setIsSearchFocused(false);
                              setSearchQuery('');
                              if (item.source) {
                                window.open(item.source, '_blank', 'noopener,noreferrer');
                              }
                            }}
                          >
                            <div className="text-sm font-semibold text-gray-800 truncate">{item.title}</div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">{item.summary}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 px-2 py-1">Không tìm thấy tin tức</div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>

            <FeaturedHospitals hospitals={hospitals} />
          </div>
        </div>

      </div>

      {/* Standalone post details modal */}
      {selectedPost && (
        <PostCard 
          post={selectedPost} 
          defaultOpenCommentModal={true} 
          modalOnly={true} 
          onClose={() => setSelectedPost(null)}
          onHashtagClick={(tag) => {
            setActiveHashtag(tag);
            setSelectedPost(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
};

export default FanpagePage;
