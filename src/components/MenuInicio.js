import React from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import s from "../../assets/style/Style";
import images from "../utils/images";

export default (props) => {
	const { navigation, associado = false } = props;
	const menus = [
		{
			id: 1,
			link: "RecadastrarAssociado",
			image: images.cadastrar_associado,
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
		{
			id: 5,
			link: "PlanosDeSaude",
			image: images.cadastrar_plano_saude,
			title: "CADASTRAR\nPLANO DE SAÚDE",
		},
		{
			id: 6,
			link: "PlanosDeSaude",
			image: images.cadastrar_plano_saude,
			title: "MIGRAR\nPLANO DE SAÚDE",
		},
	];

	return (
		<>
			{associado ? (
				<>
					<FlatList
						data={menus}
						keyExtractor={(item) => item.id}
						numColumns={3}
						style={{ marginHorizontal: 20 }}
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
								<Image source={item.image} style={[s.w60, s.h60]} />
								<Text style={[s.tac, s.fs18]}>{item.title}</Text>
							</TouchableOpacity>
						)}
					/>
				</>
			) : (
				<View style={s.row}>
					<View style={[s.fl1, s.jcc, s.aic, s.pd20]}>
						<TouchableOpacity
							onPress={() => navigation.navigate("CadastrarAssociado")}
							style={[s.bgcw, s.fullw, s.pd10, s.jcc, s.aic, s.br6, s.el3]}
						>
							<Image
								source={images.cadastrar_associado}
								style={[s.w60, s.h60]}
							/>
							<Text style={s.fs20}>CADASTRAR ASSOCIADO</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</>
	);
};
