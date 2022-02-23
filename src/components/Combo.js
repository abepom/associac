import React from "react";
import { Image, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import PickerModal from "react-native-picker-modal-view";
import s, { tema } from "../../assets/style/Style";
import images from "../utils/images";

export default (props) => {
	const { label, pronome, lista, item, style } = props;
	const [escolhido, setEscolhido] = item;

	let placeholder = `SELECIONE ${pronome.toUpperCase()} ${label.toUpperCase()}`;

	return (
		<TextInput
			label={label}
			value={escolhido.Value}
			mode="outlined"
			onChangeText={(texto) => setEscolhido(texto)}
			style={[s.fullw, { ...style }]}
			theme={tema}
			render={(props) => (
				<PickerModal
					renderSelectView={(disabled, selected, showModal) => (
						<TouchableOpacity
							style={[s.row, s.fl1, s.pdl10]}
							disabled={disabled}
							onPress={showModal}
						>
							<View style={[s.fl2, s.jcc]}>
								<Text style={s.fs18}>{escolhido.Name ?? escolhido.Name}</Text>
							</View>
							<View style={[s.fl1, s.aife, s.jcc, s.pdr10]}>
								<Image
									source={images.seta}
									tintColor={tema.colors.primary}
									style={[s.w20, s.h20, s.r0, s.tcp, s.tr90]}
								/>
							</View>
						</TouchableOpacity>
					)}
					modalAnimationType="fade"
					selected={escolhido}
					sortingLanguage={"pt-br"}
					autoGenerateAlphabeticalIndex={true}
					showAlphabeticalIndex={true}
					selectPlaceholderText={placeholder}
					searchPlaceholderText={`Digite o nome d${pronome} ${label.toLowerCase()}...`}
					onSelected={(key) => setEscolhido(key)}
					onClosed={() => setEscolhido({ Name: "", Value: "" })}
					items={lista}
				/>
			)}
		/>
	);
};
