
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Input, Modal } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import { LocaleText } from '../styled';
import {Redirect} from 'react-router-dom';
import {Client} from '../apollo/client';
import {RequestIssueMutation} from '../apollo/query';


//assets

const { Content } = Layout;
const { TextArea } = Input;

const ServiceCenter: React.FC<any> = (props) => {
    const intl = useIntl();
    const [values, setValues] = useState({
        email:'', 
        text:'',
        goToHome: false,
    });

    const OnCreateIssue = async ( email:string, text:string ) =>{
        if ( email.length == 0 || text.length == 0 )
        {
            Modal.info({
                title: intl.formatMessage({id:'service.errorDescription'}),
                content: (
                    <div>
                        {
                            intl.formatMessage({id:'service.errorDescription.invalidContext'})
                        }
                    </div>
                ),
                onOk() { },
            });
            return;            
        };

        if ( email.indexOf('@') < 0 )
        {
            Modal.info({
                title: intl.formatMessage({id:'service.errorDescription'}),
                content: (
                    <div>
                        {
                            intl.formatMessage({id:'service.errorDescription.invalidEmail'})
                        }
                    </div>
                ),
                onOk() { },
            });
            return;     
        }
        
        try{
            const result = await Client.mutate({
                mutation: RequestIssueMutation,
                variables:{email: email, text:text}
            });
            
            Modal.info({
                title: intl.formatMessage({id:'service.success'}),
                content: (
                    <div>
                        {
                            intl.formatMessage(
                                {id:'service.success.description'},
                                 {value:result.data.requestIssue, n:<br />}
                                 )
                        }
                    </div>
                ),
                onOk() {
                    //이동..
                 },
            });
        }
        catch( error)
        {
            Modal.info({
                title: intl.formatMessage({id:'service.errorDescription'}),
                content: (
                    <div>
                        {
                            intl.formatMessage({id:'service.invalidError'})
                        }
                    </div>
                ),
                onOk() {    setValues(initial => {
                    return {
                        ...initial,
                        goToHome: true
                    };
                });},
            });
        }
    };

    if ( values.goToHome == true )
    {
        return (<Redirect
            to={{
                pathname: "/",
                state: { from: props.location }
            }}
        />)
    }

    return (
        <Layout>           
        <div className={'main-top-bg'}>
    <img className={'main-top-bg-img'} src="/images/main_top_bg.png" alt="home" />
    </div>
                <Content>
                    <div className={'service-top-container'}>
                        <div>
                            <div className={'service-title'} >
                                <LocaleText id={'customerSupport'}/>
                            </div>
                            <div className={'service-sub-title'} >    
                                <LocaleText id={'service.description'}/>                        
                            </div>
                        </div>
                    </div>                                          
            </Content>
            <Content>
                <div style={{ marginTop: '103px', marginBottom: '100px' }}>
                    <div className={'service-form-container'}>
                        <Form>
                            <div className={'form-title'}>
                                <LocaleText id={'service.form.description'} />
                            </div>

                            <Form.Item>
                                <Input
                                    className={'form-item-input'}
                                    id="email"
                                    value={values.email}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setValues(initial => {
                                            return {
                                                ...initial,
                                                email: value
                                            };
                                        });
                                    }}
                                    placeholder={intl.formatMessage({ id: 'service.input.email' })} />
                            </Form.Item>
                            <Form.Item>
                                <TextArea
                                className={'form-item-input'}
                                id="text" 
                                value={values.text}
                                style={{height:'300px'}}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setValues(initial => {
                                        return {
                                            ...initial,
                                            text: value
                                        };
                                    });
                                }}
                                placeholder={intl.formatMessage({ id: 'service.input.text' })} />
                            </Form.Item>

                            <Button
                                className={'form-item-submit'}
                                size='large'
                                type='primary'
                                onClick={(e) => {
                                    e.preventDefault();
                                    OnCreateIssue(values.email, values.text);
                                }}
                            >
                                <FormattedMessage id={'service.submit'}/>
                            </Button>
                        </Form>
                    </div>
                </div>
            </Content>
        </Layout>
        );
};

export default ServiceCenter;