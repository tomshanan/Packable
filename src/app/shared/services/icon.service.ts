import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { Injectable } from "@angular/core";

@Injectable()
export class IconService {
    icons = [
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
    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
        this.matIconRegistry.addSvgIcon(
            'default',
            this.domSanitizer.bypassSecurityTrustResourceUrl("src/assets/icons/default.svg")
        );
        this.icons.forEach(icon => {
            this.matIconRegistry.addSvgIcon(
                icon,
                this.domSanitizer.bypassSecurityTrustResourceUrl("src/assets/icons/"+icon+'.svg')
            );
        });
        
    }
}