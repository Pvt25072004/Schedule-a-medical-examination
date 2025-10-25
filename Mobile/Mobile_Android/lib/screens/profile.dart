import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter/material.dart';
import 'package:clinic_booking_system/welcome/welcome.dart'; // FIXED: Import WelcomeScreen cho logout

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<dynamic, dynamic>? userData;

  @override
  void initState() {
    super.initState();
    _fetchUserData();
  }

  Future<void> _fetchUserData() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return;

    final ref = FirebaseDatabase.instance.ref('users/${user.uid}');
    final snapshot = await ref.get();

    if (snapshot.exists) {
      setState(() {
        userData = snapshot.value as Map<dynamic, dynamic>;
      });
    }
  }

  Future<void> _handleLogout() async {
    await FirebaseAuth.instance.signOut();
    if (context.mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const WelcomeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFFF8F0), // FIXED: Background từ theme (như login screen)
      appBar: AppBar(
        title: const Text("Hồ Sơ"),
        backgroundColor: Colors.greenAccent,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: userData == null
          ? const Center(child: CircularProgressIndicator(color: Colors.greenAccent))
          : SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // FIXED: Profile header card với avatar
            Card(
              elevation: 8,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.greenAccent.withOpacity(0.2),
                      backgroundImage: userData!['photoUrl'] != null
                          ? NetworkImage(userData!['photoUrl'])
                          : null,
                      child: userData!['photoUrl'] == null
                          ? const Icon(Icons.person, size: 50, color: Colors.greenAccent)
                          : null,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      userData!['displayName'] ?? 'N/A',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.greenAccent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        userData!['role'] ?? 'N/A',
                        style: TextStyle(fontSize: 14, color: Colors.green.shade700, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // FIXED: Details list với ListTile đẹp
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.phone, color: Colors.greenAccent),
                    title: const Text('Số điện thoại', style: TextStyle(fontWeight: FontWeight.w500)),
                    subtitle: Text(userData!['phone'] ?? 'N/A'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.description, color: Colors.greenAccent),
                    title: const Text('Giới thiệu', style: TextStyle(fontWeight: FontWeight.w500)),
                    subtitle: Text(userData!['bio'] ?? 'Chưa cập nhật'),
                    trailing: userData!['bio'] == null || (userData!['bio'] as String).isEmpty
                        ? const Icon(Icons.edit, color: Colors.grey)
                        : null,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // FIXED: Logout button đẹp
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _handleLogout,
                icon: const Icon(Icons.logout, color: Colors.white),
                label: const Text('Đăng xuất', style: TextStyle(fontSize: 16)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade400,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}