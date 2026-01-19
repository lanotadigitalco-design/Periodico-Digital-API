import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveCreatedByFromLiveStreams1768437000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('live_streams');
    if (table) {
      const createdByColumn = table.findColumnByName('created_by');
      const createdByIdColumn = table.findColumnByName('createdById');
      
      if (createdByColumn) {
        await queryRunner.dropColumn('live_streams', 'created_by');
      }
      if (createdByIdColumn) {
        await queryRunner.dropColumn('live_streams', 'createdById');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'live_streams',
      new TableColumn({
        name: 'createdById',
        type: 'integer',
        isNullable: false,
      }),
    );
  }
}
