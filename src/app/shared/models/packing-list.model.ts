export interface packingItem {
    name: string,
    quantity: number,
    checked: boolean
}

export interface Catergory {
    name: string,
    packables: packingItem[]
}

export interface Traveler {
    name: string,
    categories: Catergory[]
}

export interface PackingList {
    tripId: string,
    name: string,
    updated: string,
    travelers: Traveler[]
}