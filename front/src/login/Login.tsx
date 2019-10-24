
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { StyledMainLayout, LocaleText } from '../styled';
import { Client } from '../apollo/client';
import { LoginQuery } from '../apollo/query';
import { Redirect, Link } from 'react-router-dom';

import { UseRedux } from '../store/store';

//assets

const { SubMenu } = Menu;
const { Content } = Layout;


function hasErrors(fieldsError: any) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const Login: React.FC<any> = (props) => {
    const intl = useIntl();
    const [values, setValues] = useState({
        account: '',
        password: '',
    });

    const [AppState, AppActions] = UseRedux();

    const OnLogin = async (account: string, password: string) => {
        if (account.length == 0 || password.length == 0) {
            Modal.info({
                title: intl.formatMessage({ id: 'login.errorDescription' }),
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'login.invalidAccount' })
                        }
                    </div>
                ),
                onOk() { },
            });
            return;
        };

        try {
            const result = await Client.query({
                query: LoginQuery,
                variables: { account: account, password: password }
            });

            props.setLogInUser(result.data.login);
        }
        catch (error) {
            Modal.info({
                title: intl.formatMessage({ id: 'login.errorDescription' }),
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'login.invalidAccount' })
                        }
                    </div>
                ),
                onOk() { },
            });
        }

    };

    if (AppState.isLoggedIn) {
        return (<Redirect
            to={{
                pathname: "/",
                state: { from: props.location }
            }}
        />)
    }

    return (
        <Layout style={{ background: '#F5F5F5' }}>
            <div style={{ textAlign: 'center' }}>
                <div>
                    <img src="/images/loginIcon.png" style={{ marginTop: '70px', marginBottom: '50px' }} />

                    <div className={'login-form-container'}>
                        <Form style={{ padding: '50px 100px 50px 100px' }}>
                            <div className={'form-item-text'}>
                                <FormattedMessage id={'account'} />
                            </div>
                            <Form.Item>
                                <Input id="account"
                                    className={'form-item-input'}
                                    value={values.account}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setValues(initial => {
                                            return {
                                                ...initial,
                                                account: value
                                            };
                                        });
                                    }}
                                    placeholder={intl.formatMessage({ id: 'account' })} />
                            </Form.Item>
                            <div className={'form-item-text'}>
                                <FormattedMessage id={'password'} />
                            </div>
                            <Form.Item>
                                <Input id="password"
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
                                    placeholder={intl.formatMessage({ id: 'password' })} />
                            </Form.Item>
                            <Button
                                className={'form-item-submit'}
                                size='large'
                                type='primary'
                                onClick={(e) => {
                                    e.preventDefault();
                                    OnLogin(values.account, values.password);
                                }}
                            >
                                <FormattedMessage id={'login'} />
                            </Button>
                        </Form>
                    </div>

                    {/* 로그인 창 하단 */}
                    <div style={{ marginTop: '30px' }}>
                        <Link to={'/signup'} style={{color: '#262626'}}>
                            <FormattedMessage id={"signup"} />
                        </Link>
                        {'  |  ' }
                        <Link to={'/find_account'}  style={{color: '#262626'}}>
                            <FormattedMessage id={"forgotPassword"} />
                        </Link>
                    </div>

                </div>
            </div>
        </Layout >
    );
};

export default Login;