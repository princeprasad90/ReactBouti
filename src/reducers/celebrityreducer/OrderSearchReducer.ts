/**
 * Order search Reducer
 * Developed by M.Imtyaz
 **/
 
import {
    DATA_ORDERSEARCH,
    DATA_ORDERSEARCH_FAILURE,
    DATA_ORDERSEARCH_SUCCESS,
    ListJuniorRM,ListJuniorRMSuccess,ListJuniorRMFailure
} from 'constants/celebritytypes';



/**
 * initial adjustment
 */
const INIT_STATE = { 
    dataOrderSearchGrid: [],
    juniorRM :[]
};
export default (state = INIT_STATE, action) => {
    
   
    switch (action.type) {
        
        case DATA_ORDERSEARCH: 
            return {
                ...state, loading: true
            }
        case DATA_ORDERSEARCH_SUCCESS: 
            return {
                ...state, 
                dataOrderSearchGrid:  action.payload,
            }
        case DATA_ORDERSEARCH_FAILURE : 
            return {
                ...state, 
                dataOrderSearchGrid:  [],
            }
            case ListJuniorRM: 
            return {
                ...state, loading: true
            }
        case ListJuniorRMSuccess: 
            return {
                ...state, 
                juniorRM:  action.payload,
            }
        case ListJuniorRMFailure : 
            return {
                ...state, 
                juniorRM:  [],
            }    
  
        default: return { ...state };
    }
}