export interface userPermissions {
    setPermissions: boolean,
    userManagement: boolean,
    creator: boolean,
    user: boolean
}
export type permissionTypes = keyof userPermissions;

export interface UserSettings {
    alias:string
}
export interface State {
    permissions: userPermissions,
    settings: UserSettings
}


export const defaultUserSettings: UserSettings = {
    alias: 'Visitor'
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

export const defaultUserConfigState: State = {
    permissions:defaultUserPermissions,
    settings:defaultUserSettings
}

