import 'package:flutter/material.dart';
import '../models/auth_session.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService authService;

  AuthSession? _session;
  bool _isLoading = true;
  String? _errorMessage;

  AuthProvider([AuthService? service]) : authService = service ?? AuthService();

  AuthSession? get session => _session;
  bool get isLoggedIn => _session != null && !_session!.isExpired;
  bool get isAuthenticated => isLoggedIn;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> checkSession() async => checkAutoLogin();

  Future<void> checkAutoLogin() async {
    _isLoading = true;
    notifyListeners();
    try {
      _session = await authService.getCurrentUser();
    } catch (_) {
      _session = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _session = await authService.login(email: email, password: password);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();
    try {
      _session = await authService.register(
        name: name,
        email: email,
        password: password,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await authService.logout();
    _session = null;
    notifyListeners();
  }
}
