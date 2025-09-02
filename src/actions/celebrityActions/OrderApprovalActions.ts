import * as common from '../../network/index'
import React from 'react';
import { GET_EDITORDERDATA } from '../../constants/celebritytypes';

export const GetOrdersForConfirmation = (reqdata) => async (dispatch) => {
    let response = await common.apiCall('POST',
        'Order/GetOrderByApprovalMatrix', '', reqdata, '', '');
    return response;
}
export const orderConfirmAction = (reqdata) => async (dispatch) => {
    let response = await common.apiCall('POST',
        'Order/ConfirmOrder', '', reqdata, '', '')
    return response;

}
export const orderCancelAction = (reqdata) => async (dispatch) => {
    let response = await common.apiCall('POST',
        'Order/CancelOrder', '', reqdata, '', '')
    return response;
}
export const EditOrderAction = (reqdata) => async (dispatch) => {
    dispatch({ type: GET_EDITORDERDATA, payload: reqdata });
}
export const GetOrderDetailsBySearch = (reqdata) => async (dispatch) => {
    let response = await common.apiCall('POST',
        'Order/GetOrderSearch', '', reqdata, '', '')
    return response;

}
