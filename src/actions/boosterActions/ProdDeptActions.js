import * as common from 'network/index';
import {
    PROD_DEPT_CREATE,
    PROD_DEPT_SUCCESS,
    PROD_DEPT_FAILURE,
    BRANDS_CREATE,
    BRANDS_SUCCESS,
    BRANDS_FAILURE,
    PROD_CATEGORY_CREATE,
    PROD_CATEGORY_SUCCESS,
    PROD_CATEGORY_FAILURE
} from 'constants/boosterTypes';
export const listProdDeptAction = () => async (dispatch) => 
{    
    dispatch({ type: PROD_DEPT_CREATE }); 
    let response = await common.apiCall('POST',
    'Misc/GetProdDepts', 'PROD_DEPT_SUCCESS', null,'','')   
    let data = response.result 
    if (response.statusCode == 200) {
        dispatch({ type: PROD_DEPT_SUCCESS, payload: data   }); 
     }
     else {
        dispatch({ type: PROD_DEPT_FAILURE }); 
     } 
 }

 export const listBrandAction = () => async (dispatch) => 
{    
    dispatch({ type: BRANDS_CREATE }); 
    let response = await common.apiCall('POST',
    'Misc/GetBrands', 'BRANDS_SUCCESS', null,'','')   
    let data = response.result 
    if (response.statusCode == 200) {
        dispatch({ type: BRANDS_SUCCESS, payload: data   }); 
     }
     else {
        dispatch({ type: BRANDS_FAILURE }); 
     } 
 }

 export const listProdCategoryAction = () => async (dispatch) => 
 {    
     dispatch({ type:  PROD_CATEGORY_CREATE}); 
     let response = await common.apiCall('POST',
     'Misc/GetProdCategories', 'PROD_CATEGORY_SUCCESS', null,'','')   
     let data = response.result 
     if (response.statusCode == 200) {
         dispatch({ type: PROD_CATEGORY_SUCCESS, payload: data   }); 
      }
      else {
         dispatch({ type: PROD_CATEGORY_FAILURE }); 
      } 
  }