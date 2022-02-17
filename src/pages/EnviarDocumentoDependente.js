import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	RefreshControl,
	TouchableOpacity,
	Image,
	Modal,
	Alert,
} from "react-native";
import Header from "../components/Header";
import Loading from "../components/Loading";
import api from "../../services/api";
import styles, { tema } from "../../assets/style/Style";
import images from "../utils/images";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { WebView } from "react-native-webview";
import AlertMessage from "../components/Alert";
import { useUsuario } from "../store/Usuario";
import Messages from "../components/Messages";
import PdfReader from "rn-pdf-reader-js";

const wait = (timeout) => {
	return new Promise((resolve) => {
		setTimeout(resolve, timeout);
	});
};

function EnviarDocumentoDependente(props) {
	const { navigation } = props;
	const { cartao, dependente, nome } = props.route.params;
	const [usuario, setUsuario] = useUsuario();
	const [documentos, setDocumentos] = useState([]);
	const [carregando, setCarregando] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [modalArquivo, setModalArquivo] = useState(false);
	const [arquivo, setArquivo] = useState({});
	const [alerta, setAlerta] = useState({});
	const [modalCarregando, setModalCarregando] = useState(false);
	let mostrarBotao = true;

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		setCarregando(true);

		wait(2000).then(() => {
			listarDocumentos();
			setRefreshing(false);
			setCarregando(false);
		});
	}, []);

	useEffect(() => {
		setCarregando(true);
		listarDocumentos();
	}, []);

	async function listarDocumentos() {
		const { data } = await api({
			url: "/associados/listarDocumentosDependentes",
			method: "GET",
			params: {
				id: dependente,
			},
			headers: { "x-access-token": usuario.token },
		});

		setDocumentos(data.documentos);
		setCarregando(false);
	}

	async function tirarFoto(id) {
		let permissao_atual = await Camera.getCameraPermissionsAsync();

		if (permissao_atual.status != "granted") {
			let permissao = await Camera.requestCameraPermissionsAsync();

			if (permissao.status != "granted") {
				alert("Você não forneceu permissão para acessar a CÂMERA.");
				return;
			}
		}

		let result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: false,
			aspect: [4, 3],
			quality: 0.5,
		});

		if (!result.cancelled) {
			setCarregando(true);
			const { uri } = result;

			let extensao = uri.split(".")[uri.split(".").length - 1];

			const formulario = new FormData();
			formulario.append("cartao", cartao);
			formulario.append("id_pre_cadastro", `${dependente}`);
			formulario.append("id_documento", `${id}`);
			formulario.append("file", {
				uri,
				type: `image/${extensao}`,
				name: `${cartao}_${dependente}_${id}_${new Date().toJSON()}.${extensao}`,
			});

			const { data } = await api({
				url: "/associados/enviarArquivoDependente",
				method: "POST",
				data: formulario,
				headers: {
					"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
					"x-access-token": usuario.token,
				},
			});

			setAlerta({
				visible: true,
				title: data.title,
				message: data.message,
				type: data.status ? "success" : "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});

			listarDocumentos();
		}
	}

	async function buscarNoAparelho(id) {
		let result = await DocumentPicker.getDocumentAsync();
		let ext_result = result.name.split(".")[result.name.split(".").length - 1];

		switch (ext_result.toLowerCase()) {
			case "jpg":
			case "jpeg":
			case "png":
			case "bmp":
			case "pdf":
				if (result.type !== "cancel") {
					setCarregando(true);
					const { uri } = result;

					let extensao = uri.split(".")[uri.split(".").length - 1];

					const formulario = new FormData();
					formulario.append("cartao", cartao);
					formulario.append("id_pre_cadastro", `${dependente}`);
					formulario.append("id_documento", `${id}`);
					formulario.append("file", {
						uri,
						type: `application/${extensao}`,
						name: `${cartao}_${dependente}_${id}_${new Date().toJSON()}.${extensao}`,
					});

					const { data } = await api({
						url: "/associados/enviarArquivoDependente",
						method: "POST",
						data: formulario,
						headers: {
							"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
							"x-access-token": usuario.token,
						},
					});

					setAlerta({
						visible: true,
						title: data.title,
						message: data.message,
						type: data.status ? "success" : "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});

					listarDocumentos();
				}
				break;
			default:
				setAlerta({
					visible: true,
					title: "EXTENSÃO INVÁLIDA!",
					message:
						"A extensão do arquivo selecionado é inválida. Por favor, selecione arquivos com as seguintes extensões: JPG / JPEG / PNG / BMP / PDF.",
					type: "danger",
					confirmText: "BUSCAR",
					cancelText: "FECHAR",
					showConfirm: true,
					showCancel: true,
					confirmFunction: () => buscarNoAparelho(id),
				});
				break;
		}
	}

	async function excluir(id_documento, caminho, tipo) {
		setAlerta({
			visible: true,
			title: "EXCLUSÃO DO ARQUIVO",
			message: `Você realmente deseja REMOVER permanentemente o arquivo ${tipo}?`,
			type: "warning",
			confirmText: "SIM, REMOVER!",
			cancelText: "NÃO, FECHAR!",
			showConfirm: true,
			showCancel: true,
			confirmFunction: async () => {
				const { data } = await api({
					url: "/associados/excluirArquivoDependente",
					method: "POST",
					data: {
						cartao,
						id_documento,
						caminho,
					},
					headers: { "x-access-token": usuario.token },
				});
				listarDocumentos();
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: data.status ? "success" : "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			},
		});
	}

	async function abrirArquivo(doc) {
		setModalCarregando(true);
		setModalArquivo(true);

		const { data } = await api({
			url: "/associados/visualizarDocumentoDependente",
			method: "GET",
			params: {
				cartao,
				id_documento: doc.id,
			},
			headers: { "x-access-token": usuario.token },
		});

		setArquivo({ caminho: data.caminho, extensao: doc.extensao });
		setModalCarregando(false);
	}

	async function aprovarDependencia() {
		setAlerta({
			visible: true,
			title: "APROVAÇÃO DE DEPENDÊNCIA",
			message:
				"Você realmente deseja aprovar todos os documentos e tornar este pré-cadastro como um dependente?",
			type: "warning",
			confirmText: "SIM, APROVAR!",
			cancelText: "FECHAR",
			showConfirm: true,
			showCancel: true,
			confirmFunction: async () => {
				const { data } = await api({
					url: "/associados/aprovarDependencia",
					method: "POST",
					data: {
						cartao,
						dependente,
						origem: "Associac Mobile",
						usuario: usuario.usuario,
					},
					headers: { "x-access-token": usuario.token },
				});

				if (data.status) {
					setAlerta({
						visible: true,
						title: data.title,
						message: data.message,
						type: "success",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
						confirmFunction: () => {
							navigation.navigate("Dependentes", { id: new Date().toJSON() });
						},
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
			},
		});
	}

	return (
		<>
			<Header titulo="Enviar Documentos" {...props} />
			<Modal
				animationType="fade"
				transparent
				collapsable
				visible={modalArquivo}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: "#000A",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<View
						style={{
							padding: 20,
							backgroundColor: "#fff",
							margin: 10,
							width: "100%",
							height: "100%",
						}}
					>
						{modalCarregando ? (
							<Loading size={90} />
						) : (
							<>
								{arquivo?.extensao?.toLowerCase() === "pdf" ? (
									<PdfReader
										source={{
											uri: arquivo.caminho,
										}}
									/>
								) : (
									<WebView
										source={{
											uri: arquivo.caminho,
										}}
										style={{
											marginVertical: 10,
											backgroundColor: "#fff",
										}}
										textZoom={250}
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
								)}
							</>
						)}
						<View style={styles.centralizado}>
							<TouchableOpacity
								style={[
									styles.linha,
									styles.centralizado,
									{
										backgroundColor: tema.colors.vermelho,
										width: "40%",
										alignItems: "center",
										justifyContent: "center",
										padding: 10,
										borderRadius: 6,
										top: 10,
									},
								]}
								onPress={() => {
									setModalArquivo(false);
								}}
							>
								<Image
									source={images.fechar}
									style={{
										width: 10,
										height: 10,
										tintColor: "#fff",
										right: 10,
									}}
									tintColor={"#fff"}
								/>
								<Text style={{ color: "#fff" }}>FECHAR</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			<View style={{ flex: 1, backgroundColor: "#f1f1f1" }}>
				<View style={{ flex: 6, alignItems: "center", marginTop: 10 }}>
					{carregando ? (
						<View style={[styles.centralizado, { flex: 1 }]}>
							<Loading size={80} />
						</View>
					) : (
						<>
							<Text style={{ fontWeight: "bold", fontSize: 25, marginTop: 20 }}>
								{nome.toUpperCase()}
							</Text>
							<Text style={{ textAlign: "center", padding: 10, fontSize: 16 }}>
								Para a aprovação da dependência cadastrada será necessário
								enviar os documentos listados abaixo.
							</Text>
							<ScrollView
								refreshControl={
									<RefreshControl
										refreshing={refreshing}
										onRefresh={onRefresh}
										progressBackgroundColor={tema.colors.background}
										tintColor={"#fff"}
										colors={[
											tema.colors.verde,
											tema.colors.vermelho,
											tema.colors.primary,
										]}
									/>
								}
								style={{
									width: "90%",
									flex: 2,
									marginTop: 10,
									marginBottom: 15,
								}}
							>
								{documentos.length > 0 ? (
									<>
										{documentos.map((doc, index) => {
											if (!doc.caminho_arquivo) {
												mostrarBotao = false;
											}

											return (
												<View
													key={index}
													style={[
														styles.blocoScroll,
														styles.centralizado,
														styles.linha,
														{ height: "auto" },
													]}
												>
													<View
														style={{
															flex: 3,
															padding: 20,
														}}
													>
														<Text>{doc.nome}</Text>
														{doc.status_analise === "E" ? (
															<Text
																style={{
																	fontSize: 10,
																	marginTop: 10,
																}}
															>
																ARQUIVO ENVIADO - {doc.data_envio}
															</Text>
														) : doc.status_analise === "A" ? (
															<Text
																style={{
																	fontSize: 10,
																	color: "green",
																	marginTop: 10,
																}}
															>
																ARQUIVO APROVADO - {doc.data_analise}
															</Text>
														) : doc.status_analise === "N" ? (
															<TouchableOpacity
																onPress={() => {
																	setAlerta({
																		visible: true,
																		title: "ARQUIVO NEGADO",
																		message: `${doc.motivo_analise}\n\nDATA DE REPROVAÇÃO:  ${doc.data_analise}`,
																		type: "danger",
																		confirmText: "FECHAR",
																		showConfirm: true,
																		showCancel: false,
																	});
																}}
															>
																<Text
																	style={{
																		fontSize: 10,
																		marginTop: 10,
																		color: "red",
																	}}
																>
																	ARQUIVO REPROVADO - {doc.data_analise} :{" "}
																	{doc.motivo_analise}
																</Text>
																<Text
																	style={{
																		fontSize: 11,
																		marginTop: 5,
																	}}
																>
																	VER MAIS
																</Text>
															</TouchableOpacity>
														) : (
															<Text
																style={{
																	fontSize: 10,
																	marginTop: 10,
																}}
															>
																AGUARDANDO O ENVIO
															</Text>
														)}
													</View>
													{!!doc.caminho_arquivo ? (
														<>
															<View
																style={{
																	flexDirection: "column",
																	flex: 1,
																}}
															>
																<TouchableOpacity
																	onPress={() => {
																		abrirArquivo(doc);
																	}}
																	style={[
																		styles.centralizado,
																		styles.linha,
																		{
																			flex: 1,
																			backgroundColor: tema.colors.verde,
																			height: "100%",
																			borderTopRightRadius: 6,
																		},
																	]}
																>
																	<Image
																		source={
																			doc.extensao.toLowerCase() === "pdf"
																				? images.file
																				: images.image
																		}
																		style={{
																			width: 25,
																			height: 25,
																			tintColor: "#fff",
																		}}
																		tintColor={"#fff"}
																	/>
																</TouchableOpacity>
																{doc.status_analise != "S" ? (
																	<TouchableOpacity
																		onPress={() =>
																			excluir(
																				doc.id,
																				doc.caminho_arquivo,
																				doc.nome
																			)
																		}
																		style={[
																			styles.centralizado,
																			styles.linha,
																			{
																				flex: 1,
																				backgroundColor: tema.colors.primary,
																				height: "100%",
																				borderBottomRightRadius: 6,
																			},
																		]}
																	>
																		<Image
																			source={images.trash}
																			style={{
																				width: 25,
																				height: 25,
																				tintColor: tema.colors.background,
																			}}
																			tintColor={tema.colors.background}
																		/>
																	</TouchableOpacity>
																) : null}
															</View>
														</>
													) : (
														<>
															<TouchableOpacity
																onPress={() => {
																	Alert.alert(
																		"SELECIONE A FORMA DE ENVIO",
																		`Selecione a forma como irá enviar o documento.`,
																		[
																			{
																				text: "FECHAR",
																				style: "cancel",
																			},
																			{
																				text: "TIRAR UMA FOTO",
																				onPress: () => {
																					tirarFoto(doc.id);
																				},
																			},
																			{
																				text: "BUSCAR ",
																				onPress: () => {
																					buscarNoAparelho(doc.id);
																				},
																			},
																		],
																		{
																			cancelable: false,
																		}
																	);
																}}
																style={[
																	styles.centralizado,
																	{
																		flex: 1,
																		backgroundColor: tema.colors.primary,
																		height: "100%",
																		borderTopRightRadius: 6,
																		borderBottomRightRadius: 6,
																	},
																]}
															>
																<Image
																	source={images.buscar}
																	style={{
																		width: 25,
																		height: 25,
																		tintColor: "#fff",
																		marginBottom: 10,
																	}}
																	tintColor={"#fff"}
																/>
																<Text
																	style={{
																		textAlign: "center",
																		color: "#fff",
																		fontSize: 12,
																	}}
																>
																	ENVIAR{`\n`}ARQUIVO
																</Text>
															</TouchableOpacity>
														</>
													)}
												</View>
											);
										})}
										{mostrarBotao && usuario.administrador ? (
											<View
												style={{
													flexDirection: "row",
													justifyContent: "center",
													alignContent: "center",
												}}
											>
												<TouchableOpacity
													onPress={() => aprovarDependencia()}
													style={{
														marginTop: 20,
														backgroundColor: tema.colors.primary,
														padding: 10,
														borderRadius: 6,
														justifyContent: "center",
														alignItems: "center",
														width: "50%",
													}}
												>
													<Text style={{ color: "#fff", fontSize: 18 }}>
														APROVAR DEPENDÊNCIA
													</Text>
												</TouchableOpacity>
											</View>
										) : null}
									</>
								) : (
									<Messages
										titulo="NENHUM DOCUMENTO À SER ENVIADO"
										subtitulo="Não é necessário o envio de nenhum documento. Aguarde a análise."
									/>
								)}
							</ScrollView>
						</>
					)}
				</View>
			</View>
			<AlertMessage {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default EnviarDocumentoDependente;
