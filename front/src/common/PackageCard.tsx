import React, { useState, useEffect } from 'react';
import {  Col, Button, Modal } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { LocaleText} from '../styled';
import { UseRedux } from '../store/store';
import { Link } from 'react-router-dom';

const PackageCard = (props: any) => {
    const data = props.data;
    const intl = useIntl();

    const [AppState] = UseRedux();
    const OnClick = async () =>{
        // 이제 패키지 구매가 없다.

        Modal.info({
            content: (
                <div>
                    {
                        intl.formatMessage({id:'package.buy.upgrade.description'}, {value: data.price/100000000, n: <br/>})
                    }
                </div>
            ),
        });
         return;
        if ( Number(AppState.user.depositedBitcoin) < data.price*100000000 )
            return (
                Modal.info({
                    title: intl.formatMessage({id:'package.notenough.point'}),
                    okCancel: true,
                    content: (
                        <div>
                            {
                                intl.formatMessage({id:'package.notenough.point.description'}, {value: data.price, n: <br/>})
                            }
                        </div>
                    ),
                    onOk() { props.requestBuyPackage(data.index); },
                    onCancel() { }
                }));
        return (
        Modal.info({
            okCancel: true,
            content: (
                <div key={'package.confirm'}>
                    {
                        intl.formatMessage({id:'package.confirm.body'}, {value: data.price, n: <br/>})
                    }
                </div>
            ),
            onOk() { props.requestBuyPackage(data.index); },
            onCancel() { }
        }));
    }

    return (
        <Col className={'package-information-container'}>
            <div className={'package-information-title'}>
                {data.title}
            </div>
            <div style={{lineHeight:'200px', textAlign:'center'}}>
                <img src={data.icon}/>
            </div>
            <div className={'package-information-footer'}>
                <table className={'package-information-detail'}>
                    <tbody>
                    <tr>
                        <td style={{width:'120px'}}>
                        <FormattedMessage id={'miningVolumePerDay'}/>
                        </td>
                        <td>
                            {data.volume/100000000} <FormattedMessage id={'dayPerBTC'}/>
                        </td>
                    </tr></tbody>
                    <tbody>
                    <tr>
                        <td>
                            <LocaleText id={'price'}/>
                        </td>
                        <td>
                            {data.price/100000000} UM
                        </td>
                        </tr></tbody>
                </table>

                {AppState.isLoggedIn == false ? (
                    <Link to={'/login'}>
                        <Button
                            className={'package-information-purchase-container'}
                            size='large'
                            type='primary'
                        >
                            <FormattedMessage id={'upgrade'} />
                        </Button>
                    </Link>
                ) : props.requestBuyPackage == null ? (
                    <Link to={'/package'}>
                        <Button
                            className={'package-information-purchase-container'}
                            size='large'
                            type='primary'
                        >
                            <FormattedMessage id={'upgrade'} />
                        </Button>
                    </Link>
                ) : (
                            <Button
                                className={'package-information-purchase-container'}
                                size='large'
                                type='primary'
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (AppState.isLoggedIn)
                                        OnClick();
                                }}
                            >
                                <FormattedMessage id={'upgrade'} />
                            </Button>
                        )}
            </div>
        </Col>
    );
}

export default PackageCard;