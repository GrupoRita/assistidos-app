import React from 'react';
import {
  View,
  Text,
  TextInput,
} from 'react-native';

import Input from '../components/Input';
import ButtonAction from '../components/ButtonAction';

export default class DoneRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
    }
  }

  componentDidMount() {
    const params = this.props.navigation.state.params;
    this.setState({ params });
  }

  render() {
    console.log(this.state.params);
    return (
      <View>
        <ButtonAction
          secundary        
          title={'OK'}
          action={() => {
          }}
        />
      </View>
    );
  }
}
