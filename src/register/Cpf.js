import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

import ButtonAction from '../components/ButtonAction';

export default class Cpf extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cpf: '',
      params: {},
    }
  }

  componentDidMount() {
    const params = this.props.navigation.state.params;
    this.setState({ params });
  }

  render() {
    const isInvalidCpf = this.state.cpf.length != 11;
    return (
      <View>
        <TextInput
          label={'Digite seu CPF'}
          placeholder={`${this.state.params.alias}, digite seu CPF para cadastro Unico`}
	  keyboardType={'numeric'}
          onChangeText={(cpf) => this.setState({cpf})}
          value={this.state.cpf}
        />
	<HelperText
	   type="error"
	   visible={isInvalidCpf}
	>
	 O campo CPF tem que ter 11 digitos
        </HelperText>
	<ButtonAction	  
          secundary        
          title={'OK'}
	  disable={isInvalidCpf}
         action={() => {
            this.props.navigation.replace('Done', {
	      cpf: this.state.cpf,
	      ...this.state.params,
            });
          }}
        />
      </View>
    );
  }
}
