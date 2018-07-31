import { Pipe, PipeTransform } from '@angular/core';
import { DestinationDataService } from '../location-data.service';

@Pipe({name: 'fullPlaceName'})
export class FullPlaceNamePipe implements PipeTransform {
  constructor(private destService:DestinationDataService){}
  transform(value: string): string {
    if (value && this.destService.DestinationById(value)){
      return this.destService.DestinationById(value).fullName;
    }
    return value
  }
}