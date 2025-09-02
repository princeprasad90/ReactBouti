import * as common from 'network/index'
import React from 'react';
import {
    LIST_CELEBRITY,
    LIST_CELEBRITY_SUCCESS,
    LIST_CELEBRITY_FAILURE,
    LIST_MAPPEDAGENT,
    LIST_MAPPEDAGENT_SUCCESS,
    LIST_MAPPEDAGENT_FAILURE,
    LIST_ORDERSTATUS,
    LIST_ORDERSTATUS_SUCCESS,
    LIST_ORDERSTATUS_FAILURE,
    ALL_CELEBRITY,
    ALL_CELEBRITY_SUCCESS,
    ALL_CELEBRITY_FAILURE
} from 'constants/celebritytypes';



export const listMappedCelebrityAction = (reqdata) => async (dispatch) => 
{    
    dispatch({ type: LIST_CELEBRITY }); 
    let response = await common.apiCall('POST',
    'CelebrityRegister/GetMappedCelebrityList', 'LIST_CELEBRITY_SUCCESS', reqdata,'','')   
    let data = response.result 
    if (response.statusCode == 200) {
        dispatch({ type: LIST_CELEBRITY_SUCCESS, payload: data   }); 
     }
     else {
        dispatch({ type: LIST_CELEBRITY_FAILURE }); 
     } 
 }
export const listMappedCoordinatorAction = (reqdata) => async (dispatch) => 
{    
    dispatch({ type: LIST_MAPPEDAGENT }); 
    let response = await common.apiCall('POST',
    'CelebrityRegister/GetMappedCoordinatorsList', 'LIST_MAPPEDAGENT_SUCCESS', reqdata,'','')  
    let data = response.result     
    if (response.statusCode == 200) {
        dispatch({ type: LIST_MAPPEDAGENT_SUCCESS, payload: data   }); 
     }
     else {
        dispatch({ type: LIST_MAPPEDAGENT_FAILURE }); 
     } 
 }
 export const listOrderStatusAction = (reqdata) => async (dispatch) => 
{    
    dispatch({ type: LIST_ORDERSTATUS }); 
    let response = await common.apiCall('POST',
    'OrderSearch/GetOrderStatus', 'LIST_ORDERSTATUS_SUCCESS', reqdata,'','')  
    let data = response.result  
    if (response.statusCode == 200) {
        dispatch({ type: LIST_ORDERSTATUS_SUCCESS, payload: data   }); 
     }
     else {
        dispatch({ type: LIST_ORDERSTATUS_FAILURE }); 
     } 
 }
 export const allListCelebrityAction = (reqdata) => async (dispatch) => 
{    
    dispatch({ type: ALL_CELEBRITY }); 
    let response = await common.apiCall('POST',
    'CelebrityRegister/GetMappedCelebrityList', 'ALL_CELEBRITY_SUCCESS', reqdata,'','')   
    let data = response.result 
    if (response.statusCode == 200) {
        dispatch({ type: ALL_CELEBRITY_SUCCESS, payload: data   }); 
     }
     else {
        dispatch({ type: ALL_CELEBRITY_FAILURE }); 
     } 
 }
 export const GetMappedCelebrityByAm = (reqdata) => async (dispatch) => 
{    
    
    let response = await common.apiCall('POST',
    'CelebrityRegister/GetMappedCelebrityByAm', 'ALL_CELEBRITY_SUCCESS', reqdata,'','')   
    //let data = response.result 
    if (response.statusCode == 200) {
        let data = response.result;
        return data;
        
     }
     else {
       return null;
     } 
 }
 
 export const GetMappedAccountManagerByTm = (reqdata) => async (dispatch) => 
{  
     let response = await common.apiCall('POST',
         'CelebrityRegister/GetMappedAccountManagerByTm', 'ALL_CELEBRITY_SUCCESS', reqdata, '', '')     
     if (response.statusCode == 200) {
         let data = response.result;
         return data;
     }
     else {
         return null;
     } 
 }
 export const GetCelebrityListCampaign = (reqdata) => async (dispatch) => {
    let response = await common.apiCall('POST',
       'CelebrityRegister/GetMappedCelebrityListCampaign', '', reqdata, '', '')
    return response;
 
 }