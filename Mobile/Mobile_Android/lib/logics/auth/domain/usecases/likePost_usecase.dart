import '../entities/social.dart';
import '../repositories/social_repository.dart';

class LikepostUseCase {
  final SocialRepository repository;
  LikepostUseCase(this.repository);

  Future<bool> call(int postId) async {
    return await repository.likePost(postId);
  }
}
