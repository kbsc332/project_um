import { RouteProps } from 'react-router';

import Main from './view/Main';
import Login from './login/Login';
import SignUp from './login/SignUp';
import Package from './view/Package';
import Withdrawal from './view/Withdrawal';
import AccountInformation from './view/AccountInformation';
import ServiceCenter from './view/ServiceCenter';
import PointCharge from './view/PointCharge';
import Event from './view/Event';
import FindAccount from './view/FindAccount';
import RouletteEvent from './view/RouletteEvent';
import DiceEvent from './view/DiceEvent';
import Mining from './view/Mining';
import PointDetail from './view/PointDetail';

export interface CustomRouterProps extends RouteProps{
  needLogin: boolean;
}

const routes: Array<CustomRouterProps> = [
  {
    path: '/',
    exact: true,
    component: Main,
    needLogin: false,
  },
  {
    path: '/signup',
    component: SignUp,
    needLogin: false,
  },
  {
    path:'/package',
    component: Package,
    needLogin: false,
  },
  {
    path:'/withdrawal',
    component: Withdrawal,
    needLogin: true,
  },
  {
    path:'/account',
    component: AccountInformation,
    needLogin: true,
  },
  {
    path:'/service_center',
    component: ServiceCenter,
    needLogin: false,
  },
  {
    path:'/point_charge',
    component: PointCharge,
    needLogin: true
  },
  {
    path:'/find_account',
    component: FindAccount,
    needLogin: false
  },
  {
    path:'/event',
    component: Event,
    needLogin: false
  },
  {
    path:'/event_roulette',
    component: RouletteEvent,
    needLogin:false
  },
  {
    path:'/event_dice',
    component: DiceEvent,
    needLogin:false
  },
  {
    path:'/mining',
    component: Mining,
    needLogin:false
  },
  {
    path:'/point_detail',
    component: PointDetail,
    needLogin:true
  }
];

export default routes;
