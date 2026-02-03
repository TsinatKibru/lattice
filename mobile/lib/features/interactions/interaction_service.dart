import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lattice_mobile/core/constants.dart';
import 'package:lattice_mobile/core/dio_provider.dart';

enum InteractionType { HELPFUL, RELEVANT, CHALLENGING, DISMISS, VIEW }

final interactionServiceProvider = Provider<InteractionService>((ref) {
  return InteractionService(ref.watch(dioProvider));
});

class InteractionService {
  final Dio _dio;

  InteractionService(this._dio);

  Future<void> trackInteraction({
    required String contentId,
    required String type,
    double value = 1.0,
  }) async {
    try {
      await _dio.post(
        AppConstants.interactionsEndpoint,
        data: {
          'userId': 'demo_user_1', // Hardcoded for demo/MVP
          'contentId': contentId,
          'type': type,
          'value': value,
          'timestamp': DateTime.now().toIso8601String(),
        },
      );
    } catch (e) {
      // Background tracking silently fails or logs for retry
      print('Interaction tracking failed: $e');
    }
  }
}
