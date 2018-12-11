import { Injectable } from "@angular/core";
import { StoreSelectorService } from '@shared/services/store-selector.service';
import { randomBetween } from "@app/shared/global-functions";

export var colors = [
    "#e57373",
    '#f06292',
    '#ba68c8',
    '#9575cd',
    '#7986cb',
    '#64b5f6',
    '#4fc3f7',
    '#4dd0e1',
    '#4db6ac',
    '#81c784',
    '#aed581',
    '#dce775',
    '#fff176',
    '#ffd54f',
    '#ffb74d',
    '#ff8a65',
    '#90a4ae',
    "#ff5252",
    "#ff4081",
    "#7c4dff",
    "#536dfe",
    "#448aff",
    "#40c4ff",
    "#18ffff",
    "#64ffda",
    "#69f0ae",
    "#b2ff59",
    "#eeff41",
    "#ffff00",
    "#ffd740",
    "#ffab40",
    "#ff6e40"
]

@Injectable()
export class ColorGeneratorService {
    constructor(private storeSelector: StoreSelectorService) { }
    getUnused = (): string => {
        let profiles = this.storeSelector.profiles
        let usedColors = profiles.map(profile=>profile.avatar.color)
        let filteredColors = colors.filter(c=>{
            return usedColors.indexOf(c) == -1
        });
        if (filteredColors.length > 0) {
            let rand = randomBetween(0, filteredColors.length - 1)
            return filteredColors[rand]
        } else {
            let rand = randomBetween(0, colors.length - 1)
            return colors[rand]
        }
    }

}