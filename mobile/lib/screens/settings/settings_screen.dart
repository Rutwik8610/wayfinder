import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/app_config.dart';
import '../../core/storage/storage_service.dart';
import '../../providers/auth_provider.dart';
import '../../providers/settings_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final TextEditingController _urlCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadCustomUrl();
  }

  Future<void> _loadCustomUrl() async {
    final customUrl = await StorageService.instance.getCustomBaseUrl();
    _urlCtrl.text = customUrl ?? AppConfig.apiBaseUrl;
  }

  @override
  void dispose() {
    _urlCtrl.dispose();
    super.dispose();
  }

  Future<void> _showEditServerDialog() async {
    return showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Backend Server URL'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Enter the backend URL (e.g., http://10.0.2.2:8080 for Android emulator, or http://192.168.1.X:8080 for a physical device on Wi-Fi).',
                style: TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _urlCtrl,
                decoration: const InputDecoration(
                  labelText: 'Server Base URL',
                  hintText: 'http://10.0.2.2:8080',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                _urlCtrl.text = AppConfig.apiBaseUrl;
              },
              child: const Text('Reset Default'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () async {
                await StorageService.instance.saveCustomBaseUrl(_urlCtrl.text.trim());
                if (!context.mounted) return;
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Server URL updated! Restart app or reload.')),
                );
                setState(() {});
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = context.watch<AuthProvider>();
    final settingsProvider = context.watch<SettingsProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          // User Profile Header
          if (authProvider.isAuthenticated && authProvider.session != null) ...[
            ListTile(
              leading: CircleAvatar(
                radius: 24,
                backgroundColor: theme.colorScheme.primaryContainer,
                child: Text(
                  authProvider.session!.email.isNotEmpty
                      ? authProvider.session!.email[0].toUpperCase()
                      : 'U',
                  style: TextStyle(fontSize: 20, color: theme.colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold),
                ),
              ),
              title: Text(
                authProvider.session!.email,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                authProvider.session!.name.isNotEmpty
                    ? authProvider.session!.name
                    : 'Member',
              ),
              trailing: IconButton(
                icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
                tooltip: 'Logout',
                onPressed: () async {
                  await authProvider.logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              ),
            ),
            const Divider(),
          ] else ...[
            ListTile(
              leading: const CircleAvatar(child: Icon(Icons.person_outline)),
              title: const Text('Not signed in'),
              subtitle: const Text('Sign in to access your planned trips and account'),
              trailing: FilledButton(
                onPressed: () => context.go('/login'),
                child: const Text('Sign In'),
              ),
            ),
            const Divider(),
          ],

          // Preferences section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'Appearance & Language',
              style: theme.textTheme.labelLarge?.copyWith(color: theme.colorScheme.primary),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.dark_mode_outlined),
            title: const Text('Theme Mode'),
            subtitle: Text(_themeModeName(settingsProvider.themeMode)),
            trailing: DropdownButton<ThemeMode>(
              value: settingsProvider.themeMode,
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(value: ThemeMode.system, child: Text('System')),
                DropdownMenuItem(value: ThemeMode.light, child: Text('Light')),
                DropdownMenuItem(value: ThemeMode.dark, child: Text('Dark')),
              ],
              onChanged: (mode) {
                if (mode != null) settingsProvider.setThemeMode(mode);
              },
            ),
          ),
          ListTile(
            leading: const Icon(Icons.language_rounded),
            title: const Text('Language'),
            subtitle: Text(settingsProvider.locale.languageCode == 'hi' ? 'हिंदी (Hindi)' : 'English'),
            trailing: DropdownButton<String>(
              value: settingsProvider.locale.languageCode,
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(value: 'en', child: Text('English')),
                DropdownMenuItem(value: 'hi', child: Text('हिंदी (Hindi)')),
              ],
              onChanged: (lang) {
                if (lang != null) settingsProvider.setLocale(Locale(lang));
              },
            ),
          ),

          const Divider(),

          // Server settings
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'Server Configuration',
              style: theme.textTheme.labelLarge?.copyWith(color: theme.colorScheme.primary),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.cloud_outlined),
            title: const Text('Backend API URL'),
            subtitle: Text(_urlCtrl.text.isEmpty ? AppConfig.apiBaseUrl : _urlCtrl.text),
            trailing: const Icon(Icons.edit_outlined),
            onTap: _showEditServerDialog,
          ),

          const Divider(),

          // About section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'About WayFinder',
              style: theme.textTheme.labelLarge?.copyWith(color: theme.colorScheme.primary),
            ),
          ),
          const ListTile(
            leading: Icon(Icons.info_outline_rounded),
            title: Text('Version'),
            subtitle: Text('1.0.0 (Release Build)'),
          ),
          const ListTile(
            leading: Icon(Icons.security_rounded),
            title: Text('Database'),
            subtitle: Text('Neon Serverless PostgreSQL (Cloud)'),
          ),
          const ListTile(
            leading: Icon(Icons.code_rounded),
            title: Text('Architecture'),
            subtitle: Text('Spring Boot 3 + Flutter Native Android'),
          ),
        ],
      ),
    );
  }

  String _themeModeName(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.system:
        return 'System default';
      case ThemeMode.light:
        return 'Light theme';
      case ThemeMode.dark:
        return 'Dark theme';
    }
  }
}
