import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  String? _userRole;
  List<Map<String, dynamic>> _appointments = []; // FIXED: Mock data (fetch from DB in real)

  @override
  void initState() {
    super.initState();
    _fetchUserRoleAndAppointments();
  }

  Future<void> _fetchUserRoleAndAppointments() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final ref = FirebaseDatabase.instance.ref('users/${user.uid}');
    final snapshot = await ref.get();

    if (snapshot.exists) {
      final userData = snapshot.value as Map<dynamic, dynamic>;
      setState(() {
        _userRole = userData['role'] as String?;
      });

      // FIXED: Mock appointments (real: fetch from 'appointments/$uid' hoặc query)
      _appointments = [
        {
          'date': '25/10/2025',
          'time': '10:00',
          'status': 'Đã xác nhận', // FIXED: Status badge
          'notes': 'Khám tim mạch định kỳ',
          // Doctor view: patient info
          'patientName': 'Nguyễn Văn A',
          'patientPhone': '0123456789',
          'patientEmail': 'a@example.com',
          'medicalHistory': 'Tiểu đường type 2, cao huyết áp',
          // Patient view: doctor info
          'doctorName': 'BS. Trần Thị B',
          'doctorSpecialty': 'Nội khoa',
          'doctorPhone': '0987654321',
        },
        {
          'date': '26/10/2025',
          'time': '14:00',
          'status': 'Chờ xác nhận',
          'notes': 'Tái khám nhi khoa',
          'patientName': 'Trần Thị C',
          'patientPhone': '0111222333',
          'patientEmail': 'c@example.com',
          'medicalHistory': 'Hen suyễn nhẹ',
          'doctorName': 'BS. Lê Văn D',
          'doctorSpecialty': 'Nhi khoa',
          'doctorPhone': '0444555666',
        },
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_userRole == null) {
      return const Scaffold(
        backgroundColor: Color(0xFFFFF8F0),
        body: Center(child: CircularProgressIndicator(color: Colors.greenAccent)),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F0),
      appBar: AppBar(
        title: const Text("Lịch hẹn"),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _appointments.isEmpty
          ? const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy, size: 80, color: Colors.grey),
            SizedBox(height: 16),
            Text('Chưa có lịch hẹn nào', style: TextStyle(fontSize: 18, color: Colors.grey)),
          ],
        ),
      )
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _appointments.length,
        itemBuilder: (context, index) {
          final appt = _appointments[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            elevation: 4,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ExpansionTile(
              leading: CircleAvatar(
                backgroundColor: Colors.greenAccent.withOpacity(0.2),
                child: const Icon(Icons.schedule, color: Colors.greenAccent),
              ),
              title: Text(
                '${appt['date']} - ${appt['time']}',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(appt['notes']),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: appt['status'] == 'Đã xác nhận' ? Colors.green : Colors.orange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  appt['status'],
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),
              children: _userRole == 'DOCTOR'
                  ? _buildDoctorView(appt) // FIXED: Doctor view: patient details
                  : _buildPatientView(appt), // FIXED: Patient view: doctor details
            ),
          );
        },
      ),
    );
  }

  // FIXED: Doctor view (patient info limited)
  List<Widget> _buildDoctorView(Map<String, dynamic> appt) {
    return [
      Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailItem(Icons.person, 'Bệnh nhân', appt['patientName']),
            _buildDetailItem(Icons.phone, 'SĐT', appt['patientPhone']),
            _buildDetailItem(Icons.email, 'Email', appt['patientEmail']),
            _buildDetailItem(Icons.medical_information, 'Bệnh nền', appt['medicalHistory']),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () {
                // FIXED: Placeholder view full profile (limited access)
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Xem chi tiết bệnh nhân (sắp có)')),
                );
              },
              icon: const Icon(Icons.visibility, size: 18),
              label: const Text('Xem chi tiết'),
            ),
          ],
        ),
      ),
    ];
  }

  // FIXED: Patient view (doctor info)
  List<Widget> _buildPatientView(Map<String, dynamic> appt) {
    return [
      Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailItem(Icons.local_hospital, 'Bác sĩ', appt['doctorName']),
            _buildDetailItem(Icons.medical_services  , 'Chuyên khoa', appt['doctorSpecialty']),
            _buildDetailItem(Icons.phone, 'SĐT', appt['doctorPhone']),
            const SizedBox(height: 8),
            TextButton.icon(
              onPressed: () {
                // FIXED: Placeholder contact doctor
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Liên hệ bác sĩ (sắp có)')),
                );
              },
              icon: const Icon(Icons.call, size: 18),
              label: const Text('Liên hệ'),
            ),
          ],
        ),
      ),
    ];
  }

  Widget _buildDetailItem(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.greenAccent),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
                Text(value, style: const TextStyle(fontSize: 16)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}