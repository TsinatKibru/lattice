import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lattice_mobile/features/feed/models/content_model.dart';
import 'package:lattice_mobile/features/feed/providers/feed_repository.dart';
import 'package:lattice_mobile/features/feed/providers/interest_provider.dart';
import 'package:lattice_mobile/features/feed/ui/content_detail_screen.dart';
import 'package:lattice_mobile/features/interactions/interaction_service.dart';
import 'package:lattice_mobile/core/theme.dart';
import 'dart:ui';
import 'dart:math' as math;

final feedItemsProvider = FutureProvider<List<Content>>((ref) async {
  final repository = ref.watch(feedRepositoryProvider);
  final interests = ref.watch(interestProvider);
  return repository.getFeed(
    interests: interests.categories,
    targetDifficulty: interests.targetDifficulty,
  );
});

class StarryBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white;
    final random = math.Random(42);
    for (int i = 0; i < 150; i++) {
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height;
      final radius = random.nextDouble() * 0.8;
      final opacity = random.nextDouble() * 0.3 + 0.1;
      paint.color = Colors.white.withOpacity(opacity);
      canvas.drawCircle(Offset(x, y), radius, paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class FeedScreen extends ConsumerWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final feedAsync = ref.watch(feedItemsProvider);

    return Scaffold(
      backgroundColor: SapphireTheme.background,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.auto_awesome_rounded, color: SapphireTheme.accentIndigo, size: 20),
            const SizedBox(width: 8),
            const Text(
              'Lattice',
              style: TextStyle(
                color: SapphireTheme.textMain,
                fontWeight: FontWeight.w800,
                fontSize: 22,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
        centerTitle: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.search_rounded, color: SapphireTheme.textMain),
            onPressed: () {},
          ),
          CircleAvatar(
            radius: 16,
            backgroundColor: SapphireTheme.surface,
            child: const Icon(Icons.person_outline_rounded, size: 18, color: SapphireTheme.textDim),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(painter: StarryBackgroundPainter()),
          ),
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0, -0.5),
                  radius: 1.2,
                  colors: [
                    SapphireTheme.neonBlue.withOpacity(0.05),
                    SapphireTheme.background,
                  ],
                ),
              ),
            ),
          ),
          feedAsync.when(
            data: (items) => ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 130, 20, 100),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return ContentCard(content: item);
              },
            ),
            loading: () => const Center(
              child: CircularProgressIndicator(color: SapphireTheme.accentIndigo),
            ),
            error: (err, stack) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off_rounded, size: 64, color: SapphireTheme.accentPurple),
                  const SizedBox(height: 16),
                  Text('Connectivity Issue', style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => ref.refresh(feedItemsProvider),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: SapphireTheme.accentIndigo,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _BottomNavBar(),
    );
  }
}

class ContentCard extends ConsumerWidget {
  final Content content;
  const ContentCard({super.key, required this.content});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final interactionService = ref.watch(interactionServiceProvider);

    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: SapphireTheme.accentIndigo.withOpacity(0.15),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(28),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
            child: Container(
              decoration: BoxDecoration(
                color: SapphireTheme.surface.withOpacity(0.4),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                  color: Colors.white.withOpacity(0.12),
                  width: 1.2,
                ),
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => ContentDetailScreen(content: content),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Image/Glow area
                      Container(
                        height: 140,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              SapphireTheme.accentIndigo.withOpacity(0.2),
                              SapphireTheme.accentPurple.withOpacity(0.05),
                            ],
                          ),
                        ),
                        child: Stack(
                          children: [
                            Positioned(
                              right: -20,
                              top: -20,
                              child: Icon(
                                content.category.contains('ai') ? Icons.psychology_rounded : Icons.code_rounded,
                                size: 150,
                                color: Colors.white.withOpacity(0.05),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _Badge(
                                    label: content.difficulty.name,
                                    color: SapphireTheme.accentIndigo,
                                  ),
                                  const Spacer(),
                                  Text(
                                    content.body.split('\n').first.replaceAll('#', '').trim(),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      height: 1.2,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.timer_outlined, size: 14, color: SapphireTheme.textDim),
                                const SizedBox(width: 4),
                                Text(
                                  '${content.expectedReadTimeSec ~/ 60} Min read',
                                  style: const TextStyle(color: SapphireTheme.textDim, fontSize: 12),
                                ),
                                const SizedBox(width: 12),
                                const Icon(Icons.category_outlined, size: 14, color: SapphireTheme.textDim),
                                const SizedBox(width: 4),
                                Text(
                                  content.category,
                                  style: const TextStyle(color: SapphireTheme.textDim, fontSize: 12),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Understand the core principles and underlying mechanisms in this hand-crafted guide.',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(color: SapphireTheme.textDim.withOpacity(0.8), fontSize: 14, height: 1.4),
                            ),
                            const SizedBox(height: 24),
                            Row(
                              children: [
                                Expanded(
                                  child: _NeonButton(
                                    icon: Icons.thumb_up_rounded,
                                    label: 'Helpful',
                                    color: SapphireTheme.accentIndigo,
                                    onPressed: () => interactionService.trackInteraction(
                                      contentId: content.id,
                                      type: 'helpful',
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _NeonButton(
                                    icon: Icons.psychology_rounded,
                                    label: 'Challenging',
                                    color: SapphireTheme.accentPurple,
                                    onPressed: () => interactionService.trackInteraction(
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
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
      ),
    );
  }
}

class _NeonButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onPressed;

  const _NeonButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 10,
            spreadRadius: -2,
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon, size: 18),
        label: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        style: ElevatedButton.styleFrom(
          backgroundColor: SapphireTheme.surface.withOpacity(0.5),
          foregroundColor: color,
          elevation: 0,
          side: BorderSide(color: color.withOpacity(0.3), width: 1),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}

class _BottomNavBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 100,
      decoration: BoxDecoration(
        color: SapphireTheme.background.withOpacity(0.8),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 25),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavIcon(icon: Icons.home_filled, label: 'Home', isActive: true),
                _NavIcon(icon: Icons.explore_outlined, label: 'Browse'),
                _NavIcon(icon: Icons.auto_awesome_rounded, label: 'Progress'),
                _NavIcon(icon: Icons.person_outline_rounded, label: 'Profile'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavIcon extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  const _NavIcon({required this.icon, required this.label, this.isActive = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          icon,
          color: isActive ? SapphireTheme.accentIndigo : SapphireTheme.textDim,
          size: 26,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: isActive ? SapphireTheme.accentIndigo : SapphireTheme.textDim,
            fontSize: 10,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
