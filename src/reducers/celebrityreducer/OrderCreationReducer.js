/**
 * Order search Reducer
 * Developed by Anu
 **/
 
import {
    LIST_CELEBRITY_ADDRESS,
    LIST_CELEBRITY_ADDRESS_SUCCESS,
    LIST_CELEBRITY_ADDRESS_FAILURE,

    LIST_SKUDETAILS,
    LIST_SKUDETAILS_SUCCESS,
    LIST_SKUDETAILS_FAILURE
   
} from '../../constants/celebritytypes';

/**
 * initial adjustment
 */
const INIT_STATE = {
    listCelebrityAddress : [],
    listSkuDetails:{},
      
};
export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case LIST_CELEBRITY_ADDRESS: 
            return {
                ...state, loading: true
            };
        case LIST_CELEBRITY_ADDRESS_SUCCESS: 
            return {
                ...state, 
                listCelebrityAddress:  action.payload,
                 
            };
        case LIST_CELEBRITY_ADDRESS_FAILURE : 
            return {
                ...state, 
                listCelebrityAddress:  [], 
            } ;
            case LIST_SKUDETAILS: 
            return {
                ...state, loading: true
            };
            
        case LIST_SKUDETAILS_SUCCESS: 
            return { ...state, listSkuDetails:action.payload };
        case LIST_SKUDETAILS_FAILURE : 
            return {
                ...state, 
                listSkuDetails:  {}, 
            };
        default: return { ...state };
    }

}