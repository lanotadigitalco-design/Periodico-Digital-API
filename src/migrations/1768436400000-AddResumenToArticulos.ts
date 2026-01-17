import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddResumenToArticulos1768436400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'articulos',
      new TableColumn({
        name: 'resumen',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('articulos', 'resumen');
  }
}
