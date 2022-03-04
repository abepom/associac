import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	AsyncStorage,
} from "react-native";
import s, { tema } from "../../assets/style/Style";
import Header from "../components/Header";
import images from "../utils/images";

function Sair(props) {
	const { navigation } = props;

	async function sair() {
		await AsyncStorage.clear().then((usuario) =>
			navigation.navigate("Login", { id: new Date().toJSON() })
		);
	}

	return (
		<>
			<Header
				titulo="Sair"
				voltar={false}
				voltarPara={{ name: "Inicio", params: {} }}
				{...props}
			/>
			<View style={[s.jcc, s.aic, s.bgcw, s.fl1]}>
				<Image
					source={images.logo_abepom}
					style={[s.w200, s.h200, s.mb20, s.tcp]}
					tintColor={tema.colors.primary}
				/>
				<Text style={s.fs25}>
					Você realmente deseja DESLOGAR do aplicativo?
				</Text>
				<View style={s.row}>
					<TouchableOpacity
						style={[s.jcc, s.aic, s.row, s.fl1, s.m20, s.bgcr, s.br6]}
						onPress={() => sair()}
					>
						<Image
							source={images.sucesso}
							style={[s.w20, s.h20, s.tcw]}
							tintColor={tema.colors.background}
						/>
						<Text style={[s.fcw, s.fs20, s.pd10]}>SIM, SAIR!</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[s.jcc, s.aic, s.row, s.fl1, s.m20, s.bgcp, s.br6]}
						onPress={() => navigation.navigate("Inicio")}
					>
						<Image
							source={images.seta}
							style={[s.w20, s.h20, s.tr180, s.tcw]}
							tintColor={tema.colors.background}
						/>
						<Text style={[s.fcw, s.fs20, s.pd10]}>NÃO, VOLTAR</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	);
}

export default Sair;
