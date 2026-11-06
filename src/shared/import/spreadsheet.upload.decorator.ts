import { applyDecorators, HttpCode, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiPayloadTooLargeResponse,
} from '@nestjs/swagger';

export const MAX_IMPORT_FILE_BYTES = 1024 * 1024;

// Accepts a single .xlsx upload in the "file" multipart field
export function SpreadsheetUpload(): MethodDecorator {
  return applyDecorators(
    HttpCode(201),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file'],
        properties: { file: { type: 'string', format: 'binary' } },
      },
    }),
    ApiBadRequestResponse({
      description: 'The file is missing, unreadable or has invalid rows',
    }),
    ApiPayloadTooLargeResponse({ description: 'The file is over 1 MB' }),
    UseInterceptors(
      FileInterceptor('file', { limits: { fileSize: MAX_IMPORT_FILE_BYTES } }),
    ),
  );
}
