import 'package:flutter/material.dart';
import '../../domain/entities/city.dart';
import '../../domain/usecases/get_cities_usecase.dart';

class CityProvider extends ChangeNotifier {
  final GetCitiesUseCase getCitiesUseCase;

  List<City> _cities = [];
  bool _isLoading = false;
  String? _errorMessage;

  CityProvider({required this.getCitiesUseCase});

  List<City> get cities => _cities;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchCities() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _cities = await getCitiesUseCase();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
