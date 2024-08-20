import { PickType } from '@nestjs/swagger';
import { Column as ColumnModel } from '@prisma/client';
import { Column } from './columns.swagger';

export class CreateColumnDto
  extends PickType(Column, ['name'])
  implements Pick<ColumnModel, 'name'> {}

export class UpdateColumnDto extends CreateColumnDto {}
