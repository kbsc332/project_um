import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView } from 'react-native';
import { Manager } from './Manager';
import SimpleModal from './SimpleModal';
import { Client } from './apollo/client';
import { RequestIssueMutation } from './apollo/query';

const scaleFactor = Dimensions.get('window').width / 360;

export class ServiceCenter extends React.Component 
{
    constructor(props)
    {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            email :'',
            content : '',

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
                        <Text style={{ fontSize: 15, color: '#222222' }}>고객 지원</Text>
                    </View>
                </View>
                <ScrollView>
                    <Image source={require('./assets/main_bg.png')} style={{ width: '100%', position: 'absolute', top: 0 }} />

                    <View style={{ marginTop: 59, alignItems: 'center', height: 150 }}>
                        <Text style={{ fontSize: 14, color: '#fff', textAlign: 'center' }}>등록 및 서비스 이용, 자세한 지침 등과 관련하여 추가 정보가 필요하시면 고객 지원 서비스에 설명을 요청할 수 있습니다.</Text>
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 56 }}>
                        <Text style={{ color: '#01467F', fontSize: 16 }}>고객 지원 서비스에 문의하기 </Text>
                    </View>

                    <View style={{margin:25}}>
                        <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
                            value={this.state.email}
                            enablesReturnKeyAutomatically
                            placeholder={'이메일 주소를 입력해주세요.'}
                            placeholderTextColor={'#BCBCBC'}
                            onChangeText={(text) => {
                                this.setState({email:text})
                            }} />

                        <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 200, marginBottom: 10 }}
                            value={this.state.content}
                            multiline={true}                            
                            placeholder={'굼금하신 점 또는 필요하신 내용을 말씀해주시면 좀 더 상세한 안내를 도와드립니다.'}
                            placeholderTextColor={'#BCBCBC'}
                            onChangeText={(text) => {
                                this.setState({ content: text })
                            }} />
                        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop:14}}>
                            <TouchableOpacity onPress={()=>{
                                if ( this.state.requested == false )
                                {
                                    this.state.requested = true;
                                    this.OnCreateIssue(this.state.email, this.state.content);
                                }
                            }}>
                            <View style={{ width: 100, height: 34, backgroundColor: '#01467F', borderRadius: 80, justifyContent: 'center', alignItems: 'center' }} >
                                <View >
                                    <Text style={{ color: '#fff', fontSize: 14 }}>제출하기</Text>
                                </View>
                            </View>
                            </TouchableOpacity>
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