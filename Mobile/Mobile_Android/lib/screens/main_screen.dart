import 'package:clinic_booking_system/screens/settings.dart';
import 'package:flutter/material.dart';

import 'appointments.dart';
import 'booking.dart';
import 'chatbot.dart';
import 'home.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    BookingScreen(),
    AppointmentsScreen(),
    ChatBotScreen(),
    SettingScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.green,
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: "Trang chủ",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.medical_services),
            label: "Đặt lịch",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.list_alt),
            label: "Xem lịch",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.support_agent),
            label: "Hỗ trợ",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: "Cài đặt",
          ),
        ],
      ),
    );
  }
}
