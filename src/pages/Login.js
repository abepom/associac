import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

function Login({ navigation }) {
	return (
		<>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<TouchableOpacity onPress={() => navigation.push("Inicio")}>
					<Text style={{ fontSize: 30 }}>LOGAR</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}

export default Login;
