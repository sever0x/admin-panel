import {
    ERROR_SIGN_IN,
    REQUEST_SIGN_IN,
    SUCCESS_SIGN_IN,
    REQUEST_SIGN_OUT,
    SUCCESS_SIGN_OUT,
    ERROR_SIGN_UP,
    REQUEST_SIGN_UP,
    SUCCESS_SIGN_UP,
} from '../constants/actionTypes';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import storage from 'misc/storage';
import { auth } from 'app/config/firebaseConfig';

const requestSignIn = () => ({
    type: REQUEST_SIGN_IN,
});

const successSignIn = (user: User) => ({
    type: SUCCESS_SIGN_IN,
    payload: user,
});

const errorSignIn = (error: any) => ({
    type: ERROR_SIGN_IN,
    payload: error,
});

const requestSignUp = () => ({
    type: REQUEST_SIGN_UP,
});

const successSignUp = () => ({
    type: SUCCESS_SIGN_UP,
});

const errorSignUp = (error: any) => ({
    type: ERROR_SIGN_UP,
    payload: error,
});

const requestSignOut = () => ({
    type: REQUEST_SIGN_OUT,
});

const successSignOut = () => ({
    type: SUCCESS_SIGN_OUT,
});

const fetchLogin = (email: string, password: string) => async (dispatch: any) => {
    dispatch(requestSignIn());
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        storage.setItem('user', JSON.stringify(user));
        dispatch(successSignIn(user));
    } catch (error) {
        dispatch(errorSignIn(error));
    }
};

const fetchRegister = (email: string, password: string) => async (dispatch: any) => {
    dispatch(requestSignUp());
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        dispatch(successSignUp());
    } catch (error) {
        dispatch(errorSignUp(error));
    }
};

const fetchLogout = () => async (dispatch: any) => {
    dispatch(requestSignOut());
    try {
        await signOut(auth);
        storage.removeItem('user');
        dispatch(successSignOut());
    } catch (error) {
        // Handle error if needed
    }
};

const exportFunctions = {
    fetchLogin,
    fetchRegister,
    fetchLogout,
    successSignIn,
    requestSignOut,
};

export default exportFunctions;