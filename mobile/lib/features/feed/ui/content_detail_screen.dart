import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lattice_mobile/features/feed/models/content_model.dart';
import 'package:lattice_mobile/features/interactions/interaction_service.dart';
import 'package:lattice_mobile/core/theme.dart';
import 'package:lattice_mobile/features/feed/ui/feed_screen.dart'; // For StarryBackgroundPainter
import 'dart:ui';

class ContentDetailScreen extends ConsumerWidget {
  final Content content;

  const ContentDetailScreen({super.key, required this.content});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Track ContentViewed event on entry
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(interactionServiceProvider).trackInteraction(
            contentId: content.id,
            type: 'viewed',
          );
    });

    return Scaffold(
      backgroundColor: SapphireTheme.background,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Text(content.category.toUpperCase(), 
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 2)),
        backgroundColor: SapphireTheme.background.withOpacity(0.5),
        elevation: 0,
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(color: Colors.transparent),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_border_rounded, color: SapphireTheme.textDim),
            onPressed: () {
              ref.read(interactionServiceProvider).trackInteraction(
                    contentId: content.id,
                    type: 'saved',
                  );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: SapphireTheme.surface,
                  content: const Text('Saved to Sapphire vault', style: TextStyle(color: Colors.white)),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: StarryBackgroundPainter()),
          ),
          Positioned.fill(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 120, 24, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Row(
                    children: [
                      _DifficultyBadge(difficulty: content.difficulty),
                      const SizedBox(width: 12),
                      Icon(Icons.timer_outlined, size: 14, color: SapphireTheme.textDim.withOpacity(0.6)),
                      const SizedBox(width: 4),
                      Text(
                        '${content.expectedReadTimeSec ~/ 60}m read',
                        style: TextStyle(color: SapphireTheme.textDim.withOpacity(0.6), fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Tags
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: content.tags.map((tag) => _TagChip(label: tag)).toList(),
                  ),
                  const SizedBox(height: 32),

                  // Content Body
                  MarkdownBody(
                    data: content.body,
                    selectable: true,
                    styleSheet: MarkdownStyleSheet(
                      p: const TextStyle(color: SapphireTheme.textMain, height: 1.7, fontSize: 16),
                      h1: const TextStyle(
                        color: SapphireTheme.textMain, 
                        fontWeight: FontWeight.bold, 
                        fontSize: 28, 
                        letterSpacing: -0.5
                      ),
                      h2: const TextStyle(
                        color: SapphireTheme.textMain, 
                        fontWeight: FontWeight.bold, 
                        fontSize: 22
                      ),
                      h3: const TextStyle(
                        color: SapphireTheme.accentIndigo, 
                        fontWeight: FontWeight.bold, 
                        fontSize: 18
                      ),
                      code: const TextStyle(
                        backgroundColor: Colors.transparent,
                        color: SapphireTheme.accentIndigo,
                        fontFamily: 'monospace',
                        fontSize: 14,
                      ),
                      codeblockDecoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: SapphireTheme.accentIndigo.withOpacity(0.2)),
                      ),
                      blockquoteDecoration: BoxDecoration(
                        color: SapphireTheme.accentIndigo.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(8),
                        border: const Border(left: BorderSide(color: SapphireTheme.accentIndigo, width: 4)),
                      ),
                      horizontalRuleDecoration: BoxDecoration(
                        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1), width: 1)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 60),

                  // Glassmorphic Interaction Footer
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: SapphireTheme.surface.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white.withOpacity(0.05)),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Refine Your Lattice Filter',
                          style: TextStyle(
                            color: SapphireTheme.textMain,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Was this information clear and relevant?',
                          style: TextStyle(color: SapphireTheme.textDim, fontSize: 13),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Expanded(
                              child: _DetailActionButton(
                                icon: Icons.thumb_up_rounded,
                                label: 'Helpful',
                                color: SapphireTheme.accentIndigo,
                                onPressed: () => ref.read(interactionServiceProvider).trackInteraction(
                                  contentId: content.id,
                                  type: 'helpful',
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _DetailActionButton(
                                icon: Icons.psychology_rounded,
                                label: 'Challenging',
                                color: SapphireTheme.accentPurple,
                                onPressed: () => ref.read(interactionServiceProvider).trackInteraction(
                                  contentId: content.id,
                                  type: 'challenging',
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DifficultyBadge extends StatelessWidget {
  final ContentDifficulty difficulty;
  const _DifficultyBadge({required this.difficulty});

  @override
  Widget build(BuildContext context) {
    final color = _getColor();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        difficulty.name.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w900),
      ),
    );
  }

  Color _getColor() {
    switch (difficulty) {
      case ContentDifficulty.beginner: return const Color(0xFF10B981); // Emerald
      case ContentDifficulty.intermediate: return const Color(0xFFF59E0B); // Amber
      case ContentDifficulty.advanced: return Colors.orangeAccent;
    }
  }
}

class _TagChip extends StatelessWidget {
  final String label;
  const _TagChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Text(
        '#$label',
        style: const TextStyle(color: SapphireTheme.textDim, fontSize: 11, fontWeight: FontWeight.w500),
      ),
    );
  }
}

class _DetailActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onPressed;

  const _DetailActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton.icon(
      onPressed: () {
        onPressed();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: SapphireTheme.surface,
            content: Text('$label tracked!', style: const TextStyle(color: Colors.white)),
            duration: const Duration(seconds: 1),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      },
      icon: Icon(icon, size: 18),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: color.withOpacity(0.1),
        foregroundColor: color,
        elevation: 0,
        side: BorderSide(color: color.withOpacity(0.4)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }
}
