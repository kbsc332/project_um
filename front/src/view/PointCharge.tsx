
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { LocaleText } from '../styled';
import { Redirect } from 'react-router-dom';

import { UseRedux } from '../store/store';

//assets

const PointCharge: React.FC<any> = (props) => {
    const [values, setValues] = useState({
        account: '',
        password: '',
    });
    const intl = useIntl();

    const [AppState] = UseRedux();
    
    if ( AppState.isLoggedIn == false)
    {
        return (<Redirect
            to={{
                pathname: "/login",
                state: { from: props.location }
            }}
        />)
    }

    const RequestBuyPoint = async(pointIndex:number)=>{

    };

    const OnRequestBuyPoint = async(pointIndex:number)=>{
        const point = dataManager.getPoint(pointIndex);
        if ( !point  )
            return;
            
        // 팝업을 띄워야 해        
        Modal.info({
            title: intl.formatMessage({ id: 'pointCharge.deposit.confirm.description' }, { value: point.um / 100000000 }),
            content: (
                <div>
                    {intl.formatMessage({ id: 'pointCharge.deposit.request.description' }, {
                        n: <br />,
                        address: <div className={'bold'} style={{ fontSize: '20px' }}>{AppState.user.companyBitcoinDepositAddress}</div>,
                        value: <div>{point.btc / 100000000} UM</div>
                    })}
                </div>
            ),
            onOk() {                 
                // 서버에 구매 요청을 보내자.
                RequestBuyPoint(pointIndex);
            }
        });    
    }

    return (
        <Layout  style={{background:'#F5F5F5'}}>
            <div style={{textAlign:'center'}}>
                <div>
                    <div style={{marginTop:'70px', marginBottom:'17px', fontSize:'30px', color:'#222222'}}>
                        <FormattedMessage id={'pointCharge'}/>
                    </div>
                    <div style={{ paddingBottom: '62px', fontSize: '16px', color: '#222222' }}>
                        <LocaleText id={'pointCharge.title.description'} />
                    </div>

                    <div className={'point-charge-form-container'}>
                        <div className={'flex'} style={{ paddingTop: '70px' }}>
                            <div className={'card'}>
                                <div className={'body'}>
                                    <div className={'title'}>
                                        <LocaleText id={'currentPoint'}/>
                                </div>
                                    <div className={'line'}>

                                    </div>
                                    <div className={'body'}>
                                        <img src={'images/pointChargeIcon.png'} width={'44px'} height={'45px'} />
                                        <div style={{ marginLeft: 'auto', marginRight: '18px' }}><span className={'text'} > {Number(AppState.user.depositedBitcoin)/100000000} UM</span></div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        <table className={'table-container'}>
                            <tbody>
                                {dataManager.getPoints().map((item: any, index) => {
                                    return (<div key={index}>
                                        <div style={{ height: '1px', background: '#8B838350', marginBottom: '10px' }}></div>
                                        <tr style={{ display: 'flex', paddingBottom: '10px' }}>
                                            <td className={'img'}>
                                                <img src={'images/pointChargeIcon_small.png'} width={'26px'} height={'30px'} />
                                            </td>
                                            <td style={{marginRight:'auto', paddingLeft:'5px', marginLeft:'0px'}}>
                                                <span className={'price'}>{item.um/100000000}</span> <span className={'unit'}>UM</span>
                                            </td>
                                            <td>
                                                <div className={'flex'}>
                                                    <div className={'btc-button'} onClick={()=>{
                                                        OnRequestBuyPoint(index);
                                                    }}>
                                                        <div className={'btc-price'}>
                                                            {item.btc/100000000} BTC
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        </div>
                                    );
                                })}
                                
                                <div style={{ height: '1px', background: '#8B838350', marginBottom: '10px' }}></div>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
            </Layout>
        );
};
export default PointCharge;