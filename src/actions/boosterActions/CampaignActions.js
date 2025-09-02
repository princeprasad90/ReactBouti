import * as common from 'network/index';
export const CreateCampaign = (reqdata) => async (dispatch) => {
   var personJSONString = JSON.stringify(reqdata);
   let response = await common.apiCall('POST',
      'Booster/Camp_Create', '', reqdata, '', '')
   return response;
}
export const GetCampaignApprovalData = (reqdata) => async (dispatch) => {
   let response = await common.apiCall('POST',
      'Booster/Camp_Pending_Approval', '', reqdata, '', '')
   return response;
}
export const LoadFilterData = (reqdata) => async (dispatch) => {
   let response = await common.apiCall('POST',
      'Booster/Camp_Approval_Load', '', reqdata, '', '')
   return response;
}
export const EditCampaign = (reqdata) => async (dispatch) => {
   let response = await common.apiCall('POST',
      'Booster/Camp_Edit', '', reqdata, '', '')
   return response;

}
export const Campaign_Listing = (reqdata) => async (dispatch) => {
   var personJSONString = JSON.stringify(reqdata);
  
   let response = await common.apiCall('POST',
      'Booster/Camp_Listing', '', reqdata, '', '')

      console.log("DYNA",response)
   return response;

}
export const GetCampaignApprovalDataByMatrix = (reqdata) => async (dispatch) => {
   let response = await common.apiCall('POST',
      'Booster/Camp_Pending_ApprovalMatrix', '', reqdata, '', '')
   return response;
}
export const EditCampaignApprovalMatrix = (reqdata) => async (dispatch) => {
   let response = await common.apiCall('POST',
      'Booster/EditCampaignApprovalMatrix', '', reqdata, '', '')
   return response;

}
export const LoadFilterDataMatrix = (reqdata) => async (dispatch) => {
   let response = await common.apiCall('POST',
      'Booster/Camp_Approval_LoadMatrix', '', reqdata, '', '')
   return response;
}