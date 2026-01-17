import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1766403520506 implements MigrationInterface {
    name = 'InitialMigration1766403520506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."roles_nombre_enum" AS ENUM('administrador', 'periodista', 'lector')`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "nombre" "public"."roles_nombre_enum" NOT NULL, "descripcion" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "informacion_usuario" ("id" SERIAL NOT NULL, "ultimaIp" character varying, "ultimoInicioSesion" TIMESTAMP, "navegador" character varying, "sistemaOperativo" character varying, "dispositivo" character varying, "ubicacion" character varying, "intentosFallidosLogin" integer NOT NULL DEFAULT '0', "ultimoIntentoFallido" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "usuario_id" integer, CONSTRAINT "REL_794cb631e6c8433622ab944d59" UNIQUE ("usuario_id"), CONSTRAINT "PK_1e211a21c3e541efc5ee07c0015" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comentarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contenido" text NOT NULL, "visible" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "articulo_id" integer, "usuario_id" integer, "padreId" uuid, CONSTRAINT "PK_b60b1468bb275db8d5e875c4a78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "log_visualizacion_articulos" ("id" SERIAL NOT NULL, "ip" character varying, "navegador" character varying, "sistemaOperativo" character varying, "dispositivo" character varying, "ubicacion" character varying, "referer" character varying, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "articulo_id" integer, CONSTRAINT "PK_15f7ad5689b9476a42afe1a2d35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "articulos" ("id" SERIAL NOT NULL, "titulo" character varying(500) NOT NULL, "contenido" text NOT NULL, "categoria" character varying(255) NOT NULL, "imagenes" text, "publicado" boolean NOT NULL DEFAULT true, "contadorVisualizaciones" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c0b7bae1b9e1d86fa63a0c924b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "nombre" character varying(255) NOT NULL, "apellido" character varying(255), "activo" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "rol_id" integer, CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "log_visualizacion_sitio" ("id" SERIAL NOT NULL, "ip" character varying, "navegador" character varying, "sistemaOperativo" character varying, "dispositivo" character varying, "ubicacion" character varying, "url" character varying, "referer" character varying, "metodo" character varying, "statusCode" integer, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6546522de829c20f08b11b9cb92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "articulo_autores" ("articulo_id" integer NOT NULL, "usuario_id" integer NOT NULL, CONSTRAINT "PK_a7d4977e6d11bf933edda9257f4" PRIMARY KEY ("articulo_id", "usuario_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_71ffbc11f92143deaae9109f60" ON "articulo_autores" ("articulo_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_57b321525ee707a685bcd1cbc3" ON "articulo_autores" ("usuario_id") `);
        await queryRunner.query(`CREATE TABLE "comentarios_closure" ("id_ancestor" uuid NOT NULL, "id_descendant" uuid NOT NULL, CONSTRAINT "PK_fb05cc448e5183cee1caa2332ce" PRIMARY KEY ("id_ancestor", "id_descendant"))`);
        await queryRunner.query(`CREATE INDEX "IDX_58ff91b420e518739760aaad16" ON "comentarios_closure" ("id_ancestor") `);
        await queryRunner.query(`CREATE INDEX "IDX_8f343b00e8a34975d827eab007" ON "comentarios_closure" ("id_descendant") `);
        await queryRunner.query(`ALTER TABLE "informacion_usuario" ADD CONSTRAINT "FK_794cb631e6c8433622ab944d59b" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios" ADD CONSTRAINT "FK_78f7816e9d6b23dbe27e82e99e6" FOREIGN KEY ("articulo_id") REFERENCES "articulos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios" ADD CONSTRAINT "FK_1281c1e3cb210b0b3d6d09ab2e7" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios" ADD CONSTRAINT "FK_a7ea658f2982a68f79aac5bee4c" FOREIGN KEY ("padreId") REFERENCES "comentarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "log_visualizacion_articulos" ADD CONSTRAINT "FK_d250b8c83f94c22fdcde4977a74" FOREIGN KEY ("articulo_id") REFERENCES "articulos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_9e519760a660751f4fa21453d3e" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "articulo_autores" ADD CONSTRAINT "FK_71ffbc11f92143deaae9109f608" FOREIGN KEY ("articulo_id") REFERENCES "articulos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "articulo_autores" ADD CONSTRAINT "FK_57b321525ee707a685bcd1cbc34" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios_closure" ADD CONSTRAINT "FK_58ff91b420e518739760aaad163" FOREIGN KEY ("id_ancestor") REFERENCES "comentarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comentarios_closure" ADD CONSTRAINT "FK_8f343b00e8a34975d827eab0074" FOREIGN KEY ("id_descendant") REFERENCES "comentarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comentarios_closure" DROP CONSTRAINT "FK_8f343b00e8a34975d827eab0074"`);
        await queryRunner.query(`ALTER TABLE "comentarios_closure" DROP CONSTRAINT "FK_58ff91b420e518739760aaad163"`);
        await queryRunner.query(`ALTER TABLE "articulo_autores" DROP CONSTRAINT "FK_57b321525ee707a685bcd1cbc34"`);
        await queryRunner.query(`ALTER TABLE "articulo_autores" DROP CONSTRAINT "FK_71ffbc11f92143deaae9109f608"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_9e519760a660751f4fa21453d3e"`);
        await queryRunner.query(`ALTER TABLE "log_visualizacion_articulos" DROP CONSTRAINT "FK_d250b8c83f94c22fdcde4977a74"`);
        await queryRunner.query(`ALTER TABLE "comentarios" DROP CONSTRAINT "FK_a7ea658f2982a68f79aac5bee4c"`);
        await queryRunner.query(`ALTER TABLE "comentarios" DROP CONSTRAINT "FK_1281c1e3cb210b0b3d6d09ab2e7"`);
        await queryRunner.query(`ALTER TABLE "comentarios" DROP CONSTRAINT "FK_78f7816e9d6b23dbe27e82e99e6"`);
        await queryRunner.query(`ALTER TABLE "informacion_usuario" DROP CONSTRAINT "FK_794cb631e6c8433622ab944d59b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f343b00e8a34975d827eab007"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_58ff91b420e518739760aaad16"`);
        await queryRunner.query(`DROP TABLE "comentarios_closure"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_57b321525ee707a685bcd1cbc3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71ffbc11f92143deaae9109f60"`);
        await queryRunner.query(`DROP TABLE "articulo_autores"`);
        await queryRunner.query(`DROP TABLE "log_visualizacion_sitio"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "articulos"`);
        await queryRunner.query(`DROP TABLE "log_visualizacion_articulos"`);
        await queryRunner.query(`DROP TABLE "comentarios"`);
        await queryRunner.query(`DROP TABLE "informacion_usuario"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."roles_nombre_enum"`);
    }

}
