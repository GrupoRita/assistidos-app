import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default class ButtonAction extends React.Component {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          alert('WIP - em breve podera cadastrar')
        }}
      >
        <Text>
         Cadastrar
        </Text>
      </TouchableOpacity>
    );
  }
}