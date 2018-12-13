import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

import ButtonAction from '../components/ButtonAction';

export default class Name extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      params: {},
    }
  }

  componentDidMount() {
    const params = this.props.navigation.state.params;
    this.setState({ params });
  }

  render() {
    const invalidName = this.state.name.length < 3
    return (
      <View>
        <TextInput
 	  label={'Nome Completo'}
	  mode={'outlined'}
	  placeholder={`${this.state.params.alias}, qual seu nome completo?`}
          onChangeText={(name) => this.setState({name})}
          value={this.state.name}
        />
	<HelperText
	   type="error"
	   visible={invalidName}
	>
	 Nome Completo deve ter mais que 3 caracteres
        </HelperText>
        <ButtonAction
          secundary        
          title={'Continuar'}
	  disable={invalidName}
	  action={() => {
	    this.props.navigation.navigate('Age', {
	      name: this.state.name,
	      ...this.state.params,
            });
          }}
        />
      </View>
    );
  }
}
