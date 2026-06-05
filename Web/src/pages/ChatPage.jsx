import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User as UserIcon, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Smile, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PAGES, API_BASE_URL } from '../utils/constants';
import { formatTime } from '../utils/helpers';

// Helper function to extract JSON object from a string
const extractJSON = (text) => {
  if (!text) return null;
  try {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonStr = text.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('Lỗi phân tích cú pháp JSON trích xuất:', e);
  }
  return null;
};

const ChatPage = ({ navigate }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('ai_chat_messages');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        text: 'Xin chào! Tôi là trợ lý ảo y tế thông minh của STL Clinic. 🤖✨',
        sender: 'bot',
        timestamp: new Date()
      },
      {
        id: 2,
        text: 'Tôi có thể hỗ trợ tư vấn sức khỏe, triệu chứng bệnh và tự động đặt lịch khám từ A-Z. Hãy cho tôi biết nhu cầu của bạn nhé! (Ví dụ: "Tôi ở Đà Nẵng, đang bị chóng mặt và buồn nôn, muốn đặt lịch khám vào mai khoảng 9h sáng").',
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  });
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API Lists
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Live Booking Data State (tracked by AI)
  const [bookingData, setBookingData] = useState(() => {
    const saved = localStorage.getItem('ai_booking_data');
    if (saved) return JSON.parse(saved);
    return {
      hospitalId: null,
      hospitalName: '',
      symptoms: '',
      specialty: '',
      doctorId: null,
      doctorName: '',
      date: '',
      time: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('ai_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('ai_booking_data', JSON.stringify(bookingData));
  }, [bookingData]);

  const clearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện không?')) {
      const defaultMessages = [
        {
          id: 1,
          text: 'Xin chào! Tôi là trợ lý ảo y tế thông minh của STL Clinic. 🤖✨',
          sender: 'bot',
          timestamp: new Date()
        },
        {
          id: 2,
          text: 'Tôi có thể hỗ trợ tư vấn sức khỏe, triệu chứng bệnh và tự động đặt lịch khám từ A-Z. Hãy cho tôi biết nhu cầu của bạn nhé! (Ví dụ: "Tôi ở Đà Nẵng, đang bị chóng mặt và buồn nôn, muốn đặt lịch khám vào mai khoảng 9h sáng").',
          sender: 'bot',
          timestamp: new Date()
        }
      ];
      setMessages(defaultMessages);
      setBookingData({
        hospitalId: null,
        hospitalName: '',
        symptoms: '',
        specialty: '',
        doctorId: null,
        doctorName: '',
        date: '',
        time: ''
      });
      localStorage.removeItem('ai_chat_messages');
      localStorage.removeItem('ai_booking_data');
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load backend hospitals & doctors list
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resHosp = await fetch(`${API_BASE_URL}/hospitals`);
        if (resHosp.ok) {
          const data = await resHosp.json();
          setHospitals(data);
        }
        const resDoc = await fetch(`${API_BASE_URL}/doctors`);
        if (resDoc.ok) {
          const data = await resDoc.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error('Lỗi tải danh mục bệnh viện/bác sĩ:', err);
      }
    };
    fetchData();
  }, []);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  // Conversational AI handler using Groq
  const handleSend = async (forcedText = null) => {
    const textToSend = (forcedText || inputText).trim();
    if (!textToSend) return;

    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Build conversations messages context
      const apiMessages = [];
      messages.slice(-6).forEach(msg => {
        if (msg.id === 1 || msg.id === 2) return; // Skip default greetings
        apiMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
      apiMessages.push({ role: 'user', content: textToSend });

      // Call backend AI endpoint
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          bookingData: bookingData,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error (${response.status}): ${errorText}`);
      }

      const parsed = await response.json();

      if (parsed && parsed.reply) {
        // Update AI booking data state
        if (parsed.bookingData) {
          setBookingData(parsed.bookingData);
        }

        // Display bot reply
        addBotMessage(parsed.reply);

        // If user confirmed the booking, submit to API
        if (parsed.isComplete) {
          setIsTyping(true);
          try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const body = {
              doctor_id: parsed.bookingData.doctorId || doctors[0]?.id || 1,
              hospital_id: parsed.bookingData.hospitalId || hospitals[0]?.id || 1,
              appointment_date: parsed.bookingData.date || new Date().toISOString().slice(0, 10),
              appointment_time: parsed.bookingData.time || '08:30',
              symptoms: parsed.bookingData.symptoms || 'Đăng ký khám qua trợ lý AI'
            };

            const appointmentRes = await fetch(`${API_BASE_URL}/appointments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(body)
            });

            if (appointmentRes.ok) {
              const result = await appointmentRes.json();
              
              // Create demo payment record
              try {
                await fetch(`${API_BASE_URL}/payments`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({
                    appointment_id: result.id,
                    amount: result.total_fee || 500000,
                    base_fee: result.total_fee || 500000,
                    payment_method: 'cash'
                  })
                });
              } catch (paymentErr) {
                console.warn('Lỗi tạo thanh toán demo:', paymentErr);
              }

              addBotMessage(
                `🎉 **Hệ thống đặt lịch khám thành công!**\n` +
                `• Mã phiếu khám của bạn: **#STL-${result.id}**\n` +
                `• Cơ sở y tế: ${parsed.bookingData.hospitalName}\n` +
                `• Bác sĩ khám: ${parsed.bookingData.doctorName}\n` +
                `• Thời gian: ${parsed.bookingData.time} ngày ${parsed.bookingData.date.split('-').reverse().join('/')}\n` +
                `• Trạng thái thanh toán: **Đã thanh toán (Demo Cash)** 💳\n\n` +
                `**Chúc bạn khám bệnh suôn sẻ và sớm bình phục sức khỏe nhé! ❤️**`
              );
            } else {
              const errorText = await appointmentRes.text();
              throw new Error(errorText || 'Lỗi từ phía server đặt lịch');
            }
          } catch (err) {
            console.error('Lỗi thực tế khi đặt lịch:', err);
            
            // Try to extract dynamic error message from NestJS exception response
            let errorMsg = 'Lịch làm việc của bác sĩ vào giờ này không khả dụng';
            try {
              const parsedErr = JSON.parse(err.message);
              if (parsedErr && parsedErr.message) {
                errorMsg = parsedErr.message;
              }
            } catch (jsonErr) {}

            addBotMessage(
              `⚠️ **Đặt lịch khám không thành công**: ${errorMsg}.\n\n` +
              `*Lưu ý:* Vui lòng chọn khung giờ nằm trong lịch làm việc trống thực tế của bác sĩ.`
            );
          }
          
          // Reset booking data state
          setBookingData({
            hospitalId: null,
            hospitalName: '',
            symptoms: '',
            specialty: '',
            doctorId: null,
            doctorName: '',
            date: '',
            time: ''
          });
        }
      } else {
        // Fallback: If it's not a parsable JSON, display the raw response text
        addBotMessage(parsed?.reply || 'Tôi đã ghi nhận ý kiến của bạn. Hãy cho tôi biết thêm chi tiết nhé.');
      }
    } catch (e) {
      console.error('Error handling conversational chat:', e);
      addBotMessage(`⚠️ Lỗi kết nối AI: ${e.message}. Vui lòng thử lại sau giây lát.`);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(PAGES.HOME)}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-1.5">
                    Trợ lý ảo STL AI <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                  </h1>
                  <p className="text-[10px] md:text-xs text-green-600 font-medium">Đang trực tuyến • Sẵn sàng tư vấn</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-red-500 hover:text-red-600"
                title="Xóa trò chuyện"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition text--500">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white border-gray-100 text-blue-600'
                }`}>
                  {msg.sender === 'user' ? (
                    <UserIcon className="w-4.5 h-4.5" />
                  ) : (
                    <Bot className="w-4.5 h-4.5" />
                  )}
                </div>

                <div className="flex flex-col">
                  <div className={`inline-block p-4 rounded-2xl max-w-[100%] ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                  }`}>
                    <div className="prose prose-sm max-w-none break-words">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>

                  <span className={`text-[10px] text-gray-400 mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-9 h-9 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm text-blue-600">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div className="bg-white px-5 py-2.5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg shrink-0 p-4 sticky bottom-0 z-40">
        <div className="max-w-3xl mx-auto flex items-end gap-2.5">
          <button className="p-2.5 hover:bg-gray-50 rounded-xl transition text-gray-400 hover:text-gray-600 shrink-0">
            <Paperclip className="w-5.5 h-5.5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              placeholder="Trò chuyện hoặc yêu cầu đặt lịch hẹn khám bệnh tự nhiên với Trợ lý AI..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none resize-none max-h-24 bg-gray-50 focus:bg-white transition-colors text-sm"
              style={{ minHeight: '44px' }}
            />
          </div>

          <button className="p-2.5 hover:bg-gray-50 rounded-xl transition text-gray-400 hover:text-gray-600 shrink-0">
            <Smile className="w-5.5 h-5.5" />
          </button>
          
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-2.5 transition shadow-md disabled:opacity-40 disabled:hover:bg-blue-600 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-[10px] text-gray-400 text-center mt-2 shrink-0">
          Nhấn Enter để gửi tin nhắn, Shift + Enter để xuống dòng. Trợ lý AI kết nối trực tiếp Groq.
        </p>
      </div>

      <style>{`
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
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;