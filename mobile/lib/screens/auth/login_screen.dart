import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final _loginFormKey = GlobalKey<FormState>();
  final _registerFormKey = GlobalKey<FormState>();

  final _loginEmailController = TextEditingController();
  final _loginPasswordController = TextEditingController();

  final _registerNameController = TextEditingController();
  final _registerEmailController = TextEditingController();
  final _registerPasswordController = TextEditingController();

  bool _obscureLoginPassword = true;
  bool _obscureRegisterPassword = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _registerNameController.dispose();
    _registerEmailController.dispose();
    _registerPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_loginFormKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final success = await auth.login(
      _loginEmailController.text.trim(),
      _loginPasswordController.text,
    );
    if (success && mounted) {
      context.go('/home');
    } else if (mounted && auth.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage!),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  Future<void> _handleRegister() async {
    if (!_registerFormKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final success = await auth.register(
      _registerNameController.text.trim(),
      _registerEmailController.text.trim(),
      _registerPasswordController.text,
    );
    if (success && mounted) {
      context.go('/home');
    } else if (mounted && auth.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(auth.errorMessage!),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Brand Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(
                          Icons.explore,
                          color: theme.colorScheme.primary,
                          size: 28,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'WayFinder',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    context.tr('auth.heroEyebrow'),
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Tab Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              color: theme.colorScheme.surface,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: TabBar(
                              controller: _tabController,
                              indicatorSize: TabBarIndicatorSize.tab,
                              indicator: BoxDecoration(
                                color: theme.colorScheme.primary,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              labelColor: theme.colorScheme.onPrimary,
                              unselectedLabelColor: theme.textTheme.bodyMedium?.color,
                              tabs: [
                                Tab(text: context.tr('auth.tabLogin')),
                                Tab(text: context.tr('auth.tabRegister')),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          SizedBox(
                            height: 320,
                            child: TabBarView(
                              controller: _tabController,
                              children: [
                                // Login Tab
                                Form(
                                  key: _loginFormKey,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      TextFormField(
                                        controller: _loginEmailController,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: InputDecoration(
                                          labelText: context.tr('auth.email'),
                                          prefixIcon: const Icon(Icons.email_outlined),
                                        ),
                                        validator: (v) =>
                                            (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
                                      ),
                                      const SizedBox(height: 16),
                                      TextFormField(
                                        controller: _loginPasswordController,
                                        obscureText: _obscureLoginPassword,
                                        decoration: InputDecoration(
                                          labelText: context.tr('auth.password'),
                                          prefixIcon: const Icon(Icons.lock_outline),
                                          suffixIcon: IconButton(
                                            icon: Icon(
                                              _obscureLoginPassword
                                                  ? Icons.visibility_off
                                                  : Icons.visibility,
                                            ),
                                            onPressed: () => setState(() {
                                              _obscureLoginPassword = !_obscureLoginPassword;
                                            }),
                                          ),
                                        ),
                                        validator: (v) =>
                                            (v == null || v.length < 6) ? 'Password must be ≥ 6 chars' : null,
                                      ),
                                      const Spacer(),
                                      ElevatedButton(
                                        onPressed: auth.isLoading ? null : _handleLogin,
                                        child: auth.isLoading
                                            ? const SizedBox(
                                                height: 20,
                                                width: 20,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  color: Colors.white,
                                                ),
                                              )
                                            : Text(context.tr('auth.loginAction')),
                                      ),
                                    ],
                                  ),
                                ),

                                // Register Tab
                                Form(
                                  key: _registerFormKey,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.stretch,
                                    children: [
                                      TextFormField(
                                        controller: _registerNameController,
                                        decoration: InputDecoration(
                                          labelText: context.tr('auth.name'),
                                          prefixIcon: const Icon(Icons.person_outline),
                                        ),
                                        validator: (v) =>
                                            (v == null || v.trim().isEmpty) ? 'Name is required' : null,
                                      ),
                                      const SizedBox(height: 12),
                                      TextFormField(
                                        controller: _registerEmailController,
                                        keyboardType: TextInputType.emailAddress,
                                        decoration: InputDecoration(
                                          labelText: context.tr('auth.email'),
                                          prefixIcon: const Icon(Icons.email_outlined),
                                        ),
                                        validator: (v) =>
                                            (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
                                      ),
                                      const SizedBox(height: 12),
                                      TextFormField(
                                        controller: _registerPasswordController,
                                        obscureText: _obscureRegisterPassword,
                                        decoration: InputDecoration(
                                          labelText: context.tr('auth.password'),
                                          prefixIcon: const Icon(Icons.lock_outline),
                                          suffixIcon: IconButton(
                                            icon: Icon(
                                              _obscureRegisterPassword
                                                  ? Icons.visibility_off
                                                  : Icons.visibility,
                                            ),
                                            onPressed: () => setState(() {
                                              _obscureRegisterPassword = !_obscureRegisterPassword;
                                            }),
                                          ),
                                        ),
                                        validator: (v) =>
                                            (v == null || v.length < 6) ? 'Password must be ≥ 6 chars' : null,
                                      ),
                                      const Spacer(),
                                      ElevatedButton(
                                        onPressed: auth.isLoading ? null : _handleRegister,
                                        child: auth.isLoading
                                            ? const SizedBox(
                                                height: 20,
                                                width: 20,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  color: Colors.white,
                                                ),
                                              )
                                            : Text(context.tr('auth.registerAction')),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
