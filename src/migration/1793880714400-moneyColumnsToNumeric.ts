import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoneyColumnsToNumeric1793880714400 implements MigrationInterface {
  name = 'MoneyColumnsToNumeric1793880714400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "airline" ALTER COLUMN "redeemFee" TYPE numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight" ALTER COLUMN "basePrice" TYPE numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "flightsTotal" TYPE numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "luggageTotal" TYPE numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "redeemFee" TYPE numeric(12,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "grandTotal" TYPE numeric(12,2)`,
    );
  }

  // Lossy: reverting rounds every amount to a whole number
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "grandTotal" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "redeemFee" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "luggageTotal" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" ALTER COLUMN "flightsTotal" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight" ALTER COLUMN "basePrice" TYPE integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "airline" ALTER COLUMN "redeemFee" TYPE integer`,
    );
  }
}
