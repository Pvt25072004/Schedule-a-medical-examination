import 'package:flutter/material.dart';
import 'package:clinic_booking_system/core/tokens/app_colors.dart';

import 'package:clinic_booking_system/core/tokens/app_colors.dart';

class WeatherWidget extends StatelessWidget {
  final bool isLoading;
  final Map<String, dynamic>? weatherData;
  final Color primaryColor;
  final Color primaryDarkColor;

  const WeatherWidget({
    super.key,
    required this.isLoading,
    required this.weatherData,
    required this.primaryColor,
    required this.primaryDarkColor,
  });

  IconData _getWeatherIcon(String iconCode) {
    if (iconCode.contains('01')) return Icons.wb_sunny_rounded;
    if (iconCode.contains('09') || iconCode.contains('10')) return Icons.cloudy_snowing;
    if (iconCode.contains('03') || iconCode.contains('04')) return Icons.cloud;
    return Icons.cloud_outlined;
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return SizedBox(
        width: 110,
        height: 28,
        child: Center(
          child: LinearProgressIndicator(
            backgroundColor: const Color(0xFFE8F5E9),
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            minHeight: 2,
          ),
        ),
      );
    }

    final dynamic tempVal = weatherData?['main']?['temp'];
    final String temp = tempVal is num ? tempVal.toStringAsFixed(1) : (tempVal?.toString() ?? '--');
    final city = weatherData?['name'] ?? 'Vị trí';
    
    // Safety check for weather data structure
    String iconCode = '01d';
    if (weatherData != null && 
        weatherData!['weather'] != null && 
        weatherData!['weather'].isNotEmpty && 
        weatherData!['weather'][0] != null) {
      iconCode = weatherData!['weather'][0]['icon'] ?? '01d';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getWeatherIcon(iconCode),
            color: AppColors.primaryDark,
            size: 18,
          ),
          const SizedBox(width: 4),
          Text(
            '$temp°C, $city',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryDark,
            ),
          ),
        ],
      ),
    );
  }
}



