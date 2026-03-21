import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Length, Matches, Min } from 'class-validator';
import { WorkwearSize } from '../enums/size.enum';
import { WorkwearSeason } from '../enums/season.enum';
import { WorkwearItemSet } from '../enums/set.enum';
import { Transform, Type } from 'class-transformer';

export class UpdateWorkwearDto {
  @IsOptional()
  @IsString({ message: 'Название должно быть строкой' })
  @Length(1, 200, { message: 'Название должно содержать от 1 до 200 символов' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @Transform(({ value }) => Array.isArray(value) ? value : [value])
  @IsOptional()
  @IsArray({ message: 'Размеры должны быть в массиве' })
  @IsEnum(WorkwearSize, { each: true, message: `Размер должен быть одним из: ${Object.values(WorkwearSize).join(', ')}` })
  size?: WorkwearSize[];

  @IsOptional()
  @IsString({ message: 'Цвет должен быть строкой' })
  @Length(1, 100, { message: 'Цвет должен содержать от 1 до 100 символов' })
  color?: string;

  @IsOptional()
  @IsEnum(WorkwearSeason, { message: `Сезон должен быть одним из значений: ${Object.values(WorkwearSeason).join(', ')}` })
  season?: WorkwearSeason;

  @IsOptional()
  @IsEnum(WorkwearItemSet, { message: `Комплект должен быть одним из значений: ${Object.values(WorkwearItemSet).join(', ')}` })
  set?: WorkwearItemSet;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Цена должна быть числом' })
  @Min(0.01, { message: 'Цена должна быть больше 0' })
  price?: number;

  @IsOptional()
  @IsString({ message: 'Артикул должен быть строкой' })
  @Length(1, 50, { message: 'Артикул должен содержать от 1 до 50 символов' })
  @Matches(/^[A-Za-z0-9-_]+$/, { message: 'Артикул может содержать только буквы, цифры, дефисы и подчеркивания' })
  sku?: string;

  @IsOptional()
  @IsBoolean({ message: 'Статус сертификации должен быть логическим значением' })
  isCertified?: boolean;

  @IsOptional()
  @IsString({ message: 'Материал должен быть строкой' })
  @Length(1, 100, { message: 'Материал должен содержать от 1 до 100 символов' })
  material?: string;
}