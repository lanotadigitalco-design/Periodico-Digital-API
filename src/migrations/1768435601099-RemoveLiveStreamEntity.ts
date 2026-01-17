import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLiveStreamTable1768435601099 implements MigrationInterface {
    name = 'CreateLiveStreamTable1768435601099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE IF NOT EXISTS "live_streams" (
                "id" SERIAL NOT NULL, 
                "url" text NOT NULL, 
                "titulo" character varying(255) NOT NULL, 
                "descripcion" text, 
                "activo" boolean NOT NULL DEFAULT false, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "created_by" integer, 
                CONSTRAINT "PK_live_streams_id" PRIMARY KEY ("id")
            )`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "live_streams"`);
    }
}

