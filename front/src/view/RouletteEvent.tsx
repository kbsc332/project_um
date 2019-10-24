import React, { useState } from 'react';
import { Layout, Modal } from 'antd';
import { useIntl, FormattedMessage } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { Client } from '../apollo/client';
import { RequestRouletteMutation } from '../apollo/query';
import { UseRedux } from '../store/store';
import styled , { LocaleText, Keyframes  } from '../styled';
import { Link, Redirect } from 'react-router-dom';
import { keyframes } from 'styled-components';


//assets

const { Content } = Layout;

const RouletteEvent: React.FC<any> = (props) => {
    const intl = useIntl();

    const [values, setValues] = useState({
        requestStart: false,
        rotationDegree: 0,
        resultIndex:0
        });

    //background:linear-gradient( 45deg, #A7264E, #7C122F, #400A11), url("/images/metal_background.png");
    const [AppState, AppActions] = UseRedux();

    if ( AppState.isLoggedIn == false )
    {
      return (<Redirect
          to={{
              pathname: "/login",
              state: { from: props.location }
          }}
      />)
    }

    var lang = localStorage.getItem('language');
    if (lang == null)
        lang = 'ko';
        
    const titleImageSrc = '/images/roulette_title_' + lang + '.png';
    const subTitleImageSrc = '/images/roulette_subTitle_' + lang + '.png';

    const OnStartRoulette = async () => {
        const miningData :any = AppState.miningData;
        const miningVolume = dataManager.getCurrentMiningVolumeAndSpeed(AppState.user, AppState.miningData);
        const now = Date.now();
        let eventVolume = 0;
        if (miningData.speedUpExpirationTime != 0) {
            // 지금 시간이, 이벤트 시간보다 클 경우 이벤트 시간까지만 따로 계산 해줘야함.
            var eventTime = ((now - miningData.speedUpExpirationTime > 0 ? miningData.speedUpExpirationTime : now) - miningData.updateTime) / (3600 * 24 * 1000);
            eventVolume = eventTime * miningData.speedUp;
        }
        const volume = miningVolume.volume + eventVolume;   

        if (volume < dataManager.getRouletteNeedBitcoin()) {
            Modal.info({
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'event.not.enough.bitcoin' })
                        }
                    </div>
                ),
                onOk() { },
            });
            return;
        }

        if ( miningData.speedUpExpirationTime != 0 )
        {
            Modal.info({
                content: (
                    <div>
                        {
                            intl.formatMessage({ id: 'event.roulette.already.start' })
                        }
                    </div>
                ),
                onOk() { },
            });
            return;
        }

        setValues(initial => {
            return {
                ...initial,
                requestStart: true
            };
        });

        try {
            const result = await Client.mutate({
                mutation: RequestRouletteMutation,
                variables: { userID: AppState.user.userID },
                context: {
                    headers: {
                        accountID: AppState.user.accountID, session: AppState.user.session
                    }
                }
            });

            var index = result.data.requestRoulette.result + 1;
            console.log(index);
            var rouletteData = dataManager.getRouletteEvent(index);
            console.log(rouletteData);
            if (rouletteData == null) {
                // 서버는 성공 했는데.. 프론트쪽 데이터와 싱크가 안맞나 보다.
                throw new Error('dataError');
            }
            else {
                setValues(initial => {
                    return {
                        ...initial,
                        rotationDegree: -(1080 + (360 / 8) * (index)),
                        resultIndex : index
                    };
                });

                setTimeout(() => {
                    var rouletteData : any = dataManager.getRouletteEvent(values.resultIndex);
                    if (rouletteData.speed == 0) {
                        Modal.info({
                            content: (
                                <div style={{ textAlign: 'center', color: '#262626' }}>
                                    <div style={{ margin: 'auto', lineHeight: '172px', background: 'url("/images/event_boom_icon.png")', width: '209px', height: '172px' }}>
                                        <span style={{ fontSize: '40px' }}> {
                                            intl.formatMessage({ id: 'event.roulette.boom.title' })
                                        }</span>
                                    </div>
                                    <div style={{ fontSize: '20px', marginTop: '30px' }}>
                                        {
                                            intl.formatMessage({ id: 'event.roulette.boom.description' })
                                        }
                                    </div>
                                </div>
                            ),
                            onOk() { },
                        });
                    }
                    else {
                        Modal.info({
                            content: (
                                <div style={{ textAlign: 'center', color: '#262626' }}>
                                    <div style={{ fontSize: '26px' }}>
                                        {
                                            intl.formatMessage({ id: 'event.roulette.prize.tile' })
                                        }
                                    </div>
                                    <div style={{ fontSize: '20px' }}>
                                        {
                                            intl.formatMessage({ id: 'event.roulette.prize.description' }, { value: rouletteData.speed / 100000000 })
                                        }
                                    </div>
                                    <div style={{ marginTop: '40px' }}>
                                        <img src={'/images/event_prize_icon.png'}></img>
                                    </div>
                                    <div style={{ color: '#262626', marginTop: '30px', fontSize: '30px', fontFamily: 'Futura' }}>
                                        {rouletteData.speed / 100000000} BTC UP
                        </div>
                                </div>
                            ),
                            onOk() { },
                        });
                    }
                    values.requestStart = false;

                }, 3300);
            }

            AppActions.updateMiningData(result.data.requestRoulette.miningData);
            
        }
        catch (error) {
            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                var errorMessage = error.graphQLErrors[0].message;
                var message = '';

                if (errorMessage == 'invalidAuth') {
                    Modal.info({
                        content: (
                            <div>
                                {
                                    intl.formatMessage({ id: 'login.invalidSession' })
                                }
                            </div>
                        ),
                        onOk() {
                            AppActions.logOutUser();
                        },
                    });
                    return;
                }
                else if (errorMessage == 'alreadyEventUp') {
                    message = intl.formatMessage({ id: 'event.roulette.already.start' });
                }
                else if (errorMessage == 'notEnoughBitcoin') {
                    message = intl.formatMessage({ id: 'event.not.enough.bitcoin' });
                }
                else {
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

            setValues(initial => {
                return {
                    ...initial,
                    requestStart: false
                };
            });
        }
    };

    var spin = keyframes`
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(${values.rotationDegree}deg);
        }
    `

    const Spin = styled.img`
        transform-origin: 333px 322px;
    animation: ${spin} 3s ease-out;
    animation-fill-mode: forwards;
    `;

    return (
        <div className={'bg'}>
            
            <img className={'main-top-bg'} src="/images/roulette_background.png" style={{ opacity: 0.8 }} />
            <Layout className={'event'}>
                <Content style={{ zIndex: 1 }}>
                    <div className={'event-top-container'}>
                        <div className={'sub-title'}>
                            <div className={'event-title'} style={{ color: '#19588D', marginLeft: 'auto' }}>
                                <img src={subTitleImageSrc} />
                            </div>
                            <div className={'sub-title-textbox'} style={{ marginRight: 'auto' }}>
                                <div style={{ padding: '30px', paddingBottom: '20px' }}>
                                    <LocaleText id={'event.roulette.description'} />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '-60px' }}>
                            <img src={titleImageSrc} />
                        </div>
                    </div>
                </Content>
                <Content style={{ zIndex: 1 }}>
                    <div style={{ marginBottom: '282px', display: 'flex' }}>
                        <div style={{ marginTop: '100px' }}>
                            <div className={'event-description-title'}>
                                <LocaleText id={'event.description.game.title'} />
                            </div>
                            <div className={'event-description-box'}>
                                <FormattedMessage id={'event.roulette.game.description'} values={{n : <br/>, needBitcoin: (dataManager.getRouletteNeedBitcoin() / 100000000)}} />
                            </div>
                            { AppState.isLoggedIn ? (
                            <div className={'event-start-button'} onClick={() => {
                                if ( values.requestStart )
                                    return;
                                Modal.info({
                                    content: (
                                        <div style={{ textAlign: 'center' }}>
                                            <div>
                                                {
                                                    intl.formatMessage({ id: 'event.roulette.game.start.description' }, { value: dataManager.getRouletteNeedBitcoin() / 100000000 })
                                                }
                                            </div>
                                            <div style={{ marginTop: '40px' }}>
                                                <img src={'/images/event_coin_icon.png'}></img>
                                            </div>
                                            <div style={{ color: '#262626', marginTop: '30px', fontSize: '30px', fontFamily: 'Futura' }}>
                                                -{dataManager.getRouletteNeedBitcoin() / 100000000} BTC
                                            </div>
                                        </div>
                                    ),
                                    onOk() { OnStartRoulette() },
                                });
                            }}>
                                <div className={'box'} >
                                    시작하기
                                </div>
                                </div>
                            ) : (
                                    // 로그인이 되어 있지 않으므로, 로그인 창으로...
                                    <Link to={'/login'}>
                                        <div className={'event-start-button'}>
                                            <div className={'box'} >
                                                시작하기
                                            </div>
                                        </div>
                                    </Link>)}
                        </div>
                        <div style={{ marginRight: '-50px' }}>
                            <img src={'/images/roulette_spin_board_back.png'} style={{ position: 'absolute' }} />
                            { values.rotationDegree == 0 ? (
                            <img src={'/images/roulette_spin_board.png'} style={{ 
                                position: 'absolute'                          
                                 }} >
                                </img>) : (
                            <Spin src={'/images/roulette_spin_board.png'} style={{ 
                                position: 'absolute'                          
                                 }} >
                                </Spin>) }
                            <img src={'/images/roulette_spin_board_front.png'} style={{ position: 'absolute' }} />
                        </div>
                    </div>
                </Content>
            </Layout>
        </div>
    );
};

export default RouletteEvent;