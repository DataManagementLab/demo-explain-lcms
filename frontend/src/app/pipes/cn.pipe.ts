import { Pipe, PipeTransform } from '@angular/core';
import { ClassValue } from 'clsx';
import cn from '../utils/cn';

@Pipe({
  name: 'cn',
  standalone: true,
})
export class CnPipe implements PipeTransform {
  transform(...inputs: ClassValue[]): string {
    return cn(inputs);
  }
}
