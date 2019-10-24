import React, { useState, useEffect } from 'react';
import Modal from "react-native-simple-modal";
import { Dimensions, View, Text, Image, TouchableOpacity } from "react-native";

const scaleFactor = Dimensions.get('window').width / 360;

function SimpleModal ( props )
{
  return (
    <Modal
      open={props.showModal}
      closeOnTouchOutside={false}
      disableOnBackPress={true}
      modalStyle={{
        borderRadius: 6,
        margin: 40*scaleFactor,
        padding: 0,
      }}
    >
      <View style={{
        flexDirection: 'row', height: 40 * scaleFactor,
        alignItems: 'center',
        justifyContent: 'center'}}>
        <Text>{props.popupTitle}</Text>
        <View style={{position:'absolute', right:15*scaleFactor, top:15*scaleFactor}}
        >
          <TouchableOpacity onPress={() => {
            props.close();
          }}>
            <Image source={require('./assets/close2.png')} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{paddingLeft:20, paddingRight:20, paddingBottom:20}}>
        <Text selectable>
          {props.popupText}
      </Text>
      </View>
      <TouchableOpacity onPress={() => { props.close(); }}>
        <View style={{
          height: 36 * scaleFactor,
          backgroundColor: '#01467F',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ color: '#fff', fontSize: 14 }}>
            {props.bottomText}
        </Text>
      </View>
          </TouchableOpacity>
    </Modal>)
}

export default SimpleModal;