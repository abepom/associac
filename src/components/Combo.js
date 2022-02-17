import React from "react";
import { Image, Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import PickerModal from "react-native-picker-modal-view";
import { tema } from "../../assets/style/Style";
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
			style={{ width: "100%", ...style }}
			theme={tema}
			render={(props) => (
				<PickerModal
					renderSelectView={(disabled, selected, showModal) => (
						<TouchableOpacity
							style={{
								flexDirection: "row",
								flex: 1,
								paddingLeft: 10,
							}}
							disabled={disabled}
							onPress={showModal}
						>
							<View
								style={{
									width: "94%",
									justifyContent: "center",
								}}
							>
								<Text>{escolhido.Name ?? escolhido.Name}</Text>
							</View>
							<View
								style={{
									width: "6%",
									alignItems: "flex-end",
									justifyContent: "center",
									paddingRight: 10,
								}}
							>
								<Image
									source={images.seta}
									tintColor={tema.colors.primary}
									style={{
										width: 20,
										height: 20,
										right: 0,
										tintColor: tema.colors.primary,
										transform: [{ rotate: "90deg" }],
									}}
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
