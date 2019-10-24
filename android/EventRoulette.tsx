import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView, Animated } from 'react-native';
import { Manager } from './Manager';
import SimpleModal from './SimpleModal';
import { Client } from './apollo/client';
import { RequestIssueMutation, RequestRouletteMutation } from './apollo/query';
import dataManager from './dataManager';

const scaleFactor = Dimensions.get('window').width / 360;

export class EventRoulette extends React.Component 
{
    constructor(props)
    {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            rotateValue: new Animated.Value(0.0),
            targetRotate: 720,
            requestStart : false,

            showModal: false,
            popupTitle: '',
            popupText: '',
            bottomText:'',
        };
        
        this.ShowModal = this.ShowModal.bind(this);
        this.OnCloseModal = this.OnCloseModal.bind(this);
        this.OnStartRoulette = this.OnStartRoulette.bind(this);
    }

    ShowModal = (title: string, text: string, bottomText: string = '') => {
        this.setState({
            showModal: true,
            popupTitle: title,
            popupText: text,
            bottomText : bottomText,
        })
    }

    OnCloseModal = () => {
        this.setState({ showModal: false });
    }


    OnStartRoulette = async () => {
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

        if (volume < dataManager.getRouletteNeedBitcoin()) {
            this.ShowModal('', '비트코인이 모자랍니다.', '확인' );
            return;
        }

        if ( miningData.speedUpExpirationTime != 0 )
        {

            this.ShowModal('', '이미 이벤트가 적용 중 입니다.', '확인' );
            return;
        }

        this.state.requestStart = true;

        try {
            const result = await Client.mutate({
                mutation: RequestRouletteMutation,
                variables: { userID: Manager.GetInstance().user.userID }
            });

            this.state.requestStart = false;

            var index = result.data.requestRoulette.result;

            var rouletteData = dataManager.getRouletteEvent(index);
            if (rouletteData == null) {
                // 서버는 성공 했는데.. 프론트쪽 데이터와 싱크가 안맞나 보다.
                throw new Error('dataError');
            }
            else {
                this.setState({
                    targetRotate: (1080 + 360 - ((360 / 8) * (index)))
                })

                Animated.timing(this.state.rotateValue, {
                    duration: 3000,
                    toValue: this.state.targetRotate,
                  }).start();
 
                if ( rouletteData.speed == 0 )
                {
                    this.ShowModal('', '다음 기회에 다시 도전하세요!', '확인');
                }
                else 
                {

                    this.ShowModal('축하 드립니다!', `채산성이 ${rouletteData.speed / 100000000} BTC 빨라집니다.`, '확인');
                }
            }

            Manager.GetInstance().UpdateMiningData(result.data.requestRoulette.miningData);
            
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
                            <Image source={require('./assets/event_textbox.png')} />
                        </View>
                        <View style={{marginTop:0, alignItems:'center'}}>
                            <View style={{width:310, paddingBottom:30, backgroundColor:'#fff', borderRadius:10}}>
                                <View style={{backgroundColor:'#5A5A5A', borderRadius:6, marginLeft:20, marginTop:-22, width:140, height:40, alignItems:'center', justifyContent:'center'}}>
                                    <Text style={{fontFamily:'Futura', fontSize:18, color:'#fff'}}>게임 참여 방법</Text>
                                </View>
                                <View style={{marginTop:20, marginLeft:15, marginRight:15}}>
                                    <Text style={{fontFamily:'NotoSans', fontSize:14, includeFontPadding:false }}>*룰렛 이벤트에 참여하기 위해서는 채굴된 코인 중 0.00003 BTC를 지불하여야 합니다.</Text>
                                    <Text style={{fontFamily:'NotoSans', fontSize:14, includeFontPadding:false }}>*아래 시작하기 버튼을 누르시면 룰렛 이벤트가 시작됩니다.</Text>
                                    <Text style={{fontFamily:'NotoSans', fontSize:14, includeFontPadding:false }}>*당첨된 채굴 속도 향상권은 한 시간동안 유효합니다.</Text>
                                </View>
                            </View>
                        </View>
                        <View style={{marginTop:20, alignItems:'center', }}>
                            <TouchableOpacity onPress={()=>{
                                if ( this.state.requestStart )
                                    return;

                                this.OnStartRoulette();
                            }}>
                            <View style={{backgroundColor:'#6307A5', width:160, height:40, borderRadius:45, alignItems:'center', justifyContent:'center'}}>
                                <Text style={{color:'#fff', fontSize:16}}>시작하기</Text>
                            </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{alignItems: 'center', marginTop:-30}}>
                            <View style={{ width: 297,height:378 }}>
                                <Image source={require('./assets/roulette_spin_board_back.png')} style={{ width:297, height:378, position: 'absolute', top: 0 }} />
                                <Animated.View style={{
                                    transform: [{
                                        rotate: this.state.rotateValue.interpolate({
                                            inputRange: [0, this.state.targetRotate],
                                            outputRange: ['0deg', this.state.targetRotate+'deg'],
                                        })
                                        }], width:297, height:378}}>
                                <Image source={require('./assets/roulette_spin_board.png')} style={{ width:297, height:378,  position: 'absolute', top: 0 }} />
                                </Animated.View>
                                <Image source={require('./assets/roulette_spin_board_front.png')} style={{  width:297, height:378, position: 'absolute', top: 0 }} />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <SimpleModal showModal={this.state.showModal} popupTitle={this.state.popupTitle} popupText={this.state.popupText} bottomText={this.state.bottomText} close={() => {
                    this.setState({
                        showModal: false
                    });
                    
                    if ( this.state.success )
                        this.props.OnClose();
                }} />
            </View>
        );
    };
}