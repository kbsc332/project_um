
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input,Row } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import PackageCard from '../common/PackageCard';
import dataManager from '../dataManager/dataManager';
import {Client} from '../apollo/client';
import {RequestBuyPackageMutation} from '../apollo/query';
import { UseRedux } from '../store/store';
import { LocaleText } from '../styled';


//assets

const { Content } = Layout;

const Package: React.FC<any> = (props) => {
    const intl = useIntl();
    const [AppState, AppActions] = UseRedux();

    const RequestBuyPackage = async(packageIndex:number) =>{
        try
        {
            const result = await Client.mutate({
                mutation: RequestBuyPackageMutation,
                variables:{userID: AppState.user.userID, packageID:packageIndex}
            });

            AppActions.updateAccountDataAction(result.data.requestBuyPackage.account);
            AppActions.updateMiningData(result.data.requestBuyPackage.miningData);

            Modal.info({
                title: intl.formatMessage({id:'package.buy.success.title'}),
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'package.buy.success.description' }, {transaction: result.data.requestBuyPackage.transactionID, n :<br/>})
                        }
                    </div>
                ),
                onOk() { },
            });
        }
        catch
        {

        }
    };

    return (
        <Layout>           
        <div className={'main-top-bg'}>
    <img className={'main-top-bg-img'} src="/images/main_top_bg.png" alt="home" />
    </div>
                <Content>
                    <div className={'package-top-container'}>
                        <div>
                            <div className={'package-title'} >
                                <LocaleText id={'packageInformation'}/>
                            </div>
                            <div className={'package-sub-title'} >    
                                <FormattedMessage id={'recommendation.purchase.miner'} values={{n: ' '}}/>                        
                            </div>
                        </div>
                    </div>                                          
            </Content>
            <Content>
                <div className={'package-content'}>
                    <Row type="flex">
                        <PackageCard data={dataManager.getPackageData(1)} requestBuyPackage={RequestBuyPackage} />
                        <PackageCard data={dataManager.getPackageData(2)} requestBuyPackage={RequestBuyPackage}/>
                        <PackageCard data={dataManager.getPackageData(3)} requestBuyPackage={RequestBuyPackage}/>
                        <PackageCard data={dataManager.getPackageData(4)} requestBuyPackage={RequestBuyPackage}/>
                        <PackageCard data={dataManager.getPackageData(5)} requestBuyPackage={RequestBuyPackage}/>
                        <PackageCard data={dataManager.getPackageData(6)} requestBuyPackage={RequestBuyPackage}/>
                    </Row>
                </div>
            </Content>
        </Layout>
        );
};

export default Package;