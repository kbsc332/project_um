
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import {StyledMainLayout, LocaleText} from '../styled';
import {Client} from '../apollo/client';
import { UseRedux } from '../store/store';
import {Redirect } from 'react-router-dom';
import { SignUpMutation,DuplicateCheckQuery, RequestVerifyWithPhoneMutation, VerifyWithPhoneMutation } from '../apollo/query';


//assets

const { SubMenu } = Menu;
const { Content } = Layout;


function hasErrors(fieldsError: any) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const SignUp: React.FC<any> = (props) => {
    const [AppState] = UseRedux();
    const intl = useIntl();

    const isProductionBuild = process.env.NODE_ENV === 'production';
    const [values, setValues] = useState({
        account:'', 
        password:'', 
        passwordConfirm:'', 
        email:'', 
        emailFirst:'',
        emailSecond:'',
        phoneNumber:'', 
        bitcoinAddress:'',
        recommanderUserID: '',

        isDuplicateChecked: false,
        confirmDuplicateCheck: false,

        // 개발 모드에선 phone인증을 하지 않는다.
        isPhoneVerified: isProductionBuild ? false : true, 
        requestVerifyNumber : false,
        sendVerifyNumber : false,

        phoneVerifyNumber :'',
        requestVerifyCheckNumber : false,
        goToLogin:false,
    });


    const RequestPhoneVerifyCheckNumber = async () =>{
        if ( values.requestVerifyCheckNumber == true )
            return;

        if ( values.phoneVerifyNumber.length != 6 )
            return;

        values.requestVerifyCheckNumber = true;

        try
        {
            let result = await Client.mutate({
                mutation: VerifyWithPhoneMutation,
                variables:{phoneNumber: values.phoneNumber, verifyNumber: values.phoneVerifyNumber }
            });
            result = result.data.verifyWithPhone;
            if ( result == 'invalidVerifyNumber' || result == 'notMatched')
            {

                Modal.info({
                    content: (
                        <div>
                            {
                                intl.formatMessage({ id: 'find.phone.verify.invalid.length' })
                            }
                        </div>
                    ),
                    onOk() { },
                });
                return;
            }
            else if ( result == 'success')
            {
                Modal.info({
                    content: (
                        <div>
                            {
                                intl.formatMessage({ id: 'signup.phone.verify.success' })
                            }
                        </div>
                    ),
                    onOk() { },
                });

                setValues(initial => {
                    return {
                        ...initial,
                        isPhoneVerified: true,
                    };
                });
            }
            else 
            {
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

                values.requestVerifyCheckNumber = false;
                return;
            }
            
            
        }
        catch
        {
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

            values.requestVerifyNumber = false;
        }       
    }

    const RequestPhoneVerifyNumber = async () =>{
        if ( values.requestVerifyNumber == true )
            return;

        if ( values.phoneNumber.length == 0 )
            return;

        values.requestVerifyNumber = true;

        try
        {
            const result = await Client.mutate({
                mutation: RequestVerifyWithPhoneMutation,
                variables:{phoneNumber: values.phoneNumber }
            });

            if ( result.data.requestVerifyWithPhone == false )
            {
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

                values.requestVerifyNumber = false;
                return;
            }

            setValues(initial => {
                return {
                    ...initial,
                    sendVerifyNumber: true,
                };
            });
        }
        catch
        {
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

            values.requestVerifyNumber = false;
        }       

    }

    const OnSignUp = async(account:string, password:string, emailFirst:string, emailSecond:string
        , phoneNumber:string, bitcoinDepositAddress:string, recommanderUserID: string
        ) => {
        if ( values.confirmDuplicateCheck == false )
        {
            Modal.info({
                title: intl.formatMessage({id:'signup.errorDescription'}),
                content: (
                    <div>
                        {
                            intl.formatMessage({id:'signup.requestAccountDuplicateCheck'})
                        }
                    </div>
                ),
                onOk() { },
            });
            return;
        }

        if ( values.password != values.passwordConfirm )
        {
            Modal.info({
                title: intl.formatMessage({id:'signup.errorDescription'}),
                content: (
                    <div>
                        {
                            intl.formatMessage({id:'signup.notEqualPassword'})
                        }
                    </div>
                ),
                onOk() { },
            });
            return;
        }

        if ( account.length == 0 || password.length == 0 || bitcoinDepositAddress.length == 0 || phoneNumber.length == 0 || emailFirst.length == 0 || emailSecond.length == 0 )
        {
            Modal.info({
                title: intl.formatMessage({id:'login.errorDescription'}),
                content: (
                    <div>
                        {
                            intl.formatMessage({id:'login.invalidAccount'})
                        }
                    </div>
                ),
                onOk() { },
            });
            return;            
        };
        
        var email = emailFirst+'@'+emailSecond;
        try{
            const result = await Client.mutate({
                mutation: SignUpMutation,
                variables:{account: account, password:password, email : email, phoneNumber: phoneNumber,
                    bitcoinDepositAddress: bitcoinDepositAddress, 
                    recommanderUserID : recommanderUserID.length> 0 ? Number(recommanderUserID) : null}
            });

            setValues(initial => {
                return {
                    ...initial,
                    goToLogin: true,
                };
            });
        }
        catch( error)
        {
            if ( error.graphQLErrors && error.graphQLErrors.length > 0 )
            {
                var errorMessage = error.graphQLErrors[0].message;
                var message = '';

                if ( errorMessage == 'invalidVerifyOperation' )
                {
                    message = intl.formatMessage({ id: 'signup.invalid.verify.operation' });
                }
                else if ( errorMessage == 'invalidVerify' ) 
                {
                    message = intl.formatMessage({ id: 'singup.invalid.verify' });
                }
                else if ( errorMessage == 'duplicateEmail' ) 
                {
                    message = intl.formatMessage({ id: 'signup.duplicate.email' });
                }
                else if ( errorMessage == 'duplicatePhoneNumber' ) 
                {
                    message = intl.formatMessage({ id: 'signup.duplicate.phoneNumber' });

                    setValues(initial => {
                        return {
                            ...initial,
                            requestVerifyCheckNumber : false,
                            sendVerifyNumber : false,
                            requestVerifyNumber : false,
                            isPhoneVerified: false
                        };
                    });
                }
                else if ( errorMessage == 'invalidRecommanderUserID' ) 
                {
                    message = intl.formatMessage({ id: 'signup.invalid.recommanderUserID' });
                }
                else 
                {
                    // 알수 없는 메시지..
                    message = intl.formatMessage({ id: 'common.server.error' });
                }

                Modal.info({
                    content: (
                        <div>
                            {
                                message
                            }
                        </div>
                    ),
                    onOk() { },
                });
            }
            else 
            {

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
    
    const OnDuplicateCheck = async(account:string)=>{
        try
        {
            const result = await Client.query({
                query: DuplicateCheckQuery,
                variables:{account: account}
            });

            setValues(initial => {
                return {
                    ...initial,
                    isDuplicateChecked: result.data.accountDuplicateCheck,
                    confirmDuplicateCheck: result.data.accountDuplicateCheck == false ? true : false, 
                };
            });
        }
        catch(error)
        {
            setValues(initial => {
                return {
                    ...initial,
                    isDuplicateChecked: true
                };
            });
        }
    }

    if (AppState.isLoggedIn) {
        return (<Redirect
            to={{
                pathname: "/",
                state: { from: props.location }
            }}
        />)
    }

    if (values.goToLogin) {
        return (<Redirect
            to={{
                pathname: "/login",
                state: { from: props.location }
            }}
        />)
    }
    return (
        <Layout  style={{background:'#F5F5F5'}}>
            <div style={{textAlign:'center'}}>
                <div>
                    <div style={{marginTop:'70px', marginBottom:'17px', fontSize:'30px', color:'#222222'}}>
                        <LocaleText id={'signup'}/>
                    </div>
                    <div style={{  marginBottom:'62px',fontSize:'16px', color:'#222222'}}>
                        <LocaleText id={'signup.description'}/>
                    </div>

                    <div className={'signup-form-container'}>
                        <Form style={{padding:'50px 110px 50px 110px'}}>
                            <div className={'form-item-text'}>
                                <FormattedMessage id={'recommanderUserID'}/>
                            </div>
                            <Form.Item>
                                <Input
                                className={'form-item-input'}
                                id="recommanderUserID" 
                                value={values.recommanderUserID}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValues(initial => {
                                        return {
                                            ...initial,
                                            recommanderUserID: value
                                        };
                                    });
                                }}
                                placeholder={intl.formatMessage({ id: 'input.recommanderUserID' })} />
                            </Form.Item>

                            <div className={'form-item-text'}>
                                <FormattedMessage id={'account'}/>
                            </div>
                            <Form.Item
                                style={{textAlign:'left'}}
                                help={ values.isDuplicateChecked ? intl.formatMessage({id:'signup.duplicate.account'}) : "" }
                                validateStatus={ values.isDuplicateChecked ? 'error' : 'success'}
                            >
                                <span>
                                    <Input id="account"
                                        className={'form-item-input'}
                                        style={{ width: '300px' }}
                                        value={values.account}
                                        disabled={values.confirmDuplicateCheck ? true : false}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setValues(initial => {
                                                return {
                                                    ...initial,
                                                    account: value
                                                };
                                            });
                                        }}
                                        placeholder={intl.formatMessage({ id: 'input.account' })} />
                                </span>
                                <span>
                                <Button
                                    className={'form-item-account-confirm'}
                                    size='large'
                                    type='primary'
                                    onClick={(e) => {
                                        e.preventDefault();
                                        OnDuplicateCheck(values.account);
                                    }} 
                                >
                                    <FormattedMessage id={'duplicateCheck'}/>
                                </Button>
                                </span>
                            </Form.Item>


                            <div className={'form-item-text'}>
                                <FormattedMessage id={'password'}/>
                            </div>
                            <Form.Item>
                                <Input id="password"   
                                className={'form-item-input'}                             
                                value={values.password}
                                type="password"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValues(initial => {
                                        return {
                                            ...initial,
                                            password: value
                                        };
                                    });
                                }}
                                placeholder={intl.formatMessage({ id: 'input.password' })} />
                            </Form.Item>

                            <div className={'form-item-text'}>
                                <FormattedMessage id={'password.confirm'}/>
                            </div>
                            <Form.Item>
                                <Input id="password.confirm"    
                                className={'form-item-input'}    
                                type="password"                        
                                value={values.passwordConfirm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValues(initial => {
                                        return {
                                            ...initial,
                                            passwordConfirm: value
                                        };
                                    });
                                }}
                                placeholder={intl.formatMessage({ id: 'input.password' })} />
                            </Form.Item>

                            <div className={'form-item-text'}>
                                <FormattedMessage id={'phoneNumber'}/>
                            </div>
                            <Form.Item style={{textAlign:'left'}}>
                                <span>
                                    <Input id="phoneNumber"
                                        className={'form-item-input'}
                                        style={{ width: isProductionBuild ? '300px' : '100%' }}
                                        value={values.phoneNumber}
                                        disabled={ (values.sendVerifyNumber && values.isPhoneVerified) ? true : false }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setValues(initial => {
                                                return {
                                                    ...initial,
                                                    phoneNumber: value
                                                };
                                            });
                                        }}
                                        placeholder={intl.formatMessage({ id: 'input.phoneNumber' })} />
                                </span>
                                <span style={{display: isProductionBuild ? 'inline' : 'none'}}>
                                    <Button
                                        className={'form-item-account-confirm'}
                                        size='large'
                                        type='primary'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if( values.requestVerifyNumber )
                                                return;

                                            RequestPhoneVerifyNumber();
                                        }}
                                    >
                                        <FormattedMessage id={'find.phone.verify'} />
                                    </Button>
                                </span>
                            </Form.Item>

                            <Form.Item style={{textAlign:'left', display : (values.sendVerifyNumber && values.isPhoneVerified == false)? 'inline' : 'none'}}>
                                <span>
                                    <Input id="phoneVerifyNumber"
                                        className={'form-item-input'}
                                        style={{ width: '300px' }}
                                        value={values.phoneVerifyNumber}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setValues(initial => {
                                                return {
                                                    ...initial,
                                                    phoneVerifyNumber: value
                                                };
                                            });
                                        }}
                                        placeholder={intl.formatMessage({ id: 'verify.number' })} />
                                </span>
                                <span >
                                    <Button
                                        className={'form-item-account-confirm'}
                                        size='large'
                                        type='primary'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if( values.requestVerifyCheckNumber )
                                                return;

                                            RequestPhoneVerifyCheckNumber();
                                        }}
                                    >
                                        <FormattedMessage id={'confirm'} />
                                    </Button>
                                </span>
                            </Form.Item>

                            <div className={'form-item-text'}>
                                <LocaleText id={'email.address'} />
                            </div>
                            <Form.Item>
                                <div style={{display: 'flex' }}>
                                    <Input
                                        className={'form-item-input'}   
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
                                        className={'form-item-input'}   
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
                            </Form.Item>
                            <div className={'form-item-text'}>
                                <FormattedMessage id={'bitcoinAddress'}/>
                            </div>
                            <Form.Item>
                                <Input id="bitcoinAddress"         
                                className={'form-item-input'}                       
                                value={values.bitcoinAddress}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValues(initial => {
                                        return {
                                            ...initial,
                                            bitcoinAddress: value
                                        };
                                    });
                                }}
                                placeholder={intl.formatMessage({ id: 'input.bitcoinAddress' })} />
                            </Form.Item>

                            <Button
                                className={'form-item-submit'}
                                size='large'
                                type='primary'
                                onClick={(e) => {
                                    e.preventDefault();
                                    OnSignUp(values.account, values.password, values.emailFirst, values.emailSecond, values.phoneNumber, values.bitcoinAddress, values.recommanderUserID);
                                }}
                            >
                                <FormattedMessage id={'signup'}/>
                            </Button>
                        </Form>
                    </div>
                </div>
            </div>
            </Layout>
        );
};

export default SignUp;