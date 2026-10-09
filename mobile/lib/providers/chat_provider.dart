import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../services/assistant_service.dart';

class ChatProvider extends ChangeNotifier {
  final AssistantService assistantService;

  final List<ChatMessage> _messages = [
    ChatMessage(
      role: 'assistant',
      content: 'Hello! I am Wayfinder AI, your travel concierge powered by Gemini. Where would you like to travel next?',
    ),
  ];
  bool _isLoading = false;
  String? _error;

  ChatProvider([AssistantService? service])
      : assistantService = service ?? AssistantService();

  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void clearMessages() => clearChat();

  Future<void> sendMessage(String text, {String language = 'en', String? currentSpot}) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _isLoading) return;

    _messages.add(ChatMessage(role: 'user', content: trimmed));
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final reply = await assistantService.sendChat(
        message: trimmed,
        history: _messages.sublist(0, _messages.length - 1),
        currentSpot: currentSpot,
        language: language,
      );
      _messages.add(reply);
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _messages.add(
        ChatMessage(
          role: 'assistant',
          content: 'Sorry, I could not process your query right now. Please try again.',
        ),
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearChat() {
    _messages.clear();
    _messages.add(
      ChatMessage(
        role: 'assistant',
        content: 'Hello! I am Wayfinder AI, your travel concierge. Where would you like to travel next?',
      ),
    );
    notifyListeners();
  }
}
