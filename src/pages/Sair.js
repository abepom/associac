import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	AsyncStorage,
} from "react-native";
import styles, { tema } from "../../assets/style/Style";
import Header from "../components/Header";
import imagens from "../utils/images";

function Sair(props) {
	const { navigation } = props;

	async function sair() {
		await AsyncStorage.clear().then((usuario) =>
			navigation.navigate("Login", { id: new Date().toJSON() })
		);
	}

	return (
		<>
			<Header titulo="Sair" voltar voltarPara={"Inicio"} {...props} />
			<View style={[styles.centralizado, styles.background, { flex: 1 }]}>
				<Image
					source={imagens.logo_abepom}
					style={{
						width: 200,
						height: 200,
						marginBottom: 30,
						tintColor: tema.colors.primary,
					}}
					tintColor={tema.colors.primary}
				/>
				<Text style={{ fontSize: 20 }}>
					Você realmente deseja DESLOGAR do aplicativo?
				</Text>
				<View style={styles.linha}>
					<TouchableOpacity
						style={[
							styles.centralizado,
							styles.linha,
							{
								flex: 1,
								margin: 20,
								backgroundColor: tema.colors.vermelho,
								borderRadius: 6,
							},
						]}
						onPress={() => {
							sair();
						}}
					>
						<Image
							source={imagens.sucesso}
							style={{ width: 18, height: 18, tintColor: "#fff" }}
							tintColor="#fff"
						/>
						<Text style={{ color: "#FFF", fontSize: 20, padding: 10 }}>
							SIM, SAIR!
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.centralizado,
							styles.linha,
							{
								flex: 1,
								margin: 20,
								backgroundColor: tema.colors.primary,
								borderRadius: 6,
							},
						]}
						onPress={() => {
							navigation.navigate("Inicio");
						}}
					>
						<Image
							source={imagens.seta_direita}
							style={{
								width: 18,
								height: 18,
								transform: [{ rotateY: "180deg" }],
								tintColor: "#fff",
							}}
							tintColor="#fff"
						/>
						<Text style={{ color: "#FFF", fontSize: 20, padding: 10 }}>
							NÃO, VOLTAR
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
}

export default Sair;
