import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ContentStatus {
  ACTIVE = 'active',
  STALE = 'stale',
  ARCHIVED = 'archived',
}

export enum ContentType {
  CONCEPT = 'concept',
  EXAMPLE = 'example',
  PROJECT = 'project',
  NEWS = 'news',
  FUN_FACT = 'fun-fact',
}

export enum ContentDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface AiMetadata {
  prompt_version: string;
  model_version: string;
  timestamp: string;
}

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category: string;

  @Column('simple-array')
  subcategories: string[];

  @Column('simple-array')
  tags: string[];

  @Column({
    type: 'enum',
    enum: ContentDifficulty,
  })
  difficulty: ContentDifficulty;

  @Column({
    type: 'enum',
    enum: ContentType,
  })
  type: ContentType;

  @Column('text')
  body: string;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.ACTIVE,
  })
  status: ContentStatus;

  @Column('int')
  expectedReadTimeSec: number;

  @Column('jsonb')
  aiMetadata: AiMetadata;

  @Column({ nullable: true })
  sourceUrl?: string;

  @Column({ nullable: true })
  ttl?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
