
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input,Row } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import PackageCard from '../common/PackageCard';
import dataManager from '../dataManager/dataManager';
import { StyledMainLayout, LocaleText } from '../styled';
import { UseRedux } from '../store/store';
import {Client} from '../apollo/client';
import {RequestChangePasswordMutation} from '../apollo/query';
import {Link, Redirect} from 'react-router-dom';


//assets

const { Content } = Layout;

const AccountInformation: React.FC<any> = (props) => {

    const [AppState, AppActions] = UseRedux();

    const intl = useIntl();
    const [values, setValues] = useState({
        modifyPassword: false,
        password:'',
        });

    if ( AppState.isLoggedIn == false )
    {
      return (<Redirect
          to={{
              pathname: "/login",
              state: { from: props.location }
          }}
      />)
    }
    global.console.log(AppState);
    
    const now = Date.now();
    var miningData : any = AppState.miningData;
    var speed = miningData.speed;
    if (miningData.speedUpExpirationTime != 0 && now < miningData.speedUpExpirationTime) {
        speed += miningData.speedUp;
    }

    let eventVolume = 0;
    if (miningData.speedUpExpirationTime != 0) {
        // 지금 시간이, 이벤트 시간보다 클 경우 이벤트 시간까지만 따로 계산 해줘야함.
        var eventTime = ((now - miningData.speedUpExpirationTime > 0 ? miningData.speedUpExpirationTime : now) - miningData.updateTime) / (3600 * 24 * 1000);
        eventVolume = eventTime * miningData.speedUp;
    }
    const time = (now - miningData.updateTime) / (3600 * 24 * 1000);
    const volume = miningData.speed * time + miningData.volume;  

    const RequestChangePassword = async ()=>
    {
        try
        {
            const result = await Client.mutate({
                mutation: RequestChangePasswordMutation,
                variables: { userID: AppState.user.userID, password: values.password },
                context: {
                    headers: {
                        accountID: AppState.user.accountID, session: AppState.user.session
                    }
                }
            });

            setValues(initial => {
                return {
                    ...initial,
                    modifyPassword: false,
                    password:''
                };
            });
        }
        catch(error)
        {
            if ( error.graphQLErrors && error.graphQLErrors.length > 0 )
            {
                var errorMessage = error.graphQLErrors[0].message;
                if ( errorMessage == 'invalidAuth' )
                {
                    Modal.info({
                        content: (
                            <div>
                                {
                                    intl.formatMessage({ id: 'login.invalidSession' })
                                }
                            </div>
                        ),
                        onOk() {
                            AppActions.logOutUser();
                        },
                    });
                    return;
                }
                var message = '';
            }
            else {
                Modal.info({
                    content: (
                        <div>
                            {
                                intl.formatMessage({ id: 'common.server.error' })
                            }
                        </div>
                    ),
                    onOk() { },
                });
            }
        }
    }
    return (
        <Layout  style={{background:'#F5F5F5'}}>
           <div style={{textAlign:'center'}}>
                <div>
                    <div style={{marginTop:'70px', marginBottom:'17px', fontSize:'30px', color:'#222222'}}>
                        <LocaleText id={'account.information'}/>
                    </div>
                    <div style={{  marginBottom:'40px',fontSize:'16px', color:'#222222'}}>
                        <LocaleText id={'account.description'}/>
                    </div>
                </div>

                <div className={'account-information-container'}>
                    <div style={{padding:'50px 35px 50px 35px'}}>
                        <table>
                            <tbody>
                                <tr style={{borderTop:'0px'}}>
                                    <td>
                                        <FormattedMessage id={'account'}/>
                                    </td>

                                    <td>
                                        {AppState.user.accountID}
                                    </td>
                                    <td>
                                        
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <FormattedMessage id={'password'}/>
                                    </td>

                                    <td>
                                        { values.modifyPassword ? (<Input id="account"
                                            className={'form-item-input'}
                                            type={'password'}
                                            value={values.password}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setValues(initial => {
                                                    return {
                                                        ...initial,
                                                        password: value
                                                    };
                                                });
                                            }}
                                            />) : ('********')}
                                    </td>
                                    <td style={{fontSize:'12px', color:'#01467F'}}>
                                        <div className={'flex'}>
                                            <div style={{marginLeft:'auto', marginRight:'15px'}}
                                            onClick={()=>{
                                                if ( values.modifyPassword == false )
                                                {
                                                    setValues(initial => {
                                                        return {
                                                            ...initial,
                                                            modifyPassword: true
                                                        };
                                                    });
                                                }
                                                else if ( values.password.length == 0 )
                                                {
                                                    Modal.info({
                                                        content: (
                                                            <div>
                                                                {
                                                                    intl.formatMessage({ id: 'signup.notEqualPassword' })
                                                                }
                                                            </div>
                                                        ),
                                                        onOk() { },
                                                    });
                                                }
                                                else 
                                                {
                                                    setValues(initial => {
                                                        return {
                                                            ...initial,
                                                            modifyPassword: false
                                                        };
                                                    });
                                                    RequestChangePassword();
                                                }
                                            }}>
                                                <FormattedMessage id={'modify'}/>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <FormattedMessage id={'phoneNumber'}/>
                                    </td>

                                    <td>
                                        010-0000-0000
                                    </td>
                                    <td>
                                        
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <FormattedMessage id={'bitcoinAddress'}/>
                                    </td>

                                    <td>
                                        {AppState.user.bitcoinDepositAddress}
                                    </td>
                                    <td>
                                        
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <FormattedMessage id={'currentPoint'}/>
                                    </td>

                                    <td>
                                        {(Number(AppState.user.depositedBitcoin)/100000000)} UM
                                    </td>
                                    <td style={{fontSize:'12px', color:'#01467F'}}>
                                        <div className={'flex'}>
                                            <div style={{marginLeft:'auto', marginRight:'15px'}}>
                                                <Link to={'/point_detail'} style={{color: '#01467F'}}>
                                                <FormattedMessage id={'detail'}/>
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <FormattedMessage id={'miningVolumePerDay'}/>
                                    </td>

                                    <td>
                                        {speed/100000000} <LocaleText id={'dayPerBTC'}/>
                                    </td>
                                    <td style={{fontSize:'12px', color:'#01467F'}}>
                                        <div className={'flex'}>
                                            <div style={{marginLeft:'auto', marginRight:'15px'}}>
                                                <Link to={'/mining'} style={{color: '#01467F'}}>
                                                    <FormattedMessage id={'detail'}/>
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <FormattedMessage id={'currentMiningBitcoin'}/>
                                    </td>

                                    <td>
                                        {(volume/100000000).toFixed(8)} BTC
                                    </td>
                                    <td style={{ fontSize: '12px' }}>
                                        <div className={'flex'}>
                                            <div style={{ marginLeft: 'auto', marginRight: '15px' }}>
                                                <Link to={'/withdrawal'} style={{color: '#01467F'}}>
                                                    <FormattedMessage id={'requestWithdrawal'} />
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>       
        </Layout>
        );
};

export default AccountInformation;