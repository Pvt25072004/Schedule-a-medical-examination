import 'package:flutter/material.dart';
import '../atoms/app_text_field.dart';

class AuthInputField extends StatefulWidget {
  final String inputType;
  final ValueChanged<String> onInputTypeChanged;
  final TextEditingController inputController;

  const AuthInputField({
    super.key,
    required this.inputType,
    required this.onInputTypeChanged,
    required this.inputController,
  });

  @override
  State<AuthInputField> createState() => _AuthInputFieldState();
}

class _AuthInputFieldState extends State<AuthInputField> {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: const BoxDecoration(
              border: Border(right: BorderSide(color: Colors.black12)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: widget.inputType,
                icon: const Icon(Icons.arrow_drop_down, color: Colors.black54),
                style: const TextStyle(
                  color: Colors.black87,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                items: const [
                  DropdownMenuItem(value: 'email', child: Text("Email")),
                  DropdownMenuItem(value: 'phone', child: Text("SĐT")),
                ],
                onChanged: (val) {
                  if (val != null) {
                    widget.onInputTypeChanged(val);
                  }
                },
              ),
            ),
          ),
          Expanded(
            child: AppTextField(
              controller: widget.inputController,
              hintText: widget.inputType == 'email' ? "Nhập email của bạn..." : "Nhập số điện thoại...",
              prefixIcon: widget.inputType == 'email' ? Icons.email_outlined : Icons.phone_outlined,
              keyboardType: widget.inputType == 'email' ? TextInputType.emailAddress : TextInputType.phone,
            ),
          ),
        ],
      ),
    );
  }
}
