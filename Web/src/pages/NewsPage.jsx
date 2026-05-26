import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { getPublicNews } from '../services/news.api';
import Card from '../components/common/Card';
import { PAGES } from '../utils/constants';

const ITEMS_PER_PAGE = 6; // Dưới phần nổi bật

const NewsPage = ({ navigate }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tin y tế');
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = ['Tin dịch vụ', 'Tin y tế', 'Y học thường thức'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getPublicNews();
        // Giả sử API trả về mảng trực tiếp hoặc { data }
        const newsArray = Array.isArray(data) ? data : (data?.data || []);
        setNews(newsArray);
      } catch (error) {
        console.error("Lỗi khi tải tin tức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Pseudo-filtering logic since the backend doesn't categorize news yet
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const text = (item.title + ' ' + (item.summary || '')).toLowerCase();
      if (activeTab === 'Tin dịch vụ') {
        return text.includes('bảo hiểm') || text.includes('khám') || text.includes('dịch vụ') || text.includes('bệnh viện') || text.includes('chi phí');
      }
      if (activeTab === 'Y học thường thức') {
        return text.includes('nghiên cứu') || text.includes('phát hiện') || text.includes('khoa học') || text.includes('chữa') || text.includes('thuốc');
      }
      // Tin y tế: các bài còn lại hoặc từ khóa chung
      return true; // Mặc định hiển thị tất cả nếu là Tin y tế
    });
  }, [news, activeTab]);

  // Tách 4 tin đầu làm phần nổi bật từ danh sách đã lọc
  const featuredNews = useMemo(() => filteredNews.length > 0 ? filteredNews[0] : null, [filteredNews]);
  const sideNews = useMemo(() => filteredNews.slice(1, 4), [filteredNews]);
  
  // Phần còn lại cho vào Grid và phân trang
  const gridNews = useMemo(() => filteredNews.slice(4), [filteredNews]);
  
  const totalPages = Math.ceil(gridNews.length / ITEMS_PER_PAGE) || 1;
  const currentGridData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return gridNews.slice(start, start + ITEMS_PER_PAGE);
  }, [gridNews, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Cuộn tới phần grid
      document.getElementById('news-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openNews = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-10 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
            Tin tức y khoa
          </h1>
          <div className="flex flex-wrap gap-6 text-lg font-medium">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors ${
                  activeTab === tab 
                    ? 'text-blue-500 border-b-2 border-blue-500 pb-1 -mb-[18px]' 
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        {news.length > 0 && (
          <div className="grid lg:grid-cols-12 gap-8 mb-16">
            
            {/* Main Featured (Left) */}
            {featuredNews && (
              <div className="lg:col-span-8 cursor-pointer group" onClick={() => openNews(featuredNews.source)}>
                <div className="relative rounded-2xl overflow-hidden shadow-lg h-[400px] lg:h-[500px]">
                  <img 
                    src={featuredNews.image_url || 'https://placehold.co/600x400/004d99/FFFFFF/png?text=Tin+Tuc+Y+Te'} 
                    alt={featuredNews.title}
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/004d99/FFFFFF/png?text=Tin+Tuc+Y+Te"; }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 p-6 lg:p-8 w-full">
                    <span className="inline-block px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full mb-4">
                      {activeTab}
                    </span>
                    <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors">
                      {featuredNews.title}
                    </h2>
                    <p className="text-gray-200 text-sm lg:text-base line-clamp-2 mb-4 max-w-3xl">
                      {featuredNews.summary || featuredNews.content?.substring(0, 150).replace(/<[^>]+>/g, '') + '...'}
                    </p>
                    <div className="flex items-center text-sm text-gray-300 gap-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredNews.published_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Side Posts (Right) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {sideNews.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 cursor-pointer group bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => openNews(item.source)}
                >
                  <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image_url || 'https://placehold.co/600x400/004d99/FFFFFF/png?text=Tin+Tuc+Y+Te'} 
                      alt={item.title}
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/004d99/FFFFFF/png?text=Tin+Tuc+Y+Te"; }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-semibold text-blue-500 mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                      {activeTab}
                    </span>
                    <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 text-sm">
                      {item.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(item.published_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Grid Section */}
        <div id="news-grid">
          {gridNews.length > 0 && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {currentGridData.map((item) => (
                  <Card key={item.id} hover className="flex flex-col h-full cursor-pointer group" onClick={() => openNews(item.source)}>
                    <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
                      <img 
                        src={item.image_url || 'https://placehold.co/600x400/004d99/FFFFFF/png?text=Tin+Tuc+Y+Te'} 
                        alt={item.title}
                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/004d99/FFFFFF/png?text=Tin+Tuc+Y+Te"; }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-blue-600 flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        {activeTab}
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                        {item.summary || item.content?.substring(0, 150).replace(/<[^>]+>/g, '') + '...'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500 gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.published_at)}
                        </div>
                        <span className="text-blue-500 font-medium text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Xem tiếp <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}

          {news.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500">Chưa có bài viết nào được đăng tải.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NewsPage;
