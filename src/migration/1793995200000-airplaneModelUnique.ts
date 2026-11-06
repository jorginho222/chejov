import { MigrationInterface, QueryRunner } from 'typeorm';

export class AirplaneModelUnique1793995200000 implements MigrationInterface {
  name = 'AirplaneModelUnique1793995200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The API now stores models trimmed, so match existing rows. If two
    // airplanes share a model, the constraint below fails and the migration
    // rolls back, so remove the duplicates first.
    await queryRunner.query(
      `UPDATE "airplane" SET "model" = trim("model") WHERE "model" <> trim("model")`,
    );
    await queryRunner.query(
      `ALTER TABLE "airplane" ADD CONSTRAINT "UQ_ba88131180005a1b73cb730a84e" UNIQUE ("model")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "airplane" DROP CONSTRAINT "UQ_ba88131180005a1b73cb730a84e"`,
    );
  }
}
