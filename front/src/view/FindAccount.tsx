import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input, Tabs, Radio } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { StyledMainLayout, LocaleText } from '../styled';
import { Client } from '../apollo/client';
import { RequestVerifyWithPhoneMutation, FindVerifyWithPhoneQuery, FindPasswordWithEmailQuery } from '../apollo/query';
import { Redirect, Link } from 'react-router-dom';
import { UseRedux } from '../store/store';

const { TabPane } = Tabs;

//assets
const { SubMenu } = Menu;
const { Content } = Layout;


function hasErrors(fieldsError: any) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}
const Timer = () => {
    const [counter, setCounter] = useState(60 * 3);

    useEffect(() => {
        if (counter > 0) {
            const interval = setTimeout(() => {
                setCounter(counter => counter - 1);
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [counter]);
    const m = parseInt((counter / 60).toString());
    const s = Number(counter % 60).toFixed(0);

    return <FormattedMessage id={'find.phone.verify.remain.time'} values={{ m: m, s: s }} />
};

const FindAccount: React.FC<any> = (props) => {
    const intl = useIntl();
    const [AppState] = UseRedux();
    const [values, setValues] = useState({
        account: '',
        password: '',
        isAccountFind: true,
        phoneNumber: '',
        requestedPhoneVerify: false,
        findingAccount: false,
        findingAccountResult: null,
        verifyNumber: '',

        // 비밀번호 찾기
        emailFirst: '',
        emailSecond: '',
        findingPassword: false,
        findingPasswordResult: false,
        email: '',
    });

    if (AppState.isLoggedIn) {
        return (<Redirect
            to={{
                pathname: "/",
                state: { from: props.location }
            }}
        />)
    }

    // 임시 비밀번호 요청
    const OnRequestTemporatePassword = async () => {
        if (values.emailFirst.length == 0 || values.emailSecond.length == 0 || values.account.length == 0) {
            Modal.info({
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'find.password.invalid.input.data' }, { n: <br /> })
                        }
                    </div>
                ),
                onOk() { }
            });
            return;
        }

        var email = values.emailFirst + '@' + values.emailSecond;

        try {
            const result: any = await Client.query({
                query: FindPasswordWithEmailQuery,
                variables: { account: values.account, email: email },
                context: {
                    headers: {
                        accountID: AppState.user.accountID, session: AppState.user.session
                    }
                }
            });

            // 이메일 가리기
            if ( values.emailFirst.length > 2 )
            {
                email = values.emailFirst.substring(0, 2)
                for ( var i = 0 ; i < values.emailFirst.length - 2; ++ i)
                    email += '*';
                email += '@' + values.emailSecond;
            }
            else if ( values.emailFirst.length == 2 )
                email = values.emailFirst.substring(0,1) + '*@' + values.emailSecond;

            if (result.data.findPasswordWithEmail) {
                setValues(initial => {
                    return {
                        ...initial,
                        findingPassword: true,
                        findingPasswordResult: result.data.findPasswordWithEmail,
                        email : email
                    };
                });
            }
            else 
            {
                Modal.info({
                    content: (
                        <div>
                            {
                                intl.formatMessage({ id: 'find.password.not.found' })
                            }
                        </div>
                    ),
                    onOk() { },
                });
            }
        }
        catch (err) {
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

    const OnVerifyCheck = async () => {
        if (values.verifyNumber.length < 6) {
            Modal.info({
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'find.phone.verify.invalid.length' }, { n: <br /> })
                        }
                    </div>
                ),
                onOk() { }
            });
            return;
        }

        try {
            const result: any = await Client.query({
                query: FindVerifyWithPhoneQuery,
                variables: { phoneNumber: values.phoneNumber, verifyNumber: values.verifyNumber }
            });
            setValues(initial => {
                return {
                    ...initial,
                    findingAccount: true,
                    findingAccountResult: result.data.findVerifyWithPhone,
                };
            });

        }
        catch (error) {
            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                var errorMessage = error.graphQLErrors[0].message;
                var message = '';
                var callback: any = null;
                if (errorMessage == 'notRequested') {
                    message = intl.formatMessage({ id: 'find.phone.verify.notRequested' });
                    callback = () => {
                        setValues(initial => {
                            return {
                                ...initial,
                                requestedPhoneVerify: false,
                                phoneNumber: '',
                                verifyNumber: ''
                            };
                        });
                    }
                }
                else {
                    message = intl.formatMessage({ id: 'find.phone.verify.invalid' });
                }

                Modal.info({
                    content: (
                        <div>
                            {message}
                        </div>
                    ),
                    onOk() { if (callback) callback(); },
                });
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

    };
    const OnRequestPhoneVerify = async () => {
        if (values.phoneNumber.length == 0) {
            Modal.info({
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'find.phone.invalid.phoneNumber' }, { n: <br /> })
                        }
                    </div>
                ),
                onOk() { }
            });
            return;
        }

        try {
            const result = await Client.mutate({
                mutation: RequestVerifyWithPhoneMutation,
                variables: { phoneNumber: values.phoneNumber }
            });

            if (result == false) {
                Modal.info({
                    content: (
                        <div>
                            {
                                intl.formatMessage({ id: 'find.phone.fail.requestVerify' })
                            }
                        </div>
                    ),
                    onOk() { },
                });
                return;
            }
            // 페이지를 변경해야한다.
            setValues(initial => {
                return {
                    ...initial,
                    requestedPhoneVerify: true,
                };
            });
        }
        catch (error) {
            Modal.info({
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'find.phone.invalid.phoneNumber' })
                        }
                    </div>
                ),
                onOk() { },
            });
        }
    };

    const OnVerifyNumberChange = (e: any) => {
        const { value } = e.target;
        const reg = /^-?([0-9]*)(\[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            setValues(initial => {
                return {
                    ...initial,
                    verifyNumber: value
                };
            });
        }
    };

    const OnPhoneNumberChange = (e: any) => {
        const { value } = e.target;
        const reg = /^-?([0-9]*)(\[0-9]*)?$/;
        if ((!isNaN(value) && reg.test(value)) || value === '') {
            setValues(initial => {
                return {
                    ...initial,
                    phoneNumber: value
                };
            });
        }
    };
    return (
        <Layout style={{ background: '#F5F5F5' }}>
            <div style={{ textAlign: 'center' }}>
                <div>
                    <div style={{ marginTop: '70px', marginBottom: '17px', fontSize: '30px', color: '#262626' }}>
                        <LocaleText id={'find.description'} />
                    </div>
                </div>

                <div className={'find-account'}>
                    <div style={{ display: 'flex', lineHeight: '50px' }}>
                        <div className={values.isAccountFind ? 'select' : 'unselect'} style={{ marginLeft: '20px', width: '130px' }} onClick={() => {
                            setValues(initial => {
                                return {
                                    ...initial,
                                    isAccountFind: true
                                };
                            });
                        }}>
                            아이디 찾기
                        </div>
                        <div className={values.isAccountFind ? 'unselect' : 'select'} style={{ marginLeft: '10px', width: '130px' }} onClick={() => {
                            setValues(initial => {
                                return {
                                    ...initial,
                                    isAccountFind: false
                                };
                            });
                        }}>
                            비밀번호 찾기
                        </div>
                    </div>
                    <div className={'find-account-contaniner'}>
                        {
                            values.isAccountFind ?
                                values.findingAccount == false ? (
                                    values.requestedPhoneVerify ? (
                                        // 핸드폰 인증 2번째. 
                                        <div>
                                            <div style={{ color: '#262626', fontSize: '22px', paddingTop: '60px' }}>
                                                <LocaleText id={'find.phone.verify'} />
                                            </div>
                                            <div style={{ fontSize: '12px', paddingTop: '12px' }}>
                                                <LocaleText id={'find.phone.input.verify.number'} />
                                            </div>
                                            <div style={{ display: 'flex', paddingTop: '33px' }}>
                                                <div style={{ display: 'flex', margin: 'auto', lineHeight: '40px' }}>
                                                    <span style={{ fontSize: '16px' }}><Radio checked={true}><LocaleText id={'verify.number'} /></Radio></span>
                                                    <span style={{ marginLeft: '20px', marginRight: '10px' }}> <Input
                                                        className={'input-box verify'}
                                                        id="verifyNumber"
                                                        value={values.verifyNumber}
                                                        onChange={OnVerifyNumberChange}
                                                        maxLength={6}
                                                    /></span>
                                                    <span>
                                                        <span className={'retry-button'} onClick={() => { }}>
                                                            <span style={{ margin: 'auto' }}>
                                                                <LocaleText id={'re.send'} />
                                                            </span>
                                                        </span>
                                                    </span>
                                                </div>

                                            </div>
                                            <div>
                                                <div style={{ color: '#8D8D8D', fontSize: '12px', width: '183px', margin: 'auto', paddingTop: '19px', textAlign: 'left' }}>
                                                    <Timer />
                                                </div>
                                            </div>

                                            <div className={'confirm-button'} style={{ marginTop: '96px' }} onClick={OnVerifyCheck}>
                                                <span style={{ margin: 'auto' }}>
                                                    <LocaleText id={'confirm'} />
                                                </span>
                                            </div>
                                        </div>) : (
                                            // 핸드폰 번호를 입력 받고, 인증 번호 전송 요청을 하자.
                                            <div>
                                                <div style={{ textAlign: 'left', paddingTop: '30px', paddingLeft: '20px', fontSize: '12px' }}>
                                                    <LocaleText id={'find.description.security'} />
                                                </div>
                                                <div style={{ width: '412px', marginLeft: 'auto', marginRight: 'auto', marginTop: '70px', textAlign: 'left' }}>
                                                    <div style={{ fontSize: '16px', marginLeft: '-24px' }}>
                                                        <Radio checked={true}><LocaleText id={'find.phone.verify'} /></Radio>
                                                    </div>
                                                    <div style={{ paddingTop: '7px', marginBottom: '62px' }}>
                                                        <Input
                                                            className={'input-box'}
                                                            id="phoneNumber"
                                                            value={values.phoneNumber}
                                                            onChange={OnPhoneNumberChange}
                                                            placeholder={intl.formatMessage({ id: 'find.phone.input.placeholder' })}
                                                            maxLength={12}
                                                        />
                                                    </div>
                                                    <div className={'confirm-button'} onClick={OnRequestPhoneVerify}>
                                                        <span style={{ margin: 'auto' }}>
                                                            <LocaleText id={'confirm'} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>)
                                )
                                    :
                                    (
                                        // 아이디 찾기 결과가 있음.
                                        <div>
                                            <div style={{ color: '#262626', fontSize: '22px', paddingTop: '60px' }}>
                                                {values.findingAccountResult ?
                                                    (
                                                        <LocaleText id={'find.phone.find.account.success.title'} />
                                                    )
                                                    : (
                                                        <LocaleText id={'find.phone.find.account.fail.title'} />
                                                    )
                                                }
                                            </div>
                                            <div style={{ color: '#262626', fontSize: '12px', paddingTop: '67px', paddingBottom: '100px' }}>

                                                {values.findingAccountResult ?
                                                    (
                                                        intl.formatMessage({ id: 'find.phone.find.account.success' }, { account: <span style={{ fontSize: '16px' }}> {values.findingAccountResult}</span> })
                                                    )
                                                    : (
                                                        <FormattedMessage id={'find.phone.find.account.fail'} />
                                                    )
                                                }
                                            </div>
                                            {values.findingAccountResult ?
                                                (
                                                    <Link to={'/login'}>
                                                        <div className={'confirm-button'}>
                                                            <span style={{ margin: 'auto' }}>
                                                                <LocaleText id={'login'} />
                                                            </span>
                                                        </div>
                                                    </Link>
                                                )
                                                : (
                                                    <div className={'confirm-button'} style={{ cursor: 'pointer' }} onClick={() => {
                                                        setValues(initial => {
                                                            return {
                                                                ...initial,
                                                                requestedPhoneVerify: false,
                                                                phoneNumber: '',
                                                                verifyNumber: '',
                                                                findingAccount: false,
                                                                findingAccountResult: null,
                                                            };
                                                        });
                                                    }}>
                                                        <span style={{ margin: 'auto' }}>
                                                            <LocaleText id={'go.back'} />
                                                        </span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )

                                :
                                values.findingPassword == false ?
                                    (
                                        //비밀번호 찾기 
                                        <div>
                                            <div style={{ textAlign: 'left', paddingTop: '30px', paddingLeft: '20px', fontSize: '12px' }}>
                                                <LocaleText id={'find.description.security'} />
                                            </div>
                                            <div style={{ width: '412px', marginLeft: 'auto', marginRight: 'auto', marginTop: '70px', textAlign: 'left' }}>
                                                <div style={{ fontSize: '14px' }}>
                                                    <LocaleText id={'account'} />
                                                </div>
                                                <div style={{ paddingTop: '8px', marginBottom: '23px' }}>
                                                    <Input
                                                        className={'input-box'}
                                                        id="account"
                                                        value={values.account}
                                                        onChange={(e: any) => {
                                                            const { value } = e.target;
                                                            setValues(initial => {
                                                                return {
                                                                    ...initial,
                                                                    account: value,
                                                                };
                                                            });
                                                        }}
                                                        placeholder={intl.formatMessage({ id: 'input.account' })}
                                                        maxLength={12}
                                                    />
                                                </div>
                                                <div style={{ fontSize: '14px' }}>
                                                    <LocaleText id={'email.address'} />
                                                </div>
                                                <div style={{ paddingTop: '8px', marginBottom: '62px', display: 'flex' }}>
                                                    <Input
                                                        className={'input-box'}
                                                        id="email.account"
                                                        value={values.emailFirst}
                                                        onChange={(e: any) => {
                                                            const { value } = e.target;
                                                            setValues(initial => {
                                                                return {
                                                                    ...initial,
                                                                    emailFirst: value,
                                                                };
                                                            });
                                                        }}
                                                        placeholder={intl.formatMessage({ id: 'find.password.first.email.placeholder' })}
                                                        maxLength={12}
                                                    />
                                                    <span style={{ paddingLeft: '4px', paddingRight: '4px', color: '#BCBCBC', lineHeight: '40px' }}>@</span>
                                                    <Input
                                                        className={'input-box'}
                                                        id="email.domain"
                                                        value={values.emailSecond}
                                                        onChange={(e: any) => {
                                                            const { value } = e.target;
                                                            setValues(initial => {
                                                                return {
                                                                    ...initial,
                                                                    emailSecond: value,
                                                                };
                                                            });
                                                        }}
                                                        maxLength={12}
                                                    />
                                                </div>
                                                <div className={'confirm-button'} onClick={OnRequestTemporatePassword}>
                                                    <span style={{ margin: 'auto' }}>
                                                        <LocaleText id={'confirm'} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) :
                                    (
                                        <div>
                                            <div style={{ color: '#262626', fontSize: '22px', paddingTop: '60px' }}>
                                                <LocaleText id={'find.password.find.title'} />
                                            </div>
                                            <div style={{ color: '#262626', fontSize: '12px', paddingTop: '67px', paddingBottom: '100px' }}>
                                                <FormattedMessage id={'find.password.find.reset'} values={{email:values.email}}/>
                                            </div>
                                            <Link to={'/login'}>
                                                <div className={'confirm-button'}>
                                                    <span style={{ margin: 'auto' }}>
                                                        <LocaleText id={'login'} />
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                    )
                        }
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default FindAccount;