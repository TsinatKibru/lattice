import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('user_interests')
export class UserInterest {
    @PrimaryColumn('varchar', { length: 255 })
    user_id: string;

    @PrimaryColumn('varchar', { length: 100 })
    subcategory: string;

    @Column({ type: 'float', default: 0.0 })
    weight: number;

    @UpdateDateColumn()
    last_updated: Date;
}
