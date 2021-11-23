import React from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	FlatList,
	ImageBackground,
} from "react-native";
import images from "../utils/images";
import app from "../../app.json";

function Inicio({ navigation }) {
	const items = [
		{
			id: 1,
			image: images.cadastrar_associado,
			link: "CadastrarAssociado",
		},
		{
			id: 2,
			image: images.consultar_descontos,
			link: "ConsultarDescontos",
		},
		{ id: 3, image: images.gerar_senha, link: "GerarSenha" },
		{
			id: 4,
			image: images.recadastrar_associado,
			link: "RecadastrarAssociado",
		},
		{
			id: 5,
			image: images.cadastrar_plano_saude,
			link: "PlanoDeSaude",
		},
	];

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<ImageBackground
				source={images.bg}
				style={{
					flex: 1,
					backgroundColor: "#031e3f",
				}}
				resizeMode={"repeat"}
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
						style={{ width: 200, height: 200 }}
					/>
				</View>
				<FlatList
					style={{ margin: 15 }}
					data={items}
					keyExtractor={(item) => item.id}
					numColumns={2}
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
									width: "47%",
									height: 150,
									padding: 10,
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								{item.image ? (
									<Image
										source={item.image}
										style={{
											width: "100%",
											height: 100,
											resizeMode: "contain",
										}}
									/>
								) : (
									<Text>{item.title}</Text>
								)}
							</TouchableOpacity>
						);
					}}
				/>
				<Text style={{ color: "#fff", textAlign: "center", bottom: 20 }}>
					Versão: {app.expo.version.substring(0, 3)}
				</Text>
			</ImageBackground>
		</SafeAreaView>
	);
}

export default Inicio;
