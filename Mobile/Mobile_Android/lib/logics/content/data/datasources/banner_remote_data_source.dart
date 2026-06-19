import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/banner_model.dart';

abstract class BannerRemoteDataSource {
  Future<List<BannerModel>> fetchBanners();
}

class BannerRemoteDataSourceImpl implements BannerRemoteDataSource {
  final Dio dio;
  BannerRemoteDataSourceImpl(this.dio);

  @override
  Future<List<BannerModel>> fetchBanners() async {
    try {
      final response = await dio.get('${ApiConfig.baseUrl}/hospital-admin/banners/active');
      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> listData = [];
        if (data is List) {
          listData = data;
        } else if (data is Map && data.containsKey('data')) {
          listData = data['data'] as List<dynamic>;
        }
        return listData.map((e) => BannerModel.fromJson(e)).toList();
      }
      return [];
    } catch (e) {
      throw Exception('Lỗi fetchBanners: $e');
    }
  }
}
