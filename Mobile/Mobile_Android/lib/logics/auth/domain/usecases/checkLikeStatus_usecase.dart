import '../entities/social.dart';
import '../repositories/social_repository.dart';

class ChecklikestatusUseCase {
  final SocialRepository repository;
  ChecklikestatusUseCase(this.repository);

  Future<bool> call(int postId) async {
    return await repository.checkLikeStatus(postId);
  }
}
