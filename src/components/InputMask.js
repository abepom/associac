import React from "react";
import { TextInputMask } from "react-native-masked-text";
import { TextInput } from "react-native-paper";
import s, { tema } from "../../assets/style/Style";

export default (props) => {
	const {
		label,
		value,
		mode = "outlined",
		mask = "999999",
		keyboardType = "numeric",
		returnKeyType = "default",
		onSubmitEditing = () => {},
		maxLength = 250,
	} = props;
	const [valor, setValor] = value;

	return (
		<TextInput
			label={label}
			value={valor}
			keyboardType={keyboardType}
			returnKeyType={returnKeyType}
			mode={mode}
			theme={tema}
			maxLength={maxLength}
			style={s.fs18}
			onChangeText={(text) => setValor(text)}
			onSubmitEditing={onSubmitEditing}
			render={(props) => (
				<TextInputMask {...props} type={"custom"} options={{ mask }} />
			)}
		/>
	);
};
