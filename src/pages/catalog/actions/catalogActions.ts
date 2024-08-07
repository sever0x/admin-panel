import {Dispatch} from 'redux';
import {deleteObject, getDownloadURL, ref as storageRef, uploadBytes} from 'firebase/storage';
import {get, ref, remove, set, update} from 'firebase/database';
import * as actionTypes from '../constants/actionTypes';
import storage from "misc/storage";
import {database, storage as firebaseStorage} from 'app/config/firebaseConfig';
import {Good} from "pages/catalog/types/Good";
import {v4 as uuidv4} from 'uuid';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchCategories = () => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.FETCH_CATEGORIES_REQUEST });

    try {
        const categoriesRef = ref(database, 'categories');
        const snapshot = await get(categoriesRef);

        if (snapshot.exists()) {
            dispatch({
                type: actionTypes.FETCH_CATEGORIES_SUCCESS,
                payload: snapshot.val()
            });
        } else {
            throw new Error('No categories found');
        }
    } catch (error) {
        dispatch({
            type: actionTypes.FETCH_CATEGORIES_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

export const fetchAllUserGoods = () => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.FETCH_GOODS_REQUEST });

    try {
        let userData = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (!userData && attempts < maxAttempts) {
            userData = JSON.parse(storage.getItem(storage.keys.USER_DATA) ?? 'null');
            if (!userData) {
                await delay(500);
                attempts++;
            }
        }

        if (!userData) {
            throw new Error('Failed to load user data');
        }

        const portId = userData.port?.id;
        const userId = userData.id;

        if (!portId || !userId) {
            throw new Error('User port or ID not found');
        }

        const goodsRef = ref(database, `goods/${portId}/${userId}`);
        const snapshot = await get(goodsRef);

        if (snapshot.exists()) {
            const userGoods = Object.values(snapshot.val());

            dispatch({
                type: actionTypes.FETCH_GOODS_SUCCESS,
                payload: userGoods
            });
        } else {
            dispatch({
                type: actionTypes.FETCH_GOODS_SUCCESS,
                payload: []
            });
        }
    } catch (error) {
        dispatch({
            type: actionTypes.FETCH_GOODS_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

export const fetchGoods = (categoryId: string) => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.FETCH_GOODS_REQUEST });

    try {
        const userData = JSON.parse(storage.getItem(storage.keys.USER_DATA) ?? '{}');
        const portId = userData.port?.id;
        const userId = userData.id;

        if (!portId || !userId) {
            throw new Error('User port or ID not found');
        }

        const goodsRef = ref(database, `goods/${portId}`);
        const snapshot = await get(goodsRef);

        if (snapshot.exists()) {
            const allGoods = snapshot.val() as Record<string, Record<string, Good>>;
            const filteredGoods = Object.values(allGoods)
                .flatMap(userGoods =>
                    Object.values(userGoods)
                        .filter((good: Good) =>
                            good.categoryId === categoryId && good.ownerId === userId
                        )
                );

            dispatch({
                type: actionTypes.FETCH_GOODS_SUCCESS,
                payload: filteredGoods
            });
        } else {
            dispatch({
                type: actionTypes.FETCH_GOODS_SUCCESS,
                payload: []
            });
        }
    } catch (error) {
        dispatch({
            type: actionTypes.FETCH_GOODS_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

export const updateGood = (updatedGood: Good, newImages: File[], deletedImageKeys: string[]) => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.UPDATE_GOOD_REQUEST });

    try {
        const userData = JSON.parse(storage.getItem(storage.keys.USER_DATA) ?? '{}');
        const portId = userData.port?.id;
        const userId = userData.id;

        if (!portId || !userId) {
            throw new Error('User port or ID not found');
        }

        // Upload new images
        const uploadedImages = await Promise.all(newImages.map(async (file) => {
            const uniqueFileName = `${uuidv4()}_${file.name.replace(/[.#$\/\[\]]/g, '_')}`;
            const imageRef = storageRef(firebaseStorage, `goods/${portId}/${userId}/${updatedGood.id}/${uniqueFileName}`);
            await uploadBytes(imageRef, file);
            const downloadURL = await getDownloadURL(imageRef);
            return { [uniqueFileName]: downloadURL };
        }));

        // Delete removed images from Firebase Storage
        await Promise.all(deletedImageKeys.map(async (key) => {
            const imageRef = storageRef(firebaseStorage, `goods/${portId}/${userId}/${updatedGood.id}/${key}`);
            await deleteObject(imageRef);
        }));

        // Remove deleted images from the good object
        const filteredImages = Object.entries(updatedGood.images || {})
            .filter(([key]) => !deletedImageKeys.includes(key))
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        // Merge new images with existing ones
        const mergedImages = {
            ...filteredImages,
            ...Object.assign({}, ...uploadedImages)
        };

        const updatedGoodWithImages = {
            ...updatedGood,
            images: mergedImages
        };

        const goodRef = ref(database, `goods/${portId}/${userId}/${updatedGood.id}`);
        await update(goodRef, updatedGoodWithImages);

        dispatch({
            type: actionTypes.UPDATE_GOOD_SUCCESS,
            payload: updatedGoodWithImages
        });
    } catch (error) {
        dispatch({
            type: actionTypes.UPDATE_GOOD_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

export const deleteGood = (good: Good) => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.DELETE_GOOD_REQUEST });

    try {
        const userData = JSON.parse(storage.getItem(storage.keys.USER_DATA) ?? '{}');
        const portId = userData.port?.id;
        const userId = userData.id;

        if (!portId || !userId) {
            throw new Error('User port or ID not found');
        }

        // Delete images from Firebase Storage
        if (good.images) {
            await Promise.all(Object.keys(good.images).map(async (key) => {
                const imageRef = storageRef(firebaseStorage, `goods/${portId}/${userId}/${good.id}/${key}`);
                await deleteObject(imageRef);
            }));
        }

        // Delete good from Firebase Realtime Database
        const goodRef = ref(database, `goods/${portId}/${userId}/${good.id}`);
        await remove(goodRef);

        dispatch({
            type: actionTypes.DELETE_GOOD_SUCCESS,
            payload: good.id
        });
    } catch (error) {
        dispatch({
            type: actionTypes.DELETE_GOOD_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

export const addGood = (newGood: Omit<Good, 'id'>, newImages: File[]) => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.ADD_GOOD_REQUEST });

    try {
        const userData = JSON.parse(storage.getItem(storage.keys.USER_DATA) ?? '{}');
        const portId = userData.port?.id;
        const userId = userData.id;

        if (!portId || !userId) {
            throw new Error('User port or ID not found');
        }

        const goodId = uuidv4();

        // Upload new images
        const uploadedImages = await Promise.all(newImages.map(async (file) => {
            const uniqueFileName = `${uuidv4()}_${file.name.replace(/[.#$\/\[\]]/g, '_')}`;
            const imageRef = storageRef(firebaseStorage, `goods/${portId}/${userId}/${goodId}/${uniqueFileName}`);
            await uploadBytes(imageRef, file);
            const downloadURL = await getDownloadURL(imageRef);
            return { [uniqueFileName]: downloadURL };
        }));

        const goodWithImages = {
            ...newGood,
            id: goodId,
            images: Object.assign({}, ...uploadedImages),
            ownerId: userId,
            portId: portId,
            createTimestampGMT: new Date().toISOString(),
            available: true,
        };

        const goodRef = ref(database, `goods/${portId}/${userId}/${goodId}`);
        await set(goodRef, goodWithImages);

        dispatch({
            type: actionTypes.ADD_GOOD_SUCCESS,
            payload: goodWithImages
        });
    } catch (error) {
        dispatch({
            type: actionTypes.ADD_GOOD_FAILURE,
            payload: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};