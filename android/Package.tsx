import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView } from 'react-native';
import { Manager } from './Manager';
import { PackageCard } from './PackageCard';
import SimpleModal from './SimpleModal';
import dataManager from './dataManager';

const scaleFactor = Dimensions.get('window').width / 360;
export class Package extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            showModal: false,
            popupTitle: '',
            popupText: '',
            bottomText: '',
        }

        this.ShowModal = this.ShowModal.bind(this)
        this.OnUpgrade = this.OnUpgrade.bind(this)
    }

    ShowModal = (title: string, text: string, bottomText: string = '') => {
        this.setState({
            showModal: true,
            popupTitle: title,
            popupText: text,
            bottomText: bottomText,
        })
    }

    OnUpgrade = (index ) => {
        var packageData = dataManager.getPackageData(index);
        this.ShowModal('', `귀하의 채굴량 + 보유 포인트의 합이 ${packageData.price / 100000000} BTC 보다 높아지면, 해당 패키지가 적용 됩니다.`, '확인')
    }

    render() {
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
                        <Text style={{ fontSize: 15, color: '#222222' }}>패키지 정보</Text>
                    </View>
                </View>
                <ScrollView>
                    <Image source={require('./assets/main_bg.png')} style={{ width: '100%', position: 'absolute', top: 0 }} />

                    <View style={{ marginTop: 59, alignItems: 'center', height: 150 }}>
                        <Text style={{ fontSize: 12, fontFamily:'NotoSans', includeFontPadding:false, color: '#fff', textAlign: 'center' }}>{'채굴속도를 업그레이드해서 \n더욱 채계화된 마이닝을 하실 수 있습니다.'}</Text>
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <PackageCard index={1} OnUpgrade={()=>{this.OnUpgrade(1);}}/>
                        <PackageCard index={2} OnUpgrade={()=>{this.OnUpgrade(2);}}/>
                        <PackageCard index={3} OnUpgrade={()=>{this.OnUpgrade(3);}}/>
                        <PackageCard index={4} OnUpgrade={()=>{this.OnUpgrade(4);}}/>
                        <PackageCard index={5} OnUpgrade={()=>{this.OnUpgrade(5);}}/>
                        <PackageCard index={6} OnUpgrade={()=>{this.OnUpgrade(6);}}/>
                    </View>
                </ScrollView>

                <SimpleModal showModal={this.state.showModal} popupTitle={this.state.popupTitle} popupText={this.state.popupText} bottomText={this.state.bottomText} close={() => {
                    this.setState({
                        showModal: false
                    });
                }} />
            </View>
        );
    }
}