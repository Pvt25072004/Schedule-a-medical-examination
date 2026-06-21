import 'package:dio/dio.dart';
import '../../../../core/utils/api_config.dart';
import '../models/news_model.dart';

abstract class NewsRemoteDataSource {
  Future<List<NewsModel>> fetchNews({int page = 1, int limit = 10});
}

class NewsRemoteDataSourceImpl implements NewsRemoteDataSource {
  final Dio dio;
  NewsRemoteDataSourceImpl(this.dio);

  @override
  Future<List<NewsModel>> fetchNews({int page = 1, int limit = 10}) async {
    try {
      final response = await dio.get('${ApiConfig.baseUrl}/news?page=$page&limit=$limit');
      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> listData = [];
        if (data is List) {
          listData = data;
        } else if (data is Map && data.containsKey('data')) {
          listData = data['data'] as List<dynamic>;
        }
        return listData.map((e) => NewsModel.fromJson(e)).toList();
      } else {
        throw Exception('Failed to load news');
      }
    } catch (e) {
      throw Exception('Lỗi gọi API News: $e');
    }
  }
}

