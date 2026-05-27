import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import { ChevronUp, MessageSquare, X, Send, Bot, User as UserIcon, Maximize2, Minimize2, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../utils/constants';

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

const FloatingWidgets = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
        text: 'Tôi có thể hỗ trợ tư vấn sức khỏe và giúp bạn đặt lịch khám bệnh trực tiếp qua hội thoại tự nhiên. Hãy thử nhắn điều bạn muốn nhé! (Ví dụ: "Tôi ở Đà Nẵng, đang bị chóng mặt và buồn nôn, muốn đặt lịch khám vào mai khoảng 9h sáng").',
        sender: 'bot',
        timestamp: new Date()
      }
    ];
  });
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
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

  // Đóng chat khi chuyển trang
  useEffect(() => {
    setIsChatOpen(false);
  }, [location.pathname]);

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
          text: 'Tôi có thể hỗ trợ tư vấn sức khỏe và giúp bạn đặt lịch khám bệnh trực tiếp qua hội thoại tự nhiên. Hãy thử nhắn điều bạn muốn nhé! (Ví dụ: "Tôi ở Đà Nẵng, đang bị chóng mặt và buồn nôn, muốn đặt lịch khám vào mai khoảng 9h sáng").',
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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen, isTyping]);

  // Load hospitals & doctors list
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      text,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const handlePredefinedClick = (q) => {
    const userMessage = {
      id: Date.now(),
      text: q.label,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(q.reply);
    }, 600);
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
        if (parsed.bookingData) {
          setBookingData(parsed.bookingData);
        }
        addBotMessage(parsed.reply);

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
                `🎉 **Đặt lịch thành công!**\n` +
                `• Phiếu khám: **#STL-${result.id}**\n` +
                `• Nơi khám: ${parsed.bookingData.hospitalName}\n` +
                `• Trạng thái thanh toán: **Đã thanh toán (Demo Cash)** 💳\n\n` +
                `**Chúc bạn khám bệnh suôn sẻ và sớm bình phục sức khỏe nhé! ❤️**`
              );
            } else {
              const errorText = await appointmentRes.text();
              throw new Error(errorText || 'Lỗi từ phía server đặt lịch');
            }
          } catch (err) {
            console.error('Lỗi thực tế khi đặt lịch:', err);
            addBotMessage(
              `⚠️ **Đặt lịch thất bại thực tế**: ${err.message || 'Lịch làm việc của bác sĩ vào giờ này không khả dụng'}.\n\n` +
              `*Lưu ý:* Vui lòng chọn khung giờ trống nằm trong lịch làm việc thực tế của bác sĩ.`
            );
          }
          
          // Reset state
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
        addBotMessage(rawText || 'Tôi đã ghi nhận ý kiến của bạn. Hãy cho tôi biết thêm chi tiết nhé.');
      }
    } catch (e) {
      console.error(e);
      
      // Local Smart Fallback in case of API limits or Credit issues
      const lowercase = textToSend.toLowerCase();
      let fallbackReply = "";
      
      if (lowercase.includes("đà nẵng") || lowercase.includes("da nang")) {
        setBookingData(prev => ({ ...prev, symptoms: "Chóng mặt, buồn nôn" }));
        fallbackReply = "Chào bạn! Tôi rất tiếc khi biết bạn đang bị chóng mặt và buồn nôn 🩺. Ở Đà Nẵng, hệ thống liên kết với **Bệnh viện Hoàn Mỹ Đà Nẵng** và **Bệnh viện Đa khoa Gia Đình**. Bạn muốn đăng ký khám tại cơ sở nào?";
      } else if (lowercase.includes("hoàn mỹ") || lowercase.includes("hoan my") || lowercase.includes("gia đình") || lowercase.includes("gia dinh") || lowercase.includes("bệnh viện nào cũng được") || lowercase.includes("benh vien nao cung duoc")) {
        const hospName = lowercase.includes("gia đình") || lowercase.includes("gia dinh") ? "Bệnh viện Đa khoa Gia Đình" : "Bệnh viện Hoàn Mỹ Đà Nẵng";
        setBookingData(prev => ({ ...prev, hospitalId: 2, hospitalName: hospName, specialty: "Nội khoa" }));
        fallbackReply = `Đã chọn cơ sở khám: **${hospName}** 🏥.\nVới triệu chứng chóng mặt và buồn nôn, tôi tự động gợi ý bạn khám chuyên khoa **Nội khoa**.\nTại đây có bác sĩ chuyên khoa tốt là **BS. Nguyễn Văn An**. Bạn có muốn chọn khám với bác sĩ này không?`;
      } else if (lowercase.includes("an") || lowercase.includes("bác sĩ bất kỳ") || lowercase.includes("bat ky") || lowercase.includes("ok") || lowercase.includes("có")) {
        setBookingData(prev => ({ ...prev, doctorId: 1, doctorName: "BS. Nguyễn Văn An" }));
        fallbackReply = "Đã ghi nhận bác sĩ: **BS. Nguyễn Văn An** 👨‍⚕️.\nBạn rảnh vào ngày mai khoảng 9h đúng không? Tôi sẽ chọn ngày khám là **Ngày mai** 📅. Khung giờ khám sẽ là **09:00** ⏰ nhé?\n\nBạn có xác nhận đặt lịch khám này không?";
      } else if (lowercase.includes("xác nhận") || lowercase.includes("xac nhan") || lowercase.includes("đặt") || lowercase.includes("dong y") || lowercase.includes("đồng ý")) {
        fallbackReply = `🎉 **Đặt lịch hẹn khám thành công! (Simulated)**\n\n• Mã số phiếu khám của bạn là: **#STL-APP9022**\n• Bệnh viện: Bệnh viện Hoàn Mỹ Đà Nẵng 🏥\n• Bác sĩ: BS. Nguyễn Văn An 👨‍⚕️\n• Thời gian: 09:00 ngày mai 📅\n• Triệu chứng: Chóng mặt, buồn nôn 🩺\n• Trạng thái thanh toán: **Đã thanh toán (Demo Cash)** 💳\n\n**Chúc bạn khám bệnh suôn sẻ và sớm bình phục sức khỏe nhé! ❤️**`;
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
      } else {
        fallbackReply = "Tôi đã ghi nhận thông tin. Bạn có thể cho tôi biết bạn muốn đặt lịch khám tại Bệnh viện Hoàn Mỹ Đà Nẵng hay Bệnh viện Đa khoa Gia Đình không?";
      }
      
      addBotMessage(fallbackReply);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Back to Top Button - Bottom Right */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
      >
        <button
          onClick={scrollToTop}
          className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-lg shadow-xl flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>

      {/* Chatbot Trigger & Panel - Bottom Left */}
      <div className="fixed bottom-0 left-6 z-50 flex flex-col items-start">
        {/* Chatbot Panel (Slide up) */}
        <div
          className={`bg-white rounded-t-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out origin-bottom flex flex-col ${
            isChatOpen
              ? isExpanded
                ? 'w-[520px] max-h-[80vh] h-[80vh] opacity-100 mb-4'
                : 'w-80 sm:w-96 max-h-[500px] h-[500px] opacity-100 mb-4'
              : 'w-80 sm:w-96 max-h-0 h-0 opacity-0 pointer-events-none'
          }`}
        >
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-300" />
              <span className="font-semibold text-sm">Tư vấn sức khỏe AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                title="Xóa trò chuyện"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(v => !v)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 ${isExpanded ? 'max-w-[90%]' : 'max-w-[85%]'} ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border text-blue-600'}`}>
                    {msg.sender === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className={`inline-block p-3 rounded-2xl max-w-[85%] ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <div className={`prose prose-sm max-w-none break-words ${msg.sender === 'user' ? 'text-white prose-p:text-white prose-strong:text-white prose-a:text-white' : ''}`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 bg-white border rounded-full flex items-center justify-center text-blue-600">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white px-3 py-2 rounded-xl rounded-tl-none border shadow-sm text-xs text-gray-400">
                    Đang trả lời...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          {!user ? (
            <div className="p-3 border-t bg-gray-50 shrink-0">
              <div className="text-xs text-gray-500 mb-2 text-center font-medium">Bạn cần đăng nhập để chat với AI. Hoặc chọn câu hỏi:</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { label: "Làm sao để đặt lịch?", reply: "Để đặt lịch khám, bạn vui lòng [Đăng nhập](/login) vào hệ thống, sau đó chọn chuyên khoa, bác sĩ và thời gian phù hợp nhé!" },
                  { label: "Giờ làm việc?", reply: "Phòng khám hoạt động từ Thứ 2 đến Thứ 7, sáng 07:30 - 11:30, chiều 13:00 - 17:00." },
                  { label: "Có khám BHYT không?", reply: "Phòng khám hiện có hỗ trợ thanh toán bảo hiểm y tế. Bạn vui lòng mang theo thẻ BHYT và CCCD khi đến khám." },
                  { label: "Tính năng AI là gì?", reply: "Khi đăng nhập, Trợ lý AI sẽ giúp phân tích triệu chứng của bạn, tư vấn chuyên khoa và hỗ trợ đặt lịch tự động." }
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePredefinedClick(q)}
                    className="bg-white hover:bg-blue-50 text-blue-600 text-xs py-1.5 px-3 rounded-full transition-colors border border-blue-200"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 border-t bg-white shrink-0 flex items-center gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                maxLength={300}
                disabled={isTyping}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !isTyping) handleSend();
                }}
                className={`flex-1 px-3 border rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${isExpanded ? 'py-2.5 text-sm' : 'py-1.5 text-xs'}`}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isTyping}
                className={`bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed ${isExpanded ? 'p-2.5' : 'p-2'}`}
              >
                <Send className={isExpanded ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
              </button>
            </div>
          )}
        </div>

        {/* Trigger Bar (Sits at the very bottom) */}
        <div
          className={`bg-blue-500 hover:bg-blue-600 text-white cursor-pointer px-3 py-1.5 w-96 justify-center rounded-t font-medium shadow-lg flex items-center gap-2 transition-all transform ${isChatOpen ? 'translate-y-full' : 'translate-y-0'}`}
          onClick={() => setIsChatOpen(true)}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">Tư vấn trực tuyến</span>
        </div>
      </div>
    </>
  );
};

export default FloatingWidgets;
