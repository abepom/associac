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
import CancelarPlanoDeSaude from "./src/pages/CancelarPlanoDeSaude";
import AlterarDependente from "./src/pages/AlterarDependente";
import AtivarDependente from "./src/pages/AtivarDependente";
import CadastrarDependente from "./src/pages/CadastrarDependente";
import EnviarDocumentoDependente from "./src/pages/EnviarDocumentoDependente";
import CadastrarPlanosDeSaude from "./src/pages/CadastrarPlanosDeSaude";
import VisualizarRequerimentos from "./src/pages/VisualizarRequerimentos";
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
							name="CadastrarPlanosDeSaude"
							component={CadastrarPlanosDeSaude}
							options={{ headerShown: false, orientation: "portrait" }}
						/>
						<Stack.Screen
							name="CancelarPlanoDeSaude"
							component={CancelarPlanoDeSaude}
							options={{ headerShown: false, orientation: "portrait" }}
						/>
						<Stack.Screen
							name="VisualizarRequerimentos"
							component={VisualizarRequerimentos}
							options={{ headerShown: false, orientation: "portrait" }}
						/>
						<Stack.Screen
							name="AlterarDependente"
							component={AlterarDependente}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="AtivarDependente"
							component={AtivarDependente}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="CadastrarDependente"
							component={CadastrarDependente}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="EnviarDocumentoDependente"
							component={EnviarDocumentoDependente}
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
