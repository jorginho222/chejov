import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1774469999194 implements MigrationInterface {
  name = 'InitialSchema1774469999194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "airplane" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brand" character varying NOT NULL, "model" character varying NOT NULL, "passengersCapacity" integer NOT NULL, "seatsConfig" json NOT NULL, "imageUrl" character varying NOT NULL DEFAULT '', CONSTRAINT "PK_ed933274baeda55658b17b13b78" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "passenger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "documentNumber" character varying NOT NULL, "name" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_50e940dd2c126adc20205e83fac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "flight" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" json NOT NULL, "origin" character varying NOT NULL, "destination" character varying NOT NULL, "departure" TIMESTAMP NOT NULL, "arrival" TIMESTAMP NOT NULL, "status" character varying NOT NULL, "seats" json NOT NULL, "flightPrices" json NOT NULL, "isFullyReserved" boolean NOT NULL DEFAULT false, "airplaneId" uuid, CONSTRAINT "PK_bf571ce6731cf071fc51b94df03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "flight_passengers" ("passenger_id" uuid NOT NULL, "flight_id" uuid NOT NULL, CONSTRAINT "PK_4a19f7f57db1354b53c1bba7800" PRIMARY KEY ("passenger_id", "flight_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55310042d6010fe8de9035cae7" ON "flight_passengers" ("passenger_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b864ce1b25ccd32cec430cdcdc" ON "flight_passengers" ("flight_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "flight" ADD CONSTRAINT "FK_4536914081408ed9a36062b6833" FOREIGN KEY ("airplaneId") REFERENCES "airplane"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" ADD CONSTRAINT "FK_55310042d6010fe8de9035cae7a" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" ADD CONSTRAINT "FK_b864ce1b25ccd32cec430cdcdc3" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" DROP CONSTRAINT "FK_b864ce1b25ccd32cec430cdcdc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" DROP CONSTRAINT "FK_55310042d6010fe8de9035cae7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight" DROP CONSTRAINT "FK_4536914081408ed9a36062b6833"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b864ce1b25ccd32cec430cdcdc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55310042d6010fe8de9035cae7"`,
    );
    await queryRunner.query(`DROP TABLE "flight_passengers"`);
    await queryRunner.query(`DROP TABLE "flight"`);
    await queryRunner.query(`DROP TABLE "passenger"`);
    await queryRunner.query(`DROP TABLE "airplane"`);
  }
}
