/**
 * Order search Reducer
 * Developed by M.Imtyaz
 **/

import {
    DATA_PENDINGORDER,
    DATA_PENDINGORDER_SUCCESS,
    DATA_PENDINGORDER_FAILURE,
    PENDING_ORDER_SKU_DELETION,
    PENDING_ORDER_SKU_DELETION_SUCCESS,
    PENDING_ORDER_SKU_FAILURE

} from '../../constants/celebritytypes';


/**
 * initial adjustment
 */
const INIT_STATE = {
    dataPendingGrid: []
};
export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case DATA_PENDINGORDER:
            return {
                ...state, loading: true
            }
        case DATA_PENDINGORDER_SUCCESS:
            return {
                ...state,
                dataPendingGrid: action.payload,
            }
        case DATA_PENDINGORDER_FAILURE:
            return {
                ...state,
                dataPendingGrid: [],
            }
        case PENDING_ORDER_SKU_DELETION:
            return {
                ...state
            }
        case PENDING_ORDER_SKU_FAILURE:
            return {
                ...state                
            }
        case PENDING_ORDER_SKU_DELETION_SUCCESS:
            return {
                ...state,
                dataPendingGrid: action.payload
            }
        default: return { ...state };
    }
}