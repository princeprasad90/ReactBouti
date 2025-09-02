/**
 * Order search Reducer
 * Developed by M.Imtyaz
 **/
 
import {
    DATA_MYORDER,
    DATA_MYORDER_FAILURE,
    DATA_MYORDER_SUCCESS,
   
} from '../../constants/celebritytypes';
 

/**
 * initial adjustment
 */
const INIT_STATE = { 
    dataGrid: [] 
};
export default (state = INIT_STATE, action) => {
    
   
    switch (action.type) {
        
        case DATA_MYORDER: 
            return {
                ...state, loading: true
            }
        case DATA_MYORDER_SUCCESS: 
            return {
                ...state, 
                dataGrid:  action.payload,
                 
            }
        case DATA_MYORDER_FAILURE : 
            return {
                ...state, 
                dataGrid:  [],
                 
            }
  
        default: return { ...state };
    }
}