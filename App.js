import React from "react";
import { Dimensions, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Inicio from "./src/pages/Inicio";
import Login from "./src/pages/Login";
import CadastrarAssociado from "./src/pages/CadastrarAssociado";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<StatusBar style="light" backgroundColor={"#04254E"} />
			<View
				style={{
					flex: 1,
					marginTop: Constants.statusBarHeight,
				}}
			>
				<Stack.Navigator>
					<Stack.Screen
						name="Login"
						component={Login}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="Inicio"
						component={Inicio}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="CadastrarAssociado"
						component={CadastrarAssociado}
						options={{ headerShown: false }}
					/>
				</Stack.Navigator>
			</View>
		</NavigationContainer>
	);
}
