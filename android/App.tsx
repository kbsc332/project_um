
// var areIntlLocalesSupported = require('intl-locales-supported');

// var localesMyAppSupports = [
//   /* list locales here */
//   'ko'
// ];

// if (global.Intl) {
//   // Determine if the built-in `Intl` has the locale data we need.
//   if (!areIntlLocalesSupported(localesMyAppSupports)) {
//     // `Intl` exists, but it doesn't have the data we need, so load the
//     // polyfill and patch the constructors we need with the polyfill's.
//     var IntlPolyfill = require('intl');
//     Intl.NumberFormat = IntlPolyfill.NumberFormat;
//     Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat;
//   }
// } else {
//   // No `Intl`, so use and load the polyfill.
//   global.Intl = require('intl');
// } 
import React, { useState, useEffect } from 'react';
import Modal from "react-native-simple-modal";
import { StyleSheet, Text, View, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState, StatusBar } from 'react-native';

// import { IntlProvider } from 'react-intl';
import { ApolloProvider } from "react-apollo";
import { Client } from './apollo/client';
import locale from './locale/locale';

import { SignUpMutation, DuplicateCheckQuery, LoginQuery, RequestVerifyWithPhoneMutation, FindVerifyWithPhoneQuery } from './apollo/query';
import * as Selectors from './store/selectors';
import { Manager } from './Manager';
import Main from './Main';
import * as Font from 'expo-font';
import SimpleModal from './SimpleModal';

let currentLocale = 'ko';
if (!locale[currentLocale])
  currentLocale = null;

const scaleFactor = Dimensions.get('window').width / 360;

class FindAccount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      findAccount: true,
      requestedPhoneVerify: false,
      findingAccount : false,
      findingAccountResult : null,
      // 재전송 여부
      reSend: false,

      phoneNumber: '',
      verifyNumber: '',

      // 비밀번호 찾기
      account : '',
      email : '',

      showModal: false,
      popupTitle: '',
      popupText: '',
      bottomText: '',
    }

    this.ShowModal = this.ShowModal.bind(this);
    this.OnRequestPhoneVerify = this.OnRequestPhoneVerify.bind(this);
    this.OnVerifyCheck = this.OnVerifyCheck.bind(this);
    this.OnRequestPassword = this.OnRequestPassword.bind(this);
  };

  ShowModal = (title: string, text: string, bottomText: string = '', modalCallback = null) => {
    this.setState({
      showModal: true,

      popupTitle: title,
      popupText: text,
      bottomText: bottomText,
      modalCallback: modalCallback,
    })
  }

  OnVerifyCheck = async () => {
      if (this.state.verifyNumber.length < 6) {
        this.ShowModal('', '올바른 인증번호를 입력해주세요.', '확인');
          return;
      }

      try {
          const result: any = await Client.query({
              query: FindVerifyWithPhoneQuery,
              variables: { phoneNumber: this.state.phoneNumber, verifyNumber: this.state.verifyNumber }
          });
          this.setState({
            findingAccount:true, 
            findingAccountResult: result.data.findVerifyWithPhone,
          });
      }
      catch (error) {
          if (error.graphQLErrors && error.graphQLErrors.length > 0) {
              var errorMessage = error.graphQLErrors[0].message;
              var message = '';
              if (errorMessage == 'notRequested') {
                  message = '유효시간이 지났습니다. 이전으로 돌아 갑니다.';
                this.setState({

                  requestedPhoneVerify: false,
                  phoneNumber: '',
                  verifyNumber: ''
                });
              }
              else {
                  message = '올바른 인증번호를 입력해주세요.'
              }

              this.ShowModal('', message, '확인');
          }
          else {
            this.ShowModal('', '알수 없는 에러 입니다. 관리자에게 문의 해주시기 바랍니다.', '확인');
          }
      }

  };

  OnRequestPhoneVerify = async () => {
    if (this.state.phoneNumber.length == 0) {
      this.ShowModal('', '올바른 핸드폰 번호를 입력해주세요.', '확인');
      return;
    }

    try {
      const result = await Client.mutate({
        mutation: RequestVerifyWithPhoneMutation,
        variables: { phoneNumber: this.state.phoneNumber }
      });

      if (result == false) {
        this.ShowModal('', '인증 번호를 요청하는데 실패 하였습니다. 관리자에게 직접 문의 해주시기 바랍니다.', '확인');
        return;
      }
      // 페이지를 변경해야한다.
      this.setState({ requestedPhoneVerify: true });
    }
    catch (error) {
      this.ShowModal('', '올바른 핸드폰 번호를 입력해주세요.', '확인');
    }
  };

  OnRequestPassword = async () => {
    if (this.state.account.length == 0) {
      this.ShowModal('', '올바른 아이디를 입력해주세요.', '확인');
      return;
    }

    if (this.state.email.length == 0) {
      this.ShowModal('', '올바른 이메일을 입력해주세요.', '확인');
      return;
    }

    this.ShowModal('', '알수 없는 에러 입니다. 관리자에게 문의 해주시기 바랍니다.', '확인');
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
        < View style={{ backgroundColor: '#F5F5F5', height: '100%' }}>
          <StatusBar hidden={true} />
          <View style={{ marginLeft: 20 * scaleFactor, marginTop: 33 * scaleFactor }}>
            <TouchableHighlight style={{ width: 18 }} onPress={() => {
              if (this.props.OnClose)
                this.props.OnClose();
            }}>
              <Image source={require('./assets/close.png')} />
            </TouchableHighlight>
          </View>
          <View style={{ alignItems: 'center', marginTop: 13 * scaleFactor }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#262626', fontSize: 20, fontFamily: 'NotoSans', includeFontPadding: false }}>아이디 / 비밀번호 찾기</Text>
            </View>
          </View>
          <View style={{ margin: 25, marginTop: 50 }}>
            <View style={{ flexDirection: 'row', marginLeft: 6 }}>
              <TouchableWithoutFeedback onPress={() => {
                this.setState({ findAccount: true });
              }}>
                <View style={{ width: 100, height: 40, backgroundColor: this.state.findAccount ? '#4C84FF' : '#E6E6E6', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                  <Text style={{ fontFamily: 'NotoSans', fontSize: 14, includeFontPadding: false, color: this.state.findAccount ? '#fff' : '#262626' }}>아이디 찾기</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => { this.setState({ findAccount: false }); }}>
                <View style={{ marginLeft: 10, width: 100, height: 40, backgroundColor: this.state.findAccount == false ? '#4C84FF' : '#E6E6E6', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 6, borderTopRightRadius: 6 }}>
                  <Text style={{ fontFamily: 'NotoSans', fontSize: 14, includeFontPadding: false, color: this.state.findAccount ? '#262626' : '#fff' }}>비밀번호 찾기</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
            {/* 내용 부분 */}
            <View style={{ borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: '#4C84FF' }}>
              <View style={{ backgroundColor: '#fff', marginTop: 5 }}>
                {
                  this.state.findAccount ==false ? (
                    //비밀번호 찾기
                  <View>
                      <Text style={{ margin: 20, fontSize: 12, fontFamily: 'NotoSans', includeFontPadding: false, color: '#262626' }}>*고객님의 개인정보는 항상 암호화되어 처리되고, 본인인증으로만 사용되며, 보관하지 않습니다.</Text>
                      <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 8, fontFamily: 'NotoSans', fontSize: 14, includeFontPadding: false, color: '#262626' }}>아이디</Text>
                      </View>
                      <View>
                        <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, margin: 30, marginTop: 7 }}
                          value={this.state.account}
                          placeholder={'아이디 입력'}
                          enablesReturnKeyAutomatically
                          placeholderTextColor={'#BCBCBC'}
                          onChangeText={(text) => {
                            this.setState({ account: text })
                          }} />
                      </View>
                      <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginLeft: 8, fontFamily: 'NotoSans', fontSize: 14, includeFontPadding: false, color: '#262626' }}>이메일</Text>
                      </View>
                      <View>
                        <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, margin: 30, marginTop: 7 }}
                          value={this.state.email}
                          placeholder={'이메일 주소 입력'}
                          enablesReturnKeyAutomatically
                          placeholderTextColor={'#BCBCBC'}
                          onChangeText={(text) => {
                            this.setState({ email: text })
                          }} />
                      </View>

                      <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 30 }}>
                        <TouchableOpacity onPress={() => {
                          this.OnRequestPassword();
                        }}>
                          <View style={{ backgroundColor: '#01467F', width: 100, height: 34, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'NotoSans', fontSize: 14, includeFontPadding: false, fontWeight: 'bold', color: '#FFFFFF' }}>확인</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                  </View>
                  ) :
                  this.state.requestedPhoneVerify == false ? (
                  // 휴대폰 인증
                  <View>
                    <Text style={{ margin: 20, fontSize: 12, fontFamily: 'NotoSans', includeFontPadding: false, color: '#262626' }}>*고객님의 개인정보는 항상 암호화되어 처리되고, 본인인증으로만 사용되며, 보관하지 않습니다.</Text>

                    <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                      <Image source={require('./assets/radio.png')} />
                      <Text style={{ marginLeft: 8, fontFamily: 'NotoSans', fontSize: 16, includeFontPadding: false, color: '#262626' }}>휴대폰 인증</Text>
                    </View>
                    <View>
                      <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, margin: 30, marginTop: 7 }}
                        value={this.state.phoneNumber}
                        placeholder={'-없이 숫자만 입력'}
                        enablesReturnKeyAutomatically
                        placeholderTextColor={'#BCBCBC'}
                        onChangeText={(text) => {
                          this.setState({ phoneNumber: text })
                        }} />
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 30 }}>
                      <TouchableOpacity onPress={()=>{
                        this.OnRequestPhoneVerify();
                      }}>
                      <View style={{ backgroundColor: '#01467F', width: 100, height: 34, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'NotoSans', fontSize: 14, includeFontPadding: false, fontWeight: 'bold', color: '#FFFFFF' }}>확인</Text>
                      </View>
                      </TouchableOpacity>
                    </View>
                  </View>) : 
                  this.state.findingAccount == false ? 
                  (
                    //휴대폰 인증 2단계.
                    <View>
                      <View>
                        <Text style={{fontFamily:'NotoSans', fontSize:16, color:'#262626', includeFontPadding:false, textAlign:'center', marginTop:55}}>휴대폰 인증</Text>
                        <Text style={{fontFamily:'NotoSans', fontSize:12, color:'#262626', includeFontPadding:false, textAlign:'center', marginTop:10}}>*휴대폰에 문자메세지로 전송된 인증번호 6자리를 입력하신 후 확인 버튼을 눌러주세요.</Text>
                        <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center',marginTop:15 }}>
                          <Image source={require('./assets/radio.png')} />
                          <Text style={{ marginLeft: 8, fontFamily: 'NotoSans', fontSize: 16, includeFontPadding: false, color: '#262626' }}>인증번호</Text>
                        </View>
                        <View style={{height:40, marginTop:10}}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent:'center' }}>
                            <TextInput style={{ borderColor: '#BCBCBC', width:183, borderWidth: 1, borderRadius: 4, height: 40, }}
                              value={this.state.verifyNumber}
                              placeholder={''}
                              enablesReturnKeyAutomatically
                              placeholderTextColor={'#BCBCBC'}
                              onChangeText={(text) => {
                                this.setState({ verifyNumber: text })
                              }} />
                            <TouchableOpacity onPress={() => {
                              if (this.state.reSend)
                                return;
                              this.state.reSend = true;
                              this.OnRequestPhoneVerify();
                              this.ShowModal('', '재전송을 요청 했습니다.', '확인');
                            }}>
                              <View style={{ marginLeft: 6, backgroundColor: '#FBB03B', borderRadius: 4, width: 62, height: 40, marginRight: 0, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontFamily: 'NotoSans', fontSize: 12, includeFontPadding: false, color: '#fff' }}>재전송</Text>
                              </View>
                            </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 30 }}>
                          <TouchableOpacity onPress={()=>{
                            this.OnVerifyCheck();
                          }}>
                          <View style={{ backgroundColor: '#01467F', width: 100, height: 34, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'NotoSans', fontSize: 14, includeFontPadding: false, fontWeight: 'bold', color: '#FFFFFF' }}>확인</Text>
                          </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    ) :
                    (
                    // 휴대폰 인증 3단계
                    <View>
                        <View>
                          <Text style={{ marginTop: 55, color: '#262626', fontSize: 16, fontFamily: 'NotoSans', includeFontPadding: false, textAlign: 'center' }}>
                            {this.state.findingAccountResult ? '아이디를 찾았습니다' : '아이디를 찾지 못했습니다'}
                          </Text>
                          <Text style={{ marginTop: 17, color: '#262626', fontSize: 12, fontFamily: 'NotoSans', includeFontPadding: false, textAlign: 'center' }}>
                            {this.state.findingAccountResult ? `귀하의 아이디는 ${this.state.findingAccountResult} 입니다.` : '입력하신 핸드폰 번호로 가입된 계정이 없습니다.'}
                          </Text>

                          <View style={{alignItems:'center', marginTop:60, marginBottom:30}}>
                          {this.state.findingAccountResult ? (
                            <TouchableOpacity onPress={() => { this.props.OnClose() }}>
                              <View style={{ backgroundColor: '#01467F', borderRadius: 25, width: 100, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{color:'#fff', fontFamily:'NotoSans', fontSize:14, includeFontPadding:false, fontWeight:'bold'}}>로그인</Text>
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity onPress={() => { this.setState({
                              phoneNumber:'',
                              verifyNumber: '',
                              requestedPhoneVerify: false,
                              findingAccount: false,
                            }) }}>
                              <View style={{ backgroundColor: '#fff', borderWidth:1, borderColor:'#01467F', borderRadius: 25, width: 100, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{color:'#01467F', fontFamily:'NotoSans', fontSize:14, includeFontPadding:false, fontWeight:'bold'}}>재발송</Text>
                              </View>
                            </TouchableOpacity>
                          )}
                            </View>
                        </View>
                    </View>
                  )
                }
              </View>

            </View>
          </View>

          <SimpleModal showModal={this.state.showModal} popupTitle={this.state.popupTitle} popupText={this.state.popupText} bottomText={this.state.bottomText} close={() => {
            this.setState({
              showModal: false,
              modalCallback: null
            });
          }} />
        </ View>
      </TouchableWithoutFeedback>
    );
  }
};

function SingUp(props) {
  const [values, setValues] = useState({
    recommanderCode: '',
    account: '',
    password: '',
    passwordConfirm: '',
    email: '',
    phoneNumber: '',
    bitcoinAddress: '',
    confirmDuplicateCheck: false,
    isDuplicateChecked: false,

    showModal: false,
    popupTitle: '',
    popupText: '',
  });

  const ShowModal = (title: string, text: string) => {
    setValues(initial => {
      return {
        ...initial,
        showModal: true,
        popupTitle: title,
        popupText: text,
      };
    });
  }

  const OnCloseModal = () => {
    setValues(initial => {
      return {
        ...initial,
        showModal: false,
      };
    });
  }

  const RequestSignUp = async () => {
    console.log(values.confirmDuplicateCheck);
    if (values.confirmDuplicateCheck == false) {
      ShowModal('회원가입 실패', '아이디 중복을 확인 해주세요.');
      return;
    }

    if (values.password != values.passwordConfirm) {
      ShowModal('회원가입 실패', '비밀번호를 다시 확인 해주세요.');
      return;
    }

    if (values.account.length == 0 || values.password.length == 0 || values.bitcoinAddress.length == 0 || values.phoneNumber.length == 0 || values.email.length == 0) {

      ShowModal('회원가입 실패', '입력된 정보가 올바르지 않습니다.');
      return;
    };

    var email = values.email;
    try {
      const result = await Client.mutate({
        mutation: SignUpMutation,
        variables: {
          account: values.account, password: values.password, email: email, phoneNumber: values.phoneNumber,
          bitcoinDepositAddress: values.bitcoinAddress,
          recommanderUserID: values.recommanderCode.length > 0 ? Number(values.recommanderCode) : null
        }
      });

      props.OnClose();
    }
    catch (error) {
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        var errorMessage = error.graphQLErrors[0].message;
        var message = '';

        if (errorMessage == 'invalidVerifyOperation') {
          message = '핸드폰 번호 혹은 이메일 주소를 확인 해주세요.'
        }
        else if (errorMessage == 'invalidVerify') {
          message = '핸드폰 인증이 유효하지 않습니다.'
        }
        else if (errorMessage == 'duplicateEmail') {
          message = '이메일이 중복 됩니다.'
        }
        else if (errorMessage == 'duplicatePhoneNumber') {
          message = '헨드폰 번호가 중복 됩니다.'
        }
        else if (errorMessage == 'invalidRecommanderUserID') {
          message = '추천인 코드가 유효하지 않습니다'
        }
        else {
          // 알수 없는 메시지..
          message = '알수 없는 에러 입니다. 관리자에게 문의 해주시기 바랍니다.'
        }

        ShowModal('실패', message);
      }
      else {

        ShowModal('실패', '알수 없는 에러 입니다. 관리자에게 문의 해주시기 바랍니다.');
      }
    }
  };

  const OnDuplicateCheck = async (account: string) => {
    try {
      const result = await Client.query({
        query: DuplicateCheckQuery,
        variables: { account: account }
      });

      if (result.data.accountDuplicateCheck) {
        ShowModal('중복', '아이디가 중복 됩니다.');
      }

      setValues(initial => {
        return {
          ...initial,

          isDuplicateChecked: result.data.accountDuplicateCheck == false,
          confirmDuplicateCheck: result.data.accountDuplicateCheck == false ? true : false,
        };
      });
    }
    catch (error) {
      setValues(initial => {
        return {
          ...initial,
          isDuplicateChecked: true
        };
      });
    }
  }
  return (

    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>

      < View style={{ backgroundColor: '#F5F5F5', height: '100%' }}>
        <StatusBar hidden={true} />
        <View style={{ marginLeft: 20 * scaleFactor, marginTop: 33 * scaleFactor }}>
          <TouchableHighlight style={{ width: 18 }} onPress={() => {
            if (props.OnClose)
              props.OnClose();
          }}>
            <Image source={require('./assets/close.png')} />
          </TouchableHighlight>
        </View>
        <View style={{ alignItems: 'center', marginTop: 13 * scaleFactor }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#262626', fontSize: 20, fontFamily: 'NotoSans', includeFontPadding: false }}>회원 가입</Text>
            <Text style={{ color: '#262626', marginBottom: 20 * scaleFactor, fontFamily: 'NotoSans', includeFontPadding: false }}>유니버스 마이닝에서 비트코인을 획득해보세요.</Text>
          </View>
          <View style={{
            backgroundColor: '#fff', width: 310 * scaleFactor, borderRadius: 8, paddingLeft: 25, paddingTop: 25, paddingRight: 25,
            //alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ color: '#262626', fontSize: 12 }}>
              추천인 코드
          </Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.recommanderCode}
              placeholder={'추천인 코드 입력'}
              enablesReturnKeyAutomatically
              placeholderTextColor={'#BCBCBC'}
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    recommanderCode: text
                  };
                });
              }} />
            <Text style={{ color: '#262626', fontSize: 12 }}>
              아이디
          </Text>
            <View style={{ flexDirection: 'row' }}>
              <TextInput style={{ borderColor: values.isDuplicateChecked ? '#BCBCBC' : '#f00', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10, width: 310 * scaleFactor - (62 + 50 + 8) }}
                value={values.account}
                editable={values.isDuplicateChecked == false}
                placeholder={'사용할 아이디 입력'}
                placeholderTextColor={'#BCBCBC'}
                onChangeText={(text) => {
                  setValues(initial => {
                    return {
                      ...initial,
                      account: text
                    };
                  });
                }} />
              <TouchableOpacity >
                <View style={{
                  height: 42, backgroundColor: '#FBB03B', borderRadius: 4, marginLeft: 8,
                  alignItems: 'center', width: 62,
                  justifyContent: 'center'

                }}>
                  <Text style={{ color: '#fff', fontSize: 12 }} onPress={() => {

                    if (values.isDuplicateChecked == false) {
                      OnDuplicateCheck(values.account);
                    }
                  }}>중복 확인</Text>
                </View></TouchableOpacity>
            </View>
            <Text style={{ color: '#262626', fontSize: 12 }}>
              비밀번호
          </Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.password}
              secureTextEntry={true}
              enablesReturnKeyAutomatically
              placeholder={'영문, 숫자, 특수문자 포함 8자 이상 입력'}
              placeholderTextColor={'#BCBCBC'}
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    password: text
                  };
                });
              }} />
            <Text style={{ color: '#262626', fontSize: 12 }}>
              비밀번호 확인
          </Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.passwordConfirm}
              secureTextEntry={true}
              enablesReturnKeyAutomatically
              placeholder={'영문, 숫자, 특수문자 포함 8자 이상 입력'}
              placeholderTextColor={'#BCBCBC'}
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    passwordConfirm: text
                  };
                });
              }} />
            <Text style={{ color: '#262626', fontSize: 12 }}>
              핸드폰 번호
          </Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.phoneNumber}
              enablesReturnKeyAutomatically
              placeholder={'-없이 숫자만 입력'}
              placeholderTextColor={'#BCBCBC'}
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    phoneNumber: text
                  };
                });
              }} />
            <Text style={{ color: '#262626', fontSize: 12 }}>
              이메일
          </Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.email}
              enablesReturnKeyAutomatically
              placeholder={'이메일 주소 입력'}
              placeholderTextColor={'#BCBCBC'}
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    email: text
                  };
                });
              }} />
            <Text style={{ color: '#262626', fontSize: 12 }}>
              비트코인 주소
          </Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.bitcoinAddress}
              enablesReturnKeyAutomatically
              placeholder={'비트코인 주소 입력'}
              placeholderTextColor={'#BCBCBC'}
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    bitcoinAddress: text
                  };
                });
              }} />
            <View style={{ alignItems: 'center', marginTop: 20 * scaleFactor, marginBottom: 30 * scaleFactor }}>
              <View style={{
                width: 100, height: 34, backgroundColor: '#01467F', borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: '#fff' }} onPress={() => {
                  RequestSignUp();
                }}>회원가입</Text>
              </View>
            </View>
          </View>
        </View>

        <Modal
          open={values.showModal}
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
            <Text>{values.popupTitle}</Text>
            <View style={{ position: 'absolute', right: 15 * scaleFactor, top: 15 * scaleFactor }}
            >
              <TouchableOpacity onPress={() => {
                setValues(initial => {
                  return {
                    ...initial,
                    showModal: false
                  }
                });
              }}>
                <Image source={require('./assets/close2.png')} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
            <Text>
              {values.popupText}
            </Text>
          </View>
          <TouchableOpacity onPress={() => { OnCloseModal(); }}>
            <View style={{
              height: 36 * scaleFactor,
              backgroundColor: '#01467F',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>
                확인
            </Text>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

    </TouchableWithoutFeedback>
  );
}
function Login(props) {

  const [values, setValues] = useState({
    account: '',
    password: '',

    doSignup: false,
    doFindAccount: false,

    popupTitle: '',
    popupText: '',
    bottomText: '',
    showModal: false,
  });

  const ShowModal = (title: string, body: string, bottom: string) => {
    setValues(initial => {
      return {
        ...initial,
        popupTitle: title,
        popupText: body,
        bottomText: bottom,
        showModal: true
      };
    });
  }

  const RequestLogin = async () => {
    if (values.account.length == 0 || values.password.length == 0) {
      ShowModal('실패', '아이디와 비밀번호를 확인하여 주십시오', '확인');
      return;
    };

    try {
      const result = await Client.query({
        query: LoginQuery,
        variables: { account: values.account, password: values.password }
      });
      console.log(result);
      Manager.GetInstance().LoginUser(result.data.login);
      Manager.GetInstance().UpdateUserData(result.data.login.account);
      Manager.GetInstance().UpdateMiningData(result.data.login.miningData);
      props.OnLogin();
    }
    catch (error) {
      console.log(error);
      ShowModal('실패', '아이디와 비밀번호를 확인하여 주십시오', '확인');
    }
  }

  if (values.doSignup) {
    return (
      <SingUp OnClose={() => {

        setValues(initial => {
          return {
            ...initial,
            doSignup: false
          };
        });
      }} />
    )
  }
  else if (values.doFindAccount) {
    return (
      <FindAccount OnClose={() => {
        setValues(initial => {
          return {
            ...initial,
            doFindAccount: false
          };
        });
      }} />
    )
  }
  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss() }}>
      < View style={styles.container}>
        <ImageBackground source={require('./assets/login_bg.png')} style={{
          width: '100%', height: '100%', display: 'flex',
          alignItems: 'center'
        }}>
          <Image source={require('./assets/login_logo.png')} style={{ marginTop: 130 * scaleFactor, marginBottom: 83 * scaleFactor }} />
          <Text style={{ fontSize: 20, color: '#fff', marginBottom: 10 * scaleFactor }}>
            아이디로 로그인
          </Text>
          <View style={{
            backgroundColor: '#fff', width: 310 * scaleFactor, height: 250 * scaleFactor, borderRadius: 8, paddingLeft: 25, paddingRight: 25,
            //alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Text style={{ marginBottom: 4, color: '#01467F' }}>아이디</Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.account}
              enablesReturnKeyAutomatically
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    account: text
                  };
                });
              }}></TextInput>
            <Text style={{ marginBottom: 4, color: '#01467F' }}>비밀번호</Text>
            <TextInput style={{ borderColor: '#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40, marginBottom: 10 }}
              value={values.password}
              secureTextEntry={true}
              enablesReturnKeyAutomatically
              onChangeText={(text) => {
                setValues(initial => {
                  return {
                    ...initial,
                    password: text
                  };
                });
              }}
            ></TextInput>
            <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
              <View style={{
                width: 100, height: 34, backgroundColor: '#01467F', borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{ color: '#fff' }} onPress={() => {
                  setValues(initial => {
                    return {
                      ...initial,
                      doSignup: true
                    };
                  });
                }}>회원가입</Text>
              </View>
              <TouchableOpacity onPress={() => { RequestLogin() }}>
                <View style={{
                  marginLeft: 10,
                  width: 100, height: 34, borderColor: '#01467F', borderWidth: 1, borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Text style={{ color: '#01467F' }} >로그인</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{ color: '#fff', marginTop: 23, fontSize: 12, fontFamily: 'NotoSans', includeFontPadding: false }}
            onPress={() => {

              setValues(initial => {
                return {
                  ...initial,
                  doFindAccount: true
                };
              });
            }}
          >아이디/비밀번호를 잊어셨나요?</Text>

          <SimpleModal showModal={values.showModal} popupTitle={values.popupTitle} popupText={values.popupText} bottomText={values.bottomText} close={() => {
            setValues(initial => {
              return {
                ...initial,
                showModal: false
              };
            });
          }} />
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};


export default class App extends React.Component {
  constructor(props) {
    super(props);

    // 폰트로딩이 완료되면 true로 변경
    this.state = { isReady: false, isLoggedIn: Manager.GetInstance().isLoggedIn };
  }

  async componentDidMount() {
    // await키워드를 붙여 비동기식으로 변경
    await Font.loadAsync(
      { 'Digital-7': require('./assets/fonts/digital-7.ttf'), 'Futura': require('./assets/fonts/Futura-Bold.ttf'), 'NotoSans': require('./assets/fonts/NotoSansCJKkr-Regular.otf'), }
    );

    Manager.GetInstance().setLogoutEvent(() => {
      this.setState({ isLoggedIn: false });
    });

    // 폰트로드가 완료되어 true로 변경
    this.setState({ isReady: true });
  }

  render() {

    if (this.state.isReady) {
      return (
        <ApolloProvider client={Client}>
          {/* <IntlProvider defaultLocale={'ko'} locale={values.language} messages={locale[values.language]}>   */}
          {this.state.isLoggedIn ? (<Main></Main>) : (<Login OnLogin={() => {
            console.log('dwdwdw')
            this.setState({ isLoggedIn: Manager.GetInstance().isLoggedIn });
          }} />)}
          {/* </IntlProvider> */}
        </ApolloProvider>
      );
    }
    else {
      return <View><Text></Text></View>;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
