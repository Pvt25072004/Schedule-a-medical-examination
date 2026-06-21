import '../entities/review.dart';
import '../repositories/review_repository.dart';

class UpdatereviewUseCase {
  final ReviewRepository repository;
  UpdatereviewUseCase(this.repository);

  Future<bool> call({
    required int reviewId,
    required int rating,
    String? comment,
  }) async {
    return await repository.updateReview(reviewId: reviewId, rating: rating, comment: comment);
  }
}
