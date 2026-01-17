import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveCreatedByFromLiveStreams1768437000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('live_streams', 'createdById');
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
