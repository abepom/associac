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
import s, { tema } from "../../assets/style/Style";
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
					message: `A extensão do arquivo selecionado é inválida.${"\n"}Por favor, selecione arquivos com as seguintes extensões:${"\n"}JPG / JPEG / PNG / BMP / PDF.`,
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
			message: `Você realmente deseja aprovar todos os documentos e${"\n"}tornar este pré-cadastro como um dependente?`,
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
					const retorno = await api({
						url: "/associados/listarDependentes",
						method: "GET",
						params: {
							cartao: `${usuario.associado_atendimento.matricula}00001`,
						},
						headers: { "x-access-token": usuario.token },
					});

					setUsuario({
						...usuario,
						associado_atendimento: {
							...usuario.associado_atendimento,
							dependentes: retorno.data.dependentes,
						},
					});

					setAlerta({
						visible: true,
						title: data.title,
						message: data.message,
						type: "success",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
						confirmFunction: () => navigation.navigate("Inicio"),
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
				<View style={[s.fl1, s.bgcm, s.jcc, s.aic]}>
					<View style={[s.pd20, s.bgcw, s.m10, s.fullh, s.fullw]}>
						{modalCarregando ? (
							<Loading size={90} />
						) : (
							<>
								{arquivo?.extensao?.toLowerCase() === "pdf" ? (
									<PdfReader source={{ uri: arquivo.caminho }} />
								) : (
									<WebView
										source={{ uri: arquivo.caminho }}
										style={[s.mv10, s.bgcw]}
										textZoom={250}
										startInLoadingState={true}
										renderLoading={() => (
											<View style={[s.fl1, s.jcc, s.aic]}>
												<Loading size={80} />
											</View>
										)}
									/>
								)}
							</>
						)}
						<View style={[s.jcc, s.aic]}>
							<TouchableOpacity
								style={[
									s.row,
									s.jcc,
									s.aic,
									s.bgcr,
									s.w40p,
									s.pd10,
									s.br6,
									s.t10,
								]}
								onPress={() => {
									setModalArquivo(false);
								}}
							>
								<Image
									source={images.fechar}
									style={[s.w10, s.h10, s.tcw, s.r10]}
									tintColor={tema.colors.background}
								/>
								<Text style={s.fcw}>FECHAR</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			<View style={s.fl1}>
				<View style={[s.fl6, s.aic, s.mt10]}>
					{carregando ? (
						<View style={[s.jcc, s.aic, s.fl1]}>
							<Loading size={80} />
						</View>
					) : (
						<>
							<Text style={[s.bold, s.fs25, s.mt20]}>{nome.toUpperCase()}</Text>
							<Text style={[s.tac, s.pd10, s.fs15]}>
								Para a aprovação da dependência cadastrada será necessário
								enviar os documentos listados abaixo.
							</Text>
							<ScrollView
								refreshControl={
									<RefreshControl
										refreshing={refreshing}
										onRefresh={onRefresh}
										progressBackgroundColor={tema.colors.background}
										tintColor={tema.colors.background}
										colors={[
											tema.colors.verde,
											tema.colors.vermelho,
											tema.colors.primary,
										]}
									/>
								}
								style={[s.w90p, s.fl2, s.mt10, s.mb20]}
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
														s.jcc,
														s.aic,
														s.fl1,
														s.h100,
														s.bgcw,
														s.mv6,
														s.br6,
														s.el5,
														s.row,
														s.hauto,
													]}
												>
													<View style={[s.fl3, s.pd20]}>
														<Text>{doc.nome}</Text>
														{doc.status_analise === "E" ? (
															<Text style={[s.fs10, s.mt10]}>
																ARQUIVO ENVIADO - {doc.data_envio}
															</Text>
														) : doc.status_analise === "A" ? (
															<Text style={[s.fs10, s.fcg, s.mt10]}>
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
																<Text style={[s.fs10, s.mt10, s.fcr]}>
																	ARQUIVO REPROVADO - {doc.data_analise} :{" "}
																	{doc.motivo_analise}
																</Text>
																<Text style={[s.fs11, s.mt5]}>VER MAIS</Text>
															</TouchableOpacity>
														) : (
															<Text style={[s.fs10, s.mt10]}>
																AGUARDANDO O ENVIO
															</Text>
														)}
													</View>
													{!!doc.caminho_arquivo ? (
														<>
															<View style={[s.col, s.fl1]}>
																<TouchableOpacity
																	onPress={() => abrirArquivo(doc)}
																	style={[
																		s.jcc,
																		s.aic,
																		s.row,
																		s.fl1,
																		s.bgcg,
																		s.fullh,
																		s.btrr6,
																	]}
																>
																	<Image
																		source={
																			doc.extensao.toLowerCase() === "pdf"
																				? images.file
																				: images.image
																		}
																		style={[s.w25, s.h25, s.tcw]}
																		tintColor={tema.colors.background}
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
																			s.jcc,
																			s.aic,
																			s.row,
																			s.fl1,
																			s.bgcp,
																			s.fullh,
																			s.bbrr6,
																		]}
																	>
																		<Image
																			source={images.trash}
																			style={[s.w25, s.h25, s.tcw]}
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
																	s.jcc,
																	s.aic,
																	s.fl1,
																	s.bgcp,
																	s.fullh,
																	s.btrr6,
																	s.bbrr6,
																]}
															>
																<Image
																	source={images.buscar}
																	style={[s.w25, s.h25, s.tcw, s.mb10]}
																	tintColor={tema.colors.background}
																/>
																<Text style={[s.tac, s.fcw, s.fs12]}>
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
									<View style={s.fl1}>
										<Messages
											titulo="NENHUM DOCUMENTO À SER ENVIADO"
											subtitulo="Não é necessário o envio de nenhum documento. Aguarde a análise."
										/>
									</View>
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
