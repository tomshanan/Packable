export class Reason {
    constructor(
        public text: string,
        public active = true){
    }

}
export interface PackingListPackable {
    profileID: string,
    collectionID: string,
    packableID: string,
    quantity: number,
    quantityReasons: Reason[],
    checked: boolean
}

export class PackingList {
    constructor(
        public tripId: string,
        public updated: string,
        public data: {},
        public packables: PackingListPackable[] =[],
    ){}

}