import 'dart:io';

void main() async {
  // Map of module -> list of features
  final modules = {
    'content': ['banner', 'news'],
    'core_data': ['service_package'], // Wait, plan moved service_package to doctor, let's keep it here for script
    'doctor': ['doctor', 'hospital', 'review', 'category', 'service_package'],
    'appointment': ['appointment', 'schedule', 'payment'],
    'user': ['medical_record'],
    'auth': ['startup', 'social', 'email'],
  };

  final basePath = 'lib/logics';

  for (var entry in modules.entries) {
    final module = entry.key;
    for (var feature in entry.value) {
      final capitalized = _capitalize(feature);
      final entityName = capitalized;
      final modelName = '${capitalized}Model';
      final repoName = '${capitalized}Repository';
      final repoImplName = '${capitalized}RepoImpl';
      final dataSourceName = '${capitalized}RemoteDataSource';
      final providerName = '${capitalized}Provider';

      // Directories
      final entityDir = Directory('$basePath/$module/domain/entities');
      final repoDir = Directory('$basePath/$module/domain/repositories');
      final usecaseDir = Directory('$basePath/$module/domain/usecases');
      final modelDir = Directory('$basePath/$module/data/models');
      final dsDir = Directory('$basePath/$module/data/datasources');
      final repoImplDir = Directory('$basePath/$module/data/repositories');
      final providerDir = Directory('$basePath/$module/providers'); // User said: "cứ để providers không cần presentation/providers"

      await Future.wait([
        entityDir.create(recursive: true),
        repoDir.create(recursive: true),
        usecaseDir.create(recursive: true),
        modelDir.create(recursive: true),
        dsDir.create(recursive: true),
        repoImplDir.create(recursive: true),
        providerDir.create(recursive: true),
      ]);

      // 1. Entity
      final entityFile = File('${entityDir.path}/$feature.dart');
      if (!entityFile.existsSync()) {
        await entityFile.writeAsString('''
class $entityName {
  final String? id;
  $entityName({this.id});
}
''');
      }

      // 2. Repository Interface
      final repoFile = File('${repoDir.path}/${feature}_repository.dart');
      if (!repoFile.existsSync()) {
        await repoFile.writeAsString('''
import '../entities/$feature.dart';

abstract class $repoName {
  // TODO: Add methods
}
''');
      }

      // 3. Model
      final modelFile = File('${modelDir.path}/${feature}_model.dart');
      if (!modelFile.existsSync()) {
        await modelFile.writeAsString('''
import '../../domain/entities/$feature.dart';

class $modelName extends $entityName {
  $modelName({super.id});

  factory $modelName.fromJson(Map<String, dynamic> json) {
    return $modelName(
      id: json['_id'] ?? json['id'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
    };
  }
}
''');
      }

      // 4. DataSource Interface & Impl
      final dsFile = File('${dsDir.path}/${feature}_remote_data_source.dart');
      if (!dsFile.existsSync()) {
        await dsFile.writeAsString('''
import 'package:dio/dio.dart';
import '../../../../utils/api_config.dart';
import '../models/${feature}_model.dart';

abstract class $dataSourceName {
  // TODO: Add methods
}

class ${dataSourceName}Impl implements $dataSourceName {
  final Dio dio;

  ${dataSourceName}Impl(this.dio);
}
''');
      }

      // 5. RepoImpl
      final repoImplFile = File('${repoImplDir.path}/${feature}_repo_impl.dart');
      if (!repoImplFile.existsSync()) {
        await repoImplFile.writeAsString('''
import '../../domain/entities/$feature.dart';
import '../../domain/repositories/${feature}_repository.dart';
import '../datasources/${feature}_remote_data_source.dart';

class $repoImplName implements $repoName {
  final $dataSourceName remoteDataSource;

  $repoImplName(this.remoteDataSource);
}
''');
      }

      // 6. Provider
      final providerFile = File('${providerDir.path}/${feature}_provider.dart');
      if (!providerFile.existsSync()) {
        await providerFile.writeAsString('''
import 'package:flutter/material.dart';
import '../domain/entities/$feature.dart';

class $providerName extends ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // TODO: Add UseCases and methods
}
''');
      }
    }
  }
  print('Done generating Clean Architecture skeletons!');
}

String _capitalize(String text) {
  return text.split('_').map((word) => word.isEmpty ? '' : '\${word[0].toUpperCase()}\${word.substring(1)}').join('');
}
