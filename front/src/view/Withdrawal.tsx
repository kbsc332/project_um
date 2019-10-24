
import React, { useState } from 'react';
import { Layout, Button, Form, Checkbox, Input,Modal } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { UseRedux } from '../store/store';
import { LocaleText } from '../styled';
import {Client} from '../apollo/client';
import {Redirect} from 'react-router-dom';
import { RequestWithdrawalBitcoinMutation} from '../apollo/query';

const Withdrawal: React.FC<any> = (props) => {
    const intl = useIntl();

    const [AppState, AppActions] = UseRedux();
    const address = AppState.user.bitcoinDepositAddress;

    const [values, setValues] = useState({
        withdrawalVolume: 0.005,
        confirmed: false,
        requested: false,
        linkTo: false,
    });
    
    if ( AppState.isLoggedIn == false)
    {
        return (<Redirect
            to={{
                pathname: "/login",
                state: { from: props.location }
            }}
        />)
    }

    const now = Date.now();
    const miningData : any = AppState.miningData;
    let eventVolume = 0;
    if (miningData.speedUpExpirationTime != 0) {
        // 지금 시간이, 이벤트 시간보다 클 경우 이벤트 시간까지만 따로 계산 해줘야함.
        var eventTime = ((now - miningData.speedUpExpirationTime > 0 ? miningData.speedUpExpirationTime : now) - miningData.updateTime) / (3600 * 24 * 1000);
        eventVolume = eventTime * miningData.speedUp;
    }
    const time = (now - miningData.updateTime) / (3600 * 24 * 1000);
    const volume : number = Number(AppState.user.depositedBitcoin) + miningData.speed * time + miningData.volume;  

    const hasBitcoin = Number((volume/100000000));
    
    const RequestWithdrawalBitcoin = async() =>{
        if ( values.requested ) 
            return;

        if ( values.withdrawalVolume <= 0.0 )
        {
            return;
        }

        values.requested = true;

        const result: any = await Client.mutate({
            mutation: RequestWithdrawalBitcoinMutation,
            variables: { userID: AppState.user.userID, amount: Math.floor(values.withdrawalVolume * 100000000) },
            context: {
                headers: {
                    accountID: AppState.user.accountID, session: AppState.user.session
                }
            }
        });

        AppActions.updateAccountDataAction(result.data.requestWithdrawalBitcoin.account);
        AppActions.updateMiningData(result.data.requestWithdrawalBitcoin.miningData);

        values.requested = false;

        setValues(initial => {
            return {
                ...initial,
                linkTo: true
            };
        });
    };

    const onVolumeChange = (e : any) => {
        const { value } = e.target;
        const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            setValues(initial => {
                return {
                    ...initial,
                    withdrawalVolume: value
                };
            });
        }
      };

      if ( values.linkTo )
      {
        return (<Redirect
            to={{
                pathname: "/point_detail",
                state: { from: props.location }
            }}
        />)
      }
    return (
        <Layout style={{ background: '#F5F5F5' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ marginTop: '70px', marginBottom: '17px', fontSize: '30px', color: '#222222' }}>
                    <LocaleText id={'withdrawal'}/>
                    </div>
                <div style={{ marginBottom: '40px', fontSize: '16px', color: '#222222' }}>
                    <LocaleText id={'account.description'}/>
                    </div>

                <div className={'withdrawal-form-container'}>
                    <Form className={'form'}>
                        <div className={'form-item-text'} style={{ display: 'flex' }}>
                            <FormattedMessage id={'withdrawal.volume'} />
                            <span style={{ marginLeft: 'auto', color: '#01467F', fontSize: '12px' }}><FormattedMessage id={'currentBitcoin'} values={{ volume: hasBitcoin.toFixed(8) }} /></span>
                        </div>

                        <Form.Item
                            style={{ textAlign: 'left' }}
                            help={values.withdrawalVolume > hasBitcoin ? intl.formatMessage({ id: 'withdrawal.notenough.bitcoin' }) : ""}
                            validateStatus={values.withdrawalVolume > hasBitcoin ? 'error' : 'success'}
                        >
                            <Input
                                className={'form-item-input'}
                                id="withdrawalVolume"
                                value={values.withdrawalVolume}
                                suffix="BTC"
                                onChange={(e) => {
                                    onVolumeChange(e);
                                }}
                            />
                        </Form.Item>
                        {/* 출금 주소  */}
                        <div className={'form-item-text'}>
                            <FormattedMessage id={'withdrawal.address'} />
                        </div>
                        <Form.Item>
                            <Input
                                className={'form-item-input'}
                                id="withdrawalAddress"
                                value={address}
                                disabled={true}
                                onChange={(e) => {
                                    const value = e.target.value;
                                }}
                            />
                        </Form.Item>
                        <div className={'withdrawal-cautions'}>
                            <div>
                                <FormattedMessage id={'withdrawal.cautions'}/>
                            </div>
                            <div className={'text'}>
                                <LocaleText id={'withdrawal.cautions.desc'}/>
                            </div>
                        </div>
                        <div style={{ paddingTop: '30px', textAlign: 'left' }}>
                            <Form.Item
                                validateStatus={!values.confirmed ? 'error' : 'success'}
                            >
                                <Checkbox
                                    onChange={(e: any) => {
                                        const value = e.target.checked;
                                        setValues(initial => {
                                            return {
                                                ...initial,
                                                confirmed: value
                                            };
                                        });
                                    }}><FormattedMessage id={'withdrawal.cautions.confirm'} /></Checkbox>
                            </Form.Item>
                        </div>
                        <div>
                        <Button
                                className={'form-item-submit'}
                                size='large'
                                type='primary'
                                style= {{ cursor: values.confirmed ? 'default' : 'not-allowed'}}
                                onClick={ (e) => {
                                    e.preventDefault();
                                    if ( values.confirmed == false )
                                        return;
                                    if ( values.withdrawalVolume < Number(AppState.user.depositedBitcoin) * 2 )
                                    {
                                    Modal.info({
                                        content: (
                                            <div>
                                                {intl.formatMessage({ id: 'withdrawal.confirm.description.with.fee' }, {
                                                    n: <br />,
                                                    address: <div className={'bold'} style={{ fontSize: '20px' }}>{AppState.user.bitcoinDepositAddress}</div>,
                                                    value: <div>{(values.withdrawalVolume*0.7).toFixed(8)}</div>
                                                })}
                                            </div>
                                        ),
                                        onOk() {
                                            RequestWithdrawalBitcoin();
                                        }
                                    });    
                                }
                                else
                                {

                                    Modal.info({
                                        content: (
                                            <div>
                                                {intl.formatMessage({ id: 'withdrawal.confirm.description' }, {
                                                    n: <br />,
                                                    address: <div className={'bold'} style={{ fontSize: '20px' }}>{AppState.user.bitcoinDepositAddress}</div>,
                                                    value: <div>{values.withdrawalVolume.toFixed(8)}</div>
                                                })}
                                            </div>
                                        ),
                                        onOk() {
                                            RequestWithdrawalBitcoin();
                                        }
                                    });  
                                }
                                }}
                            >
                                <FormattedMessage id={'withdrawal'}/>
                            </Button>
                            </div>
                    </Form>
                </div>
            </div>
        </Layout>
        );
};

export default Withdrawal;