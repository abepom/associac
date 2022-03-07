import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import s, { tema } from "../../assets/style/Style";
import images from "../utils/images";

export default (props) => {
	const { navigation, associado } = props;

	const menus = [
		{
			id: 1,
			link: "RecadastrarAssociado",
			image: images.recadastrar_associado,
			title: "RECADASTRAR ASSOCIADO",
		},
		{
			id: 2,
			link: "CadastrarDependente",
			image: images.tipos_dependente,
			title: "CADASTRAR DEPENDENTES",
		},
		{
			id: 3,
			link: "ConsultarDescontos",
			image: images.consultar_descontos,
			title: "CONSULTAR DESCONTOS",
		},
		{
			id: 4,
			link: "GerarSenha",
			image: images.gerar_senha,
			title: "GERAR SENHA\nMINHA ABEPOM",
		},
		// {
		// 	id: 5,
		// 	link: "CadastrarPlanosDeSaude",
		// 	image: images.cadastrar_plano_saude,
		// 	title: "CADASTRAR\nPLANO DE SAÚDE",
		// },
		// {
		// 	id: 6,
		// 	link: "CancelarPlanoDeSaude",
		// 	image: images.cancelar_plano,
		// 	title: "CANCELAR\nPLANO DE SAÚDE",
		// },
		{
			id: 7,
			link: "VisualizarRequerimentos",
			image: images.visualizar_requerimentos,
			title: "VISUALIZAR REQUERIMENTOS",
		},
	];

	const menus_sinpofesc = [
		{
			id: 1,
			link: "CadastrarAssociado",
			image: images.cadastrar_associado,
			title: "CADASTRAR ASSOCIADO",
		},
		{
			id: 2,
			link: "RecadastrarAssociado",
			image: images.recadastrar_associado,
			title: "RECADASTRAR ASSOCIADO",
		},
		{
			id: 3,
			link: "CadastrarDependente",
			image: images.tipos_dependente,
			title: "CADASTRAR DEPENDENTES",
		},
	];

	return (
		<>
			{associado?.tipo === "01" ? (
				<>
					<FlatList
						data={menus}
						keyExtractor={(item) => item.id}
						numColumns={4}
						style={s.mh20}
						renderItem={({ item }) => (
							<TouchableOpacity
								onPress={() => navigation.navigate(item.link)}
								style={[
									s.aic,
									s.bgcw,
									s.flg1,
									s.m4,
									s.pd20,
									s.flb0,
									s.el3,
									s.br6,
								]}
							>
								<Image
									source={item.image}
									style={[s.w70, s.h70, s.mb10, s.tcp]}
									tintColor={tema.colors.primary}
								/>
								<Text style={[s.tac, s.fs18]}>{item.title}</Text>
							</TouchableOpacity>
						)}
					/>
				</>
			) : associado?.tipo === "31" ? (
				<FlatList
					data={menus_sinpofesc}
					keyExtractor={(item) => item.id}
					numColumns={3}
					style={s.mh20}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => navigation.navigate(item.link)}
							style={[
								s.aic,
								s.bgcw,
								s.flg1,
								s.m4,
								s.pd20,
								s.flb0,
								s.el3,
								s.br6,
							]}
						>
							<Image
								source={item.image}
								style={[s.w70, s.h70, s.mb10, s.tcp]}
								tintColor={tema.colors.primary}
							/>
							<Text style={[s.tac, s.fs18]}>{item.title}</Text>
						</TouchableOpacity>
					)}
				/>
			) : (
				<View style={[s.row, s.fl1]}>
					<View style={[s.fl1, s.jcc, s.aic, s.pd20]}>
						<TouchableOpacity
							onPress={() => navigation.navigate("CadastrarAssociado")}
							style={[s.bgcw, s.fullw, s.pd10, s.jcc, s.aic, s.br6, s.el3]}
						>
							<Image
								source={images.cadastrar_associado}
								style={[s.w60, s.h60, s.mb10]}
							/>
							<Text style={s.fs20}>CADASTRAR ASSOCIADO</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</>
	);
};
