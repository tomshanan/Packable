import { userPermissions } from '@app/user/store/userState.model';

export interface User {
    id: string,
    alias: string,
    permissions: userPermissions
}
export interface State {
    users: User[],
    simulateUser: boolean,
}