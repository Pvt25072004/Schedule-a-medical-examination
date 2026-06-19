class City {
  final String? id;
  final String name;
  final String area;
  final int hospitalCount;

  City({
    this.id,
    required this.name,
    required this.area,
    this.hospitalCount = 0,
  });
}
