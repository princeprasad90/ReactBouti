import React from 'react';
import * as common from 'network/index';
import {    ListCelebUsers,    ListCelebUsersSuccess,    ListCelebUsersFailure}
 from 'constants/celebritytypes';
 import { RoleNames,Roles,AppNames } from 'utils';
import {getCelebPriorityRole} from 'actions/helper/RoleActions';
 export const getCelebUsersRolesList = (reqdata) => async (dispatch) => {
    dispatch({ type: ListCelebUsers });
    let req =  {"appCode": AppNames.Celebrity };
    let usersListOutput = await common.apiCall2('POST', `AdminRole/GetUsersRolesListByAppAsync`, {
        ...req
      });
      let celebUsersTemp = usersListOutput.data.result;
      celebUsersTemp.forEach(element => {
        let roles = element.rolesCSV.split(',');
        element.celebPriorityRole = getCelebPriorityRole(roles);
      });

    dispatch({ type: ListCelebUsersSuccess, payload: celebUsersTemp   }); 
    
}
