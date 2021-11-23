import React from "react";
import { SafeAreaView, View, Text } from "react-native";
import Header from "../components/Header";

function GerarSenha(props) {
	return (
		<>
			<Header titulo={"Gerar Senha"} />
			<SafeAreaView style={{ flex: 1, zIndex: 100 }}>
				<View style={{ flex: 1, margin: 20 }}>
					<Text>T</Text>
				</View>
			</SafeAreaView>
		</>
	);
}

export default GerarSenha;
