import '../../domain/entities/social.dart';
import '../../domain/repositories/social_repository.dart';
import '../datasources/social_remote_data_source.dart';

class SocialRepoImpl implements SocialRepository {
  final SocialRemoteDataSource remoteDataSource;
  SocialRepoImpl(this.remoteDataSource);

  @override
  Future<bool> likePost(int postId) async {
    return await remoteDataSource.likePost(postId);
  }
  @override
  Future<bool> checkLikeStatus(int postId) async {
    return await remoteDataSource.checkLikeStatus(postId);
  }
  @override
  Future<bool> commentPost(int postId, String content) async {
    return await remoteDataSource.commentPost(postId, content);
  }
}
