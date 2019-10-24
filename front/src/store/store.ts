import { initRedoox } from 'redoox'
import { Reducer } from './reducer'
import { InitialState, IState } from './state'
import * as Selectors from './selectors';

import * as Actions from './actions';

const { Provider, useRedux } = initRedoox(Reducer, InitialState)

export interface IAppState extends IState {}

export { Provider, useRedux }

const extractState = (state: IAppState) => ({
    user: Selectors.getUser(state),
    miningData: Selectors.getMiningData(state),
    recommandData : Selectors.getRecommandData(state),
    isLoggedIn: Selectors.getIsLoggedIn(state),
  });

  const actionMap = {
    logInUser: Actions.LoginAction,
    logOutUser: Actions.LogoutAction,
    updateMiningData : Actions.UpdateMiningDataAction,
    updateAccountDataAction : Actions.UpdateAccountDataAction,
  };

export const UseRedux = () => {
    return useRedux(extractState, actionMap);
}
