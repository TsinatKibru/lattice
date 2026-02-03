import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('content_aggregates')
export class ContentAggregates {
    @PrimaryColumn('uuid')
    content_id: string;

    @Column({ type: 'int', default: 0 })
    helpful_count: number;

    @Column({ type: 'int', default: 0 })
    challenging_count: number;

    @Column({ type: 'int', default: 0 })
    view_count: number;

    @Column({ type: 'int', default: 0 })
    save_count: number;

    @Column({ type: 'timestamp', nullable: true })
    last_interaction_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
