import { toast } from 'react-toastify';
import { RoleNames } from 'utils';

export const AccessButtons = {
    CreateOrder : "CreateOrder",
    EditOrder : "EditOrder",
    ApproveOrder : "ApproveOrder",
    CancelOrder : "CancelOrder",
    DelegateEnable : "DelegateEnable"
} 

const AccessControl = new Map();
AccessControl.set(AccessButtons.CreateOrder,[RoleNames.CelebAccountManager]);
AccessControl.set(AccessButtons.EditOrder,[RoleNames.CelebAccountManager,RoleNames.CelebJuniorRM,RoleNames.CelebSeniorRM]);
AccessControl.set(AccessButtons.ApproveOrder,[RoleNames.CelebJuniorRM,RoleNames.CelebSeniorRM]);
AccessControl.set(AccessButtons.CancelOrder,[RoleNames.CelebAccountManager,RoleNames.CelebJuniorRM,RoleNames.CelebSeniorRM]);
AccessControl.set(AccessButtons.DelegateEnable,[RoleNames.CelebJuniorRM]);

export const checkAccessControl = (action, allowSuperAdmin = true) => {
    let allowAction = false;
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (allowSuperAdmin) {
        if (userData.roles.includes(RoleNames.CelebSuperAdmin)) {
            allowAction = true;
            return allowAction;
        }
    }
    let celebPriorityRole = userData.celebPriorityRole;
    let allowedRoles = AccessControl.get(action);
    if (allowedRoles == undefined) {
        toast.error(` This ${action} not defined in Celeb Access Control`);
        return allowAction;
    }
    if (allowedRoles.includes(celebPriorityRole.roleId)) {
        allowAction = true;
    }
    else {
        allowAction = false;
    }
    if (userData.roleId==2 ||userData.roleId==3 || userData.roleId==15 ){
        allowAction = true;
    }
    return allowAction;
}


