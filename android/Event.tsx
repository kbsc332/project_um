import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView } from 'react-native';
import { Manager } from './Manager';
import SimpleModal from './SimpleModal';
import { Client } from './apollo/client';
import { RequestIssueMutation } from './apollo/query';
import { EventRoulette } from './EventRoulette';
import { EventDice } from './EventDice';

const scaleFactor = Dimensions.get('window').width / 360;

export class Event extends React.Component 
{
    constructor(props)
    {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            email :'',
            content : '',

            showRoullete : false,
            showDice : false,
            requested : false,
            success : false,

            showModal: false,
            popupTitle: '',
            popupText: '',
            bottomText:'',
        };
        
        this.OnCreateIssue = this.OnCreateIssue.bind(this);
        this.ShowModal = this.ShowModal.bind(this);
        this.OnCloseModal = this.OnCloseModal.bind(this);
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

    OnCreateIssue = async ( email:string, text:string ) =>{
        if ( email.length == 0 || text.length == 0 )
        {
            this.ShowModal('문의 실패', '내용을 모두 입력하시기 바랍니다', '확인' );
            return;            
        };

        if ( email.indexOf('@') < 0 )
        {
            this.ShowModal('문의 실패', '이메일이 올바르지 않습니다', '확인' );
            return;     
        }
        
        try{
            const result = await Client.mutate({
                mutation: RequestIssueMutation,
                variables:{email: email, text:text}
            });

            this.state.success = true;
            
            this.ShowModal('문의 등록 완료', `고객 지원 서비스에 귀하의 문의 내용이 안전히 전송되었습니다. 문의 번호는 ${result.data.requestIssue} 입니다.`, '확인' );
        }
        catch( error)
        {
            this.ShowModal('문의 실패', '문의를 등록하지 못했습니다.', '확인' );
        }
        finally
        {
            this.state.requested = false;
        }
    };

    render()
    {
        var user = Manager.GetInstance().user;
        var miningData = Manager.GetInstance().miningData;
        if ( this.state.showRoullete )
        {
            return (
                <EventRoulette OnClose={()=>{
                    this.setState({showRoullete:false});
                }}/>
            )
        }
        else if ( this.state.showDice )
        {
            return (
                <EventDice OnClose={()=>{
                    this.setState({showDice:false});
                }}/>
            )
        }
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
                <ScrollView>
                    <Image source={require('./assets/main_bg.png')} style={{ width: '100%', position: 'absolute', top: 0 }} />

                    <View style={{ marginTop: 59, alignItems: 'center', height: 150 }}>
                        <Text style={{ fontSize: 14, color: '#fff', textAlign: 'center' }}>이벤트 게임에 참여해서 행운의 주인공이 되어보세요.</Text>
                    </View>
                    <View style={{margin:25}}>
                        <View>
                            <Image source={require('./assets/event_1.png')} style={{width:346, height:168 }} width={346} height={168}></Image>
                            <View style={{position:'absolute', left:176, top:89,  width: 110}}>
                            <TouchableOpacity onPress={()=>{
                                this.setState({showRoullete:true})
                                }}>
                                    <View style={{ backgroundColor: '#6307A5', borderRadius: 45, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#fff', fontSize: 12 }}>시작하기</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Image source={require('./assets/event_2.png')} style={{width:339, height:168 }} width={339} height={168}></Image>
                            <View style={{position:'absolute', left:176, top:89,  width: 110}}>
                            <TouchableOpacity onPress={()=>{                                
                                this.setState({showDice:true})
                            }}>
                                    <View style={{ backgroundColor: '#FBB03B', borderRadius: 45, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#fff', fontSize: 12 }}>시작하기</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };
}