import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('interaction_events')
export class InteractionEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    user_id: string;

    @Column({ type: 'uuid' })
    content_id: string;

    @Column({ type: 'varchar', length: 50 })
    type: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn()
    created_at: Date;
}
