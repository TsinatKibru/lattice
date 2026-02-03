import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { ContentAggregates } from './entities/content-aggregates.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Content, ContentAggregates])],
    exports: [TypeOrmModule],
})
export class ContentModule { }
