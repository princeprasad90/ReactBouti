import {
    LOGIN_USER,
    LOGIN_USER_SUCCESS,
    LOGIN_USER_FAILURE,
    LOGOUT_USER,
   
 } from '../constants/types';

/**
 * initial auth user
 */
const INIT_STATE = { 
    userData:{}
};

export default (state = INIT_STATE, action) => {
    switch (action.type) {

        // case LOGIN_USER:
        //     return {  };

        case LOGIN_USER_SUCCESS:
            return { ...state, userData: action.payload  };

        case LOGIN_USER_FAILURE:
            return { ...state, userData:{}  };

        case LOGOUT_USER:
            return { ...state, userData:{} };

       
        default: return { ...state };
    }
}
