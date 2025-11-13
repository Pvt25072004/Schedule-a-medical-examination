import 'package:flutter/material.dart';

void showAppSnackBar(BuildContext context, String message, {Color? color}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      behavior: SnackBarBehavior.floating, // ✅ Không đẩy layout
      margin: const EdgeInsets.only(bottom: 80, left: 16, right: 16), // tránh đè FAB
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      backgroundColor: color ?? Colors.green,
      duration: const Duration(seconds: 2),
    ),
  );
}
