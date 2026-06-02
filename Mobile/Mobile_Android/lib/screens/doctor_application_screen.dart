import 'package:flutter/material.dart';
import '../service/doctor_service.dart';
import '../utils/api_config.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../utils/snackbar_helper.dart';

class DoctorApplicationScreen extends StatefulWidget {
  const DoctorApplicationScreen({super.key});

  @override
  State<DoctorApplicationScreen> createState() => _DoctorApplicationScreenState();
}

class _DoctorApplicationScreenState extends State<DoctorApplicationScreen> {
  final DoctorService _doctorService = DoctorService();
  final TextEditingController _coverLetterController = TextEditingController();
  
  List<dynamic> _hospitals = [];
  int? _selectedHospitalId;
  bool _isLoading = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadHospitals();
  }

  Future<void> _loadHospitals() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/hospitals'));
      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        setState(() {
          _hospitals = data;
          if (_hospitals.isNotEmpty) {
            _selectedHospitalId = _hospitals.first['id'];
          }
        });
      }
    } catch (e) {
      print('Lỗi tải danh sách bệnh viện: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _submitApplication() async {
    if (_selectedHospitalId == null) {
      showAppSnackBar(context, 'Vui lòng chọn Bệnh viện/Phòng khám');
      return;
    }

    setState(() => _isSubmitting = true);
    
    final success = await _doctorService.applyForDoctor({
      'hospital_id': _selectedHospitalId,
      'cover_letter': _coverLetterController.text.trim(),
      'type': 'join'
    });

    if (mounted) {
      setState(() => _isSubmitting = false);
      if (success) {
        showAppSnackBar(context, 'Đã gửi đơn ứng tuyển thành công!');
        Navigator.pop(context);
      } else {
        showAppSnackBar(context, 'Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    }
  }

  @override
  void dispose() {
    _coverLetterController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ứng tuyển Bác sĩ'),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Tham gia mạng lưới Bác sĩ của chúng tôi',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1B5E20)),
                  ),
                  const SizedBox(height: 16),
                  
                  const Text('Chọn Bệnh viện / Phòng khám', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<int>(
                        isExpanded: true,
                        value: _selectedHospitalId,
                        hint: const Text('Chọn bệnh viện'),
                        items: _hospitals.map<DropdownMenuItem<int>>((h) {
                          return DropdownMenuItem<int>(
                            value: h['id'],
                            child: Text(h['name'] ?? 'Unknown'),
                          );
                        }).toList(),
                        onChanged: (val) {
                          setState(() => _selectedHospitalId = val);
                        },
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 20),
                  const Text('Thư giới thiệu (Cover Letter)', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _coverLetterController,
                    maxLines: 5,
                    decoration: InputDecoration(
                      hintText: 'Giới thiệu kinh nghiệm làm việc, bằng cấp của bạn...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _submitApplication,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.greenAccent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isSubmitting 
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Gửi Yêu Cầu Ứng Tuyển', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
