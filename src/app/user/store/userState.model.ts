import { PackingListSettings } from '../../shared/models/packing-list.model';
export interface userPermissions {
    setPermissions: boolean,
    userManagement: boolean,
    creator: boolean,
    user: boolean,
}
export type permissionTypes = keyof userPermissions;

export interface UserSettings {
    alias:string,
    email:string,
    emailConfirmed:boolean,
    packinglistSettings:PackingListSettings,
}
export interface State {
    permissions: userPermissions,
    settings: UserSettings
    loaded:boolean,
    loading:boolean,
}

export const defaultUserSettings: UserSettings = {
    alias: 'Visitor',
    email: '',
    emailConfirmed: false,
    packinglistSettings: new PackingListSettings(),
}

export const defaultUserPermissions:userPermissions = {
    setPermissions: false,
    userManagement: false,
    creator: false,
    user: true
}
export const defaultVisitorPermissions:userPermissions = {
    setPermissions: false,
    userManagement: false,
    creator: false,
    user: false
}

export const defaultUserState: State = {
    permissions:defaultUserPermissions,
    settings:defaultUserSettings,
    loaded:false,
    loading:false,
}

