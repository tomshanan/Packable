import { StoreSelectorService } from '../services/store-selector.service';
import { Injectable } from '@angular/core';
import { LibraryItem, Metadata, HasMetaData, ItemLibrary } from './library.model';
import { isDefined } from '../global-functions';


@Injectable({ providedIn: 'root' })
export class libraryFactory {
    constructor(
        private storeSelector: StoreSelectorService
    ) { }

    public attachMetadata<T extends LibraryItem>(items: T[]): Array<T & HasMetaData> {
        return items.map(item => {
            let metaData = this.storeSelector.getMetaDataForId(item.id)
            return { ...item, metaData: new Metadata(item.id, metaData) }
        })
    }
    public getLibraryItemsWithMetadata(node: keyof ItemLibrary, ids?: string[]): Array<LibraryItem & HasMetaData> {
        let items: LibraryItem[]
        if (isDefined(ids)) {
            items = this.storeSelector.getLibraryItemsByIds(node, ids)
        } else {
            items = this.storeSelector.libraryState.library[node]
        }
        return this.attachMetadata(items)
    }
}