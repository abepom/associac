import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	FlatList,
	ImageBackground,
	Dimensions,
} from "react-native";
import images from "../utils/images";
import app from "../../app.json";
import { tema } from "../../assets/style/Style";
import { useUsuario } from "../store/Usuario";

function Inicio(props) {
	const { navigation } = props;
	const [portrait, setPortrait] = useState(true);
	const [usuario] = useUsuario();
	const items = [
		{
			id: 1,
			image: images.cadastrar_associado,
			title: "Cadastrar Associado",
			link: "CadastrarAssociado",
		},
		{
			id: 2,
			image: images.consultar_descontos,
			title: "Consultar Descontos",
			link: "ConsultarDescontos",
		},
		{
			id: 3,
			image: images.gerar_senha,
			title: "Gerar Senha",
			link: "GerarSenha",
		},
		{
			id: 4,
			image: images.recadastrar_associado,
			title: "Recadastrar Associado",
			link: "RecadastrarAssociado",
		},
		{
			id: 5,
			image: images.cadastrar_plano_saude,
			title: "Cadastrar Planos\nde Saúde",
			link: "PlanoDeSaude",
		},
		{
			id: 6,
			image: images.tipos_dependente,
			title: "Alterar Tipos\nde Dependente",
			link: "Dependentes",
		},
	];

	useEffect(() => {
		Dimensions.addEventListener("change", ({ window: { width, height } }) => {
			if (width < height) {
				// PORTRAIT
				setPortrait(true);
			} else {
				// LANDSCAPE
				setPortrait(false);
			}
		});
	}, []);

	return (
		<>
			<SafeAreaView style={{ flex: 1 }}>
				<ImageBackground
					source={images.bg}
					style={{
						flex: 1,
						backgroundColor: "#031e3f",
						width: "100%",
						height: "100%",
					}}
					resizeMode={"cover"}
				>
					<View
						style={{
							alignItems: "center",
							justifyContent: "center",
							marginTop: 40,
							marginBottom: 20,
						}}
					>
						<Image
							source={images.logo_abepom}
							style={{ width: 150, height: 150 }}
						/>
					</View>
					<View style={{ flex: 6 }}>
						<FlatList
							style={{ margin: 15 }}
							data={items}
							extraData={portrait}
							keyExtractor={(item) => item.id}
							numColumns={portrait ? 2 : 3}
							key={portrait ? 2 : 3}
							renderItem={({ item }) => {
								return (
									<TouchableOpacity
										onPress={() => navigation.navigate(item.link)}
										style={{
											backgroundColor: "#fff",
											elevation: 1,
											borderRadius: 6,
											flexGrow: 1,
											margin: 10,
											width: portrait ? "47%" : 200,
											height: portrait ? 210 : 180,
											padding: portrait ? 10 : 15,
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<Image
											source={item.image}
											style={{
												width: "100%",
												height: 100,
												resizeMode: "contain",
											}}
										/>
										<Text
											style={{
												fontSize: portrait ? 30 : 25,
												fontWeight: "bold",
												color: tema.colors.primary,
												textAlign: "center",
												marginVertical: 10,
											}}
										>
											{item.title.toUpperCase()}
										</Text>
									</TouchableOpacity>
								);
							}}
						/>
					</View>
					<View
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
							bottom: 15,
						}}
					>
						<TouchableOpacity
							onPress={() => navigation.navigate("Sair")}
							style={{
								margin: 20,
								padding: 20,
								flexDirection: "row",
								width: 200,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Image
								source={images.sair}
								style={{
									width: 35,
									height: 35,
									tintColor: "#fff",
									marginRight: 10,
								}}
								tintColor={"#fff"}
							/>
							<Text style={{ fontSize: 30, color: "#fff", marginLeft: 10 }}>
								SAIR
							</Text>
						</TouchableOpacity>
					</View>
					<View
						style={{
							bottom: 10,
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Text
							style={{ color: "#fff", textAlign: "center", marginRight: 5 }}
						>
							Versão: {app.expo.version.substring(0, 3)}
						</Text>
						<Text style={{ color: "#fff", textAlign: "center", marginLeft: 5 }}>
							Usuário:{" "}
							<Text style={{ fontWeight: "bold" }}>{usuario.nome}</Text>
						</Text>
					</View>
				</ImageBackground>
			</SafeAreaView>
		</>
	);
}

export default Inicio;
