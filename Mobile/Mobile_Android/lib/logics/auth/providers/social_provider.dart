import 'package:flutter/material.dart';
import '../domain/entities/social.dart';
import '../domain/usecases/likePost_usecase.dart';
import '../domain/usecases/checkLikeStatus_usecase.dart';
import '../domain/usecases/commentPost_usecase.dart';

class SocialProvider extends ChangeNotifier {
  final LikepostUseCase likePostUseCase;
  final ChecklikestatusUseCase checkLikeStatusUseCase;
  final CommentpostUseCase commentPostUseCase;

  SocialProvider({
    required this.likePostUseCase,
    required this.checkLikeStatusUseCase,
    required this.commentPostUseCase,
  });

  bool _isLoading = false;
  String? _errorMessage;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> executeLikepost(int postId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await likePostUseCase(postId);
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeChecklikestatus(int postId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await checkLikeStatusUseCase(postId);
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  Future<void> executeCommentpost(int postId, String content) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      final result = await commentPostUseCase(postId, content);
      // TODO: Handle result
    } catch(e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
