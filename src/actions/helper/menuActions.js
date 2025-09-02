import * as common from '../../network/index'
import React from 'react';
import {CREATE_ROUTES,CREATE_ROUTES_FAILURE,CREATE_ROUTES_SUCCESS} from '../../constants/helperTypes';
import { toast } from 'react-toastify';

export const getCreateMenuAction = (reqdata) => async (dispatch) => 
{    
    dispatch({ type: CREATE_ROUTES }); 
    let response = await fetch(`${common.BASE_URL}Menu/GetMenuByUserCode?userCode=${reqdata}`);
        let output = await response.json();
        if (output.statusCode===200)
        {
            localStorage.setItem('menu', JSON.stringify(output.result));
            return (output.result);
        }
       else{
        localStorage.setItem('menu', JSON.stringify(''));
        toast.error(output.message);
        return;
      }

 } 

export const getMenuSuccessRequest = (data)=>{
    return {
        type:CREATE_ROUTES_SUCCESS,
        payload:data
    }
}
export const getMenuFailueRequest = ()=>{
    return {
        type:CREATE_ROUTES_FAILURE
    }
}