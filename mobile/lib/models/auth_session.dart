class AuthSession {
  final String id;
  final String name;
  final String email;
  final String accessToken;
  final int expiresAt;

  AuthSession({
    required this.id,
    required this.name,
    required this.email,
    required this.accessToken,
    required this.expiresAt,
  });

  bool get isExpired => DateTime.now().millisecondsSinceEpoch >= expiresAt;

  factory AuthSession.fromAuthResponse(Map<String, dynamic> json) {
    final userData = (json['user'] as Map<String, dynamic>?) ?? json;
    final token = (json['token'] as String?) ??
        (json['accessToken'] as String?) ??
        (json['session']?['token'] as String?) ??
        '';
    final expiresIn = (json['expiresIn'] as num?)?.toInt() ?? (7 * 24 * 3600);
    return AuthSession(
      id: (userData['id']?.toString()) ?? '1',
      name: userData['name'] as String? ?? '',
      email: userData['email'] as String? ?? '',
      accessToken: token,
      expiresAt: DateTime.now().millisecondsSinceEpoch + (expiresIn * 1000),
    );
  }

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      id: (json['id']?.toString()) ?? '1',
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      accessToken: json['accessToken'] as String? ?? '',
      expiresAt: (json['expiresAt'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'email': email,
        'accessToken': accessToken,
        'expiresAt': expiresAt,
      };
}
