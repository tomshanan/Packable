import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Injectable } from "@angular/core";

interface iconGroup {
    path: string,
    icons: string[]
}

@Injectable()
export class IconService {

    profileIcons:iconGroup = {
        path: 'profile',
        icons: [
            "default",
            "001-man",
            "002-man",
            "003-man",
            "004-man",
            "005-woman",
            "006-man",
            "007-man",
            "008-man",
            "009-man",
            "010-boy",
            "011-girl",
            "012-boy",
            "013-baby",
            "014-man",
            "015-boy",
            "016-girl",
            "017-girl",
            "018-girl",
            "019-girl",
            "020-woman",
            "021-woman",
            "022-woman",
        ]
    }
    appIcons:iconGroup = {
        path: 'app',
        icons: [
            'star',
            'star-border',
            'check',
            'share',
            'together',
            't-shirt-add',
            't-shirt-import',
            't-shirt-copy',
            't-shirt-push',
            't-shirt-remove',
            'collection-add',
            'collection-import',
            'collection-alt',
            'list',
            'list-edit',
            'circle',
            'circle-add',
            'circle-added',
            'circle-delete',
            'circle-remove',
            'users-add',
            'users-push',
            'users-remove',
            'send',
            'plus-minus',
            'place',
            'place-edit',
            'weather-edit',
        ]
    }
    weatherIcons:iconGroup = {
        path: 'weather',
        icons: [
            'hail',
            'rain',
            'snow',
            'windy',
            'sunny',
            'temp-high',
            'temp-low',
            'temp-mid',
            'temp',
            'weather_error',
        ]
    }
    profileTemplateIcons:iconGroup = {
        path: 'profile_templates',
        icons: [
            'business',
            'baby',
            'backpacker',
            'luggage',
            'minimalist',
            'todler',
            'frequent_traveler',
        ]
    }

    constructor(
        public registry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        this.registerIcons(this.profileIcons)
        this.registerIcons(this.appIcons)
        this.registerIcons(this.weatherIcons)
        this.registerIcons(this.profileTemplateIcons)
    }

    private registerIcons(iconGroup:iconGroup) {
        let {path,icons} = iconGroup;
        icons.forEach(icon => {
            this.registry.addSvgIcon(
                icon,
                this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}/${icon}.svg`)
            );
        });
    }
}