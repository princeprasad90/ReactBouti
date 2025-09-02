import * as common from '../../network/index'
import React from 'react';
import {
    DATA_PENDINGORDER,
    DATA_PENDINGORDER_SUCCESS,
    DATA_PENDINGORDER_FAILURE,
    PENDING_ORDER_SKU_DELETION,
    PENDING_ORDER_SKU_DELETION_SUCCESS
} from '../../constants/celebritytypes';
import { toast } from 'react-toastify';
 
export const searchPendingOrderAction = (reqdata) => async (dispatch) => 
{ 
   
    dispatch({ type: DATA_PENDINGORDER }); 
    let response = await common.apiCall('POST',
    'Order/GetPendingOrderDetailsByApprovalMatrix', 'DATA_PENDINGORDER_SUCCESS', reqdata,'','') 
      let data = response.result ;

    if (response.statusCode == 200) {
        dispatch({ type: DATA_PENDINGORDER_SUCCESS, payload: data   }); 
    }
    else {
    }
 }
 
 export const DeleteSkuAction = (reqData,orderData) => async (dispatch)=>{
    dispatch({ type:PENDING_ORDER_SKU_DELETION});
    let response = await common.apiCall('POST',
    'Order/DeleteSku', '', reqData,'','') ;
      if (response)toast.info(response.message);
      if (response.status)
      {
        let data = response.result ;
        let orderstate = [...orderData];
        orderstate.forEach(element => {
            if(element.orderId === data.orderId){
                element.celeb_OrderDetail.forEach((sku,index) =>{
                    if(sku.id ===data.id)
                    {
                        element.celeb_OrderDetail.splice(index,1);
                        element.celeb_OrderDetail.push(data);
                    }
                })
            }
        });
        dispatch({ type:PENDING_ORDER_SKU_DELETION_SUCCESS,payload:orderstate})
      }

 }