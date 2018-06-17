import { combineReducers } from 'redux';
import urls from './urlReducer';
import menu from './menuReducer';
import user from './userReducer';
import orders from './orderReducer';
import meals from './mealReducer';

const rootReducer = combineReducers({
  urls, menu, user, orders, meals,
});

export default rootReducer;