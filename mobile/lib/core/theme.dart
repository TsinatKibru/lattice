import 'package:flutter/material.dart';

class SapphireTheme {
  static const Color background = Color(0xFF020617); // Deepest Midnight
  static const Color surface = Color(0xFF0F172A);
  static const Color accentIndigo = Color(0xFF38BDF8); // Cyan/Sky blue for glow
  static const Color accentPurple = Color(0xFFC084FC); // Soft Purple
  static const Color neonBlue = Color(0xFF60A5FA);
  static const Color neonPurple = Color(0xFFD946EF);
  static const Color textMain = Colors.white;
  static const Color textDim = Color(0xFF94A3B8);

  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.dark(
        primary: accentIndigo,
        secondary: accentPurple,
        surface: surface,
        onSurface: textMain,
      ),
      cardTheme: CardThemeData(
        color: surface.withOpacity(0.8),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: Colors.white.withOpacity(0.1), width: 1),
        ),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          color: textMain,
          fontWeight: FontWeight.bold,
          letterSpacing: -0.5,
        ),
        bodyLarge: TextStyle(color: textMain, height: 1.5),
        bodyMedium: TextStyle(color: textDim),
      ),
    );
  }
}
