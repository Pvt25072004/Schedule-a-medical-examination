import 'package:flutter/material.dart';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import '../services/printer_service.dart';

class PrinterSettingsScreen extends StatefulWidget {
  const PrinterSettingsScreen({super.key});

  @override
  State<PrinterSettingsScreen> createState() => _PrinterSettingsScreenState();
}

class _PrinterSettingsScreenState extends State<PrinterSettingsScreen> {
  final PrinterService _printerService = PrinterService();
  List<BluetoothDevice> _devices = [];
  BluetoothDevice? _selectedDevice;
  bool _isConnected = false;

  @override
  void initState() {
    super.initState();
    _initPrinter();
  }

  Future<void> _initPrinter() async {
    List<BluetoothDevice> devices = await _printerService.getDevices();
    bool isConnected = await _printerService.isConnected();
    
    if (mounted) {
      setState(() {
        _devices = devices;
        _selectedDevice = _printerService.selectedDevice;
        _isConnected = isConnected;
      });
    }
  }

  void _connectDevice(BluetoothDevice device) async {
    _printerService.setDevice(device);
    setState(() {
      _selectedDevice = device;
    });
    
    try {
      await _printerService.connect();
      bool isConnected = await _printerService.isConnected();
      setState(() {
        _isConnected = isConnected;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(isConnected ? 'Kết nối thành công!' : 'Kết nối thất bại')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  void _disconnect() async {
    await _printerService.disconnect();
    setState(() {
      _isConnected = false;
    });
  }

  void _testPrint() async {
    if (!_isConnected) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Chưa kết nối máy in!')),
      );
      return;
    }

    try {
      await _printerService.printTicket(
        appointmentId: '9999',
        patientName: 'TEST IN',
        hospitalName: 'STL CLINIC',
        doctorName: 'BS. TEST',
        date: '01/01/2026',
        time: '08:00',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã gửi lệnh in test')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi in: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cài đặt Máy in Bluetooth'),
        backgroundColor: const Color(0xFF48A1F3),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Trạng thái kết nối: ', style: TextStyle(fontSize: 16)),
                Text(
                  _isConnected ? 'Đã kết nối' : 'Chưa kết nối',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: _isConnected ? Colors.green : Colors.red,
                  ),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: _devices.isEmpty
                ? const Center(child: Text('Không tìm thấy thiết bị Bluetooth nào đã Pair. Vui lòng vào cài đặt Bluetooth của máy để Pair thiết bị trước.'))
                : ListView.builder(
                    itemCount: _devices.length,
                    itemBuilder: (context, index) {
                      final device = _devices[index];
                      final isSelected = _selectedDevice?.address == device.address;
                      return ListTile(
                        leading: const Icon(Icons.print),
                        title: Text(device.name ?? 'Unknown Device'),
                        subtitle: Text(device.address ?? ''),
                        trailing: isSelected && _isConnected
                            ? IconButton(
                                icon: const Icon(Icons.link_off, color: Colors.red),
                                onPressed: _disconnect,
                              )
                            : IconButton(
                                icon: const Icon(Icons.link, color: Colors.blue),
                                onPressed: () => _connectDevice(device),
                              ),
                        tileColor: isSelected ? Colors.blue.withOpacity(0.1) : null,
                      );
                    },
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.print, color: Colors.white),
                label: const Text('In thử (Test Print)', style: TextStyle(color: Colors.white, fontSize: 16)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isConnected ? const Color(0xFF48A1F3) : Colors.grey,
                ),
                onPressed: _testPrint,
              ),
            ),
          )
        ],
      ),
    );
  }
}
