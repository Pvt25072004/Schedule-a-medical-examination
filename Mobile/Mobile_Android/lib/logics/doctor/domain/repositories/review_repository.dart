import '../entities/review.dart';

abstract class ReviewRepository {
  Future<bool> createReview({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  });
  Future<bool> updateReview({
    required int reviewId,
    required int rating,
    String? comment,
  });
}
