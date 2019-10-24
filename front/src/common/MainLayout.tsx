import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Icon, message, Row, Col } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import {StyledMainLayout, LocaleText} from '../styled';
import Header from '../common/Header'; 
import {Link} from 'react-router-dom';

// router component
//assets

const { SubMenu } = Menu;
const {  Content } = Layout;

const Footer = (props:any) => {
    return (
        <div className={'footer-container'}>
            <img className={'footer-icon'} src="images/footerIcon.png"></img>
            <div style={{ textAlign: 'center', color: '#fff', marginTop:'-50px', paddingTop:'48px', fontSize:'14px'}}>
                <div>
                    <span style={{paddingLeft:'22px', paddingRight:'22px', color:'#fff !important'}}>
                        <Link to={'package'}>
                            <FormattedMessage id={"purchasePackage"} />
                        </Link>
                    </span>
                    <span style={{ paddingLeft: '22px', paddingRight: '22px', color:'#fff !important' }}>
                    <Link to={'point_charge'}>
                        <FormattedMessage id={"pointCharge"} />
                    </Link>
                    </span>
                    <span style={{ paddingLeft: '22px', paddingRight: '22px', color:'#fff !important' }}>
                    <Link to={'withdrawal'}>
                        <FormattedMessage id={"requestWithdrawal"} />
                    </Link>
                    </span>
                    <span style={{ paddingLeft: '22px', paddingRight: '22px', color:'#fff !important' }}>
                    <Link to={'event'}>
                        <FormattedMessage id={"event"} />
                    </Link>
                    </span>
                    <span style={{ paddingLeft: '22px', paddingRight: '22px', color:'#fff !important'  }}>
                    <Link to={'service_center'}>
                        <FormattedMessage id={"customerSupport"} />
                    </Link>
                    </span>
                </div>
                <div style={{paddingTop:'18px'}}>
                    <FormattedMessage id={"copyright"}/></div>
            </div>
        </div>
    );
};

const MainLayout: React.FC<any> = (props) => {
    useEffect(() => {
       const { pathname } = window.location;
   }, [window.location.pathname]);

    useEffect(() => {
        const { pathname } = window.location;
    }, []);
    return (
        <StyledMainLayout style={{minHeight:'100vh'}}>
            <Layout style={{minHeight:'100vh'}}>
                <Header setLogOutUser={props.setLogOutUser} changeLanguage={props.changeLanguage}/>
                    {props.children}
                <Footer/>
            </Layout>
        </StyledMainLayout>
    );
};

export default MainLayout;