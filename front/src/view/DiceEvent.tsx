import React, { useState } from 'react';
import { Layout, Modal } from 'antd';
import { useIntl, FormattedMessage } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { Client } from '../apollo/client';
import { RequestDiceMutation } from '../apollo/query';
import { UseRedux } from '../store/store';
import styled, { LocaleText, Keyframes } from '../styled';
import { Link, Redirect } from 'react-router-dom';
import { keyframes } from 'styled-components';
import Spritesheet from '../Spritesheet';

//assets

const { Content } = Layout;

const DiceEvent: React.FC<any> = (props) => {
    const intl = useIntl();

    const [values, setValues] = useState({
        requestStart: false,
        rotationDegree: 0,
        dice1: null,
        dice2: null,
        dice1_value: 0,
        dice2_value: 0,
        result : false,
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

    const titleImageSrc = '/images/dice_title_' + lang + '.png';
    const subTitleImageSrc = '/images/dice_subTitle_' + lang + '.png';

    const OnStartDice = async (even : boolean) => {
        const miningData: any = AppState.miningData;

        const now = Date.now();
        let eventVolume = 0;
        if (miningData.speedUpExpirationTime != 0) {
            // 지금 시간이, 이벤트 시간보다 클 경우 이벤트 시간까지만 따로 계산 해줘야함.
            var eventTime = ((now - miningData.speedUpExpirationTime > 0 ? miningData.speedUpExpirationTime : now) - miningData.updateTime) / (3600 * 24 * 1000);
            eventVolume = eventTime * miningData.speedUp;
        }
        const time = (now - miningData.updateTime) / (3600 * 24 * 1000);
        const volume = miningData.speed * time + miningData.volume;

        if (volume < dataManager.getDiceNeedBitcoin()) {
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

        setValues(initial => {
            return {
                ...initial,
                requestStart: true
            };
        });

        try {
            const result = await Client.mutate({
                mutation: RequestDiceMutation,
                variables: { userID: AppState.user.userID, even : even },
                context: {
                    headers: {
                        accountID: AppState.user.accountID, session: AppState.user.session
                    }
                }
            });

            var win = result.data.requestDice.result;
            
            var dice1 = result.data.requestDice.dice1;
            var dice2 = result.data.requestDice.dice2;

            setValues(initial => {
                return {
                    ...initial,
                    requestStart: false,
                    dice1_value : dice1,
                    dice2_value : dice2,
                    result : win
                };
            });
            var diceRef1 : any = values.dice1;
            diceRef1.play();

            var diceRef2 : any  = values.dice2;
            diceRef2.play();

            AppActions.updateMiningData(result.data.requestDice.miningData);

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

    const showResultPopup = () => {
        if (values.result == false) {
            Modal.info({
                content: (
                    <div style={{ textAlign: 'center', color: '#262626' }}>
                        <div style={{ margin: 'auto', lineHeight: '172px', background: 'url("/images/event_boom_icon.png")', width: '209px', height: '172px' }}>
                            <span style={{ fontSize: '40px' }}> {
                                intl.formatMessage({ id: 'event.dice.boom.title' })
                            }</span>
                        </div>
                        <div style={{ fontSize: '20px', marginTop: '30px' }}>
                            {
                                intl.formatMessage({ id: 'event.dice.boom.description' })
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
                                intl.formatMessage({ id: 'event.dice.prize.tile' })
                            }
                        </div>
                        <div style={{ fontSize: '20px' }}>
                            {
                                intl.formatMessage({ id: 'event.dice.prize.description' }, { value: dataManager.getDiceRewardBitcoin() / 100000000 })
                            }
                        </div>
                        <div style={{ marginTop: '40px' }}>
                            <img src={'/images/event_prize_icon.png'}></img>
                        </div>
                        <div style={{ color: '#262626', marginTop: '30px', fontSize: '30px', fontFamily: 'Futura' }}>
                            {
                                intl.formatMessage({ id: 'event.dice.prize.description.message' }, { value: dataManager.getDiceRewardBitcoin() / 100000000 })
                            }
                        </div>
                    </div>
                ),
                onOk() { },
            });
        }
    }
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
                                    <LocaleText id={'event.dice.description'} />
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
                                <FormattedMessage id={'event.dice.game.description'} values={{ n: <br />, needBitcoin: (dataManager.getDiceNeedBitcoin() / 100000000) }} />
                            </div>
                            {AppState.isLoggedIn ? (
                                <div className={'event-start-button'} onClick={() => {
                                    if (values.requestStart)
                                        return;
                                    Modal.info({
                                        okCancel: true,
                                        content: (
                                            <div style={{ textAlign: 'center' }}>
                                                <div>
                                                    {
                                                        intl.formatMessage({ id: 'event.dice.game.start.description' }, { value: dataManager.getDiceNeedBitcoin() / 100000000 })
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
                                        okText: "짝수",
                                        cancelText : "홀수",
                                        onOk() {
                                            OnStartDice(true);
                                        },
                                        onCancel() {
                                            OnStartDice(false);
                                        }
                                        
                                    });
                                }}>
                                    <div className={'box'} style={{ background: '#DE9B32' }} >
                                        시작하기
                                </div>
                                </div>
                            ) : (
                                    // 로그인이 되어 있지 않으므로, 로그인 창으로...
                                    <Link to={'/login'}>
                                        <div className={'event-start-button'}>
                                            <div className={'box'} style={{ background: '#DE9B32' }} >
                                                시작하기
                                            </div>
                                        </div>
                                    </Link>)}
                        </div>
                        <div style={{position:'relative'}}>
                            <div style={{ marginTop: '-40px', marginRight: '0px' }}>
                                <img src={'/images/dice_board.png'} />
                            </div>
                            <div style={{ 
                             position:'absolute', left:30, top : 90}}>
                                <Spritesheet
                                    id={1}
                                    image={'/images/dice_sprites.png'}
                                    widthFrame={460}
                                    heightFrame={431}
                                    fps={16}
                                    steps={8}
                                    direction={`forward`}
                                    autoplay={false}
                                    loop={true}
                                    getInstance={(spritesheet: any) => {
                                        values.dice1 = spritesheet;
                                    }}
                                    onLoopComplete={(spritesheet: any) => {
                                        global.console.log(values.dice1_value)
                                        spritesheet.goToAndPause(7 + values.dice1_value)
                                        setTimeout(()=>{showResultPopup();}, 300)
                                        
                                    }}
                                ></Spritesheet>
                            </div>
                            <div style={{  
                             position:'absolute', left:240, top : 120}}>
                                <Spritesheet
                                    id={2}
                                    image={'/images/dice_sprites.png'}
                                    widthFrame={460}
                                    heightFrame={431}
                                    fps={16}
                                    steps={8}
                                    direction={`forward`}
                                    autoplay={false}
                                    loop={true}
                                    getInstance={(spritesheet: any) => {
                                        values.dice2 = spritesheet;
                                    }}
                                    onLoopComplete={(spritesheet: any) => {
                                        global.console.log(values.dice2_value)
                                        spritesheet.goToAndPause(7 + values.dice2_value)
                                    }}
                                ></Spritesheet>
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
        </div>
    );
};

export default DiceEvent;