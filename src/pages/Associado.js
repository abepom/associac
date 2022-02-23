import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";

function Associado(props) {
	const { navigation } = props;

	return (
		<>
			<Header titulo="Associado" {...props} />
			<SafeAreaView style={{ flex: 1, zIndex: 100 }}>
				<View style={{ flex: 1, margin: 20 }}>
					<View>
						<TouchableOpacity
							onPress={() => navigation.navigate("CadastrarAssociado")}
							style={{
								backgroundColor: "#fff",
								elevation: 1,
								borderRadius: 6,
								flexGrow: 1,
								margin: 10,
								padding: 15,
								height: 100,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Text style={{ fontSize: 22 }}>CADASTRAR NOVO ASSOCIADO</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => navigation.navigate("RecadastrarAssociado")}
							style={{
								backgroundColor: "#fff",
								elevation: 1,
								borderRadius: 6,
								flexGrow: 1,
								margin: 10,
								padding: 15,
								height: 100,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Text style={{ fontSize: 22 }}>RECADASTRAR ASSOCIADO</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</>
	);
}

export default Associado;
