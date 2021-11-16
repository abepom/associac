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

function Inicio({ navigation }) {
	const items = [
		{
			id: 1,
			title: "CADASTRAR ASSOCIADO",
			icon: "",
			link: "CadastrarAssociado",
		},
		{
			id: 2,
			title: "CONSULTAR DESCONTOS",
			icon: "",
			link: "ConsultarDescontos",
		},
		{ id: 3, title: "GERAR SENHA", icon: "", link: "GerarSenha" },
		{ id: 4, title: "RECADASTRAR DADOS", icon: "", link: "Recadastrar" },
		{ id: 5, title: "PLANO DE SAÚDE", icon: "", link: "PlanoDeSaude" },
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
						marginVertical: 20,
					}}
				>
					<Image
						source={images.logo_abepom}
						style={{ width: 100, height: 100 }}
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
								<Text>{item.title}</Text>
							</TouchableOpacity>
						);
					}}
				/>
			</ImageBackground>
		</SafeAreaView>
	);
}

export default Inicio;
