import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUpsertLiveStreamProcedure1768438000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el stored procedure para upsert del live-stream
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION upsert_live_stream(
        p_url TEXT,
        p_titulo VARCHAR(255),
        p_descripcion TEXT,
        p_activo BOOLEAN
      ) RETURNS TABLE (
        id INTEGER,
        url TEXT,
        titulo VARCHAR(255),
        descripcion TEXT,
        activo BOOLEAN,
        "createdAt" TIMESTAMP,
        "updatedAt" TIMESTAMP
      ) AS $$
      BEGIN
        -- Si existe un registro, actualizarlo
        IF EXISTS (SELECT 1 FROM live_streams LIMIT 1) THEN
          UPDATE live_streams
          SET 
            url = p_url,
            titulo = p_titulo,
            descripcion = p_descripcion,
            activo = p_activo,
            "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = 1
          RETURNING live_streams.id, live_streams.url, live_streams.titulo, 
                    live_streams.descripcion, live_streams.activo, 
                    live_streams."createdAt", live_streams."updatedAt";
        ELSE
          -- Si no existe, insertar uno nuevo con ID 1
          INSERT INTO live_streams (id, url, titulo, descripcion, activo, "createdAt", "updatedAt")
          VALUES (1, p_url, p_titulo, p_descripcion, p_activo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING live_streams.id, live_streams.url, live_streams.titulo, 
                    live_streams.descripcion, live_streams.activo, 
                    live_streams."createdAt", live_streams."updatedAt";
        END IF;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Crear una función para obtener el único live-stream
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_active_live_stream()
      RETURNS TABLE (
        id INTEGER,
        url TEXT,
        titulo VARCHAR(255),
        descripcion TEXT,
        activo BOOLEAN,
        "createdAt" TIMESTAMP,
        "updatedAt" TIMESTAMP
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT live_streams.id, live_streams.url, live_streams.titulo, 
               live_streams.descripcion, live_streams.activo, 
               live_streams."createdAt", live_streams."updatedAt"
        FROM live_streams
        WHERE activo = TRUE
        LIMIT 1;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar las funciones
    await queryRunner.query('DROP FUNCTION IF EXISTS upsert_live_stream(TEXT, VARCHAR, TEXT, BOOLEAN) CASCADE;');
    await queryRunner.query('DROP FUNCTION IF EXISTS get_active_live_stream() CASCADE;');
  }
}
