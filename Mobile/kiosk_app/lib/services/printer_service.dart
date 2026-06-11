import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:flutter/material.dart';

class PrinterService {
  static final PrinterService _instance = PrinterService._internal();
  factory PrinterService() => _instance;
  PrinterService._internal();

  final BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;
  BluetoothDevice? _selectedDevice;

  Future<List<BluetoothDevice>> getDevices() async {
    try {
      return await bluetooth.getBondedDevices();
    } catch (e) {
      debugPrint('Error getting devices: $e');
      return [];
    }
  }

  void setDevice(BluetoothDevice device) {
    _selectedDevice = device;
  }

  BluetoothDevice? get selectedDevice => _selectedDevice;

  Future<bool> isConnected() async {
    return await bluetooth.isConnected ?? false;
  }

  Future<void> connect() async {
    if (_selectedDevice == null) return;
    try {
      bool? isConn = await bluetooth.isConnected;
      if (isConn == false) {
        await bluetooth.connect(_selectedDevice!);
      }
    } catch (e) {
      debugPrint('Connection error: $e');
    }
  }

  Future<void> disconnect() async {
    try {
      await bluetooth.disconnect();
    } catch (e) {
      debugPrint('Disconnect error: $e');
    }
  }

  /// Print the appointment ticket
  Future<void> printTicket({
    required String appointmentId,
    required String patientName,
    required String hospitalName,
    required String doctorName,
    required String date,
    required String time,
    String? roomName,
  }) async {
    bool? isConn = await bluetooth.isConnected;
    if (isConn == null || !isConn) {
      if (_selectedDevice != null) {
        await connect();
      } else {
        throw Exception('Chưa chọn máy in Bluetooth');
      }
    }

    try {
      // SIZE: 0: Normal, 1: Normal-Bold, 2: Medium-Bold, 3: Large-Bold
      // ALIGN: 0: Left, 1: Center, 2: Right

      await bluetooth.printNewLine();
      
      // Header
      await bluetooth.printCustom(hospitalName, 2, 1);
      await bluetooth.printCustom("PHIEU CHO KHAM", 3, 1);
      await bluetooth.printNewLine();

      // Divider
      await bluetooth.printCustom("--------------------------------", 0, 1);
      
      // Content
      await bluetooth.printCustom("Ma Kiem Tra: #$appointmentId", 1, 0);
      await bluetooth.printCustom("Benh nhan: $patientName", 1, 0);
      await bluetooth.printCustom("Bac si: $doctorName", 0, 0);
      if (roomName != null && roomName.isNotEmpty) {
        await bluetooth.printCustom("Phong Kham: $roomName", 1, 0);
      }
      await bluetooth.printCustom("Thoi gian: $time - $date", 0, 0);
      
      await bluetooth.printCustom("--------------------------------", 0, 1);
      await bluetooth.printCustom("Vui long ngoi cho den luot!", 0, 1);
      
      // Footer and feed
      await bluetooth.printNewLine();
      await bluetooth.printNewLine();
      await bluetooth.paperCut(); // Only works if printer supports auto cutter
    } catch (e) {
      debugPrint('Print error: $e');
      throw Exception('Không thể in phiếu. Vui lòng kiểm tra lại máy in.');
    }
  }
}
