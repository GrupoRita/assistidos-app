import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import { color, font } from '../assets/desing';

export default class AreaAtuacao extends React.Component {
  render() {
    const {
      data,
      action,
    } = this.props;
    return (
      <FlatList
        data={data}     
        keyExtractor={(item, index) => item.id}
        contentContainerStyle={{
          alignItems: 'stretch',
          justifyContent: 'center',
          flex: 1,
        }}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={{
                padding: 10,       
              }}
              onPress={()=> action(item)}
            >
              <Text
                style={{
                  ...font.subtitle,            
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    );
  }
}