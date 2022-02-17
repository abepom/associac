import React, { useEffect, useState } from "react";
import {
	FlatList,
	Image,
	Keyboard,
	Modal,
	Platform,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { Checkbox, TextInput } from "react-native-paper";
import styles, { tema } from "../../assets/style/Style";
import Header from "../components/Header";
import images from "../utils/images";
import Alert from "../components/Alert";
import api from "../../services/api";
import Loading from "../components/Loading";
import Messages from "../components/Messages";
import { useUsuario } from "../store/Usuario";
import WebView from "react-native-webview";

function Dependentes(props) {
	const { navigation } = props;
	const id = props.route?.params?.id ?? 1;
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
	const [alerta, setAlerta] = useState({});
	const [carregando, setCarregando] = useState(false);
	const [associado, setAssociado] = useState({});
	const [mostrarDados, setMostrarDados] = useState(false);
	const [dependentes, setDependentes] = useState([]);
	const [modal, setModal] = useState(false);
	const [modalTermo, setModalTermo] = useState(false);
	const [modalCarregando, setModalCarregando] = useState(false);
	const [motivo, setMotivo] = useState("");
	const [termo, setTermo] = useState("");
	const [aceitoTermo, setAceitoTermo] = useState(false);
	const [dependenteEscolhido, setDependenteEscolhido] = useState({});

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

				setAssociado(data);

				if (data.status) {
					listarDependentes();
				} else {
					setDependentes([]);
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
				setCarregando(false);
				setDependentes([]);
				setMostrarDados(false);
				Keyboard.dismiss();

				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao listar os dependentes.",
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

	const confirmarExclusao = async (item) => {
		setDependenteEscolhido(item);
		setModal(true);
	};

	const excluir = async () => {
		if (dependenteEscolhido.nome !== "" && motivo !== "" && aceitoTermo) {
			setModal(false);
			setModalCarregando(true);

			const { data } = await api({
				url: "/associados/excluirDependente",
				method: "POST",
				data: {
					cartao: associado.cartao,
					dep: dependenteEscolhido.cont,
					cd_dep: dependenteEscolhido.cod_dep,
					nome: dependenteEscolhido.nome,
					tipo: dependenteEscolhido.pre_cadastro ? 2 : 1,
					motivo,
					origem: "Associac Mobile",
				},
				headers: { "x-access-token": token },
			});

			setModalCarregando(false);

			setAlerta({
				visible: true,
				title: data.title,
				message: data.message,
				type: data.status ? "success" : "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});

			if (data.status) {
				listarDependentes();
			}

			setDependenteEscolhido({});
			setMotivo("");
			setAceitoTermo(false);
		} else {
			setModal(false);
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Para prosseguir é necessário selecionar o dependente, preencher o motivo e aceitar o Termo de Exclusão de Dependentes.",
				type: "danger",
				confirmText: "OK, PREENCHER!",
				cancelText: "FECHAR",
				showConfirm: true,
				showCancel: true,
				confirmFunction: () => {
					setAlerta({ visible: false });
					setModal(true);
				},
			});
		}
	};

	async function listarDependentes() {
		setCarregando(true);
		setMostrarDados(false);

		const { data } = await api({
			url: "/associados/listarDependentes",
			method: "GET",
			params: {
				cartao: `${matricula}00001`,
			},
			headers: { "x-access-token": token },
		});
		setDependentes(data.dependentes);
		setMostrarDados(true);
		setCarregando(false);
	}

	async function mostrarTermo() {
		setModal(false);
		setModalTermo(true);

		const { data } = await api({
			url: "/associados/visualizarTermo",
			method: "GET",
			params: { id_local: 8 },
			headers: { "x-access-token": token },
		});

		let t = data.termo;
		t = t
			.replace("@TITULAR", associado.nome)
			.replace(
				"@DEPENDENTE",
				dependenteEscolhido.nome !== ""
					? `<b>${dependenteEscolhido.nome.toUpperCase()}</b>`
					: ""
			);

		if (Platform.OS === "ios") {
			t = t
				.replace(/font-size: 12pt !important;/g, `font-size: 30pt !important;`)
				.replace(
					/h3 style="text-align: center;"><span style="font-family: Arial, Helvetica, sans-serif;"/g,
					`h3 style="text-align: center;font-size: 40pt"><span style="font-family: Arial, Helvetica, sans-serif;"`
				);
		}

		setTermo({
			id: data.id_termo,
			texto: t,
		});
	}

	useEffect(() => {
		if (id !== 1) {
			listarDependentes();
		}
	}, [id]);

	return (
		<>
			<Header titulo="Buscar Dependentes" {...props} />
			<Modal animationType="fade" transparent visible={modalCarregando}>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "#000A",
					}}
				>
					<View
						style={{
							justifyContent: "center",
							alignItems: "center",
							padding: 20,
							margin: 10,
							borderRadius: 6,
							backgroundColor: "#fff",
						}}
					>
						<Loading size={90} />
						<Text>CARREGANDO...</Text>
					</View>
				</View>
			</Modal>
			<Modal visible={modal} transparent>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "#000A",
					}}
				>
					<View
						style={{
							justifyContent: "center",
							alignItems: "center",
							padding: 25,
							margin: 20,
							borderRadius: 6,
							backgroundColor: "#fff",
							width: "85%",
						}}
					>
						<Text
							style={{ textAlign: "center", marginBottom: 10, fontSize: 20 }}
						>
							Você realmente deseja excluir o dependente{`\n`}
							<Text style={{ fontWeight: "bold" }}>
								{dependenteEscolhido.nome}
							</Text>
							?
						</Text>
						<View style={{ flexDirection: "row", marginTop: 10 }}>
							<TextInput
								label="MOTIVO"
								value={motivo}
								mode="outlined"
								maxLength={300}
								theme={tema}
								onChangeText={(texto) => setMotivo(texto)}
								style={{ width: "100%" }}
								returnKeyType="done"
							/>
						</View>
						<View
							style={{
								flexDirection: "row",
								marginTop: 10,
								height: 30,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<TouchableOpacity
								onPress={() => mostrarTermo()}
								style={{
									flexDirection: "row",
									justifyContent: "center",
									alignItems: "center",
									height: 40,
									width: "100%",
								}}
							>
								<Image
									source={images.recadastrar_associado}
									style={{ width: 35, height: 35, margin: 3 }}
								/>
								<Text style={{ fontSize: 18, fontWeight: "bold" }}>
									CLIQUE AQUI E LEIA O TERMO DE EXCLUSÃO
								</Text>
							</TouchableOpacity>
						</View>
						<View style={{ flexDirection: "row", marginTop: 10 }}>
							<Checkbox
								status={aceitoTermo ? "checked" : "unchecked"}
								theme={tema}
								onPress={() => setAceitoTermo(!aceitoTermo)}
							/>
							<TouchableOpacity onPress={() => setAceitoTermo(!aceitoTermo)}>
								<Text style={{ fontSize: 17, marginTop: 7 }}>
									Eu declaro que li e aceito o Termo de Exclusão de Dependentes
								</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							onPress={() => excluir()}
							style={{
								flexDirection: "row",
								marginTop: 20,
								backgroundColor: tema.colors.primary,
								padding: 10,
								borderRadius: 6,
								width: 320,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Image
								source={images.trash}
								style={{
									width: 20,
									height: 20,
									margin: 10,
									tintColor: tema.colors.background,
								}}
								tintColor={"#fff"}
							/>
							<Text style={{ color: "#fff", fontSize: 20 }}>
								EXCLUIR DEPENDENTE
							</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity
						onPress={() => setModal(false)}
						style={{
							flexDirection: "row",
							backgroundColor: tema.colors.primary,
							borderRadius: 50,
							padding: 15,
						}}
					>
						<Image
							source={images.fechar}
							style={{
								width: 20,
								height: 20,
								tintColor: tema.colors.background,
							}}
							tintColor={tema.colors.background}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<Modal animationType="fade" visible={modalTermo}>
				<View
					style={{
						flexDirection: "row",
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "#000A",
					}}
				>
					<View style={{ flex: 1, borderRadius: 6, margin: 10 }}>
						<View style={{ flex: 1, borderRadius: 6, backgroundColor: "#fff" }}>
							<>
								<WebView
									source={{ html: termo.texto }}
									style={{
										justifyContent: "center",
										alignItems: "center",
										flex: 1,
										marginVertical: 6,
									}}
									textZoom={240}
									containerStyle={{ fontSize: 25 }}
									startInLoadingState={true}
									renderLoading={() => (
										<View
											style={{
												flex: 1,
												justifyContent: "center",
												alignItems: "center",
											}}
										>
											<Loading size={80} />
										</View>
									)}
								/>
							</>
						</View>
						<TouchableOpacity
							onPress={() => {
								setModalTermo(false);
								setModal(true);
							}}
							style={{
								justifyContent: "center",
								alignItems: "center",
								marginVertical: 10,
								backgroundColor: "#fff",
								borderRadius: 50,
								width: 50,
								height: 50,
								padding: 15,
								alignSelf: "center",
							}}
						>
							<Image
								source={images.fechar}
								style={{
									width: 20,
									height: 20,
									tintColor: tema.colors.vermelho,
								}}
								tintColor={tema.colors.vermelho}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
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
						Busque os dependentes de uma matrícula para seleção.
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
													<View style={{ flex: 1 }}>
														<Text style={{ fontWeight: "bold", fontSize: 20 }}>
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
															<>
																{associado.tipo === "31" ? (
																	<Text
																		style={{
																			fontSize: 16,
																			color: tema.colors.verde,
																		}}
																	>
																		ASSOCIADO SINPOFESC
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
															</>
														)}
													</View>
													<View style={{ flex: 1 }}>
														<Text style={{ fontSize: 16, textAlign: "right" }}>
															Nascimento: {associado.nascimento}
														</Text>
														<Text style={{ fontSize: 16, textAlign: "right" }}>
															{associado.email}
														</Text>
													</View>
												</View>
												<View
													style={{
														flexDirection: "row",
														justifyContent: "center",
														alignContent: "center",
													}}
												>
													<TouchableOpacity
														onPress={() =>
															navigation.navigate("CadastrarDependente", {
																associado,
															})
														}
														style={{
															backgroundColor: tema.colors.primary,
															padding: 10,
															borderRadius: 6,
															justifyContent: "center",
															alignItems: "center",
															width: "50%",
														}}
													>
														<Text style={{ color: "#fff", fontSize: 18 }}>
															CADASTRAR DEPENDENTE
														</Text>
													</TouchableOpacity>
												</View>
												<FlatList
													data={dependentes}
													keyExtractor={(item) => item.cont}
													numColumns={1}
													style={{ marginTop: 20 }}
													renderItem={({ item }) => {
														return (
															<View
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
																<View style={{ flex: 12 }}>
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
																	{item.pre_cadastro ? (
																		<Text style={{ color: "red" }}>
																			PRÉ-CADASTRADO
																		</Text>
																	) : null}
																</View>
																<View
																	style={{
																		flex: 3,
																		justifyContent: "center",
																		alignItems: "center",
																	}}
																>
																	<Text
																		style={{
																			fontSize: 16,
																			color: tema.colors.primary,
																		}}
																	>
																		NASCIMENTO
																	</Text>
																	<Text
																		style={{
																			fontSize: 16,
																			color: tema.colors.primary,
																		}}
																	>
																		{item.data_nascimento}
																	</Text>
																</View>
																{item.pre_cadastro ? (
																	<TouchableOpacity
																		onPress={() =>
																			navigation.navigate(
																				"EnviarDocumentoDependente",
																				{
																					cartao: associado.cartao,
																					dependente: item.cont,
																					nome: item.nome,
																				}
																			)
																		}
																		style={{
																			flex: 1,
																			justifyContent: "center",
																			alignItems: "center",
																		}}
																	>
																		<Image
																			source={images.file}
																			style={{
																				width: 40,
																				height: 40,
																				tintColor: tema.colors.primary,
																			}}
																			tintColor={tema.colors.primary}
																		/>
																	</TouchableOpacity>
																) : (
																	<TouchableOpacity
																		onPress={() =>
																			navigation.navigate(
																				"AlterarTipoDependente",
																				{
																					matricula,
																					dependente: item,
																				}
																			)
																		}
																		style={{
																			flex: 1,
																			justifyContent: "center",
																			alignItems: "center",
																		}}
																	>
																		<Image
																			source={images.recadastrar_associado}
																			style={{
																				width: 50,
																				height: 50,
																				tintColor: tema.colors.primary,
																			}}
																			tintColor={tema.colors.primary}
																		/>
																	</TouchableOpacity>
																)}
																<TouchableOpacity
																	onPress={() => confirmarExclusao(item)}
																	style={{
																		flex: 1,
																		justifyContent: "center",
																		alignItems: "center",
																	}}
																>
																	<Image
																		source={images.trash}
																		style={{
																			width: 38,
																			height: 38,
																			tintColor: tema.colors.vermelho,
																		}}
																		tintColor={tema.colors.vermelho}
																	/>
																</TouchableOpacity>
															</View>
														);
													}}
												/>
												<View
													style={{
														height: 50,
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													{dependentes.length > 6 ? (
														<View
															style={{
																flexDirection: "row",
																justifyContent: "center",
																alignItems: "center",
															}}
														>
															<Image
																source={images.seta}
																style={{
																	width: 30,
																	height: 30,
																	transform: [{ rotate: "90deg" }],
																}}
															/>
															<Text style={{ fontSize: 18, marginLeft: 15 }}>
																ARRASTE PARA CIMA PARA VER MAIS
															</Text>
														</View>
													) : null}
												</View>
											</>
										) : (
											<>
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
											</>
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

export default Dependentes;
