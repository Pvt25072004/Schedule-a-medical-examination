// step5_patient_info.dart - New step for patient info form
import 'package:clinic_booking_system/subscreens/booking/step2_area_selection.dart';
import 'package:flutter/material.dart';

class Step5PatientInfo extends StatefulWidget {
  final Function(Map<String, dynamic>) onNext;
  final VoidCallback onBack;
  const Step5PatientInfo({
    super.key,
    required this.onNext,
    required this.onBack,
  });

  @override
  State<Step5PatientInfo> createState() => _Step5PatientInfoState();
}

class _Step5PatientInfoState extends State<Step5PatientInfo> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _reasonController = TextEditingController();
  final _noteController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AppBar(
          title: const Text('Thông tin bệnh nhân'),
          backgroundColor: Colors.teal,
          foregroundColor: Colors.white,
          automaticallyImplyLeading: false,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: widget.onBack,
          ),
        ).asBody(),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Họ và tên *',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) => value!.isEmpty ? 'Vui lòng nhập họ tên' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _phoneController,
                    decoration: const InputDecoration(
                      labelText: 'Số điện thoại *',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.phone,
                    validator: (value) => value!.isEmpty ? 'Vui lòng nhập số điện thoại' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email *',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) => value!.isEmpty ? 'Vui lòng nhập email' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _reasonController,
                    decoration: const InputDecoration(
                      labelText: 'Lý do khám *',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                    validator: (value) => value!.isEmpty ? 'Vui lòng nhập lý do khám' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _noteController,
                    decoration: const InputDecoration(
                      labelText: 'Ghi chú',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      OutlinedButton(
                        onPressed: widget.onBack,
                        child: const Text('Quay lại'),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          if (_formKey.currentState!.validate()) {
                            widget.onNext({
                              'fullName': _nameController.text,
                              'phone': _phoneController.text,
                              'email': _emailController.text,
                              'reason': _reasonController.text,
                              'note': _noteController.text,
                            });
                          }
                        },
                        child: const Text('Xác nhận đặt lịch'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _reasonController.dispose();
    _noteController.dispose();
    super.dispose();
  }
}