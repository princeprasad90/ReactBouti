/**
 * Order search Reducer
 * Developed by M.Imtyaz
 **/
 
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

/**
 * initial adjustment
 */
const INIT_STATE = {
    listCelebrity : [],
    dataGrid: [],
    listAgents : [],
    allCelebs : [],
    listOrderStatus:[]
};
export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case LIST_CELEBRITY: 
            return {
                ...state, loading: true
            }
        case LIST_CELEBRITY_SUCCESS: 
            return {
                ...state, 
                listCelebrity:  action.payload,
                 
            }
        case LIST_CELEBRITY_FAILURE : 
            return {
                ...state, 
                listCelebrity:  [], 
            } 
        case LIST_MAPPEDAGENT: 
            return {
                ...state, loading: true
            }
        case LIST_MAPPEDAGENT_SUCCESS: 
            return {
                ...state, 
                listAgents:  action.payload,
                 
            }
        case LIST_MAPPEDAGENT_FAILURE : 
            return {
                ...state, 
                listAgents:  [], 
            } 
        case LIST_ORDERSTATUS: 
            return {
                ...state, loading: true
            }
        case LIST_ORDERSTATUS_SUCCESS: 
            return {
                ...state, 
                listOrderStatus:  action.payload,
                 
            }
        case LIST_ORDERSTATUS_FAILURE : 
            return {
                ...state, 
                listOrderStatus:  [], 
            } 
            case ALL_CELEBRITY: 
            return {
                ...state, loading: true
            }
        case ALL_CELEBRITY_SUCCESS: 
            return {
                ...state, 
                allCelebs:  action.payload,
                 
            }
        case ALL_CELEBRITY_FAILURE : 
            return {
                ...state, 
                allCelebs:  [], 
            }   
        default: return { ...state };
    }
}