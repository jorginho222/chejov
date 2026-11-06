import { MigrationInterface, QueryRunner } from 'typeorm';

export class FlightCodeUnique1794000000000 implements MigrationInterface {
  name = 'FlightCodeUnique1794000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Flights created before this change all have correlative 1, so an
    // airline with more than one flight makes this fail and the migration
    // rolls back. Remove those flights first.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_flight_code" ON "flight" (("code" ->> 'prefix'), (("code" ->> 'correlative')::int))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_flight_code"`);
  }
}
