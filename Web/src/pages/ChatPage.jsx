import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/common/Layout';
import Button from '../components/common/Button';
import { PAGES } from '../utils/constants';

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
      text: '• Tư vấn về triệu chứng bệnh\n• Hướng dẫn đặt lịch khám\n• Thông tin về các dịch vụ\n• Câu hỏi về sức khỏe\n\nBạn cần hỗ trợ gì hôm nay?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    'Đặt lịch khám',
    'Triệu chứng đau đầu',
    'Giá dịch vụ',
    'Địa chỉ phòng khám'
  ];

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('đặt lịch') || msg.includes('booking')) {
      return 'Để đặt lịch khám, bạn có thể:\n1. Nhấn vào nút "Đặt lịch khám" ở trang chủ\n2. Chọn bác sĩ và thời gian phù hợp\n3. Xác nhận thông tin\n\nBạn có muốn tôi chuyển bạn đến trang đặt lịch không?';
    }
    
    if (msg.includes('đau đầu') || msg.includes('triệu chứng')) {
      return 'Đau đầu có thể do nhiều nguyên nhân như:\n• Căng thẳng, stress\n• Thiếu ngủ\n• Mất nước\n• Các bệnh lý khác\n\nTôi khuyên bạn nên:\n1. Nghỉ ngơi đầy đủ\n2. Uống nhiều nước\n3. Nếu đau kéo dài, hãy đặt lịch khám với bác sĩ';
    }
    
    if (msg.includes('giá') || msg.includes('chi phí')) {
      return 'Bảng giá dịch vụ tại STL Clinic:\n• Khám tổng quát: 200.000đ\n• Khám chuyên khoa: 300.000đ - 500.000đ\n• Xét nghiệm: Tùy loại\n\nBạn có thể liên hệ hotline 1900-xxxx để biết thêm chi tiết.';
    }
    
    if (msg.includes('địa chỉ') || msg.includes('vị trí')) {
      return 'STL Clinic có các chi nhánh:\n📍 123 Đường ABC, Q.1, TP.HCM\n📍 456 Đường XYZ, Q.3, TP.HCM\n📞 Hotline: 1900-xxxx\n🕐 Giờ làm việc: 8:00 - 20:00 (T2-CN)';
    }
    
    return 'Cảm ơn bạn đã liên hệ! Để được hỗ trợ tốt hơn, bạn có thể:\n• Gọi hotline: 1900-xxxx\n• Đặt lịch trực tiếp với bác sĩ\n• Liên hệ qua email: contact@stlclinic.com';
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

    // Simulate bot response
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
    setInputText(reply);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-teal-500 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => navigate(PAGES.HOME)}
            className="p-2 hover:bg-teal-600 rounded-full transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Bot className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Trợ lý ảo STL</h1>
              <p className="text-teal-100 text-sm">Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user' ? 'bg-teal-500' : 'bg-white shadow-md'
                }`}>
                  {msg.sender === 'user' ? (
                    <UserIcon className="w-6 h-6 text-white" />
                  ) : (
                    <Bot className="w-6 h-6 text-teal-600" />
                  )}
                </div>

                {/* Message Bubble */}
                <div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-teal-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-md rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6 text-teal-600" />
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl rounded-tl-sm shadow-md">
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

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="px-6 pb-2">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-2">Câu hỏi gợi ý:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm hover:bg-teal-50 hover:text-teal-600 transition border border-gray-200"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-teal-500 focus:outline-none"
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="rounded-full px-6"
            icon={Send}
          >
            Gửi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;