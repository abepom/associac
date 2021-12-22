import React, { useState } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	Keyboard,
	FlatList,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { TextInput } from "react-native-paper";
import styles, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import Messages from "../components/Messages";
import images from "../utils/images";
import Alert from "../components/Alert";
import { useUsuario } from "../store/Usuario";

function GerarSenha(props) {
	const { navigation } = props;
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
	const [associado, setAssociado] = useState({});
	const [dependentes, setDependentes] = useState([]);
	const [carregando, setCarregando] = useState(false);
	const [mostrarDados, setMostrarDados] = useState(false);
	const [alerta, setAlerta] = useState({});

	const verificarMatricula = async () => {
		if (matricula !== "") {
			setCarregando(true);

			try {
				const { data } = await api({
					url: "/associados/verificarMatricula",
					method: "GET",
					params: { cartao: matricula },
					headers: { "x-access-token": token },
				});

				if (data.status) {
					setAssociado(data);

					const response = await api({
						url: "/associados/listarDependentes",
						method: "GET",
						params: {
							cartao: `${matricula}00001`,
						},
						headers: { "x-access-token": token },
					});

					setDependentes(response.data.dependentes);
					setMostrarDados(true);
				} else {
					setAssociado({});
					setMostrarDados(false);
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: data.message,
						type: "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});
				}

				setCarregando(false);
				Keyboard.dismiss();
			} catch (error) {
				setAssociado({});
				setCarregando(false);
				setMostrarDados(false);
				Keyboard.dismiss();

				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao verificar a matrícula.",
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			}
		} else {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Para prosseguir é obrigatório informar a matrícula.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});
		}
	};

	const gerarSenha = async (cartao, celular, tipo) => {
		try {
			const { data } = await api({
				url: "/associados/gerarSenhaAppDependente",
				method: "POST",
				data: {
					cartao,
					celular,
				},
				headers: { "x-access-token": token },
			});

			if (data.status) {
				setAlerta({
					visible: true,
					title: data.title,
					message: `Uma nova senha será enviada para o celular do ${
						tipo == 1 ? "titular" : "dependente"
					}. Caso o ${
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
		if (associado.cartao === "") {
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
			if (!associado.ativo) {
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
				if (associado.celular === "") {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message:
							"O titular informado não possui o celular cadastrado na ABEPOM.",
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
		if (item.cartao === "") {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "O dependente selecionado não possui o cartão da ABEPOM.",
				type: "danger",
				confirmText: "ATUALIZAR TELEFONE",
				cancelText: "FECHAR",
				showConfirm: true,
				showCancel: true,
				confirmFunction: ()=> navigation.navigate("AlterarTipoDependente", {
					matricula,
					dependente: item,
				})
			});
		} else {
			if (item.celular === "") {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message:
						"O dependente selecionado não possui o celular cadastrado na ABEPOM.",
					type: "danger",
					confirmText: "ATUALIZAR TELEFONE",
					cancelText: "FECHAR",
					showConfirm: true,
					showCancel: true,
					confirmFunction: ()=> navigation.navigate("AlterarTipoDependente", {
						matricula,
						dependente: item,
					})
				});
			} else {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message:
						"Não é possível gerar uma nova senha para o dependente selecionado.",
					type: "danger",
					confirmText: "ATUALIZAR TELEFONE",
					cancelText: "FECHAR",
					showConfirm: true,
					showCancel: true,
					confirmFunction: ()=> navigation.navigate("AlterarTipoDependente", {
						matricula,
						dependente: item,
					})
				});
			}
		}
	};

	const confirmarEnvio = (cartao, celular, tipo) => {
		setAlerta({
			visible: true,
			title: "ATENÇÃO!",
			message: `Você deseja enviar um SMS para o ${
				tipo == 1 ? "titular" : "dependente"
			} com a senha do ABEPOM Mobile no número ${celular}?`,
			type: "warning",
			confirmText: "SIM, ENVIAR!",
			showConfirm: true,
			showCancel: true,
			cancelText: "FECHAR",
			confirmFunction: () => gerarSenha(cartao, celular, tipo),
		});
	};

	return (
		<>
			<Header titulo={"Gerar Senha"} {...props} />
			<SafeAreaView style={{ flex: 1, zIndex: 100 }}>
				<View style={{ flex: 1, margin: 20 }}>
					<Text
						style={{
							textAlign: "center",
							marginTop: 10,
							marginBottom: 20,
							fontSize: 17,
						}}
					>
						Gere uma senha para acesso ao aplicativo ABEPOM Mobile para a
						matrícula abaixo.
					</Text>
					<View style={{ flexDirection: "row" }}>
						<View style={{ flex: 1 }}></View>
						<View style={{ flex: 1, marginHorizontal: 5 }}>
							<TextInput
								label="Matrícula"
								value={matricula}
								mode="outlined"
								theme={tema}
								keyboardType={"numeric"}
								maxLength={6}
								onChangeText={(text) => setMatricula(text)}
								render={(props) => (
									<TextInputMask
										{...props}
										type={"custom"}
										options={{
											mask: "999999",
										}}
									/>
								)}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<TouchableOpacity
								onPress={() => verificarMatricula()}
								style={[
									styles.linha,
									{
										justifyContent: "center",
										alignContent: "center",
										alignItems: "center",
										height: 55,
										backgroundColor: tema.colors.primary,
										marginTop: 8,
										borderRadius: 6,
									},
								]}
							>
								<Image
									source={images.buscar}
									style={{
										tintColor: "#fff",
										width: 20,
										height: 20,
										marginRight: 10,
									}}
								/>
								<Text style={{ color: "#fff", fontSize: 20 }}>BUSCAR</Text>
							</TouchableOpacity>
						</View>
						<View style={{ flex: 1 }}></View>
					</View>
					<View style={{ flex: 1, marginTop: 50 }}>
						{carregando ? (
							<View style={[styles.centralizado, { flex: 1 }]}>
								<Loading size={120} />
							</View>
						) : (
							<>
								{mostrarDados && (
									<>
										{associado.status ? (
											<>
												<View
													style={{
														width: "100%",
														backgroundColor: tema.colors.background,
														borderRadius: 6,
														padding: 20,
														marginBottom: 20,
														elevation: 2,
														flexDirection: "row",
													}}
												>
													<View style={{ flex: 9 }}>
														<Text
															style={{
																fontSize: 20,
																color: tema.colors.primary,
																fontWeight: "bold",
															}}
														>
															{associado.nome}
														</Text>
														{associado.tipo === "01" ? (
															<Text
																style={{
																	fontSize: 16,
																	color: tema.colors.verde,
																}}
															>
																ASSOCIADO ABEPOM
															</Text>
														) : (
															<Text
																style={{
																	fontSize: 16,
																	color: tema.colors.vermelho,
																}}
															>
																NÃO ASSOCIADO
															</Text>
														)}
													</View>
													<View
														style={{
															flex: 2,
															justifyContent: "center",
															alignItems: "center",
														}}
													>
														{associado.celular !== "" ? (
															<>
																<Text
																	style={{
																		fontSize: 16,
																		color: tema.colors.primary,
																	}}
																>
																	CELULAR
																</Text>
																<Text
																	style={{
																		fontSize: 16,
																		color: tema.colors.primary,
																	}}
																>
																	{associado.celular}
																</Text>
															</>
														) : (
															<>
																<Text
																	style={{
																		fontSize: 16,
																		color: tema.colors.primary,
																	}}
																>
																	NÃO POSSUI
																</Text>
																<Text
																	style={{
																		fontSize: 16,
																		color: tema.colors.primary,
																	}}
																>
																	CELULAR
																</Text>
															</>
														)}
													</View>
													<View
														style={{
															flex: 1,
															justifyContent: "center",
															alignItems: "center",
														}}
													>
														{associado.cartao !== "" &&
														associado.ativo &&
														associado.celular !== "" ? (
															<TouchableOpacity
																onPress={() =>
																	confirmarEnvio(
																		associado.cartao,
																		associado.celular,
																		1
																	)
																}
															>
																<Image
																	source={images.chave}
																	style={{
																		width: 30,
																		height: 30,
																		tintColor: tema.colors.primary,
																	}}
																	tintColor={tema.colors.primary}
																/>
															</TouchableOpacity>
														) : (
															<TouchableOpacity
																onPress={() => modalSenhaTitular()}
															>
																<Image
																	source={images.atencao}
																	style={{
																		width: 30,
																		height: 30,
																		tintColor: tema.colors.primary,
																	}}
																	tintColor={tema.colors.primary}
																/>
															</TouchableOpacity>
														)}
													</View>
												</View>
												<View style={{ flexDirection: "row" }}>
													<View style={{ flex: 1 }}>
														{associado.tipo !== "01" && (
															<TouchableOpacity
																onPress={() =>
																	navigation.navigate("CadastrarAssociado")
																}
																style={{
																	flexDirection: "row",
																	margin: 20,
																	backgroundColor: "#031e3f",
																	justifyContent: "center",
																	padding: 20,
																	borderRadius: 6,
																}}
															>
																<Text
																	style={{
																		color: "#fff",
																		fontSize: 17,
																		marginRight: 10,
																	}}
																>
																	CADASTRAR ASSOCIADO
																</Text>
																<Image
																	source={images.seta}
																	style={{
																		width: 20,
																		height: 20,
																		tintColor: "#fff",
																	}}
																	tintColor={"#fff"}
																/>
															</TouchableOpacity>
														)}
													</View>
												</View>
												<View style={{ flex: 1 }}>
													<FlatList
														data={dependentes}
														keyExtractor={(item) => item.cont}
														numColumns={1}
														renderItem={({ item }) => {
															return (
																<TouchableOpacity
																onPress={()=>item.cartao !== "" &&
																item.celular !== "" ? confirmarEnvio(
																	item.cartao,
																	item.celular,
																	2
																):modalSenhaDependente(item) }
																	style={{
																		backgroundColor: "#fff",
																		elevation: 1,
																		borderRadius: 6,
																		flexGrow: 1,
																		marginVertical: 5,
																		padding: 20,
																		flexDirection: "row",
																	}}
																>
																	<View style={{ flex: 9 }}>
																		<Text
																			style={{
																				fontSize: 20,
																				color: tema.colors.primary,
																			}}
																		>
																			{item.nome.toUpperCase()}
																		</Text>
																		<Text
																			style={{
																				fontSize: 16,
																				color: tema.colors.primary,
																			}}
																		>
																			TIPO: {item.tipo.toUpperCase()}
																		</Text>
																	</View>
																	<View
																		style={{
																			flex: 2,
																			justifyContent: "center",
																			alignItems: "center",
																		}}
																	>
																		{item.celular !== "" ? (
																			<>
																				<Text
																					style={{
																						fontSize: 16,
																						color: tema.colors.primary,
																					}}
																				>
																					CELULAR
																				</Text>
																				<Text
																					style={{
																						fontSize: 16,
																						color: tema.colors.primary,
																					}}
																				>
																					{item.celular}
																				</Text>
																			</>
																		) : (
																			<>
																				<Text
																					style={{
																						fontSize: 16,
																						color: tema.colors.primary,
																					}}
																				>
																					NÃO POSSUI
																				</Text>
																				<Text
																					style={{
																						fontSize: 16,
																						color: tema.colors.primary,
																					}}
																				>
																					CELULAR
																				</Text>
																			</>
																		)}
																	</View>
																	<View
																		style={{
																			flex: 1,
																			justifyContent: "center",
																			alignItems: "center",
																		}}
																	>
																		{item.cartao !== "" &&
																		item.celular !== "" ? (
																			
																				<Image
																					source={images.chave}
																					style={{
																						width: 30,
																						height: 30,
																						tintColor: tema.colors.primary,
																					}}
																					tintColor={tema.colors.primary}
																				/>
																		) : (
																			
																				<Image
																					source={images.atencao}
																					style={{
																						width: 30,
																						height: 30,
																						tintColor: tema.colors.primary,
																					}}
																					tintColor={tema.colors.primary}
																				/>
																		)}
																	</View>
																</TouchableOpacity>
															);
														}}
													/>
												</View>
											</>
										) : (
											<View style={{ flexDirection: "row" }}>
												<View style={{ flex: 1 }} />
												<View style={{ height: 100, flex: 3 }}>
													<Messages
														titulo={`ASSOCIADO NÃO ENCONTRADO`}
														subtitulo="A matrícula informada não pertence a nenhum associado cadastrado na ABEPOM."
														cor={tema.colors.vermelho}
														imagem={images.atencao}
													/>
												</View>
												<View style={{ flex: 1 }} />
											</View>
										)}
									</>
								)}
							</>
						)}
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default GerarSenha;
