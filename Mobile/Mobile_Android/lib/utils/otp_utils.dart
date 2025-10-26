import 'dart:math';
import 'package:flutter/material.dart';

String generateOtp() {
  final random = Random();
  return (100000 + random.nextInt(900000)).toString();
}

Future<String?> showOtpDialog(BuildContext context, String? expectedOtp) async {
  final List<TextEditingController> controllers = List.generate(
    6,
    (_) => TextEditingController(),
  );
  final List<FocusNode> focusnodes = List.generate(6, (_) => FocusNode());
  int attempts = 0;

  return await showDialog<String>(
    context: context,
    barrierDismissible: false,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            insetPadding: const EdgeInsets.symmetric(
              horizontal: 30,
              vertical: 20,
            ),
            title: const Text(
              "Nhập mã xác minh",
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            content: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(6, (index) {
                return Container(
                  width: 45,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  child: TextField(
                    controller: controllers[index],
                    focusNode: focusnodes[index],
                    keyboardType: TextInputType.number,
                    maxLength: 1,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 18),
                    decoration: InputDecoration(
                      counterText: '',
                      contentPadding: const EdgeInsets.all(10),
                      enabledBorder: OutlineInputBorder(
                        borderSide: const BorderSide(
                          color: Colors.green,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: const BorderSide(
                          color: Colors.green,
                          width: 2.5,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    onChanged: (value) {
                      if (value.isNotEmpty && index < 5) {
                        FocusScope.of(
                          context,
                        ).requestFocus(focusnodes[index + 1]);
                      } else if (value.isEmpty && index > 0) {
                        FocusScope.of(
                          context,
                        ).requestFocus(focusnodes[index - 1]);
                      }
                    },
                  ),
                );
              }),
            ),
            contentPadding: const EdgeInsets.symmetric(
              vertical: 24,
              horizontal: 16,
            ),
            actionsAlignment: MainAxisAlignment.spaceBetween,
            actionsPadding: const EdgeInsets.only(
              left: 20,
              right: 20,
              bottom: 16,
            ),
            actions: [
              TextButton(
                style: TextButton.styleFrom(
                  foregroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(
                    vertical: 10,
                    horizontal: 16,
                  ),
                ),
                onPressed: () => Navigator.pop(context, null),
                child: const Text("Hủy"),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  padding: const EdgeInsets.symmetric(
                    vertical: 10,
                    horizontal: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () {
                  final enteredOtp = controllers.map((c) => c.text).join();
                  attempts++;
                  if (expectedOtp != null && expectedOtp.isNotEmpty) {
                    // Xác minh OTP cho email
                    if (enteredOtp == expectedOtp) {
                      Navigator.pop(context, enteredOtp);
                    } else if (attempts >= 5) {
                      Navigator.pop(context, null);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("❌ Sai mã OTP ($attempts/5)")),
                      );
                    }
                  } else {
                    // Trả về OTP cho SDT (Firebase sẽ xác minh)
                    Navigator.pop(context, enteredOtp);
                  }
                },
                child: const Text(
                  "Xác nhận",
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          );
        },
      );
    },
  );
}
