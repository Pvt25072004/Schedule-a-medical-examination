import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../domain/usecases/getUserData_usecase.dart';
import '../domain/usecases/updateUserData_usecase.dart';

class UserProvider extends ChangeNotifier {
  final GetUserDataUseCase getUserDataUseCase;
  final UpdateUserDataUseCase updateUserDataUseCase;

  Map<String, dynamic>? _userData;
  bool _isLoading = false;
  String? _errorMessage;

  Map<String, dynamic>? get userData => _userData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  UserProvider({
    required this.getUserDataUseCase,
    required this.updateUserDataUseCase,
  });

  Future<void> fetchUserData(String uid) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final backendUser = await getUserDataUseCase(uid);
      
      final bool isBackendWelcome = backendUser['is_welcome'] ?? false;
      final prefs = await SharedPreferences.getInstance();
      final bool isLocalOnboardingNeeded = prefs.getBool('onboarding_needed_$uid') ?? true;
      final bool isOnboardingNeeded = isBackendWelcome ? false : isLocalOnboardingNeeded;

      Map<String, dynamic> addressMap = {};
      final rawAddress = backendUser['address'];
      if (rawAddress != null && rawAddress.toString().startsWith('{')) {
        try {
          addressMap = Map<String, dynamic>.from(jsonDecode(rawAddress));
        } catch (_) {}
      } else if (rawAddress != null) {
        addressMap = {'province': '', 'district': '', 'street': rawAddress};
      }

      _userData = {
        'role': backendUser['role'] == 'doctor' ? 'Bác sĩ' : (backendUser['role'] == 'patient' ? 'Bệnh nhân' : 'UNASSIGNED'),
        'is_onboarding_needed': isOnboardingNeeded,
        'displayName': backendUser['full_name'] ?? '',
        'dateOfBirth': backendUser['date_of_birth'],
        'address': addressMap,
        'photoUrl': backendUser['avatar_url'] ?? '',
        'phone': backendUser['phone'] ?? '',
        'email': backendUser['email'] ?? '',
        'gender': backendUser['gender'] == 'male' ? 'Nam' : (backendUser['gender'] == 'female' ? 'Nữ' : 'Khác'),
        'medicalHistory': '',
        'notification_settings': backendUser['notification_settings'],
      };
    } catch (e) {
      _errorMessage = e.toString();
      _userData = {
        'role': 'UNASSIGNED',
        'is_onboarding_needed': true,
      };
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updateProfile(String uid, Map<String, dynamic> updates) async {
    _isLoading = true;
    notifyListeners();

    try {
      final Map<String, dynamic> backendPayload = {};

      if (updates.containsKey('displayName')) {
        backendPayload['full_name'] = updates['displayName'];
      }
      if (updates.containsKey('dateOfBirth')) {
        backendPayload['date_of_birth'] = updates['dateOfBirth'];
      }
      if (updates.containsKey('role')) {
        final feRole = updates['role'].toString().toUpperCase();
        if (feRole.contains('BỆNH NHÂN') || feRole.contains('PATIENT')) {
          backendPayload['role'] = 'patient';
        } else if (feRole.contains('BÁC SĨ') || feRole.contains('DOCTOR')) {
          backendPayload['role'] = 'doctor';
        } else {
          backendPayload['role'] = 'patient';
        }
      }
      if (updates.containsKey('address')) {
        final addressData = updates['address'];
        if (addressData is Map) {
          backendPayload['address'] = jsonEncode(addressData);
        } else {
          backendPayload['address'] = addressData.toString();
        }
      }
      if (updates.containsKey('email')) {
        backendPayload['email'] = updates['email'];
      }
      if (updates.containsKey('phone')) {
        backendPayload['phone'] = updates['phone'];
      }
      if (updates.containsKey('gender')) {
        final genderStr = updates['gender'].toString().toLowerCase();
        if (genderStr == 'nam' || genderStr == 'male') {
          backendPayload['gender'] = 'male';
        } else if (genderStr == 'nữ' || genderStr == 'female') {
          backendPayload['gender'] = 'female';
        } else {
          backendPayload['gender'] = 'other';
        }
      }
      if (updates.containsKey('is_onboarding_needed')) {
        backendPayload['is_welcome'] = updates['is_onboarding_needed'] == false;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('onboarding_needed_$uid', updates['is_onboarding_needed'] == true);
      }

      final success = await updateUserDataUseCase(uid, backendPayload);
      if (success) {
        await fetchUserData(uid); // Refresh data
        return true;
      }
      return false;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
