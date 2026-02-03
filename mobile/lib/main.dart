import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lattice_mobile/features/feed/ui/feed_screen.dart';
import 'package:lattice_mobile/core/theme.dart';

import 'package:lattice_mobile/features/feed/providers/interest_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();

  runApp(
    ProviderScope(
      overrides: [
        sharedPrefsProvider.overrideWithValue(prefs),
      ],
      child: const LatticeApp(),
    ),
  );
}

class LatticeApp extends StatelessWidget {
  const LatticeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lattice',
      debugShowCheckedModeBanner: false,
      theme: SapphireTheme.dark,
      home: const FeedScreen(),
    );
  }
}
