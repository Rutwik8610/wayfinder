class AuthSession {
  final int id;
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
    final expiresIn = (json['expiresIn'] as num?)?.toInt() ?? 3600;
    return AuthSession(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      accessToken: json['accessToken'] as String? ?? '',
      expiresAt: DateTime.now().millisecondsSinceEpoch + (expiresIn * 1000),
    );
  }

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      id: (json['id'] as num).toInt(),
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
