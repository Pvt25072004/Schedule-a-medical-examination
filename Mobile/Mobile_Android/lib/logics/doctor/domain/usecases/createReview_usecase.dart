import '../entities/review.dart';
import '../repositories/review_repository.dart';

class CreatereviewUseCase {
  final ReviewRepository repository;
  CreatereviewUseCase(this.repository);

  Future<bool> call({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  }) async {
    return await repository.createReview(userId, doctorId: doctorId, appointmentId: appointmentId, rating: rating, comment: comment, : );
  }
}
