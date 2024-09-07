import { useSelector, useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import {RootState} from "../../app/reducers";
import actions from "../../app/actions/userAuth";
import {
    googleSignInAndLoadProfile,
    signInAndLoadProfile,
    signUpAndLoadProfile
} from "../../app/actions/compoundActions";

const useAuth = () => {
    const dispatch: ThunkDispatch<RootState, unknown, UnknownAction> = useDispatch();
    const { user, loading, error } = useSelector((state: RootState) => state.userAuth);

    return {
        user,
        loading,
        error,
        login: (email: string, password: string) => dispatch(signInAndLoadProfile(email, password)),
        register: (email: string, password: string, additionalInfo: { firstName: string, lastName: string, phone: string, vesselIMO: string, vesselMMSI: string }) =>
            dispatch(signUpAndLoadProfile(email, password, additionalInfo)),
        logout: () => dispatch(actions.fetchLogout()),
        googleSignIn: () => dispatch(googleSignInAndLoadProfile()),
    };
};

export default useAuth;