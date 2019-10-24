import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState } from 'react-native';
import { Manager } from './Manager';
import dataManager from './dataManager';
import SimpleModal from './SimpleModal';

const scaleFactor = Dimensions.get('window').width / 360;

export class PackageCard extends React.Component {

    constructor(props) {
        super(props)
    }
    render() {
        const packageData = dataManager.getPackageData(this.props.index);
        return (
            <View style={{ marginBottom: 40 }}>
                <View style={{
                    width: 260, height: 350,
                    backgroundColor: '#fff',
                    elevation: 8,
                    marginRight: 10,
                }}>
                    <Image source={require('./assets/package_bg.png')} style={{ width: '100%', position: 'absolute', top: 0 }} />
                    <View style={{ height: 40, backgroundColor: '#1A4469', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#FFFFFF', fontFamily: 'Futura', fontSize: 16 }}>{packageData.title}</Text>
                    </View>
                    <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('./assets/package_1.png')}></Image>
                    </View>
                    <View style={{ backgroundColor: '#fff', height: 160 }}>
                        <View style={{ marginTop: 19, marginLeft: 27, marginRight: 27 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '30%' }}>
                                    <Text style={{ color: '#262626', fontSize: 12 }}>채산성</Text>
                                </View>
                                <View style={{ width: '70%', flexDirection: 'row', alignItems: 'flex-end' }}>

                                    <Text style={{ color: '#262626', fontFamily: 'Futura', fontSize: 16 }}>{packageData.volume / 100000000}</Text>
                                    <Text style={{ color: '#262626', fontFamily: 'Futura', fontSize: 12 }}> BTC/일</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: '30%' }}>
                                    <Text style={{ color: '#262626', fontSize: 12 }}>가격</Text>
                                </View>
                                <View style={{ width: '70%', flexDirection: 'row', alignItems: 'flex-end' }}>

                                    <Text style={{ color: '#262626', fontFamily: 'Futura', fontSize: 16 }}>{packageData.price / 100000000}</Text>
                                    <Text style={{ color: '#262626', fontFamily: 'Futura', fontSize: 12 }}> BTC</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
                                <TouchableOpacity onPress={() => {
                                    if (this.props.ChangeMenu)
                                        this.props.ChangeMenu('package');
                                    else if ( this.props.OnUpgrade) 
                                        this.props.OnUpgrade();
                                }}>
                                    <View style={{
                                        width: 100, height: 34, backgroundColor: '#FBB03B', borderRadius: 25,
                                        shadowColor: "#FBB03B",
                                        shadowOffset: {
                                            width: 0,
                                            height: 0,
                                        },
                                        elevation: 8,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Text style={{ color: '#fff' }}>업그레이드</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

            </View>
        );
    }
}