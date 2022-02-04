import { getRoles as apiGetRoles, getUserRoles as apiGetUserRoles, putUserRoles as apiPutUserRoles } from '../apis';
import { Role } from '../models/Role';

export async function getRoles ():Promise<Array<Role>> {
  return await apiGetRoles();
};

export async function getUserRoles (profileId: string):Promise<Array<Role>> {
  return await apiGetUserRoles(profileId);
};

export async function putUserRoles (profileId: string, roleIds: Array<string>):Promise<Array<Role>> {
  return await apiPutUserRoles(profileId, roleIds);
};
