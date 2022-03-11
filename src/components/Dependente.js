import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import formatDate from "../functions/formatDate";
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
		setAlerta,
	} = props;
	let data_atual = new Date();
	let data_inativo =
		item.data_inativo !== ""
			? new Date(formatDate(item.data_inativo, "AMD"))
			: new Date();
	const diferenca = Math.abs(data_atual.getTime() - data_inativo.getTime());
	const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

	const confirmarExclusaoDependente = async (item) => {
		setDependenteEscolhido(item);
		setModalExcluirDependente(true);
	};

	return (
		<View
			style={[
				s.bgcw,
				s.el1,
				s.br6,
				s.flg1,
				s.mv6,
				s.pd20,
				s.row,
				s.h100,
				s.aic,
				{
					borderColor: item.inativo
						? tema.colors.vermelho
						: tema.colors.background,
					borderWidth: item.inativo ? 1 : 0,
				},
			]}
		>
			<View style={s.fl12}>
				<Text style={[s.fs20, s.fcp]}>{item.nome.toUpperCase()}</Text>
				<Text style={[s.fs15, s.fcp]}>TIPO: {item.tipo.toUpperCase()}</Text>
				{item.pre_cadastro ? <Text style={s.fcr}>PRÉ-CADASTRADO</Text> : null}
				{item.inativo ? (
					<Text style={[s.fcr, s.fs12]}>
						DEPENDENTE INATIVO - {item.data_inativo}
					</Text>
				) : null}
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
			) : item.inativo ? (
				item.data_inativo === "" || dias >= 730 ? (
					<TouchableOpacity
						onPress={() =>
							navigation.navigate("AtivarDependente", {
								matricula: associado_atendimento.matricula,
								dependente: item,
							})
						}
						style={[s.fl1, s.jcc, s.aic]}
					>
						<Image
							source={images.ativar_dependente}
							style={[s.w35, s.h35, s.tcg]}
							tintColor={tema.colors.tcg}
						/>
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={() =>
							setAlerta({
								visible: true,
								title: "ATIVAR DEPENDENTE",
								message: `O dependente ${
									item.nome
								} não pode ser ativado.${"\n"}A sua inativação ainda não passou do período de 2 anos.`,
								type: "danger",
								confirmText: "FECHAR",
								showConfirm: true,
								showCancel: false,
							})
						}
						style={[s.fl1, s.jcc, s.aic]}
					>
						<Image
							source={images.ativar_dependente}
							style={[s.w35, s.h35, s.tcc]}
							tintColor={tema.colors.cinza}
						/>
					</TouchableOpacity>
				)
			) : (
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("AlterarDependente", {
							matricula: associado_atendimento.matricula,
							dependente: item,
						})
					}
					style={[s.fl1, s.jcc, s.aic]}
				>
					<Image
						source={images.alterar_dados}
						style={[s.w35, s.h35, s.tcp]}
						tintColor={tema.colors.primary}
					/>
				</TouchableOpacity>
			)}
			{!item.inativo && (
				<TouchableOpacity
					onPress={() => confirmarExclusaoDependente(item)}
					style={[s.fl1, s.jcc, s.aic]}
				>
					<Image
						source={images.trash}
						style={[s.w35, s.h35, s.tcr]}
						tintColor={tema.colors.vermelho}
					/>
				</TouchableOpacity>
			)}
		</View>
	);
};
