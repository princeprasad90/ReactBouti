import * as common from '../../network/index'
import React from 'react';
import {  toast } from 'react-toastify';
import {
    LIST_CELEBRITY_ADDRESS,
    LIST_CELEBRITY_ADDRESS_SUCCESS,
    LIST_CELEBRITY_ADDRESS_FAILURE,

    LIST_SKUDETAILS,
    LIST_SKUDETAILS_SUCCESS,
    LIST_SKUDETAILS_FAILURE

} from '../../constants/celebritytypes';

export const ResetCelebAddress = ()=>async (dispatch) => {
  dispatch({ type: LIST_CELEBRITY_ADDRESS_FAILURE });
}

export const GetCelebrityAddress = (reqdata) => async (dispatch) => 
{   
    dispatch({ type: LIST_CELEBRITY_ADDRESS }); 
    let response = await common.apiCall('POST',
    'CelebrityRegister/GetCelebrityAddressByCelebrityCode', 'LIST_CELEBRITY_SUCCESS', reqdata,'','') 

    
    let data = response.result 
    
    if (response.statusCode == 200) {
        dispatch({ type: LIST_CELEBRITY_ADDRESS_SUCCESS, payload: data   });
    
     }
     else {
        dispatch({ type: LIST_CELEBRITY_ADDRESS_FAILURE });
       
     }
  
  
 }
 export const GetSkusInfo = (reqdata) => async (dispatch) => 
{   
    dispatch({ type: LIST_SKUDETAILS }); 
    let response = await common.apiCall('POST',
    'Order/GetSkuDetails', 'LIST_SKUDETAILS_SUCCESS', reqdata,'','') 
    return response;
     
 }
 export const CreateOrder = (reqdata) => async (dispatch) => 
{  
    let response = await common.apiCall('POST',
    'Order/CreateOrder', '', reqdata,'','') 
    return response;
    
 }
 export const SkuUpload = (reqdata) => async (dispatch) => 
{  
  let response = await common.apiCall('POST',
  'Order/UploadSku', '', reqdata,'','') 
  return response;


    
 }
export const GetProductInfoSearchPlus = (reqdata) => async (dispatch) => 
{  
//     let response = await common.MagentoapiCall('POST',
//     'https://searchplus-beta.boutiqaat.com/searchplus/rest/V1/productinfo', '', reqdata,'','') 
//     'https://www.boutiqaat.com/searchplus/rest/V1/productinfo', '', reqdata,'','') 
//  'https://cors-anywhere.herokuapp.com/https://www.boutiqaat.com/searchplus/rest/V1/productinfo'

    let response = await common.MagentoapiCall('POST',
     'Order/GetSearchPlus' , '', reqdata,'','');
     let data = JSON.parse(response)
    return data; 
 }

export const RepushOrder = (reqdata) => async (dispatch) => 
{  
    let response = await common.apiCall('POST',
    'Order/RepushOrder', '', reqdata,'','') 
    return response;
    
 }
 
 
 export const CancelOrder = (reqdata) => async (dispatch) => 
{  
    let response = await common.apiCall('POST',
    'Order/CancelOrder', '', reqdata,'','') 
    return response;
    
 }

 export const AddSku = (Sku,Skus,setSku,SetSkuDetails,isLoading,Clear) => {
    console.log("Sku OrderActions",Sku);
    if(!isLoading)
    {
    const found = Skus.some(el => el.ItemNo === Sku.ItemNo);
    if (Sku.ItemNo == undefined) {
      toast.warning("Please Enter Sku");
      Clear();
    }
    else if (Sku.CRSAvailableQty < 1) {
      toast.error("Out of Stock");
      Clear();
    }
    else if (Sku.CRSAvailableQty < Sku.Qty) {
      toast.warning("Available Qty LessThan Required Qty");
      document.getElementById("OrderQty").focus(); 
    }
    else if (Sku.Qty == undefined||Sku.Qty == 0) {
      toast.warning("Please Enter Qty ");
    }
    else if (found == true) {
      toast.warning("This Sku-" + Sku.ItemNo + " Already Added");
      Clear();
    }
    else if (Sku.ItemId ==undefined || Sku.ItemId==0 || Sku.ItemId == '') {
      Clear();
    }
    else {
      let tempSku = {...Sku};
      if(Sku.Qty>1){
       tempSku.Remarks = Sku.Remarks +"Qty more than 1/ ";
      }
      SetSkuDetails([...Skus, tempSku]);
      setSku({});
    //  one.current.focus();
      document.getElementById("ItemNo").focus();
    }
  }
  }
 
 export const GetOrderStatus = (Skus,userData,objRequest) => {

    let order_status = ""; let flag = "-1"; let notes = ""
    const found = Skus.some(el => (el.GivenBeforeQty > 0 || el.Remarks.includes("Given Before")) && el.Remarks!='Deleted');
    if (userData.celebrityRule == "Exclusive") {
      //........First Rule      
      if (found == true) {
        order_status = "Received";
        notes = "Given Before Qty";
        flag = "1";
      }
      else {
        const CompExcl = Skus.some(el => (el.CelebrityCode != objRequest.celebrityCode) && (el.CelebrityCode != '') && el.Remarks!='Deleted');
        if (CompExcl == true) {
          order_status = "Received";
          notes = "Sku Exclusive to another Celebrity";
        }
        else {
          order_status = "Confirmed";
        }
      }
     
    }
    else if (userData.celebrityRule == "Performance") {
      //........Second Rule  
      if (found == true) {
        const CompExcl = Skus.some(el => (el.CelebrityCode != objRequest.celebrityCode) && (el.CelebrityCode != '') && el.Remarks!='Deleted');
        if (CompExcl == true) {
          order_status = "Received";
          notes = "Sku Exclusive to another Celebrity";
        }
        else {
          const GrnCheck = Skus.some(el => (  el.Remarks!='Deleted'&&(el.GivenBeforeQty>0) && (el.GivenBeforeQty + el.ItemGivenOtherCeleb + el.Qty > el.ElegibleQty)));
          if (GrnCheck == true) {
            order_status = "Received";
            notes = "Exceed lifetime GRN limit";
          }
          else {
            order_status = "Confirmed";
          }

        }

      }
      else {
        const CompExcl = Skus.some(el => (el.CelebrityCode != objRequest.celebrityCode) && (el.CelebrityCode != '')  && el.Remarks!='Deleted');
        if (CompExcl == true) {
          order_status = "Received";
          notes = "Sku Exclusive to another Celebrity";
        }
        else {
          order_status = "Confirmed";
        }
      }
    }
    else if(userData.celebrityRule == "Independent")
    {
      let GrnCheck = Skus.some(el => (  el.Remarks!='Deleted' && el.Remarks.length > 1 && (el.Qty> el.ElegibleQty || el.ElegibleQty==0)));
      let CompExcl = Skus.some(el => (  el.Remarks!='Deleted' && el.Remarks.length > 1 && (el.CelebrityCode != objRequest.celebrityCode) && (el.CelebrityCode != '')));
      let QtyMore = Skus.some(el=>( el.Remarks!='Deleted' && el.Remarks.length > 1 && el.Qty>1 ));
      if (CompExcl) {
        order_status = "Received";
        notes = "Sku Exclusive to another Celebrity";
      }
      else if (found){
        order_status = "Received";
        notes = "Given Before Qty";
      }
      else if(GrnCheck){
        order_status = "Received";
        notes = "Exceed lifetime GRN limit";
      }
      else if(QtyMore)
      {
        order_status = "Received";
        notes = "Qty More than 1";
      }     
      else
      {
        order_status = "Confirmed";
      }

    }
   return { OrderStatus : order_status, Notes : notes};
  }
  export const GetProductInfoMultiWH = (reqdata) => async (dispatch) => 
{  

  dispatch({ type: LIST_SKUDETAILS }); 
    let response = await common.apiCall('POST',
    'Order/GetProductInfoMultiWH', 'LIST_SKUDETAILS_SUCCESS', reqdata,'','') 
    return response;
    // let response = await common.MagentoapiCall('POST',
    //  'Order/GetProductInfoMultiWH' , '', reqdata,'','');
    //  let data = JSON.parse(response)
    // return data; 
 }