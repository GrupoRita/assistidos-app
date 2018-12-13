import * as React from 'react';
import { View } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';

import { color, font } from '../assets/desing';

export default class ButtonAction extends React.Component {
  render() {
    const {
      icon,
      title,
      action,
      type,
      disable,
    } = this.props;

    return (
      <View
	style={{
	  margin: 5,
	}}
      >
	<Button
	  disabled={disable==true}
          icon={icon}
          mode="contained"
	  onPress={action}>
          {title}
        </Button>
      </View>
    );
  }
}
