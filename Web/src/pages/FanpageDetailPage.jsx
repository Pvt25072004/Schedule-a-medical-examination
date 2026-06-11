import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, Users } from 'lucide-react';
import PostCard from '../components/fanpage/PostCard';
import { API_BASE_URL, PAGES } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

const FanpageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [fanpage, setFanpage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        // Fetch fanpage detail
        const fanpageRes = await fetch(`${API_BASE_URL}/fanpages/hospital/${id}`);
        if (fanpageRes.ok) {
          const fanpageData = await fanpageRes.json();
          setFanpage(fanpageData);
          
          // Fetch posts for this fanpage (page 1)
          const postsRes = await fetch(`${API_BASE_URL}/posts/hospital/${id}?page=1&limit=10`);
          if (postsRes.ok) {
            const postsData = await postsRes.json();
            setPosts(postsData.data || postsData);
            setHasMore((postsData.page || 1) < (postsData.totalPages || 1));
          }
        }
      } catch (error) {
        console.error('Error fetching fanpage detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  const loadMorePosts = async () => {
    if (!hasMore || isLoadingMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const postsRes = await fetch(`${API_BASE_URL}/posts/hospital/${id}?page=${nextPage}&limit=10`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fanpage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <p className="text-gray-500 mb-4">Không tìm thấy trang.</p>
        <button onClick={() => navigate(PAGES.FANPAGE)} className="text-blue-600 hover:underline">
          Quay lại Bảng tin
        </button>
      </div>
    );
  }

  const hospital = fanpage.hospital;

  const handleFollow = () => {
    if (!isAuthenticated) {
      navigate(PAGES.LOGIN);
      return;
    }
    // TODO: Follow logic
    console.log("Followed");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Back button */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header / Cover Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="w-full h-64 md:h-80 relative bg-gray-200">
            <img 
              src={fanpage.cover_image_url || hospital?.image_url || hospital?.cover_url || 'https://via.placeholder.com/1200x400'} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Profile Info */}
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              {/* Avatar & Name */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10 w-full md:w-auto">
                <img 
                  src={fanpage.avatar_url || hospital?.logo_url || hospital?.avatar_url || 'https://via.placeholder.com/150'} 
                  alt={hospital?.name} 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-md object-cover bg-white -mt-16 md:-mt-20"
                />
                <div className="text-center md:text-left mb-2 flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {hospital?.name || 'Bệnh viện chưa xác định'}
                    </h1>
                    {fanpage.follower_count >= 100000 && (
                      <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500" style={{ color: 'white' }} title="Đã xác minh" />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm md:text-base">
                    Bệnh viện đa khoa hạng đặc biệt tại {typeof hospital?.city === 'string' ? hospital?.city : hospital?.city?.name || 'Việt Nam'}
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {typeof hospital?.city === 'string' ? hospital?.city : hospital?.city?.name || 'Việt Nam'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {(fanpage.follower_count || 0).toLocaleString('vi-VN')} người theo dõi
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center md:justify-end mb-4 md:mb-2 w-full md:w-auto shrink-0">
                <button 
                  onClick={handleFollow}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg shadow-sm transition-colors w-full md:w-auto"
                >
                  Theo dõi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Body Section (1/3 and 2/3 layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info (1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Giới thiệu</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">
                {fanpage.description || 'Chưa có thông tin giới thiệu.'}
              </p>

              <h4 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h4>
              <div className="space-y-3 text-sm text-gray-600">
                {hospital?.address && (
                  <p><strong>Địa chỉ:</strong> {hospital.address}</p>
                )}
                {hospital?.phone && (
                  <p><strong>Điện thoại:</strong> {hospital.phone}</p>
                )}
                {hospital?.email && (
                  <p><strong>Email:</strong> {hospital.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Posts (2/3) */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Bài viết</h3>
            {posts.length > 0 ? (
              <>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {hasMore && (
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
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
                Chưa có bài viết nào trên trang này.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FanpageDetailPage;
