import '../../domain/entities/review.dart';
import '../../domain/repositories/review_repository.dart';
import '../datasources/review_remote_data_source.dart';

class ReviewRepoImpl implements ReviewRepository {
  final ReviewRemoteDataSource remoteDataSource;
  ReviewRepoImpl(this.remoteDataSource);

  @override
  Future<bool> createReview({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  }) async {
    return await remoteDataSource.createReview(userId, doctorId: doctorId, appointmentId: appointmentId, rating: rating, comment: comment, : );
  }
  @override
  Future<bool> updateReview({
    required int reviewId,
    required int rating,
    String? comment,
  }) async {
    return await remoteDataSource.updateReview(reviewId, rating: rating, comment: comment, : );
  }
}
