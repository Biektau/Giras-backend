import { WorkwearSize } from '../enums/size.enum';
import { WorkwearSeason } from '../enums/season.enum';
import { WorkwearItemSet } from '../enums/set.enum';

export class UpdateWorkwearDto {
  name?: string;
  description?: string;
  size?: WorkwearSize[];
  color?: string;
  season?: WorkwearSeason;
  set?: WorkwearItemSet;
  price?: number;
  sku?: string;
  isCertified?: boolean;
  material?: string;
}