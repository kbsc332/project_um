import { Action } from 'redoox';
import { IAccount, IMiningData, IRecommandData } from './state';
import { AsyncStorage } from 'react-native';

export const Type = {
    LogInUesr: 'LOG_IN_USER',
    LogOutUser: 'LOG_OUT_USER',
    ChangeActiveSubject: 'REFRESH_CONTENTS',
    UpdateMiningData: 'UpdateMiningData',
    UpdateAccountData: 'UpdateAccountData',
}

export type LogInUesr = Action<{ isLoggedIn: boolean, user: IAccount, miningData:IMiningData, recommandData : IRecommandData }>
export function LoginAction(user: any): LogInUesr {
    AsyncStorage.setItem('user', JSON.stringify({
        user : user.account, 
        miningData: user.miningData,
        recommandData: user.recommandData
    }));
    AsyncStorage.setItem('session', user.session);
    return {
        type: Type.LogInUesr,
        payload: {
            isLoggedIn: true,
            miningData: user.miningData,
            recommandData: user.recommandData,
            user: user.account
        }
    };    
}

export type LogOutUser = Action<{ }>
export function LogoutAction(): LogOutUser {
    AsyncStorage.removeItem('user');
    AsyncStorage.removeItem('session');
    return {
        type: Type.LogOutUser,
        payload: { }
    }
}

export type UpdateMiningData = Action<{ miningData:IMiningData}>
export function UpdateMiningDataAction(miningData: IMiningData) : UpdateMiningData
{  
    let user : any= AsyncStorage.getItem('user');
    if (user) {
        user = JSON.parse(user);

        user.miningData = miningData;

        AsyncStorage.setItem('user', JSON.stringify(user));
    }

    return {
        type: Type.UpdateMiningData,
        payload: { 
            miningData : user.miningData
        }
    }
}

export type UpdateAccountData = Action<{user: IAccount}>
export function UpdateAccountDataAction(user:IAccount) : UpdateAccountData
{
    let localUser : any= AsyncStorage.getItem('user');
    if (localUser) {
        localUser = JSON.parse(localUser);

        localUser.user = user;

        AsyncStorage.setItem('user', JSON.stringify(localUser));
    }
    return {
        type: Type.UpdateAccountData,
        payload: { 
            user : localUser.user
        }
    }

}
