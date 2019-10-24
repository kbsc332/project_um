import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView, Animated, Easing } from 'react-native';
import { Manager } from './Manager';
import SimpleModal from './SimpleModal';
import { Client } from './apollo/client';
import { RequestIssueMutation, RequestRouletteMutation, RequestDiceMutation } from './apollo/query';
import dataManager from './dataManager';
import SpriteSheet from 'rn-sprite-sheet';
import Modal from 'react-native-simple-modal';

const scaleFactor = Dimensions.get('window').width / 360;

var dice =[
    require('./assets/dice_1.png'),
    require('./assets/dice_2.png'),
    require('./assets/dice_3.png'),
    require('./assets/dice_4.png'),
    require('./assets/dice_5.png'),
    require('./assets/dice_6.png'),
]
export class EventDice extends React.Component 
{
    constructor(props)
    {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            rotateValue: new Animated.Value(0.0),
            requestStart : false,

            showModal: false,
            popupTitle: '',
            popupText: '',
            bottomText:'',
            modalCallback:null,

            showDiceModal: false,
        };
        this.dice1 = null;
        this.dice2 = null;
        this.ShowModal = this.ShowModal.bind(this);
        this.OnCloseModal = this.OnCloseModal.bind(this);
        this.OnStartDice = this.OnStartDice.bind(this);
    }

    ShowModal = (title: string, text: string, bottomText: string = '', modalCallback = null) => {
        this.setState({
            showModal: true,
            popupTitle: title,
            popupText: text,
            bottomText : bottomText,
            modalCallback:modalCallback,
        })
    }

    OnCloseModal = () => {
        this.setState({ showModal: false });
    }


    OnStartDice = async (even) => {
        const miningData :any = Manager.GetInstance().miningData;
        const miningVolume = Manager.GetInstance().getCurrentMiningVolumeAndSpeed();
        const now = Date.now();
        let eventVolume = 0;
        if (miningData.speedUpExpirationTime != 0) {
            // 지금 시간이, 이벤트 시간보다 클 경우 이벤트 시간까지만 따로 계산 해줘야함.
            var eventTime = ((now - miningData.speedUpExpirationTime > 0 ? miningData.speedUpExpirationTime : now) - miningData.updateTime) / (3600 * 24 * 1000);
            eventVolume = eventTime * miningData.speedUp;
        }
        const volume = miningVolume.volume + eventVolume;   

        if (volume < dataManager.getDiceNeedBitcoin()) {
            this.ShowModal('', '비트코인이 모자랍니다.', '확인' );
            return;
        }

        this.state.requestStart = true;

        try {
            const result = await Client.mutate({
                mutation: RequestDiceMutation,
                variables: { userID: Manager.GetInstance().user.userID, even: even },
                context: {
                    headers: {
                        accountID: Manager.GetInstance().user.accountID, session: Manager.GetInstance().user.session
                    }
                }
            });

            var win = result.data.requestDice.result;
            
            this.dice1.play({
                type: "dice" + result.data.requestDice.dice1,
                fps: 28,
                loop: false,
                resetAfterFinish: false, 
                onFinish: () => {
                    if (win == false) {
                        this.ShowModal('꽝', '다음 기회에 다시 도전하세요!', '확인', ()=>{
                            this.state.requestStart = false;
                        });
                    }
                    else{
                        this.ShowModal('축하 드립니다!', `${dataManager.getDiceRewardBitcoin() / 100000000} BTC가 즉시 지급 됩니다.`, '확인',()=>{
                            this.state.requestStart = false;
                        });
                    }
                } 
            })

            this.dice2.play({
                type: "dice" + result.data.requestDice.dice2,
                fps: 28,
                loop: false,
                resetAfterFinish: false,
                onFinish: () => {
                } 
            })
            Manager.GetInstance().UpdateMiningData(result.data.requestDice.miningData);
            
        }
        catch (error) {
            if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                var errorMessage = error.graphQLErrors[0].message;
                var message = '';

                if (errorMessage == 'alreadyEventUp') {
                    message = '이미 이벤트가 적용 중 입니다.'
                }
                else if (errorMessage == 'notEnoughBitcoin') {
                    message = '비트코인이 모자랍니다.'
                }
                else {
                    // 알수 없는 메시지..
                    message = '알수 없는 에러 입니다. 관리자에게 문의 해주시기 바랍니다.';
                }
                this.ShowModal('', message, '확인');
            }
            else {

                this.ShowModal('', '알수 없는 에러 입니다. 관리자에게 문의 해주시기 바랍니다.', '확인');
            }

            this.state.requestStart = false;
        }
    };

    render()
    {
        var user = Manager.GetInstance().user;
        var miningData = Manager.GetInstance().miningData;

        return (
            <View style={{ height: '100%' }}>
                <StatusBar hidden={true}></StatusBar>
                {/* Header */}
                <View style={{ height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ position: 'absolute', left: 12, top: 16 }}>
                        <TouchableOpacity onPress={() => {
                            this.props.OnClose();
                        }}>
                            <Image source={require('./assets/back.png')} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={{ fontSize: 15, color: '#222222' }}>이벤트</Text>
                    </View>
                </View>
                <ScrollView style={{padding:0}}>
                    <View style={{backgroundColor:'#A7264E'}}>
                    {/* <Image source={require('./assets/event_roulette_bottom_bg.png')} style={{ width: '100%', position: 'absolute', top: 0, zIndex:-1 }} /> */}
                        <Image source={require('./assets/event_roulette_top_bg.png')} style={{ width: '100%', position: 'absolute', top: 0 }} />
                        <View style={{ alignItems: 'center', marginTop: 15 }}>
                            <Image source={require('./assets/event_dice_title.png')} />
                        </View>
                        <View style={{marginTop:0, alignItems:'center'}}>
                            <View style={{width:310, paddingBottom:30, backgroundColor:'#fff', borderRadius:10}}>
                                <View style={{backgroundColor:'#5A5A5A', borderRadius:6, marginLeft:20, marginTop:-22, width:140, height:40, alignItems:'center', justifyContent:'center'}}>
                                    <Text style={{fontFamily:'Futura', fontSize:18, color:'#fff'}}>게임 참여 방법</Text>
                                </View>
                                <View style={{marginTop:20, marginLeft:15, marginRight:15}}>
                                    <Text style={{fontFamily:'NotoSans', includeFontPadding:false, fontSize:14}}>*주사위를 돌려 홀짝을 맞추면 0.0003BTC가 즉시 지급됩니다. </Text>
                                    <Text style={{fontFamily:'NotoSans', includeFontPadding:false, fontSize:14}}>*주사위 이벤트에 참여하기 위해서는 채굴된 코인 중 0.00015 BTC를 지불하여야 합니다.</Text>
                                    <Text style={{fontFamily:'NotoSans', includeFontPadding:false, fontSize:14}}>*아래 시작하기 버튼을 누르시면 주사위 이벤트가 시작됩니다.</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => {
                                    if (this.state.requestStart)
                                    {
                                        return;
                                    }

                            this.setState({ showDiceModal: true });
                        }}>
                            <View style={{ marginTop: 20, alignItems: 'center', height: 40, }}>
                                <View style={{ backgroundColor: '#FBB03B', width: 160, height: 40, borderRadius: 45, alignItems: 'center', justifyContent: 'center' }}>

                                    <Text style={{ color: '#fff', fontSize: 16 }}>시작하기</Text>
                                </View>
                            </View>
                        </TouchableOpacity> 

                        <View style={{alignItems: 'center', marginTop:-30, position:'relative'}}>
                            <View style={{ width: 318, height: 316, }}>
                                <Image source={require('./assets/event_dice_front.png')} style={{ position: 'absolute', width: 318, height: 316, top: 0 }} />
                            </View>
                            <View style={{ position: 'absolute',left:110, top : 100 }}>
                                <SpriteSheet
                                    ref={ref => (this.dice1 = ref)}
                                    source={require('./assets/dice_sprites.png')}
                                    columns={14}
                                    rows={1}
                                    width={128}
                                    imageStyle={{ marginTop: -1 }}
                                    animations={{
                                        dice1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                                        dice2: [0, 1, 2, 3, 4, 5, 6, 7, 9],
                                        dice3: [0, 1, 2, 3, 4, 5, 6, 7, 10],
                                        dice4: [0, 1, 2, 3, 4, 5, 6, 7, 11],
                                        dice5: [0, 1, 2, 3, 4, 5, 6, 7, 12],
                                        dice6: [0, 1, 2, 3, 4, 5, 6, 7, 13]
                                    }}
                                />
                            </View>
                            <View style={{ position: 'absolute', left:180, top :100  }}>
                                <SpriteSheet
                                    ref={ref => (this.dice2 = ref)}
                                    source={require('./assets/dice_sprites.png')}
                                    columns={14}
                                    rows={1}
                                    width={128}
                                    imageStyle={{ marginTop: -1 }}
                                    animations={{
                                        dice1: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                                        dice2: [0, 1, 2, 3, 4, 5, 6, 7, 9],
                                        dice3: [0, 1, 2, 3, 4, 5, 6, 7, 10],
                                        dice4: [0, 1, 2, 3, 4, 5, 6, 7, 11],
                                        dice5: [0, 1, 2, 3, 4, 5, 6, 7, 12],
                                        dice6: [0, 1, 2, 3, 4, 5, 6, 7, 13]
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <SimpleModal showModal={this.state.showModal} popupTitle={this.state.popupTitle} popupText={this.state.popupText} bottomText={this.state.bottomText} close={() => {
                    if ( this.state.modalCallback)
                        this.state.modalCallback();

                    this.setState({
                        showModal: false,
                        modalCallback: null
                    });
                }} />
                <Modal
                    open={this.state.showDiceModal}
                    closeOnTouchOutside={false}
                    disableOnBackPress={true}
                    modalStyle={{
                        borderRadius: 6,
                        margin: 40 * scaleFactor,
                        padding: 0,
                    }}
                >
                    <View style={{
                        flexDirection: 'row', height: 40 * scaleFactor,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Text></Text>
                        <View style={{ position: 'absolute', right: 15 * scaleFactor, top: 15 * scaleFactor }}
                        >
                            <TouchableOpacity onPress={() => {
                                this.setState({showDiceModal:false});
                            }}>
                                <Image source={require('./assets/close2.png')} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
                        <Text selectable>
                            룰렛 게임 참여를 위해 0.00015 BTC가 지불됩니다.
                        </Text>
                    </View>
                    <View style={{
                        height: 36 * scaleFactor,
                        backgroundColor: '#01467F',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection:'row'
                        
                    }}>
                        <TouchableOpacity onPress={() => {
                            this.setState({ showDiceModal: false });
                            this.OnStartDice(false);
                        }}>
                            <Text style={{ color: '#fff', fontSize: 14 }}>
                                홀수
                            </Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#fff', fontSize: 14 }}>
                            {'  /  '}
                        </Text>
                        <TouchableOpacity onPress={() => {
                            this.setState({ showDiceModal: false });
                            this.OnStartDice(true);
                        }}>
                            <Text style={{ color: '#fff', fontSize: 14 }}>
                                짝수
                            </Text>
                        </TouchableOpacity>
                        </View>
                </Modal>
            </View>
        );
    };
}