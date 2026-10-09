import 'package:dio/dio.dart';
import '../models/chat_message.dart';
import 'api_service.dart';

class AssistantService {
  final ApiService apiService;

  AssistantService([ApiService? api]) : apiService = api ?? ApiService.instance;

  Future<ChatMessage> sendChat({
    required String message,
    required List<ChatMessage> history,
    String? currentSpot,
    String language = 'en',
  }) async {
    try {
      final historyPayload = history
          .map((m) => {
                'role': m.role,
                'content': m.content,
              })
          .toList();

      final response = await apiService.dio.post(
        '/api/assistant/chat',
        data: {
          'message': message,
          'history': historyPayload,
          'currentSpot': currentSpot,
          'language': language == 'hi' ? 'hi' : 'en',
        },
      );

      final reply = response.data['reply'] as String? ?? 'No response generated.';
      final isGrounded = response.data['grounded'] as bool? ?? false;

      return ChatMessage(
        role: 'assistant',
        content: reply,
        isGrounded: isGrounded,
      );
    } on DioException catch (e) {
      final error = e.response?.data?['detail'] ??
          e.response?.data?['error'] ??
          'Could not reach AI travel assistant.';
      throw Exception(error);
    }
  }
}
