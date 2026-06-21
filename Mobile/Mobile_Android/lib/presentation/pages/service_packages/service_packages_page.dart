import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../../service/service_package_service.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../booking/booking_page.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import '../../organisms/service_packages/service_package_card.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class ServicePackagesPage extends StatefulWidget {
  const ServicePackagesPage({super.key});

  @override
  State<ServicePackagesPage> createState() => _ServicePackagesPageState();
}

class _ServicePackagesPageState extends State<ServicePackagesPage> {
  final ServicePackageService _packageService = ServicePackageService();
  List<dynamic> _packages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPackages();
  }

  Future<void> _loadPackages() async {
    final data = await _packageService.fetchPackages();
    if (mounted) {
      setState(() {
        _packages = data;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gói Khám Sức Khỏe'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _packages.isEmpty
              ? const Center(child: Text('Hiện không có gói khám nào.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _packages.length,
                  itemBuilder: (context, index) {
                    final pkg = _packages[index];
                    return ServicePackageCard(
                      pkg: pkg,
                      onBookNow: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => BookingPage(
                              initialPackageData: pkg,
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
    );
  }
}

