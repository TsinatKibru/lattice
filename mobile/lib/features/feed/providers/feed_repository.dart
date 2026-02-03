import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lattice_mobile/core/constants.dart';
import 'package:lattice_mobile/core/dio_provider.dart';
import 'package:lattice_mobile/features/feed/models/content_model.dart';
import 'package:lattice_mobile/features/feed/providers/interest_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

final feedRepositoryProvider = Provider<FeedRepository>((ref) {
  return FeedRepository(
    ref.watch(dioProvider),
    ref.watch(sharedPrefsProvider),
  );
});

class FeedRepository {
  final Dio _dio;
  final SharedPreferences _prefs;
  static const String _feedCacheKey = 'feed_cache_json';

  FeedRepository(this._dio, this._prefs);

  Future<List<Content>> getFeed({
    required List<String> interests,
    required double targetDifficulty,
  }) async {
    try {
      final response = await _dio.get(
        AppConstants.feedEndpoint,
        queryParameters: {
          'interests': interests.join(','),
          'targetDifficulty': targetDifficulty,
        },
      );

      final List data = response.data as List;
      // Cache the raw JSON string for offline fallback
      _prefs.setString(_feedCacheKey, jsonEncode(data));
      
      return data.map((json) => Content.fromJson(json)).toList();
    } catch (e) {
      // Offline fallback: load from SharedPreferences
      final cachedJson = _prefs.getString(_feedCacheKey);
      if (cachedJson != null) {
        final List decoded = jsonDecode(cachedJson);
        return decoded.map((json) => Content.fromJson(json)).toList();
      }
      throw Exception('Failed to fetch feed and no offline cache available: $e');
    }
  }

  Future<void> triggerAIGeneration({
    required String category,
    required String difficulty,
    int count = 1,
  }) async {
    try {
      await _dio.post(
        AppConstants.generateEndpoint,
        data: {
          'category': category,
          'difficulty': difficulty,
          'count': count,
        },
      );
    } catch (e) {
      throw Exception('Failed to trigger AI generation: $e');
    }
  }
}
