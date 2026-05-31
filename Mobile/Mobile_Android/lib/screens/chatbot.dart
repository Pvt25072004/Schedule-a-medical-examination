import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/api_config.dart';

class ChatBotScreen extends StatefulWidget {
  const ChatBotScreen({super.key});

  @override
  State<ChatBotScreen> createState() => _ChatBotScreenState();
}

class _ChatBotScreenState extends State<ChatBotScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;

  Map<String, dynamic> _bookingData = {
    'hospitalId': null,
    'hospitalName': '',
    'specialty': null,
    'categoryId': null,
    'doctorId': null,
    'doctorName': '',
    'packageId': null,
    'packageName': '',
    'date': '',
    'time': '',
    'symptoms': null,
  };

  final List<Map<String, dynamic>> _messages = [
    {'text': 'Xin chào! Tôi là trợ lý ảo của HealthCare VN. Bạn cần hỗ trợ gì hôm nay?', 'isUser': false},
  ];

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'text': text, 'isUser': true});
      _controller.clear();
      _isLoading = true;
    });
    _scrollToBottom();

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/ai/chat');
      
      // Xây dựng context 6 tin nhắn gần nhất
      List<Map<String, String>> apiMessages = [];
      final recentMessages = _messages.take(_messages.length - 1).toList();
      final startIndex = recentMessages.length > 6 ? recentMessages.length - 6 : 0;
      
      for (int i = startIndex; i < recentMessages.length; i++) {
         apiMessages.add({
           'role': recentMessages[i]['isUser'] ? 'user' : 'assistant',
           'content': recentMessages[i]['text']
         });
      }
      apiMessages.add({'role': 'user', 'content': text});

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'messages': apiMessages,
          'bookingData': _bookingData,
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        if (mounted) {
          setState(() {
            _messages.add({'text': data['reply'] ?? 'Không có phản hồi.', 'isUser': false});
            if (data['bookingData'] != null) {
               _bookingData = data['bookingData'];
            }
            if (data['isComplete'] == true) {
               _messages.add({'text': '🎉 Thông tin đặt lịch đã được chốt! Bạn có thể chuyển sang trang Đặt Lịch để hoàn tất.', 'isUser': false});
            }
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _messages.add({'text': 'Hệ thống AI đang bận (Lỗi ${response.statusCode}). Vui lòng thử lại!', 'isUser': false});
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add({'text': 'Không thể kết nối với Trợ lý ảo lúc này.', 'isUser': false});
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _scrollToBottom();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8F0).withOpacity(0.92), // 👈 Thêm độ trong suốt nhẹ cho hộp chat đẹp hơn
        // 👈 Bỏ borderRadius ở đây, để parent ClipRRect lo bo tròn toàn bộ
      ),
      child: Column(
        children: [
          // FIXED: Messages list (mở rộng để chiếm hết không gian)
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length && _isLoading) {
                  return const Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: EdgeInsets.all(8.0),
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  );
                }
                final message = _messages[index];
                return Align(
                  alignment: message['isUser'] ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: message['isUser'] ? Colors.greenAccent : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.2),
                          spreadRadius: 1,
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      message['text'],
                      style: TextStyle(
                        color: message['isUser'] ? Colors.white : Colors.black87,
                        fontSize: 16,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          // FIXED: Input bottom bar (thêm bo tròn dưới để match, nhưng parent sẽ clip)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9), // 👈 Cũng thêm transparent cho input bar
              border: Border.all(color: Colors.greenAccent.withOpacity(0.3)),
              borderRadius: const BorderRadius.only( // 👈 Bo tròn dưới để đẹp, parent clip nếu cần
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Nhập tin nhắn...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(color: Colors.greenAccent.withOpacity(0.5)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(color: Colors.greenAccent.withOpacity(0.5)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                        borderSide: BorderSide(color: Colors.greenAccent, width: 2),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                FloatingActionButton(
                  onPressed: _sendMessage,
                  mini: true,
                  backgroundColor: Colors.greenAccent,
                  child: const Icon(Icons.send, color: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}