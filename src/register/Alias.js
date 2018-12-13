import React from 'react';
import { View, Text } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

import ButtonAction from '../components/ButtonAction';

export default class Alias extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alias: '',
    };
  }
  render() {
    const isInvalidAlias = this.state.alias.length < 3;
    return (
      <View>
        <TextInput
 	  label={'Nome Social'}
	  mode={'outlined'}
	  placeholder={'Como podemos te chamar?'}
          onChangeText={alias => this.setState({ alias })}
          value={this.state.alias}
        />
	<HelperText
	   type="error"
	   visible={isInvalidAlias}
	>
	 Nome Social deve ter mais que 3 caracteres
        </HelperText>
        <ButtonAction
	  secundary
	  disable={isInvalidAlias}
          title={'Continuar'}
          action={() => {
            this.props.navigation.navigate('Name', {
              alias: this.state.alias,
            });
          }}
        />
      </View>
    );
  }
}
