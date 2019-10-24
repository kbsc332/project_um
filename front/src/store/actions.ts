import { Action } from 'redoox';
import { IAccount, IMiningData, IRecommandData } from './state';

export const Type = {
    LogInUesr: 'LOG_IN_USER',
    LogOutUser: 'LOG_OUT_USER',
    ChangeActiveSubject: 'REFRESH_CONTENTS',
    UpdateMiningData: 'UpdateMiningData',
    UpdateAccountData: 'UpdateAccountData',
}

export type LogInUesr = Action<{ isLoggedIn: boolean, user: IAccount, miningData:IMiningData, recommandData : IRecommandData }>
export function LoginAction(user: any): LogInUesr {
    localStorage.setItem('user', JSON.stringify({
        user : user.account,
        miningData: user.miningData,
        recommandData: user.recommandData
    }));
    localStorage.setItem('session', user.session);
    
    return {
        type: Type.LogInUesr,
        payload: {
            isLoggedIn: true,
            miningData: user.miningData,
            recommandData: user.recommandData,
            user: {
                session: user.session,
                userID: user.account.userID,
                accountID: user.account.accountID,
                phoneNumber: user.account.phoneNumber,
                bitcoinDepositAddress: user.account.bitcoinDepositAddress,
                companyBitcoinDepositAddress: user.account.companyBitcoinDepositAddress,
                depositedBitcoin: user.account.depositedBitcoin,
            }
        }
    };    
}

export type LogOutUser = Action<{ }>
export function LogoutAction(): LogOutUser {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    return {
        type: Type.LogOutUser,
        payload: { }
    }
}

export type UpdateMiningData = Action<{ miningData:IMiningData}>
export function UpdateMiningDataAction(miningData: IMiningData) : UpdateMiningData
{  
    let user : any= localStorage.getItem('user');
    if (user) {
        user = JSON.parse(user);

        user.miningData = miningData;

        localStorage.setItem('user', JSON.stringify(user));
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
    let localUser : any= localStorage.getItem('user');
    if (localUser) {
        localUser = JSON.parse(localUser);

        localUser.user = user;

        localStorage.setItem('user', JSON.stringify(localUser));
    }
    return {
        type: Type.UpdateAccountData,
        payload: { 
            user: {
                session: user.session,
                userID: localUser.user .userID,
                accountID: localUser.user.accountID,
                phoneNumber:localUser.user.phoneNumber,
                bitcoinDepositAddress: localUser.user.bitcoinDepositAddress,
                companyBitcoinDepositAddress: localUser.user.companyBitcoinDepositAddress,
                depositedBitcoin: localUser.user.depositedBitcoin,
            }
        }
    }

}
