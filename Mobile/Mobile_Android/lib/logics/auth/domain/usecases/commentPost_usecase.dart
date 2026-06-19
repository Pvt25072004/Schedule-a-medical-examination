import '../entities/social.dart';
import '../repositories/social_repository.dart';

class CommentpostUseCase {
  final SocialRepository repository;
  CommentpostUseCase(this.repository);

  Future<bool> call(int postId, String content) async {
    return await repository.commentPost(postId, content);
  }
}
