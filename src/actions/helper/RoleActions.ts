import * as common from 'network/index';
import { RoleNames, Roles, AppNames } from 'utils';

export const getCelebUsersRolesByApp = async () => {
  let req = { "appCode": AppNames.Celebrity };
  let usersListOutput = await common.apiCall2('POST', `AdminRole/GetUsersRolesListByAppAsync`, {
    ...req
  });
  let celebUsersTemp = usersListOutput.data.result;
  celebUsersTemp.forEach(element => {
    let roles = element.rolesCSV.split(',');
    element.celebPriorityRole = getCelebPriorityRole(roles);
  });
  return celebUsersTemp;
}

export const getCelebPriorityRole = (roles) => {
  let celebPriorityRole = {};
  if (roles.some(r => Number(r) === RoleNames.CelebSeniorRM))
    celebPriorityRole = Roles.CelebSeniorRM;
  else if (roles.some(r => Number(r) === RoleNames.CelebJuniorRM))
    celebPriorityRole = Roles.CelebJuniorRM;
  else if (roles.some(r => Number(r) === RoleNames.CelebAccountManager))
    celebPriorityRole = Roles.CelebAccountManager;
  return   celebPriorityRole;

}