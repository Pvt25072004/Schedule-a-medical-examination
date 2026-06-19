import 'package:flutter/material.dart';
import '../domain/entities/review.dart';
import '../domain/usecases/createReview_usecase.dart';
import '../domain/usecases/updateReview_usecase.dart';

class ReviewProvider extends ChangeNotifier {
  final CreatereviewUseCase createReviewUseCase;
  final UpdatereviewUseCase updateReviewUseCase;

  ReviewProvider({
    required this.createReviewUseCase,
    required this.updateReviewUseCase,
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> executeCreatereview({
    required int userId,
    required int doctorId,
    required int appointmentId,
    required int rating,
    String? comment,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await createReviewUseCase(userId, doctorId: doctorId, appointmentId: appointmentId, rating: rating, comment: comment, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeUpdatereview({
    required int reviewId,
    required int rating,
    String? comment,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await updateReviewUseCase(reviewId, rating: rating, comment: comment, : );
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
