import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '../contexts/authofcontext';
import Button from '../components/common/Button';
import { PAGES } from '../utils/constants';
import { formatTime } from '../utils/helpers';

const ChatPage = ({ navigate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý ảo của STL Clinic. Tôi có thể giúp bạn:',
      sender: 'bot',
      timestamp: new Date()
    },
    {
      id: 2,
      text: '• Tư vấn về triệu chứng bệnh\n• Hướng dẫn đặt lịch khám\n• Thông tin về dịch vụ\n• Câu hỏi về sức khỏe\n\nBạn cần hỗ trợ gì hôm nay?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    { text: '📅 Đặt lịch khám', icon: '📅' },
    { text: '🩺 Triệu chứng đau đầu', icon: '🩺' },
    { text: '💰 Giá dịch vụ', icon: '💰' },
    { text: '📍 Địa chỉ phòng khám', icon: '📍' }
  ];

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('đặt lịch') || msg.includes('booking')) {
      return 'Để đặt lịch khám, bạn có thể:\n\n1️⃣ Nhấn nút "Đặt lịch khám" ở menu\n2️⃣ Chọn bác sĩ và thời gian phù hợp\n3️⃣ Xác nhận thông tin\n\nBạn có muốn tôi chuyển bạn đến trang đặt lịch không?';
    }
    
    if (msg.includes('đau đầu') || msg.includes('triệu chứng')) {
      return 'Đau đầu có thể do nhiều nguyên nhân:\n\n• Căng thẳng, stress\n• Thiếu ngủ\n• Mất nước\n• Các bệnh lý khác\n\nTôi khuyên bạn:\n1. Nghỉ ngơi đầy đủ\n2. Uống nhiều nước\n3. Nếu đau kéo dài, hãy đặt lịch khám với bác sĩ\n\nBạn có muốn đặt lịch ngay không?';
    }
    
    if (msg.includes('giá') || msg.includes('chi phí')) {
      return 'Bảng giá dịch vụ tại STL Clinic:\n\n💰 Khám tổng quát: 200.000đ\n💰 Khám chuyên khoa: 300.000đ - 500.000đ\n💰 Xét nghiệm: Tùy loại\n💰 Siêu âm: 150.000đ - 300.000đ\n\nBạn có thể liên hệ hotline 1900-xxxx để biết thêm chi tiết.';
    }
    
    if (msg.includes('địa chỉ') || msg.includes('vị trí')) {
      return 'STL Clinic có các chi nhánh:\n\n📍 123 Đường ABC, Q.1, TP.HCM\n📍 456 Đường XYZ, Q.3, TP.HCM\n📞 Hotline: 1900-xxxx\n🕐 Giờ làm việc: 8:00 - 20:00 (T2-CN)\n\nBạn có muốn chỉ đường không?';
    }
    
    return 'Cảm ơn bạn đã liên hệ! 😊\n\nĐể được hỗ trợ tốt hơn, bạn có thể:\n• Gọi hotline: 1900-xxxx\n• Đặt lịch trực tiếp với bác sĩ\n• Email: support@stlclinic.com\n\nTôi có thể giúp gì thêm không?';
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply) => {
    setInputText(reply.text);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(PAGES.HOME)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">Trợ lý ảo STL</h1>
                  <p className="text-xs text-green-600">● Đang hoạt động</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                      : 'bg-white border-2 border-blue-200'
                  }`}>
                    {msg.sender === 'user' ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div className={`px-4 py-3 rounded-2xl shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">
                        {msg.text}
                      </p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 px-2 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-10 h-10 bg-white border-2 border-blue-200 rounded-full flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="bg-white px-6 py-3 rounded-2xl rounded-tl-sm shadow-md border border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="bg-white border-t px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3 font-medium">Câu hỏi gợi ý:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition border border-blue-200 font-medium"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 items-end">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none resize-none max-h-32"
                rows="1"
                style={{ minHeight: '44px' }}
              />
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
            
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="rounded-full px-4 py-3 flex-shrink-0"
              icon={Send}
            >
              Gửi
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Nhấn Enter để gửi, Shift + Enter để xuống dòng
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;