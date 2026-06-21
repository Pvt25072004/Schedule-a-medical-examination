import 'package:clinic_booking_system/firebase_options.dart';
import 'package:clinic_booking_system/core/routes/app_routes.dart';
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
import 'package:clinic_booking_system/logics/auth/providers/auth_provider.dart';
import 'package:clinic_booking_system/logics/core_data/data/datasources/city_remote_data_source.dart';
import 'package:clinic_booking_system/logics/core_data/data/repositories/city_repo_impl.dart';
import 'package:clinic_booking_system/logics/core_data/domain/usecases/get_cities_usecase.dart';
import 'package:clinic_booking_system/logics/core_data/providers/city_provider.dart';
import 'package:clinic_booking_system/core/tokens/app_theme.dart';
import 'package:provider/provider.dart';
import 'package:clinic_booking_system/core/network/dio_client.dart';
// User DI imports
import 'package:clinic_booking_system/logics/user/data/datasources/user_remote_data_source.dart';
import 'package:clinic_booking_system/logics/user/data/repositories/user_repo_impl.dart';
import 'package:clinic_booking_system/logics/user/domain/usecases/getUserData_usecase.dart';
import 'package:clinic_booking_system/logics/user/domain/usecases/updateUserData_usecase.dart';
import 'package:clinic_booking_system/logics/user/providers/user_provider.dart';
// Appointment DI imports
import 'package:clinic_booking_system/logics/appointment/data/datasources/appointment_remote_data_source.dart';
import 'package:clinic_booking_system/logics/appointment/data/repositories/appointment_repo_impl.dart';
import 'package:clinic_booking_system/logics/appointment/domain/usecases/getOrCreateUserId_usecase.dart';
import 'package:clinic_booking_system/logics/appointment/domain/usecases/updateAppointmentStatus_usecase.dart';
import 'package:clinic_booking_system/logics/appointment/domain/usecases/requestRefund_usecase.dart';
import 'package:clinic_booking_system/logics/appointment/domain/usecases/rescheduleAppointment_usecase.dart';
import 'package:clinic_booking_system/logics/appointment/domain/usecases/fetchUserAppointments_usecase.dart';
import 'package:clinic_booking_system/logics/appointment/providers/appointment_provider.dart';

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



  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  // Dependency Injection for Auth
  final authRemoteDataSource = AuthRemoteDataSource();
  final authRepo = AuthRepoImpl(authRemoteDataSource);
  
  // Dependency Injection for Core Data
  final dio = DioClient().dio;
  final cityRemoteDataSource = CityRemoteDataSourceImpl(dio);
  final cityRepo = CityRepoImpl(cityRemoteDataSource);

  // Dependency Injection for User Profile
  final userRemoteDataSource = UserRemoteDataSourceImpl(dio);
  final userRepo = UserRepoImpl(userRemoteDataSource);

  // Dependency Injection for Appointments
  final appointmentRemoteDataSource = AppointmentRemoteDataSourceImpl(dio);
  final appointmentRepo = AppointmentRepoImpl(appointmentRemoteDataSource);

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
        ChangeNotifierProvider(create: (_) => UserProvider(
          getUserDataUseCase: GetUserDataUseCase(userRepo),
          updateUserDataUseCase: UpdateUserDataUseCase(userRepo),
        )),
        ChangeNotifierProvider(create: (_) => AppointmentProvider(
          getOrCreateUserIdUseCase: GetorcreateuseridUseCase(appointmentRepo),
          updateAppointmentStatusUseCase: UpdateappointmentstatusUseCase(appointmentRepo),
          requestRefundUseCase: RequestrefundUseCase(appointmentRepo),
          rescheduleAppointmentUseCase: RescheduleappointmentUseCase(appointmentRepo),
          fetchUserAppointmentsUseCase: FetchUserAppointmentsUseCase(appointmentRepo),
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
      routes: AppRoutes.routes,
    );
  }
}