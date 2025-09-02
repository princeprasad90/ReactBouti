import * as common from '../network/index';
import jsCookie from "js-cookie"; 
import { toast , ToastContainer } from 'react-toastify';

import React from 'react';
import {
   LOGIN_USER,
   LOGIN_USER_SUCCESS,
   LOGIN_USER_FAILURE,
   LOGOUT_USER, 
} from '../constants/types';

export const userLogin = (user) => async (dispatch) => 
{    
    dispatch({ type: LOGIN_USER }); 
    let response = await common.loginApiCall('POST',
    'Login/GetUserInfo', 'LOGIN_USER_SUCCESS', user,'','')  
    return response;
    // if (response.statusCode === "200") {
    
    //   return response;
    // }
    // else{
    //   toast.error(response.message);     
    // }
    
 }
 
//  export const userLogout = () => (dispatch) => {
//     firebase.auth().signOut()
//        .then(() => {
//           dispatch({ type: LOGOUT_USER });
//           localStorage.removeItem('user_id');
        
//        })
//        .catch((error) => {
//           NotificationManager.error(error.message);
//        })
//  }
 