import 'api_config.dart';

class ImageHelper {
  static String getFullUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    
    String cleanPath = path;
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    
    String domain = ApiConfig.baseUrl.split('/api')[0];
    return '$domain/$cleanPath';
  }
}
