import { getRoles as apiGetRoles, getUserRoles as apiGetUserRoles, putUserRoles as apiPutUserRoles } from '../apis';
import { Role } from '../models/Role';

export function getRoles ():Promise<Array<Role>> {
  return apiGetRoles();
}

export function getUserRoles (profileId: string):Promise<Array<Role>> {
  return apiGetUserRoles(profileId);
}

export function putUserRoles (profileId: string, roleIds: Array<string>):Promise<Array<Role>> {
  return apiPutUserRoles(profileId, roleIds);
}
