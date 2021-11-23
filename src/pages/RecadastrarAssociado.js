import React from "react";
import { SafeAreaView, View, Text } from "react-native";
import Header from "../components/Header";

function RecadastrarAssociado(props) {
	const { navigation } = props;

	return (
		<>
			<Header titulo="Recadastrar Associado" {...props} />
			<SafeAreaView style={{ flex: 1, zIndex: 100 }}>
				<View style={{ flex: 1, margin: 20 }}>
					<Text
						style={{
							textAlign: "center",
							marginTop: 10,
							marginBottom: 20,
							fontSize: 17,
						}}
					>
						Preencha os campos abaixo para efetuar o recadastramento do
						associado.
					</Text>
				</View>
			</SafeAreaView>
		</>
	);
}

export default RecadastrarAssociado;
