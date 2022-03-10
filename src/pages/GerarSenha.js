import React, { useEffect, useState } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	FlatList,
} from "react-native";
import s, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Header from "../components/Header";
import images from "../utils/images";
import Alert from "../components/Alert";
import { useUsuario } from "../store/Usuario";

function GerarSenha(props) {
	const { navigation } = props;
	const [{ token, associado_atendimento }] = useUsuario();
	const [alerta, setAlerta] = useState({ visible: false });

	const gerarSenha = async (nome, cartao, celular, tipo) => {
		try {
			const { data } = await api({
				url: "/associados/gerarSenhaAppDependente",
				method: "POST",
				data: { cartao, celular },
				headers: { "x-access-token": token },
			});

			if (data.status) {
				setAlerta({
					visible: true,
					title: data.title,
					message: `Uma nova senha será enviada para o celular do${"\n"}${
						tipo == 1 ? "titular" : "dependente"
					} ${nome}.${"\n"}Caso o ${
						tipo == 1 ? "titular" : "dependente"
					} não receba o SMS, entre em contato com a ABEPOM.`,
					type: "success",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			} else {
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			}
		} catch (error) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Ocorreu um erro ao tentar gerar a senha.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});
		}
	};

	const modalSenhaTitular = () => {
		setAlerta({ visible: false });

		if (associado_atendimento.cartao === "") {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "O titular informado não possui o cartão da ABEPOM.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});
		} else {
			if (!associado_atendimento.ativo) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "O titular informado consta como inativo.",
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			} else {
				if (associado_atendimento.celular === "") {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: `O titular informado não possui o${"\n"}celular cadastrado na ABEPOM.`,
						type: "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});
				} else {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message:
							"Não é possível gerar uma nova senha para o titular informado.",
						type: "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});
				}
			}
		}
	};

	const modalSenhaDependente = (item) => {
		setAlerta({ visible: false });

		if (item.cartao === "") {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: `O dependente selecionado não possui${"\n"}o cartão da ABEPOM.`,
				type: "danger",
				confirmText: "ATUALIZAR TELEFONE",
				cancelText: "FECHAR",
				showConfirm: true,
				showCancel: true,
				confirmFunction: () => {
					setAlerta({ visible: false });
					navigation.navigate("AlterarDependente", { dependente: item });
				},
			});
		} else {
			if (item.celular === "") {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: `O dependente selecionado não possui o${"\n"}celular cadastrado na ABEPOM.`,
					type: "danger",
					confirmText: "ATUALIZAR TELEFONE",
					cancelText: "FECHAR",
					showConfirm: true,
					showCancel: true,
					confirmFunction: () => {
						setAlerta({ visible: false });
						navigation.navigate("AlterarDependente", { dependente: item });
					},
				});
			} else {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: `Não é possível gerar uma nova senha${"\n"}para o dependente selecionado.`,
					type: "danger",
					confirmText: "ATUALIZAR TELEFONE",
					cancelText: "FECHAR",
					showConfirm: true,
					showCancel: true,
					confirmFunction: () => {
						setAlerta({ visible: false });
						navigation.navigate("AlterarDependente", { dependente: item });
					},
				});
			}
		}
	};

	const confirmarEnvio = (nome, cartao, celular, tipo) => {
		setAlerta({ visible: false });
		setAlerta({
			visible: true,
			title: "ATENÇÃO!",
			message: `Você deseja enviar um SMS para o${"\n"}${
				tipo == 1 ? "titular" : "dependente"
			} ${nome} com a senha do ABEPOM Mobile no número ${celular}?`,
			type: "warning",
			confirmText: "SIM, ENVIAR!",
			showConfirm: true,
			showCancel: true,
			cancelText: "FECHAR",
			confirmFunction: () => gerarSenha(nome, cartao, celular, tipo),
		});
	};

	useEffect(() => {
		setAlerta({ visible: false });
	}, []);

	return (
		<>
			<Header titulo={"Gerar Senha"} {...props} />
			<SafeAreaView style={s.fl1}>
				<View style={[s.fl1, s.m20]}>
					<View style={[s.fl1, s.mt50]}>
						<TouchableOpacity
							onPress={() =>
								associado_atendimento.cartao !== "" &&
								associado_atendimento.celular !== ""
									? confirmarEnvio(
											associado_atendimento.nome,
											associado_atendimento.cartao,
											associado_atendimento.celular,
											1
									  )
									: modalSenhaTitular()
							}
							style={[s.fullw, s.bgcw, s.br6, s.pd20, s.mb20, s.el3, s.row]}
						>
							<View style={s.fl9}>
								<Text style={[s.fs20, s.fcp, s.bold]}>
									{associado_atendimento.nome}
								</Text>
								{associado_atendimento.tipo === "01" ? (
									<Text style={[s.fs15, s.fcg]}>ASSOCIADO ABEPOM</Text>
								) : associado_atendimento.tipo === "31" ? (
									<Text style={[s.fs15, s.fcg]}>ASSOCIADO SINPOFESC</Text>
								) : (
									<Text style={[s.fs15, s.fcr]}>NÃO ASSOCIADO</Text>
								)}
							</View>
							<View style={[s.fl3, s.jcc, s.aic]}>
								{associado_atendimento.celular !== "" ? (
									<Text style={[s.fs15, s.fcp, s.tac]}>
										CELULAR{`\n`}
										{associado_atendimento.celular}
									</Text>
								) : (
									<Text style={[s.fs15, s.fcp, s.tac]}>
										NÃO POSSUI{`\n`}
										CELULAR
									</Text>
								)}
							</View>
							<View style={[s.fl1, s.jcc, s.aic]}>
								{associado_atendimento.cartao !== "" &&
								associado_atendimento.ativo &&
								associado_atendimento.celular !== "" ? (
									<TouchableOpacity
										onPress={() =>
											confirmarEnvio(
												associado_atendimento.nome,
												associado_atendimento.cartao,
												associado_atendimento.celular,
												1
											)
										}
									>
										<Image
											source={images.chave}
											style={[s.w35, s.h35, s.tcp]}
											tintColor={tema.colors.primary}
										/>
									</TouchableOpacity>
								) : (
									<TouchableOpacity onPress={() => modalSenhaTitular()}>
										<Image
											source={images.atencao}
											style={[s.w35, s.h35, s.tcp]}
											tintColor={tema.colors.primary}
										/>
									</TouchableOpacity>
								)}
							</View>
						</TouchableOpacity>
						<View style={s.row}>
							<View style={s.fl1}>
								{associado_atendimento.tipo !== "01" && (
									<TouchableOpacity
										onPress={() => navigation.navigate("CadastrarAssociado")}
										style={[s.row, s.m20, s.bgcp, s.jcc, s.pd20, s.br6]}
									>
										<Text style={[s.fcw, s.fs18, s.mr10]}>
											CADASTRAR ASSOCIADO
										</Text>
										<Image
											source={images.seta}
											style={[s.w20, s.h20, s.tcw]}
											tintColor={tema.colors.background}
										/>
									</TouchableOpacity>
								)}
							</View>
						</View>
						<View style={s.fl1}>
							<FlatList
								data={associado_atendimento.dependentes}
								keyExtractor={(item) => item.cont}
								numColumns={1}
								renderItem={({ item }) => {
									return (
										<TouchableOpacity
											onPress={() =>
												item.cartao !== "" && item.celular !== ""
													? confirmarEnvio(
															item.nome,
															item.cartao,
															item.celular,
															2
													  )
													: modalSenhaDependente(item)
											}
											style={[
												s.bgcw,
												s.el1,
												s.br6,
												s.flg1,
												s.mv6,
												s.pd20,
												s.row,
											]}
										>
											<View style={s.fl9}>
												<Text style={[s.fs20, s.fcp, s.bold]}>
													{item.nome.toUpperCase()}
												</Text>
												<Text style={[s.fs18, s.fcp]}>
													TIPO: {item.tipo.toUpperCase()}
												</Text>
											</View>
											<View style={[s.fl3, s.jcc, s.aic]}>
												{item.celular !== "" ? (
													<Text style={[s.fs15, s.fcp]}>
														CELULAR{`\n`}
														{item.celular}
													</Text>
												) : (
													<Text style={[s.fs15, s.fcp]}>
														NÃO POSSUI{`\n`}
														CELULAR
													</Text>
												)}
											</View>
											<View style={[s.fl1, s.jcc, s.aic]}>
												{item.cartao !== "" && item.celular !== "" ? (
													<Image
														source={images.chave}
														style={[s.w35, s.h35, s.tcp]}
														tintColor={tema.colors.primary}
													/>
												) : (
													<Image
														source={images.atencao}
														style={[s.w35, s.h35, s.tcp]}
														tintColor={tema.colors.primary}
													/>
												)}
											</View>
										</TouchableOpacity>
									);
								}}
							/>
						</View>
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default GerarSenha;
