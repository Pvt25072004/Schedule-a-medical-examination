import 'package:clinic_booking_system/firebase_options.dart';
import 'package:clinic_booking_system/routes/app_routes.dart';
import 'package:clinic_booking_system/service/auth_service.dart';
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/services.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:clinic_booking_system/logics/auth/data/datasources/auth_remote_data_source.dart';
import 'package:clinic_booking_system/logics/auth/data/repositories/auth_repo_impl.dart';
import 'package:clinic_booking_system/logics/auth/domain/usecases/auth_usecases.dart';
import 'package:clinic_booking_system/logics/auth/domain/usecases/login_usecase.dart';
import 'package:clinic_booking_system/logics/auth/domain/usecases/register_usecase.dart';
import 'package:clinic_booking_system/logics/auth/presentation/providers/auth_provider.dart';
import 'package:clinic_booking_system/logics/core_data/data/datasources/city_remote_data_source.dart';
import 'package:clinic_booking_system/logics/core_data/data/repositories/city_repo_impl.dart';
import 'package:clinic_booking_system/logics/core_data/domain/usecases/get_cities_usecase.dart';
import 'package:clinic_booking_system/logics/core_data/presentation/providers/city_provider.dart';
import 'package:clinic_booking_system/core/tokens/app_theme.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  print("Handling a background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('vi', null);
  
  try {
    await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    print('⚠️ Firebase Core Init warning: $e');
  }

  // TODO: Refactor AuthService to UseCases in future phases (Remove old init)
  // await AuthService.init();

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  // Dependency Injection for Auth
  final authRemoteDataSource = AuthRemoteDataSource();
  final authRepo = AuthRepoImpl(authRemoteDataSource);
  
  // Dependency Injection for Core Data
  final dio = Dio();
  final cityRemoteDataSource = CityRemoteDataSourceImpl(dio);
  final cityRepo = CityRepoImpl(cityRemoteDataSource);

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider(
          loginUseCase: LoginUseCase(authRepo),
          registerUseCase: RegisterUseCase(authRepo),
          logoutUseCase: LogoutUseCase(authRepo),
          getCurrentUserUseCase: GetCurrentUserUseCase(authRepo),
        )),
        ChangeNotifierProvider(create: (_) => CityProvider(
          getCitiesUseCase: GetCitiesUseCase(cityRepo),
        )),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    _setupFCM();
  }

  Future<void> _setupFCM() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    await messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    RemoteMessage? initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationClick(initialMessage);
    }
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      _handleNotificationClick(message);
    });
  }

  void _handleNotificationClick(RemoteMessage message) {
    print('FCM Clicked: ${message.data}');
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'STL Clinic Booking',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      navigatorKey: navigatorKey,
      initialRoute: AppRoutes.welcome,
      onGenerateRoute: AppRoutes.generateRoute,
    );
  }
}