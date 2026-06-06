import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../service/medical_record_service.dart';
import 'medical_record_detail.dart';

class MyMedicalRecordsScreen extends StatefulWidget {
  const MyMedicalRecordsScreen({super.key});

  @override
  State<MyMedicalRecordsScreen> createState() => _MyMedicalRecordsScreenState();
}

class _MyMedicalRecordsScreenState extends State<MyMedicalRecordsScreen> {
  final MedicalRecordService _recordService = MedicalRecordService();
  bool _isLoading = true;
  List<dynamic> _allRecords = [];
  List<dynamic> _filteredRecords = [];
  String _searchQuery = '';
  bool _isAscending = false; // Mặc định là mới nhất (descending)
  DateTimeRange? _selectedDateRange;

  @override
  void initState() {
    super.initState();
    _loadRecords();
  }

  Future<void> _loadRecords() async {
    final records = await _recordService.fetchMyRecords();
    if (mounted) {
      setState(() {
        _allRecords = records;
        _isLoading = false;
        _applyFilters();
      });
    }
  }

  void _applyFilters() {
    List<dynamic> filtered = List.from(_allRecords);

    // Filter by search query (Doctor name or diagnosis)
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((record) {
        final diagnosis = (record['diagnosis'] ?? '').toString().toLowerCase();
        final doctorName = (record['appointment']?['doctor']?['user']?['full_name'] ?? '').toString().toLowerCase();
        return diagnosis.contains(query) || doctorName.contains(query);
      }).toList();
    }

    // Filter by date range
    if (_selectedDateRange != null) {
      filtered = filtered.where((record) {
        final dateStr = record['created_at'];
        if (dateStr == null) return false;
        final dt = DateTime.tryParse(dateStr)?.toLocal();
        if (dt == null) return false;
        // Kiểm tra xem dt có nằm trong khoảng từ start đến end của ngày không
        // (chỉ so sánh phần ngày)
        final recordDate = DateTime(dt.year, dt.month, dt.day);
        final startDate = DateTime(_selectedDateRange!.start.year, _selectedDateRange!.start.month, _selectedDateRange!.start.day);
        final endDate = DateTime(_selectedDateRange!.end.year, _selectedDateRange!.end.month, _selectedDateRange!.end.day);
        
        return recordDate.isAfter(startDate.subtract(const Duration(days: 1))) && 
               recordDate.isBefore(endDate.add(const Duration(days: 1)));
      }).toList();
    }

    // Sort by date
    filtered.sort((a, b) {
      final dateA = DateTime.tryParse(a['created_at'] ?? '') ?? DateTime.now();
      final dateB = DateTime.tryParse(b['created_at'] ?? '') ?? DateTime.now();
      return _isAscending ? dateA.compareTo(dateB) : dateB.compareTo(dateA);
    });

    setState(() {
      _filteredRecords = filtered;
    });
  }

  Future<void> _selectDateRange(BuildContext context) async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      initialDateRange: _selectedDateRange,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF48A1F3), // header background color
              onPrimary: Colors.white, // header text color
              onSurface: Colors.black, // body text color
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDateRange) {
      setState(() {
        _selectedDateRange = picked;
        _applyFilters();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryColor = Color(0xFF48A1F3); // Blue
    const Color primaryDarkColor = Color(0xFF143250); // Dark Blue

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        title: const Text('Hồ sơ Sức khỏe', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: primaryDarkColor,
        iconTheme: const IconThemeData(color: Colors.white),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(_selectedDateRange != null ? Icons.filter_alt : Icons.date_range),
            onPressed: () => _selectDateRange(context),
            tooltip: 'Lọc theo ngày',
          ),
          if (_selectedDateRange != null)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                setState(() {
                  _selectedDateRange = null;
                  _applyFilters();
                });
              },
              tooltip: 'Xóa bộ lọc',
            ),
        ],
      ),
      body: Column(
        children: [
          // Header with Search and Filter
          Container(
            padding: const EdgeInsets.all(16.0),
            decoration: const BoxDecoration(
              color: primaryDarkColor,
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
            ),
            child: Column(
              children: [
                // Search Bar
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TextField(
                    onChanged: (value) {
                      _searchQuery = value;
                      _applyFilters();
                    },
                    decoration: const InputDecoration(
                      hintText: 'Tìm theo chẩn đoán, bác sĩ...',
                      prefixIcon: Icon(Icons.search, color: Colors.grey),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Date Filter Status & Sort Toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${_filteredRecords.length} kết quả',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                          if (_selectedDateRange != null)
                            Text(
                              '${DateFormat('dd/MM/yyyy').format(_selectedDateRange!.start)} - ${DateFormat('dd/MM/yyyy').format(_selectedDateRange!.end)}',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                        ],
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        setState(() {
                          _isAscending = !_isAscending;
                          _applyFilters();
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isAscending ? Icons.arrow_upward : Icons.arrow_downward,
                              color: Colors.white,
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _isAscending ? 'Cũ nhất' : 'Mới nhất',
                              style: const TextStyle(color: Colors.white, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // List Records
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: primaryColor))
                : _filteredRecords.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.folder_open, size: 64, color: Colors.grey[400]),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isNotEmpty 
                                  ? 'Không tìm thấy kết quả phù hợp'
                                  : 'Bạn chưa có hồ sơ khám bệnh nào',
                              style: TextStyle(color: Colors.grey[600], fontSize: 16),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16.0),
                        itemCount: _filteredRecords.length,
                        itemBuilder: (context, index) {
                          final record = _filteredRecords[index];
                          return _buildRecordCard(record, context, primaryColor);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecordCard(Map<String, dynamic> record, BuildContext context, Color primaryColor) {
    final appointment = record['appointment'] ?? {};
    final doctor = appointment['doctor'] ?? {};
    final doctorUser = doctor['user'] ?? {};
    final hospital = appointment['hospital'] ?? {};

    final doctorName = doctorUser['full_name'] ?? 'Bác sĩ ẩn danh';
    final hospitalName = hospital['name'] ?? 'Phòng khám';
    final diagnosis = record['diagnosis'] ?? 'Không có chẩn đoán';
    
    final createdStr = record['created_at'];
    String dateStr = 'N/A';
    if (createdStr != null) {
      final dt = DateTime.tryParse(createdStr);
      if (dt != null) {
        dateStr = DateFormat('dd/MM/yyyy HH:mm').format(dt.toLocal());
      }
    }

    return Card(
      elevation: 2,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => MedicalRecordDetailScreen(appointmentId: appointment['id']),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: primaryColor.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.medical_services_outlined, color: primaryColor, size: 20),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        dateStr,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                ],
              ),
              const Divider(height: 24),
              Text(
                'BS. $doctorName',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      hospitalName,
                      style: const TextStyle(fontSize: 13, color: Colors.grey),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.blueGrey[50],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chẩn đoán:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    const SizedBox(height: 2),
                    Text(
                      diagnosis,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
