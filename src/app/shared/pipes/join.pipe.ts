import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'join'
})
export class joinPipe implements PipeTransform {
    transform(array:any[], del: string, prop?: 'string') {
        if (array.length === 0){
            return array;
        }
        if (prop) {
            let props = [];
            for (let elm of array) {
                props.push(elm[prop])
            }
            return props.join(del);
        } else {
            return array.join(del);
        }
    }
}
