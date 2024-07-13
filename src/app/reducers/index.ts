import { combineReducers } from 'redux';
import userAuth, { AuthState } from './userAuth';
import profile from 'pages/profile/reducers/profileReducer';
import catalog from 'pages/catalog/reducers/catalogReducer';
import orders from 'pages/orders/reducers/orderReducer';

const rootReducer = combineReducers({
    userAuth,
    profile,
    catalog,
    orders,
});

export type RootState = {
    userAuth: AuthState;
    profile: ReturnType<typeof profile>;
    catalog: ReturnType<typeof catalog>;
    orders: ReturnType<typeof orders>;
};

export default rootReducer;