import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import s, { tema } from "../../assets/style/Style";
import { useUsuario } from "../store/Usuario";
import images from "../utils/images";

export default (props) => {
	const [{ associado_atendimento }] = useUsuario();
	const {
		navigation,
		item,
		setDependenteEscolhido,
		setModalExcluirDependente,
	} = props;

	const confirmarExclusaoDependente = async (item) => {
		setDependenteEscolhido(item);
		setModalExcluirDependente(true);
	};

	return (
		<View style={[s.bgcw, s.el1, s.br6, s.flg1, s.mv6, s.pd20, s.row]}>
			<View style={s.fl12}>
				<Text style={[s.fs20, s.fcp]}>{item.nome.toUpperCase()}</Text>
				<Text style={[s.fs15, s.fcp]}>TIPO: {item.tipo.toUpperCase()}</Text>
				{item.pre_cadastro ? <Text style={s.fcr}>PRÉ-CADASTRADO</Text> : null}
			</View>
			<View style={[s.fl3, s.jcc, s.aic]}>
				<Text style={[s.fs15, s.fcp]}>NASCIMENTO</Text>
				<Text style={[s.fs15, s.fcp]}>{item.data_nascimento}</Text>
			</View>
			{item.pre_cadastro ? (
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("EnviarDocumentoDependente", {
							cartao: associado_atendimento.cartao,
							dependente: item.cont,
							nome: item.nome,
						})
					}
					style={[s.fl1, s.jcc, s.aic]}
				>
					<Image
						source={images.file}
						style={[s.w50, s.h50, s.tcp]}
						tintColor={tema.colors.primary}
					/>
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("AlterarTipoDependente", {
							matricula: associado_atendimento.matricula,
							dependente: item,
						})
					}
					style={[s.fl1, s.jcc, s.aic]}
				>
					<Image
						source={images.recadastrar_associado}
						style={[s.w50, s.h50, s.tcp]}
						tintColor={tema.colors.primary}
					/>
				</TouchableOpacity>
			)}
			<TouchableOpacity
				onPress={() => confirmarExclusaoDependente(item)}
				style={[s.fl1, s.jcc, s.aic]}
			>
				<Image
					source={images.trash}
					style={[s.w38, s.h38, s.tcr]}
					tintColor={tema.colors.vermelho}
				/>
			</TouchableOpacity>
		</View>
	);
};
