import 'package:flutter/material.dart';

class CreateAndResetPinPage extends StatelessWidget {
  const CreateAndResetPinPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('PIN')),
      body: const Center(child: Text('Create And Reset Pin Page')),
    );
  }
}
