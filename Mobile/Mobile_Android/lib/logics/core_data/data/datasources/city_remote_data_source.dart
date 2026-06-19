import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/city_model.dart';

abstract class CityRemoteDataSource {
  Future<List<CityModel>> fetchCities();
}

class CityRemoteDataSourceImpl implements CityRemoteDataSource {
  final Dio dio;

  CityRemoteDataSourceImpl(this.dio);

  @override
  Future<List<CityModel>> fetchCities() async {
    try {
      final response = await dio.get('${ApiConfig.baseUrl}/cities');
      if (response.statusCode == 200) {
        final data = response.data;
        List<dynamic> listData = [];
        
        if (data is List) {
          listData = data;
        } else if (data is Map && data.containsKey('data')) {
          listData = data['data'] as List<dynamic>;
        }

        return listData.map((json) => CityModel.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load cities');
      }
    } catch (e) {
      throw Exception('Lỗi khi lấy danh sách thành phố: $e');
    }
  }
}
