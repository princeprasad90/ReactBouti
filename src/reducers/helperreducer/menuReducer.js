 
 import {CREATE_ROUTES,CREATE_ROUTES_SUCCESS,CREATE_ROUTES_FAILURE
} from '../../constants/helperTypes';

const INIT_STATE = {
    routes : []
};
export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case CREATE_ROUTES: 
            return {
                ...state, loading: true
            }
        case CREATE_ROUTES_SUCCESS: 
            return {
                ...state, 
                routes:  action.payload,
            }
        case CREATE_ROUTES_FAILURE : 
            return {
                ...state, 
                routes:  [], 
            } 
        default: return { ...state };
    }
}