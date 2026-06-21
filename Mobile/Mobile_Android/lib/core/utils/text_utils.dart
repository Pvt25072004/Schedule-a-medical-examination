class TextUtils {
  static String stripHtml(String text) {
    return text.replaceAll(RegExp(r'<[^>]*>|&[^;]+;'), ' ').replaceAll(RegExp(r'\s{2,}'), ' ').trim();
  }
}
