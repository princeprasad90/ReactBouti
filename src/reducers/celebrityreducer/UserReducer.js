import {    ListCelebUsers,    ListCelebUsersSuccess,    ListCelebUsersFailure}
 from 'constants/celebritytypes';

    const INIT_STATE = {
        listCelebUsersRoles : [],
    };
    export default (state = INIT_STATE, action) => {
        switch (action.type) {
            case ListCelebUsers: 
                return {
                    ...state, loading: true
                }
            case ListCelebUsersSuccess: 
                return {
                    ...state, 
                    listCelebUsersRoles:  action.payload,
                }
            case ListCelebUsersFailure : 
                return {
                    ...state, 
                    listCelebUsersRoles:  [], 
                }   
            default: return { ...state };
        }
    }