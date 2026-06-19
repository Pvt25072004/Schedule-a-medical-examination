import '../../domain/entities/news.dart';
import '../../domain/repositories/news_repository.dart';
import '../datasources/news_remote_data_source.dart';

class NewsRepoImpl implements NewsRepository {
  final NewsRemoteDataSource remoteDataSource;
  NewsRepoImpl(this.remoteDataSource);

}
