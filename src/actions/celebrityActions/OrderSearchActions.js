import * as common from 'network/index'  
import React from 'react';
import { toast } from 'react-toastify';
import {    DATA_ORDERSEARCH,    DATA_ORDERSEARCH_SUCCESS,DATA_ORDERSEARCH_FAILURE,
  ListJuniorRM,ListJuniorRMSuccess,ListJuniorRMFailure} from 'constants/celebritytypes';
 
export const searchOrderAction = (reqdata) => async (dispatch) => 
{ 
    dispatch({ type: DATA_ORDERSEARCH }); 
    let response = await common.apiCall('POST',
    'OrderSearch/OrderSearchByPagination', 'DATA_ORDERSEARCH_SUCCESS', reqdata,'','') 
      let data = response.result; 
    if (response.statusCode == 200) {
        dispatch({ type: DATA_ORDERSEARCH_SUCCESS, payload: data   }); 
    }
    else {  
    }  
 }

 export const searchOrderReset = () => async (dispatch) => 
{ 
    dispatch({ type: DATA_ORDERSEARCH_FAILURE }); 
 
 }

 export const getMappedJuniorRM = (reqdata) => async (dispatch) => 
 { 
  dispatch({ type: ListJuniorRM }); 
  let response = await common.apiCall('POST',
  'CelebrityRegister/GetMappedCelebrityList', 'ListJuniorRMSuccess', reqdata,'','')   
  let data = response.result 
  if (response.statusCode == 200) {
      dispatch({ type: ListJuniorRMSuccess, payload: data   }); 
   }
   else {
      dispatch({ type: ListJuniorRMFailure }); 
   } 
  }

 
 export const RMMappingCRUD = async (obj) => {
    try {
      let output = await common.apiCall2('POST', `RMMapping/Celeb_RMMappingCRUD`, { ...obj });
      let { data } = output;
      return data;
    }
    catch (e) {
      console.log("Error :",e);
      toast.error(`Something went wrong with api`)
    }

  }