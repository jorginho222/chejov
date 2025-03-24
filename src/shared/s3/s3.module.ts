import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  exports: [S3Service],
  providers: [S3Service],
})
export class S3Module {}
