import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import CelebrityReducer from './celebrityreducer/CelebrityReducer';
import MyOrdersReducer from './celebrityreducer/MyOrdersReducer';
import PendingOrderReducer from './celebrityreducer/PendingOrderReducer';
import OrderSearchReducer from './celebrityreducer/OrderSearchReducer';
import OrderCreationReducer from './celebrityreducer/OrderCreationReducer';
import OrderConfirmReducer from './celebrityreducer/OrderConfirmReducer';
import EditOrderReducer from './celebrityreducer/EditOrderReducer';
import MenuReducer from './helperreducer/menuReducer';
import UserReducer from './celebrityreducer/UserReducer';
import BoosterReducer from './boosterReducer/BoosterReducer'
const appReducers = combineReducers({
    AuthReducer,
    CelebrityReducer,
    MyOrdersReducer,
    PendingOrderReducer,
    OrderSearchReducer,
    OrderCreationReducer,
    OrderConfirmReducer,
    EditOrderReducer,
    MenuReducer,
    UserReducer,
    BoosterReducer
 });

 const reducers = (state, action) => {
    if (action.type === 'LOGIN_USER') {
      state = undefined
    }
  
    return appReducers(state, action)
  }
 
 export default reducers;
 