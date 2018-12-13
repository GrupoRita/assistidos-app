import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

import ButtonAction from '../components/ButtonAction';

export default class Self extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      self: '',
      params: {},
    }
  }

  componentDidMount() {
    const params = this.props.navigation.state.params;
    this.setState({ params });
  }

  render() {
    const invalidSelf = this.state.self.length < 1;
    return (
      <View>
	<TextInput
  	  label={'Self'}
          placeholder={`${this.state.params.alias}, tire uma selfe de você`}
	  keyboardType={'numeric'}
          onChangeText={(self) => this.setState({self})}
          value={this.state.self}
        />
	<HelperText
	   type="error"
	   visible={invalidSelf}
	>
	 O campo Self não pode ser vazio
        </HelperText>
        <ButtonAction
          secundary        
          title={'Continuar'}
	  disable={invalidSelf}
          action={() => {
            this.props.navigation.navigate('Cpf', {
	      self: this.state.self,
	      ...this.state.params,
            });
          }}
        />
      </View>
    );
  }
}
