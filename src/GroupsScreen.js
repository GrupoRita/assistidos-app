import React from 'react';
import { Button, Image, View, Text } from 'react-native';

import { color, font } from './assets/desing';
import AreaAtuacao from './components/AreaAtuacao';
import ButtonAction from './components/ButtonAction';
import area from './data/area.json';

export default  class GroupsScreen extends React.Component {
  render() {
    /* 2. Read the params from the navigation state */
    const { params } = this.props.navigation.state;
    const itemId = params ? params.itemId : null;
    const otherParam = params ? params.otherParam : null;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: color.secudary,
        }}>
        <Text
          style={{
            ...font.title,
          }}
        >
          Grupo
        </Text>
        <AreaAtuacao
          data={area.data}
          action={(item) => {
            console.log(item);
          }}
        />
        
        <ButtonAction
          title={'Voltar'}
          action={() => this.props.navigation.goBack()}
        />
      </View>
    );
  }
}
