import '../../domain/entities/payment.dart';

class PaymentModel extends Payment {
  PaymentModel({super.id});

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(id: json['_id'] ?? json['id']);
  }
}
