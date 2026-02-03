import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserInterests {
  final List<String> categories;
  final double targetDifficulty;

  UserInterests({
    required this.categories,
    required this.targetDifficulty,
  });

  UserInterests copyWith({
    List<String>? categories,
    double? targetDifficulty,
  }) {
    return UserInterests(
      categories: categories ?? this.categories,
      targetDifficulty: targetDifficulty ?? this.targetDifficulty,
    );
  }
}

class InterestNotifier extends StateNotifier<UserInterests> {
  final SharedPreferences _prefs;
  static const String _categoriesKey = 'user_categories';
  static const String _difficultyKey = 'user_difficulty';

  InterestNotifier(this._prefs)
      : super(UserInterests(
          categories: _prefs.getStringList(_categoriesKey) ?? ['software_engineering'],
          targetDifficulty: _prefs.getDouble(_difficultyKey) ?? 0.5,
        ));

  void toggleCategory(String category) {
    final categories = List<String>.from(state.categories);
    if (categories.contains(category)) {
      if (categories.length > 1) categories.remove(category);
    } else {
      categories.add(category);
    }
    state = state.copyWith(categories: categories);
    _prefs.setStringList(_categoriesKey, state.categories);
  }

  void setDifficulty(double difficulty) {
    state = state.copyWith(targetDifficulty: difficulty);
    _prefs.setDouble(_difficultyKey, state.targetDifficulty);
  }
}

final sharedPrefsProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError(); // Should be overridden in main.dart
});

final interestProvider = StateNotifierProvider<InterestNotifier, UserInterests>((ref) {
  final prefs = ref.watch(sharedPrefsProvider);
  return InterestNotifier(prefs);
});
