import { MigrationInterface, QueryRunner } from 'typeorm';

export class AirlineCodeUnique1793907523731 implements MigrationInterface {
  name = 'AirlineCodeUnique1793907523731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The API now stores codes trimmed and uppercase, so match existing rows.
    // If two airlines end up with the same code, the constraint below fails
    // and the migration rolls back, so fix the duplicates by hand first.
    await queryRunner.query(
      `UPDATE "airline" SET "code" = upper(trim("code")) WHERE "code" <> upper(trim("code"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "airline" ADD CONSTRAINT "UQ_c7d301a4fa39c05abc095447310" UNIQUE ("code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "airline" DROP CONSTRAINT "UQ_c7d301a4fa39c05abc095447310"`,
    );
  }
}
