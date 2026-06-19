import '../entities/social.dart';

abstract class SocialRepository {
  Future<bool> likePost(int postId);
  Future<bool> checkLikeStatus(int postId);
  Future<bool> commentPost(int postId, String content);
}
