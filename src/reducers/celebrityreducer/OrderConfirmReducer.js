/**
 * Conform Order Reducer
 * Developed by M.Imtyaz
 **/
 
import {
    DATA_ORDERCONFIRM,
    DATA_ORDERCONFIRM_FAILURE,
    DATA_ORDERCONFIRM_SUCCESS,
    GET_EDITORDERDATA
   
} from '../../constants/celebritytypes';
 

/**
 * initial adjustment
 */
const INIT_STATE = { 
    dataOrderConfirmGrid: [] ,
    dataEditOrder: [] 
};
export default (state = INIT_STATE, action) => {
    
   
    switch (action.type) {
        
        case DATA_ORDERCONFIRM: 
            return {
                ...state 
            }
        case DATA_ORDERCONFIRM_SUCCESS: 
     
            return {
                ...state, 
                dataOrderConfirmGrid:  action.payload,
                 
            }
        case GET_EDITORDERDATA: 
         return {
            ...state, 
            dataEditOrder:  action.payload,
                
        }
        case DATA_ORDERCONFIRM_FAILURE : 
            return {
                ...state, 
                dataOrderConfirmGrid:  [],
                 
            }
  
        default: return { ...state };
    }
}