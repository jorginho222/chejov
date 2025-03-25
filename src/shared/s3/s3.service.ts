import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private readonly region: string | undefined;
  private readonly bucketName: string | undefined;
  private logger: Logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_S3_REGION');
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, key: string) {
    const uploadInput: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: this.bucketName,
      Key: key,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      const response: PutObjectCommandOutput = await this.s3.send(
        new PutObjectCommand(uploadInput),
      );

      if (response.$metadata.httpStatusCode === 200) {
        return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      }

      throw new Error('Error uploading file');
    } catch (e) {
      this.logger.error('Error uploading file to s3: ', e);
      throw e;
    }
  }

  async deleteFile(key: string) {
    const deleteInput: DeleteObjectCommandInput = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await this.s3.send(new DeleteObjectCommand(deleteInput));
    } catch (e) {
      this.logger.error('Error deleting file from s3: ', e);
      throw e;
    }
  }
}
