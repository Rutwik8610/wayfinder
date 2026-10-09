class ChatMessage {
  final String role; // 'user' or 'assistant'
  final String content;
  final DateTime timestamp;
  final bool isGrounded;

  ChatMessage({
    required this.role,
    required this.content,
    DateTime? timestamp,
    this.isGrounded = false,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isUser => role == 'user';

  Map<String, dynamic> toJson() => {
        'role': role,
        'content': content,
      };
}
