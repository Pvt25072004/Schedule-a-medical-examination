import 'package:flutter/material.dart';

class AppointmentCard extends StatelessWidget {
  final dynamic appt;
  final VoidCallback onReschedule;
  final VoidCallback onCancel;
  final VoidCallback onRefund;
  final VoidCallback onReview;
  final Color statusColor;
  final String statusLabel;
  final IconData statusIcon;
  final String dateStr;
  final String timeStr;
  final String docName;
  final String specialty;
  final String hospName;
  final String status;

  const AppointmentCard({
    super.key,
    required this.appt,
    required this.onReschedule,
    required this.onCancel,
    required this.onRefund,
    required this.onReview,
    required this.statusColor,
    required this.statusLabel,
    required this.statusIcon,
    required this.dateStr,
    required this.timeStr,
    required this.docName,
    required this.specialty,
    required this.hospName,
    required this.status,
  });

  Widget _buildInfoRow(IconData icon, String label, String value, Color iconColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 16, color: iconColor),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: Colors.black45, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 1),
              Text(
                value,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.black87),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 8),
          )
        ],
        border: Border.all(color: Colors.grey.shade100),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Column(
          children: [
            Container(
              color: statusColor.withOpacity(0.06),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.access_time_rounded, size: 16, color: Colors.grey.shade700),
                      const SizedBox(width: 6),
                      Text(
                        '$timeStr - $dateStr',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: Colors.grey.shade800,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor,
                      borderRadius: BorderRadius.circular(30),
                      boxShadow: [
                        BoxShadow(
                          color: statusColor.withOpacity(0.3),
                          blurRadius: 6,
                          offset: const Offset(0, 3),
                        )
                      ]
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(statusIcon, size: 12, color: Colors.white),
                        const SizedBox(width: 4),
                        Text(
                          statusLabel,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: statusColor.withOpacity(0.1),
                        child: Text(
                          docName.isNotEmpty ? docName.substring(0, 1) : 'D',
                          style: TextStyle(
                            color: statusColor, 
                            fontWeight: FontWeight.bold, 
                            fontSize: 22
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              docName,
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 17,
                                color: Colors.black87,
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Chuyên khoa: $specialty',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 14),
                    child: Divider(height: 1, thickness: 0.8, color: Color(0xFFEEEEEE)),
                  ),

                  _buildInfoRow(Icons.business_rounded, 'Nơi khám', hospName, Colors.indigo.shade600),
                  const SizedBox(height: 10),
                  _buildInfoRow(Icons.meeting_room_rounded, 'Phòng', appt['schedule']?['room']?['name']?.toString() ?? 'Chưa phân phòng', Colors.purple.shade600),
                  const SizedBox(height: 10),
                  _buildInfoRow(
                    Icons.sticky_note_2_outlined, 
                    'Lý do khám', 
                    appt['symptoms']?.toString() ?? 'Không rõ lý do', 
                    Colors.orange.shade700
                  ),
                  
                  if (status.toLowerCase() == 'pending' || status.toLowerCase() == 'confirmed') ...[
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: onReschedule,
                            icon: const Icon(Icons.edit_calendar, size: 18),
                            label: const Text('Dời lịch'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.blue.shade700,
                              side: BorderSide(color: Colors.blue.shade700),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: onCancel,
                            icon: const Icon(Icons.cancel_outlined, size: 18),
                            label: const Text('Hủy lịch'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade600,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                  
                  if (status.toLowerCase() == 'cancelled' && (appt['admin_cancelled_free_reschedule'] == true) && (appt['refund_status'] == 'none')) ...[
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12)),
                      child: const Text('Bệnh viện đã hủy lịch này. Bạn có thể Dời lịch miễn phí hoặc Yêu cầu hoàn tiền 100%.', style: TextStyle(color: Colors.red, fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: onReschedule,
                            icon: const Icon(Icons.edit_calendar, size: 18),
                            label: const Text('Dời lịch'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.blue.shade700,
                              side: BorderSide(color: Colors.blue.shade700),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: onRefund,
                            icon: const Icon(Icons.account_balance_wallet_outlined, size: 18),
                            label: const Text('Hoàn tiền'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange.shade600,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                    const SizedBox(height: 18),
                  if (status.toLowerCase() == 'completed') ...[
                    const SizedBox(height: 18),
                    Builder(
                      builder: (context) {
                        final existingReview = appt['review'];
                        final bool hasReviewed = existingReview != null;
                        
                        return SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: onReview,
                            icon: Icon(
                              hasReviewed ? Icons.edit_note_rounded : Icons.star_rounded, 
                              size: 20, 
                              color: Colors.white
                            ),
                            label: Text(
                              hasReviewed ? 'SỬA ĐÁNH GIÁ ✏️' : 'ĐÁNH GIÁ NGAY ⭐',
                              style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: hasReviewed ? Colors.blue.shade600 : Colors.orange.shade700,
                              foregroundColor: Colors.white,
                              elevation: 4,
                              shadowColor: (hasReviewed ? Colors.blue : Colors.orange).withOpacity(0.4),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
