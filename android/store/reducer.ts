import { Action } from 'redoox';
import produce from 'immer';

import { InitialState, IState } from './state';
import * as Actions from './actions';

const ReducerMap = {
    [Actions.Type.LogInUesr]: logInUser,
    [Actions.Type.LogOutUser]: logOutUser,
    [Actions.Type.UpdateMiningData]: updateMiningDataAction,
    [Actions.Type.UpdateAccountData]: updateAccountDataAction,
}

console.log(InitialState);
export function Reducer(state: IState = InitialState, action: Action) {
    const reducer = ReducerMap[action.type];
	return reducer(state, action);
}

function logInUser(state: IState, { payload }: Actions.LogInUesr) {
    return produce(state, draft => {
        draft.user = payload.user;
        draft.miningData = payload.miningData;
        draft.isLoggedIn = payload.isLoggedIn ;
        draft.isLocalStorage = false;
    });
}

function updateMiningDataAction(state:IState, { payload }: Actions.UpdateMiningData)
{
    return produce(state, draft=>{
        draft.miningData = payload.miningData;
    })
}

function updateAccountDataAction(state:IState, { payload }: Actions.UpdateAccountData)
{
    return produce(state, draft=>{
        draft.user = payload.user;
    })
}

function logOutUser(state: IState) {
    return produce(state, draft => {
        draft.user = {      
            userID: 0,
            accountID: '',
            phoneNumber: '',
            bitcoinDepositAddress: '',
            companyBitcoinDepositAddress:'',
            depositedBitcoin: '',
            session:''
        };
        draft.isLoggedIn = false;
        draft.isLocalStorage = false;
    });
}