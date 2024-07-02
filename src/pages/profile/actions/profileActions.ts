import { Dispatch } from 'redux';
import { ref, get, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from 'app/config/firebaseConfig';
import {
    FETCH_PROFILE_REQUEST,
    FETCH_PROFILE_SUCCESS,
    FETCH_PROFILE_FAILURE,
    UPDATE_PROFILE_PHOTO_REQUEST,
    UPDATE_PROFILE_PHOTO_SUCCESS,
    UPDATE_PROFILE_PHOTO_FAILURE
} from '../constants/actionTypes';

export const fetchUserProfile = (uid: string) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_PROFILE_REQUEST });

    try {
        const userRef = ref(database, `users/${uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            dispatch({
                type: FETCH_PROFILE_SUCCESS,
                payload: snapshot.val()
            });
        } else {
            throw new Error('User profile not found');
        }
    } catch (error) {
        dispatch({
            type: FETCH_PROFILE_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

export const updateProfilePhoto = (uid: string, file: File) => async (dispatch: Dispatch) => {
    dispatch({ type: UPDATE_PROFILE_PHOTO_REQUEST });

    try {
        const photoRef = storageRef(storage, `users/${uid}/profilePhoto/${file.name}`);
        await uploadBytes(photoRef, file);
        const photoURL = await getDownloadURL(photoRef);

        const userRef = ref(database, `users/${uid}`);
        await update(userRef, { profilePhoto: photoURL });

        dispatch({
            type: UPDATE_PROFILE_PHOTO_SUCCESS,
            payload: { profilePhoto: photoURL }
        });
    } catch (error) {
        dispatch({
            type: UPDATE_PROFILE_PHOTO_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};