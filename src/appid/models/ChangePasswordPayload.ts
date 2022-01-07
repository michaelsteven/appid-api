export interface ChangePasswordPayload {
  newPassword: string;
  uuid: string;
  changedIpAddress?: string;
};
