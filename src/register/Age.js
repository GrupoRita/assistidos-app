import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

import ButtonAction from '../components/ButtonAction';

export default class Age extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      age: '',
      params: {},
    }
  }

  componentDidMount() {
    const params = this.props.navigation.state.params;
    this.setState({ params });
  }

  render() {
    const isInvalidAge = this.state.age.length < 1;
    return (
      <View>
        <TextInput
  	  label={'Idade'}
          placeholder={`${this.state.params.alias}, Quantos anos você tem?`}
	  keyboardType={'numeric'}
          onChangeText={(age) => this.setState({age})}
          value={this.state.age}
        />
	<HelperText
	   type="error"
	   visible={isInvalidAge}
	>
	 O campo idade não pode ser vazio
        </HelperText>
        <ButtonAction
          secundary        
          title={'Continuar'}
	  disable={isInvalidAge}
         action={() => {
            this.props.navigation.navigate('Self', {
	      age: this.state.age,
	      ...this.state.params,
	    });
          }}
        />
      </View>
    );
  }
}
