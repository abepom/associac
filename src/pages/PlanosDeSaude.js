import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import Header from "../components/Header";
import Alert from "../components/Alert";

function PlanosDeSaude(props) {
	const { navigation } = props;
	const [alerta, setAlerta] = useState({ visible: false });

	return (
		<>
			<Header titulo={"Planos de Saúde"} {...props} />
			<SafeAreaView style={{ flex: 1, zIndex: 100 }}>
				<View style={{ flex: 1, margin: 20 }}>
					<View>
						<TouchableOpacity
							onPress={() => navigation.navigate("CadastrarPlanosDeSaude")}
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
							<Text style={{ fontSize: 22 }}>
								CADASTRO NOVO NO PLANO DE SAÚDE
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => navigation.navigate("MigrarPlanoDeSaude")}
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
							<Text style={{ fontSize: 22 }}>MIGRAÇÃO DE PLANOS DE SAÚDE</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() =>
								navigation.navigate("VisualizarRequerimentosPlano")
							}
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
							<Text style={{ fontSize: 22 }}>VISUALIZAR REQUERIMENTOS</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default PlanosDeSaude;
