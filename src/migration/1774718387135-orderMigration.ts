import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderMigration1774718387135 implements MigrationInterface {
  name = 'OrderMigration1774718387135';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" DROP CONSTRAINT "FK_55310042d6010fe8de9035cae7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" DROP CONSTRAINT "FK_b864ce1b25ccd32cec430cdcdc3"`,
    );
    await queryRunner.query(
      `CREATE TABLE "airline" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "code" character varying NOT NULL, "luggageRules" json NOT NULL, "flightClassPriceIncrements" json NOT NULL, "redeemFee" integer NOT NULL, CONSTRAINT "PK_9a0dd52135c26e0201205412623" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "documentNumber" character varying NOT NULL, "name" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "accumulatedMiles" integer NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" character varying NOT NULL, "status" character varying NOT NULL, "luggage" json NOT NULL, "class" character varying NOT NULL, "passengersQuantity" integer NOT NULL, "exchangedMiles" integer NOT NULL, "flightsTotal" integer NOT NULL, "luggageTotal" integer NOT NULL, "redeemFee" integer NOT NULL, "grandTotal" integer NOT NULL, "userId" uuid, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "flight_order" ("flight_id" uuid NOT NULL, "order_id" uuid NOT NULL, CONSTRAINT "PK_859de927ecda8a6fe1254cc5aff" PRIMARY KEY ("flight_id", "order_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bc8d918d68fe3c3f46a97bfbe7" ON "flight_order" ("flight_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eed69ef61a3fc04b66be22fd3e" ON "flight_order" ("order_id") `,
    );
    await queryRunner.query(`ALTER TABLE "flight" DROP COLUMN "flightPrices"`);
    await queryRunner.query(
      `ALTER TABLE "flight" ADD "distance" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight" ADD "basePrice" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "flight" ADD "airlineId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight" ADD CONSTRAINT "FK_9178ec2896690b7cd4d69c4bc12" FOREIGN KEY ("airlineId") REFERENCES "airline"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" ADD CONSTRAINT "FK_b864ce1b25ccd32cec430cdcdc3" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" ADD CONSTRAINT "FK_55310042d6010fe8de9035cae7a" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_order" ADD CONSTRAINT "FK_bc8d918d68fe3c3f46a97bfbe7e" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_order" ADD CONSTRAINT "FK_eed69ef61a3fc04b66be22fd3e2" FOREIGN KEY ("order_id") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flight_order" DROP CONSTRAINT "FK_eed69ef61a3fc04b66be22fd3e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_order" DROP CONSTRAINT "FK_bc8d918d68fe3c3f46a97bfbe7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" DROP CONSTRAINT "FK_55310042d6010fe8de9035cae7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" DROP CONSTRAINT "FK_b864ce1b25ccd32cec430cdcdc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight" DROP CONSTRAINT "FK_9178ec2896690b7cd4d69c4bc12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`,
    );
    await queryRunner.query(`ALTER TABLE "flight" DROP COLUMN "airlineId"`);
    await queryRunner.query(`ALTER TABLE "flight" DROP COLUMN "basePrice"`);
    await queryRunner.query(`ALTER TABLE "flight" DROP COLUMN "distance"`);
    await queryRunner.query(
      `ALTER TABLE "flight" ADD "flightPrices" json NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eed69ef61a3fc04b66be22fd3e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bc8d918d68fe3c3f46a97bfbe7"`,
    );
    await queryRunner.query(`DROP TABLE "flight_order"`);
    await queryRunner.query(`DROP TABLE "order"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "airline"`);
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" ADD CONSTRAINT "FK_b864ce1b25ccd32cec430cdcdc3" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "flight_passengers" ADD CONSTRAINT "FK_55310042d6010fe8de9035cae7a" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
