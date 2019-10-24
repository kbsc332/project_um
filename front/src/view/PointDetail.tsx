
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { LocaleText } from '../styled';
import { Client } from '../apollo/client';
import { RequestDepositHistoryQuery } from '../apollo/query';
import { Redirect,Link } from 'react-router-dom';

import { UseRedux } from '../store/store';

//assets

const PointDetail: React.FC<any> = (props) => {
    const [values, setValues] = useState({
        loaded: false,
        history: []
    });

    const [AppState] = UseRedux();

    if (AppState.isLoggedIn == false) {
        return (<Redirect
            to={{
                pathname: "/login",
                state: { from: props.location }
            }}
        />)
    }

    const RequestDepositHistory = async () => {

        const result: any = await Client.query({
            query: RequestDepositHistoryQuery,
            variables: { userID: AppState.user.userID }
        });

        var datas = result.data.requestDepositHistory;

        if ( datas == null )
            datas = [];
        setValues(initial => {
            return {
                ...initial,
                loaded: true,
                history: datas
            };
        });
    }

    if (values.loaded == false) {
        RequestDepositHistory();
    }

    return (
        <Layout style={{ background: '#F5F5F5' }}>
            <div style={{ textAlign: 'center' }}>
                <div>
                    <div style={{ marginTop: '70px', marginBottom: '17px', fontSize: '30px', color: '#222222' }}>
                        <FormattedMessage id={'point'} />
                    </div>
                    <div style={{ paddingBottom: '62px', fontSize: '16px', color: '#222222' }}>
                        <LocaleText id={'point.detail.title.description'} />
                    </div>

                    <div className={'point-charge-form-container'}>
                        <div className={'flex'} style={{ paddingTop: '70px' }}>
                            <div className={'card'}>
                                <div className={'body'}>
                                    <div className={'title'}>
                                        현재 보유 포인트
                                    </div>
                                    <div className={'line'}>
                                    </div>
                                    <div className={'body'}>
                                        <img src={'images/pointChargeIcon.png'} width={'44px'} height={'45px'} />
                                        <div style={{ marginLeft: 'auto', marginRight: '18px' }}><span className={'text'} > {Number(AppState.user.depositedBitcoin) / 100000000} UM</span></div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <table className={'point-detail'}>
                            <tbody>
                                {values.loaded == false ? (
                                    <tr>
                                        <td className={'loading'}>
                                            <div>
                                            <LocaleText id={'loading'} />
                                            </div>
                                        </td>
                                    </tr>
                                ) : values.history.length == 0 ? (
                                    // 히스토리가 없을 때,
                                    <tr>
                                        <td className={'loading'}>
                                            <div>
                                            <LocaleText id={'point.detail.empty'} />
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                            // 
                                            values.history.map((history: any) => {
                                                return (
                                                    <tr key={history.transaction}>
                                                        <td>
                                                            <div>
                                                            { history.type == 2 ? (
                                                                    <div><LocaleText id={'point.detail.use'} /></div>

                                                            ) : history.type == 3 ? (
                                                                <div><LocaleText id={'point.detail.withdrawal'} /></div>
                                                            ) : (
                                                                <div><LocaleText id={'point.detail.charge'} /></div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                            {(history.value+history.fee)/100000000} UM
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                {history.type == 0 ? (
                                                                    <div style={{color:'#FBB03B'}}>
                                                                        <LocaleText id = {'point.detail.deposit.processing'}/>
                                                                    </div>
                                                                )
                                                                :
                                                                 history.type == 1 ? (new Date(history.time*1000).toLocaleString()) : history.type == 2 ? (<div/>):(
                                                                    <div style={{color:'#FBB03B'}}>
                                                                        <LocaleText id = {'point.detail.withdrawal.processing'}/>
                                                                    </div>) }
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                            </tbody>
                        </table>

                        <Link to={'/point_charge'}>
                        <div className={'flex'}>
                            <div className={'point-chage-button bold'}>  
                                                    
                                <LocaleText id={'pointCharge'}/>
                            </div>
                        </div>
                        </Link>
                    </div>

                </div>
            </div>
        </Layout>
    );
};
export default PointDetail;