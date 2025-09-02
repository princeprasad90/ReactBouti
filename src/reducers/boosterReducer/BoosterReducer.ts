 
import { PROD_DEPT_CREATE,PROD_DEPT_SUCCESS,PROD_DEPT_FAILURE,
    BRANDS_CREATE,BRANDS_SUCCESS,BRANDS_FAILURE,
    PROD_CATEGORY_CREATE,PROD_CATEGORY_SUCCESS,PROD_CATEGORY_FAILURE    
} from '../../constants/boosterTypes';

const INIT_STATE = {
    listProdDept : [],
    listProdCategory: [],
    listBrands : []
};
export default (state = INIT_STATE, action) => {
    switch (action.type) {
        case PROD_DEPT_CREATE: 
            return {
                ...state,  listProdDept : []
            }
        case PROD_DEPT_SUCCESS: 
            return {
                ...state, 
                listProdDept:  action.payload
            }
        case PROD_DEPT_FAILURE : 
            return {
                ...state, 
                listProdDept:  [], 
            } 
        case PROD_CATEGORY_CREATE: 
            return {
                ...state,  listProdCategory : []
            }
        case PROD_CATEGORY_SUCCESS: 
            return {
                ...state, 
                listProdCategory:  action.payload
            }
        case PROD_CATEGORY_FAILURE : 
            return {
                ...state, 
                listProdCategory:  [], 
            }     
            case BRANDS_CREATE: 
            return {
                ...state,  listBrands : []
            }
        case BRANDS_SUCCESS: 
            return {
                ...state, 
                listBrands:  action.payload
            }
        case BRANDS_FAILURE : 
            return {
                ...state, 
                listBrands:  [], 
            } 
      
        default: return { ...state };
    }
}