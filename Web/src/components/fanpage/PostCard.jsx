import React, { useState, useEffect } from 'react';
import { BadgeCheck, MoreHorizontal, Heart, MessageCircle, Share2, X } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PAGES, API_BASE_URL } from '../../utils/constants';
import { getAuthHeaders } from '../../services/http';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const PostCard = ({ post, onHashtagClick }) => {
  const { fanpage, title, content, image_url, created_at, id: postId } = post;
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [sharesCount, setSharesCount] = useState(post.shares_count || 0);
  const [isLiked, setIsLiked] = useState(false);
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Helper function to render text with clickable hashtags
  const renderContentWithHashtags = (text) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, index) => {
      if (word.startsWith('#') && word.length > 1) {
        return (
          <span 
            key={index} 
            className="text-blue-600 hover:underline cursor-pointer font-medium"
            onClick={() => onHashtagClick && onHashtagClick(word)}
          >
            {word}
          </span>
        );
      }
      return word;
    });
  };

  const handleInteraction = (callback) => {
    if (!isAuthenticated) {
      navigate(PAGES.LOGIN);
      return;
    }
    if (callback) callback();
  };

  // Check initial like status
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`${API_BASE_URL}/likes/check/${postId}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setIsLiked(data.is_liked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    checkLikeStatus();
  }, [isAuthenticated, postId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/comments/post/${postId}?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        // Sync the count with actual data length from DB
        setCommentsCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Fetch comments when modal opens
  useEffect(() => {
    if (isCommentModalOpen) {
      fetchComments();
    }
  }, [isCommentModalOpen, postId]);

  const toggleLike = async () => {
    try {
      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

      const res = await fetch(`${API_BASE_URL}/likes/toggle/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(data.likes_count);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const sharePost = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/share/${postId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setSharesCount(data.shares_count);
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      const body = {
        post_id: postId,
        content: commentText.trim(),
      };
      if (replyingTo) {
        body.parent_id = replyingTo.id;
      }

      const res = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const newComment = await res.json();
        setCommentText('');
        setReplyingTo(null);
        setCommentsCount(prev => prev + 1);
        setComments(prev => [...prev, newComment]);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  // Group comments: top-level vs replies
  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(`/fanpage/${fanpage?.id}`)}
          >
            <img 
              src={fanpage?.avatar_url || 'https://via.placeholder.com/50'} 
              alt={fanpage?.hospital?.name || 'Hospital'} 
              className="w-12 h-12 rounded-full object-cover border border-gray-100 group-hover:border-blue-200 transition-colors"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-gray-900 text-[15px] group-hover:text-blue-600 transition-colors">
                  {fanpage?.hospital?.name || 'Bệnh viện chưa xác định'}
                </h3>
                {fanpage?.follower_count >= 100000 && (
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500 flex-shrink-0" style={{ color: 'white' }} title="Đã xác minh" />
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {dayjs(created_at).fromNow()}
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          {title && <h4 className="font-bold text-gray-800 mb-2">{title}</h4>}
          <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
            {renderContentWithHashtags(content)}
          </p>
        </div>

        {/* Image */}
        {image_url && (
          <div className="w-full max-h-[500px] bg-gray-50 overflow-hidden cursor-pointer" onClick={() => setIsCommentModalOpen(true)}>
            <img 
              src={image_url} 
              alt="Post content" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Footer / Actions & Stats */}
        <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div className="flex flex-1 justify-between gap-2 max-w-[400px]">
            <button 
              onClick={() => handleInteraction(toggleLike)}
              className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : 'group-hover:fill-blue-100'}`} />
              <span className="text-sm font-medium">{likesCount} Thích</span>
            </button>
            <button 
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={() => handleInteraction(() => setIsCommentModalOpen(true))}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{commentsCount} Bình luận</span>
            </button>
            <button 
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              onClick={sharePost}
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{sharesCount} Chia sẻ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Theater Mode Comment Modal */}
      {isCommentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
          <button 
            onClick={() => setIsCommentModalOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
          >
            <X className="w-8 h-8" />
          </button>

          <div className={`bg-white rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden w-full h-[90vh] ${image_url ? 'max-w-6xl' : 'max-w-2xl'}`}>
            
            {/* Left Column - Image */}
            {image_url && (
              <div className="hidden md:flex flex-1 bg-black items-center justify-center relative">
                <img 
                  src={image_url} 
                  alt="Post content fullscreen" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* Right Column - Content & Comments */}
            <div className={`flex flex-col h-full bg-white ${image_url ? 'w-full md:w-[400px] lg:w-[450px] border-l border-gray-100' : 'w-full'}`}>
              
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    setIsCommentModalOpen(false);
                    navigate(`/fanpage/${fanpage?.id}`);
                  }}
                >
                  <img 
                    src={fanpage?.avatar_url || 'https://via.placeholder.com/50'} 
                    alt={fanpage?.hospital?.name || 'Hospital'} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                        {fanpage?.hospital?.name || 'Bệnh viện chưa xác định'}
                      </h3>
                      {fanpage?.follower_count >= 100000 && (
                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" style={{ color: 'white' }} title="Đã xác minh" />
                      )}
                    </div>
                    <p className="text-gray-500 text-xs">
                      {dayjs(created_at).fromNow()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 border-b border-gray-100">
                  {title && <h4 className="font-bold text-gray-800 mb-2 text-sm">{title}</h4>}
                  <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {renderContentWithHashtags(content)}
                  </p>
                </div>

                {image_url && (
                  <div className="md:hidden w-full bg-black">
                    <img src={image_url} alt="Mobile post" className="w-full h-auto max-h-[400px] object-contain" />
                  </div>
                )}

                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <button 
                    onClick={() => handleInteraction(toggleLike)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors font-medium text-sm ${isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : ''}`} /> {likesCount} Thích
                  </button>
                  <button 
                    onClick={() => handleInteraction(() => document.getElementById('comment-input-modal')?.focus())}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm"
                  >
                    <MessageCircle className="w-5 h-5" /> {commentsCount} Bình luận
                  </button>
                  <button 
                    onClick={sharePost}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium text-sm"
                  >
                    <Share2 className="w-5 h-5" /> {sharesCount} Chia sẻ
                  </button>
                </div>

                <div className="p-4 space-y-5">
                  {topLevelComments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
                    </div>
                  ) : (
                    topLevelComments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <img 
                          src={comment.user?.avatar_url || 'https://via.placeholder.com/40'} 
                          alt="User avatar" 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block">
                            <h5 className="font-semibold text-sm text-gray-900">{comment.user?.full_name || 'Người dùng'}</h5>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                          <div className="flex gap-4 mt-1 ml-2 text-xs font-medium text-gray-500">
                            <span>{dayjs(comment.created_at).fromNow()}</span>
                            <button 
                              className="hover:text-blue-600"
                              onClick={() => handleInteraction(() => {
                                setReplyingTo(comment);
                                setCommentText(`@${comment.user?.full_name || 'Người dùng'} `);
                                document.getElementById('comment-input-modal')?.focus();
                              })}
                            >
                              Phản hồi
                            </button>
                          </div>
                          
                          {/* Replies */}
                          {getReplies(comment.id).map(reply => (
                            <div key={reply.id} className="flex gap-3 mt-3">
                              <img 
                                src={reply.user?.avatar_url || 'https://via.placeholder.com/40'} 
                                alt="User avatar" 
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="bg-gray-100 rounded-2xl px-3 py-1.5 inline-block">
                                  <h5 className="font-semibold text-sm text-gray-900">{reply.user?.full_name || 'Người dùng'}</h5>
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{reply.content}</p>
                                </div>
                                <div className="flex gap-4 mt-1 ml-2 text-xs font-medium text-gray-500">
                                  <span>{dayjs(reply.created_at).fromNow()}</span>
                                  <button 
                                    className="hover:text-blue-600"
                                    onClick={() => handleInteraction(() => {
                                      // Reply to a reply: keep parent_id as the top-level comment
                                      setReplyingTo(comment);
                                      setCommentText(`@${reply.user?.full_name || 'Người dùng'} `);
                                      document.getElementById('comment-input-modal')?.focus();
                                    })}
                                  >
                                    Phản hồi
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                {replyingTo && (
                  <div className="flex items-center justify-between mb-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span>Đang trả lời trong luồng của <span className="font-semibold">{replyingTo.user?.full_name || 'Người dùng'}</span></span>
                    <button 
                      onClick={() => {
                        setReplyingTo(null);
                        setCommentText('');
                      }} 
                      className="hover:text-gray-900 text-xs font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <img 
                    src={user?.avatar_url || 'https://via.placeholder.com/40'} 
                    alt="My avatar" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 relative">
                    <input
                      id="comment-input-modal"
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Viết bình luận..."
                      className="w-full px-4 py-2 bg-gray-100 border-transparent focus:bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                      onClick={() => handleInteraction()}
                      onKeyDown={(e) => {
                        handleInteraction(() => {
                          if (e.key === 'Enter') {
                            submitComment();
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
