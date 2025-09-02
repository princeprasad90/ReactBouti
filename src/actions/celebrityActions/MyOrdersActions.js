import * as common from '../../network/index'
import React from 'react';
import {
    DATA_MYORDER,
    DATA_MYORDER_SUCCESS,
   
} from '../../constants/celebritytypes';
 
export const searchMyOrderAction = (reqdata,signal) => async (dispatch) => 
{ 

    dispatch({ type: DATA_MYORDER }); 
     let response = await common.apiCall('POST',
     'Order/GetMyOrderDetailsByApprovalMatrix', 'DATA_MYORDER_SUCCESS', reqdata,'','');
    if (response !==undefined && response.statusCode == 200) {
        dispatch({ type: DATA_MYORDER_SUCCESS, payload: response.result   }); 
    }
    
 }
 