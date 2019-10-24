
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Icon, message, Row, Col, Dropdown } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import {StyledMainLayout, LocaleText} from '../styled';
import { Link, Redirect } from 'react-router-dom';
import { UseRedux } from '../store/store';

//assets

const { SubMenu } = Menu;
const { Content } = Layout;


const Header: React.FC<any> = (props) => {
    const [AppState, AppActions] = UseRedux();

    const [menuItemData, setMenuItemData]: any = useState([]);
    const [values, setValues]: any = useState({
        currentSelectMenu : '',
        currentPath : window.location.pathname,
    });
    window.onbeforeunload = function(e) {
        setValues((initial: any) => {
            return {
                ...initial,
                currentPath: window.location.pathname
            };
        });
     };
    const changeMenuItemData = () => {
        setMenuItemData([
            {
                type: 'single', title: 'packageInformation', link: '/package'
            },
            {
                type: 'single', title: 'pointCharge', link: '/point_charge'
            },
            {
                type: 'single', title: 'requestWithdrawal', link: '/withdrawal'
            },
            {
                type: 'single', title: 'event', link: '/event'
            },
            {
                type: 'single', title: 'customerSupport', link: '/service_center'
            },
            {
                type: 'signup', title: 'mining', link: '/login'
            },
            {
                type: 'system', title: AppState.user.accountID, subItem: [
                    {
                        type: 'link', title: 'accountInfo', link: '/account',
                    },
                    {
                        type: 'logout', title: 'logout'
                    }
                ]
            }
        ]);
    }

    useEffect(() => {
        changeMenuItemData();
    }, [])

    const intl = useIntl();  
    
    const menuItems = (items: Array<any>) => {
        if (items && items.length > 0) {
            return items.map((item: any, index: number) => {
                if (item.type === 'single') {
                    if ( item.link )
                    {
                        return (<Menu.Item
                            key={item.title}
                            onClick={() => {
                                changeMenuItemData();
                            }}
                        >
                            <Link to={item.link}>
                                <LocaleText id={item.title } />
                            </Link>
                        </Menu.Item>);
                    }
                    else {
                        return (<Menu.Item key={item.title}
                        >
                            <LocaleText id={item.title } />
                            </Menu.Item>
                       )
                    }
                }
                else if (item.type === 'signup' && AppState.isLoggedIn == false ) {
                    return (
                        <div key={`signup - ${index}`}
                            className={'rounding-button'}
                            style={{ color: '#fff' }}
                            onClick={()=>{
                                changeMenuItemData();}}>
                            <Link
                                to={item.link}
                            >
                                <FormattedMessage id={item.title} />
                            </Link>
                        </div>
                    );
                }
                else if (item.type === 'system' && AppState.isLoggedIn == true )
                {
                    return (
                        <SubMenu key = {`system - ${index}`}
                            title = {AppState.user.accountID}
                        >
                            {
                                item.subItem.map((subItem: any) => {
                                    if ( subItem.type === 'link')
                                    {
                                        return (
                                            <Menu.Item 
                                                key={subItem.link}
                                                onClick = {() => {
                                                    changeMenuItemData();
                                                }}
                                            >
                                                <Link to={subItem.link}> 
                                                    <FormattedMessage id={subItem.title }/>
                                                </Link>
                                            </Menu.Item>
                                        );
                                    }
                                    else if ( subItem.type === 'logout')
                                    {
                                        return (
                                            <Menu.Item 
                                                key={subItem.link+ `${index}`}
                                                onClick = {() => {
                                                    changeMenuItemData();
                                                    props.setLogOutUser();
                                                }}
                                            >
                                                    <FormattedMessage id={subItem.title }/>
                                            </Menu.Item>
                                        );
                                    }
                                }
                                )
                            }
                        </SubMenu>
                    );
                }
                else if ( item.type === 'language' )
                {
                    return (
                        <SubMenu key = {`subMenu - ${index}`}
                        >
                            dw
                            {
                                item.subItem.map((subItem: any) => {
                                    
                                    return (<Menu.Item 
                                        key={subItem.title}
                                        onClick = {() => {
                                            // 언어 변경 필요.
                                        }}
                                    >
                                        {subItem.title}
                                    </Menu.Item>);
                                }
                                )
                            }
                        </SubMenu>
                    );
                }
            });
        }
    };
    const languageMenu = (
        <Menu>
            <Menu.Item 
            key={'ko'}
            onClick={()=>{
                props.changeLanguage('ko');
            }}>
                KO
            </Menu.Item>
            <Menu.Item  
            key={'en'}
            onClick={()=>{
                props.changeLanguage('en');
            }}>
                EN
          </Menu.Item>
            <Menu.Item  
            key={'cn'}
            onClick={()=>{
                props.changeLanguage('cn');
            }}>
                CN
          </Menu.Item>
            <Menu.Item 
            key={'jp'}
            onClick={()=>{
                props.changeLanguage('jp');
            }}>
                JP
          </Menu.Item>
        </Menu>
    );

    return (<Layout.Header style={{zIndex:1}}>
        <Link to={'/'}>
            <img className={'header-icon'} src="/images/headerIcon.png" alt="home" />
        </Link>
        
        <Menu
            key={'lang'}
            className={'desktop-menu'}
            //theme="dark"
            mode={'horizontal'}
            selectedKeys={values.currentSelectMenu}
            style={{ lineHeight: '80px', float: 'right' }}
        >
            {menuItems(menuItemData)}
            <Dropdown overlay={languageMenu} >
                <div style={{paddingLeft:'20px', paddingRight:'20px'}}>
                <img src={'/images/lang.png'}></img>
                </div>
            </Dropdown>
        </Menu>
        <div className={'mobile-menu'}>
            <Menu selectedKeys={values.currentSelectMenu} mode="horizontal" style={{marginTop:'auto', marginBottom:'auto'}}>
                <SubMenu
                    title={
                        <span className="submenu-title-wrapper">
                            <img src={'images/icon/menu.png'}/>
                        </span>
                    }
                >
                    <Menu.Item key='packageInformation'>
                        <Link to={'/package'}>
                        <img src={'images/icon/header-menu-package.png'} style={{marginRight:'5px'}}/><LocaleText id={'packageInformation'} />
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='pointCharge'>
                        <Link to={'/point_charge'}>
                        <img src={'images/icon/header-menu-point.png'} style={{marginRight:'5px'}}/><LocaleText id={'pointCharge'} />
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='requestWithdrawal'>
                        <Link to={'/withdrawal'}>
                        <img src={'images/icon/header-menu-withdrawal.png'} style={{marginRight:'5px'}}/><LocaleText id={'requestWithdrawal'} />
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='event'>
                        <Link to={'/event'}>
                        <img src={'images/icon/header-menu-event.png'} style={{marginRight:'5px'}}/><LocaleText id={'event'} />
                        </Link>
                    </Menu.Item>
                    <Menu.Item key='customerSupport'>
                        <Link to={'/service_center'}>
                        <img src={'images/icon/header-menu-customer.png'} style={{marginRight:'5px'}}/><LocaleText id={'customerSupport'} />
                        </Link>
                    </Menu.Item>
                    {
                        AppState.isLoggedIn ? (
                            // 로그인 했을 때,
                            <Menu.ItemGroup title={AppState.user.accountID}>
                                <Menu.Item key="accountInfo"><Link to={'/account'}><LocaleText id={'accountInfo'} /></Link></Menu.Item>
                                <Menu.Item key="logout" onClick = {() => {
                                                    props.setLogOutUser();
                                                }}><LocaleText id={'logout'} /></Menu.Item>
                            </Menu.ItemGroup>
                        ) : (
                            <Menu.Item key={'login-menu'}>
                                    <Link
                                        to={'/login'}
                                    >
                                        <FormattedMessage id={'login'} />
                                    </Link>
                            </Menu.Item>
                        )
                    }
                </SubMenu>
            </Menu>
            <div style={{margin:'auto'}}>
            <Link to={'/'} style={{marginLeft:'-66px'}}>
                <img className={'header-icon-mobile'} src="/images/headerIcon-mobile.png" alt="home" />
            </Link>
            </div>
        </div>
        
    </Layout.Header>);
};

export default Header;