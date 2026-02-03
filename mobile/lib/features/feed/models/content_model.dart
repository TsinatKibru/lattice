enum ContentDifficulty {
  beginner,
  intermediate,
  advanced;

  static ContentDifficulty fromString(String value) {
    return ContentDifficulty.values.firstWhere(
      (e) => e.name == value.toLowerCase(),
      orElse: () => ContentDifficulty.beginner,
    );
  }
}

class Content {
  final String id;
  final String category;
  final List<String> subcategories;
  final List<String> tags;
  final ContentDifficulty difficulty;
  final String type;
  final String body;
  final int expectedReadTimeSec;
  final Map<String, dynamic>? aiMetadata;
  final double? score;

  Content({
    required this.id,
    required this.category,
    required this.subcategories,
    required this.tags,
    required this.difficulty,
    required this.type,
    required this.body,
    required this.expectedReadTimeSec,
    this.aiMetadata,
    this.score,
  });

  factory Content.fromJson(Map<String, dynamic> json) {
    return Content(
      id: json['id'] ?? '',
      category: json['category'] ?? '',
      subcategories: List<String>.from(json['subcategories'] ?? []),
      tags: List<String>.from(json['tags'] ?? []),
      difficulty: ContentDifficulty.fromString(json['difficulty'] ?? ''),
      type: json['type'] ?? '',
      body: json['body'] ?? '',
      expectedReadTimeSec: json['expectedReadTimeSec'] ?? 0,
      aiMetadata: json['aiMetadata'],
      score: (json['score'] as num?)?.toDouble(),
    );
  }
}
