import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Inicio from "./src/pages/Inicio";
import Login from "./src/pages/Login";
import CadastrarAssociado from "./src/pages/CadastrarAssociado";
import ConsultarDescontos from "./src/pages/ConsultarDescontos";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import GerarSenha from "./src/pages/GerarSenha";
import RecadastrarAssociado from "./src/pages/RecadastrarAssociado";
import PlanosDeSaude from "./src/pages/PlanosDeSaude";
import Dependentes from "./src/pages/Dependentes";
import AlterarTipoDependente from "./src/pages/AlterarTipoDependente";
import { StoreProvider } from "./src/store/store";
import Sair from "./src/pages/Sair";

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
				<StoreProvider>
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
						<Stack.Screen
							name="ConsultarDescontos"
							component={ConsultarDescontos}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="GerarSenha"
							component={GerarSenha}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="RecadastrarAssociado"
							component={RecadastrarAssociado}
							options={{ headerShown: false, orientation: "portrait" }}
						/>
						<Stack.Screen
							name="PlanosDeSaude"
							component={PlanosDeSaude}
							options={{ headerShown: false, orientation: "portrait" }}
						/>
						<Stack.Screen
							name="Dependentes"
							component={Dependentes}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="AlterarTipoDependente"
							component={AlterarTipoDependente}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Sair"
							component={Sair}
							options={{ headerShown: false }}
						/>
					</Stack.Navigator>
				</StoreProvider>
			</View>
		</NavigationContainer>
	);
}
