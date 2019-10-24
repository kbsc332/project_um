
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input,Row } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import PackageCard from '../common/PackageCard';
import dataManager from '../dataManager/dataManager';
import {Client} from '../apollo/client';
import {RequestBuyPackageMutation} from '../apollo/query';
import { UseRedux } from '../store/store';
import { LocaleText } from '../styled';
import {Link} from 'react-router-dom';


//assets

const { Content } = Layout;

const Event: React.FC<any> = (props) => {

    const [AppState] = UseRedux();

    return (
        <Layout>           
        <div className={'main-top-bg'}>
    <img className={'main-top-bg-img'} src="/images/main_top_bg.png" alt="home" />
    </div>
                <Content>
                    <div className={'package-top-container'}>
                        <div>
                            <div className={'package-title'} >
                                <LocaleText id={'event.title'}/>
                            </div>
                            <div className={'package-sub-title'} >    
                                <FormattedMessage id={'event.description'} values={{n: ' '}}/>                        
                            </div>
                        </div>
                    </div>                                          
            </Content>
            <Content>
                <div style={{ marginTop: '70px', marginBottom:'282px' }}>
                    <Link to={'/event_roulette'}>
                        <img src={'/images/event_1.png'} width={370} height={220}/>
                    </Link>
                    <Link to={'/event_dice'}>
                        <img src={'/images/event_2.png'} width={370} height={220}/>
                    </Link>
                </div>
            </Content>
        </Layout>
        );
};

export default Event;