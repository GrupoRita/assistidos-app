import React from 'react';
import { View, Text, TextInput } from 'react-native';

import { font } from '../assets/desing';

export default class InputValue extends React.Component {
  render() {
    const { title, description, input } = this.props;
    // console.log(this.props);
    return (
      <View>
        <Text
          style={{
            ...font.title
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            ...font.subtitle
          }}
        >
          {description}
        </Text>
        {input()}
      </View>
    );
  }
}
