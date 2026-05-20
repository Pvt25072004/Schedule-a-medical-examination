class ApiConfig {
  // Mặc định trỏ tới máy local qua IP mạng LAN hoặc 10.0.2.2 cho emulator
  // Bạn có thể thay đổi địa chỉ IP này cho khớp với IP máy tính chạy backend của bạn
  static const String baseUrl = "http://192.168.1.23:8080/api/v1";
  
  // Thời gian timeout cho các cuộc gọi REST API
  static const Duration timeout = Duration(seconds: 10);
}
