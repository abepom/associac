import React from "react";
import { TextInput } from "react-native-paper";
import s, { tema } from "../../assets/style/Style";

export default (props) => {
	const {
		label,
		value,
		mode = "outlined",
		keyboardType = "default",
		maxLength = 250,
		textContentType = "none",
		returnKeyType = "done",
		disabled = false,
		style,
	} = props;
	const [valor, setValor] = value;

	return (
		<TextInput
			label={label}
			value={valor}
			keyboardType={keyboardType}
			textContentType={textContentType}
			mode={mode}
			theme={tema}
			maxLength={maxLength}
			disabled={disabled}
			style={[s.fs18, { ...style }]}
			returnKeyType={returnKeyType}
			onChangeText={(text) => setValor(text)}
		/>
	);
};
