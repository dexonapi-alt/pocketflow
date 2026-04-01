import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ParseDecimalPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new BadRequestException(`"${value}" is not a valid number`);
    }
    return parsed;
  }
}
