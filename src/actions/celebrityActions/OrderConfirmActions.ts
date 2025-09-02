import * as common from '../../network/index'  
import React from 'react';
import {
  DATA_ORDERCONFIRM,
   
  DATA_ORDERCONFIRM_SUCCESS,
  GET_EDITORDERDATA,
  ORDER_CONFIRM,
    ORDER_CANCEL,
    ORDER_EDIT
   
} from '../../constants/celebritytypes';
import { toast  } from 'react-toastify';

export const searchOrderConfirmAction = (reqdata) => async (dispatch) =>  
{ 
    dispatch({ type: DATA_ORDERCONFIRM }); 
    let response = await common.apiCall('POST',
    'Order/GetOrderDetailsByApprovalMatrix', 'DATA_ORDERCONFIRM_SUCCESS',  reqdata ,'','') 
      let data = response.result 
    
    if (response.statusCode == 200) {
      dispatch({ type: DATA_ORDERCONFIRM_SUCCESS, payload: data   }); 
    }
    else { 
      toast.error('No data found')   
      return null;
    
    }  
 }
export const orderConfirmAction = (reqdata) => async (dispatch) =>  
{ 
  dispatch({ type: ORDER_CONFIRM }); 
  let response = await common.apiCall('POST',
  'Order/ConfirmOrder', 'ORDER_CONFIRM',  reqdata ,'','') 
    let data = response.result 
  
  if (response.statusCode == 200) {
    toast.error(reqdata.orderId + ' : Order has been [Confirmed]')    
    return null;
  }
  else { 
    toast.error('No data found')   
    return null;
  
  }  
}
 export const orderCancelAction = (reqdata) => async (dispatch) =>  
{ 
    dispatch({ type: ORDER_CANCEL }); 
    let response = await common.apiCall('POST',
    'Order/CancelOrder', 'ORDER_CANCEL',  reqdata ,'','') 
      let data = response.result 
    
    if (response.statusCode == 200) {
      toast.error(reqdata.orderId + ' : Order has been [Cancelled]')    
    }
    else { 
      toast.error('No data found')   
      return null;
    
    }  
 }
 export const EditOrderAction = (reqdata) => async (dispatch) =>  
 { 
  dispatch({ type: GET_EDITORDERDATA, payload: reqdata   });  
 }
 export const GetOrderDetailsBySearch = (reqdata) => async (dispatch) => 
{  
    let response = await common.apiCall('POST',
    'Order/GetOrderSearch', '', reqdata,'','') 
    return response;
    
 }
 