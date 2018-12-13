import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

import { color, font } from './assets/desing';
import ButtonAction from './components/ButtonAction';

export default class HomeScreen extends React.Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: color.third,
        }}
      >
        <Text
          style={{
            ...font.title,
          }}
        >
          Assistidos Grupo Rita
        </Text>
	<View>
          <ButtonAction
            title={'Cadastrar'}
            action={() => {
              this.props.navigation.navigate('Register', {
                itemId: 86,
                otherParam: 'Cadastrar',
              });
            }}
          />
  
          <ButtonAction
            secundary
            title={'Fazer checkin'}
            action={() => {
              this.props.navigation.navigate('Groups', {
                itemId: -1,
                otherParam: 'Fazer checkin',
              });
            }}
          />
	</View>
      </View>
    );
  }
}
