import React, { useEffect, useState } from "react";
import {
	AsyncStorage,
	Image,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View,
	Modal,
	FlatList,
	Alert,
} from "react-native";
import WebView from "react-native-webview";
import s, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Alerta from "../components/Alert";
import Header from "../components/Header";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import Input from "../components/Input";
import Combo from "../components/Combo";
import InputMask from "../components/InputMask";
import Messages from "../components/Messages";
import images from "../utils/images";
import compararValores from "../functions/compararValores";
import Documento from "../components/Documento";
import PDFReader from "rn-pdf-reader-js";

function AtivarDependente(props) {
	const { navigation } = props;
	const [usuario, setUsuario] = useUsuario();
	const { token, associado_atendimento } = usuario;
	const dependente = props?.route?.params?.dependente;
	const [tipos, setTipos] = useState([]);
	const [mostrarTaxa, setMostrarTaxa] = useState(false);
	const [alerta, setAlerta] = useState({});
	const [atestado, setAtestado] = useState("");
	const [cont, setCont] = useState(dependente.cont ?? "");
	const [codDep, setCodDep] = useState(dependente.cod_dep ?? "");
	const [nome, setNome] = useState(dependente.nome ?? "");
	const [sexo, setSexo] = useState(
		dependente.sexo
			? dependente.sexo == "M"
				? { Name: "MASCULINO", Value: "M" }
				: { Name: "FEMININO", Value: "F" }
			: { Name: "MASCULINO", Value: "M" }
	);
	const [nascimento, setNascimento] = useState(
		dependente.data_nascimento ?? ""
	);
	const [tipo, setTipo] = useState({ Name: "", Value: "" });
	const [cpf, setCpf] = useState(dependente.cpf ?? "");
	const [instagram, setInstagram] = useState(dependente.instagram ?? "");
	const [facebook, setFacebook] = useState(dependente.facebook ?? "");
	const [telefone, setTelefone] = useState(dependente.telefone ?? "");
	const [celular, setCelular] = useState(dependente.celular ?? "");
	const [email, setEmail] = useState(dependente.email ?? "");
	const [requerimentos, setRequerimentos] = useState([]);
	const [requerimentosNecessarios, setRequerimentosNecessarios] = useState([]);
	const [link, setLink] = useState("");
	const [modal, setModal] = useState(false);
	const [carregar, setCarregar] = useState(false);
	const [carregando, setCarregando] = useState(false);

	const listarTipos = async () => {
		const { data } = await api({
			url: "/listarTiposDependente",
			method: "GET",
			headers: { "x-access-token": token },
		});

		let list_tipos = [];

		data.tipos.map((tipo) => {
			list_tipos.push({ Name: tipo.descricao, Value: tipo.codigo });
		});

		setTipos(list_tipos);
	};

	const listarRequerimentos = async () => {
		const { data } = await api({
			url: "/associados/listarRequerimentos",
			method: "GET",
			params: {
				matricula: associado_atendimento.matricula,
				dep: dependente.cont,
			},
			headers: { "x-access-token": token },
		});

		setRequerimentos(data.requerimentos);
	};

	const listarRequerimentosNecessarios = async () => {
		const { data } = await api({
			url: "/associados/consultarRequerimentosObrigatorios",
			method: "GET",
			params: {
				matricula: associado_atendimento.matricula,
				dep: dependente.cont,
				tipo: tipo.Value,
			},
			headers: { "x-access-token": token },
		});

		setRequerimentosNecessarios(data.requerimentos);
	};

	async function alterarTipo(codigo) {
		listarRequerimentosNecessarios();

		switch (codigo) {
			case "07":
			case "11":
			case "12":
			case "13":
			case "14":
			case "15":
			case "16":
			case "17":
			case "21":
			case "31":
			case "34":
				setMostrarTaxa(true);
				break;
			case "20":
				setMostrarTaxa(false);
				break;
			default:
				setMostrarTaxa(false);
				break;
		}
	}

	const ativarDependente = async () => {
		let data_valida = new Date(
			nascimento.substring(6, 10) +
				"-" +
				nascimento.substring(3, 5) +
				"-" +
				nascimento.substring(0, 2)
		);

		if (isNaN(data_valida.getTime()) || data_valida.getFullYear() <= 1910) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "A data de nascimento informada está incorreta.",
				type: "danger",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
			});
			return;
		}

		if (tipo?.Name === "") {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Para prosseguir com a alteração dos dados é necessário selecionar o tipo de dependente.",
				type: "danger",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
			});
			return;
		}

		setAlerta({
			visible: true,
			title: "SALVANDO INFORMAÇÕES",
			message: <Loading size={120} />,
			showIcon: false,
			showCancel: false,
			showConfirm: false,
		});

		const { data, status } = await api({
			url: "/associados/alterarTipoDependente",
			method: "POST",
			data: {
				dependente: {
					cont,
					novo_tipo: tipo,
					sexo,
					data_nascimento: nascimento,
					cpf,
					instagram,
					facebook,
					telefone,
					celular,
					email,
					ativar: 1,
				},
				matricula: associado_atendimento.matricula,
			},
			headers: { "x-access-token": token },
		});

		if (status == 401) {
			setAlerta({
				visible: true,
				title: "SESSÃO EXPIRADA!",
				message: `A sua sessão expirou. Você será deslogado em 5 segundos.`,
				type: "warning",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
			});

			setTimeout(async () => {
				await AsyncStorage.clear().then(() =>
					navigation.navigate("Login", { id: new Date().toJSON() })
				);
			}, 5000);
		} else {
			if (data.status) {
				let dependente = associado_atendimento.dependentes.find(
					(dep) => dep.cont === cont
				);

				dependente = {
					...dependente,
					celular,
					cod_dep: tipo.Value,
					cpf,
					data_nascimento: nascimento,
					email,
					facebook,
					instagram,
					sexo: sexo.Value,
					telefone,
					tipo: tipo.Name,
					inativo: 0,
					data_inativo: "",
				};

				let dependentes = associado_atendimento.dependentes.filter(
					(dep) => dep.cont !== cont
				);

				dependentes = [...dependentes, dependente];
				dependentes = dependentes
					.sort(compararValores("nome", "asc"))
					.sort(compararValores("pre_cadastro", "desc"))
					.sort(compararValores("inativo", "asc"));

				setUsuario({
					...usuario,
					associado_atendimento: { ...associado_atendimento, dependentes },
				});

				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: "success",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
					confirmFunction: () => navigation.navigate("Inicio"),
				});
			} else {
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
			}
		}
	};

	async function tirarFoto(doc, nome_doc) {
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
			formulario.append("matricula", `${associado_atendimento.matricula}`);
			formulario.append("dependente", `${dependente.cont}`);
			formulario.append("tipo", doc);
			formulario.append("nome_tipo", nome_doc);
			formulario.append("file", {
				uri,
				type: `image/${extensao}`,
				name: `${
					associado_atendimento.matricula
				}_${new Date().toJSON()}.${extensao}`,
			});

			const { data } = await api.post("/enviarDocumentoTitular", formulario, {
				headers: {
					"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
					"x-access-token": token,
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

			listarRequerimentos();
			listarRequerimentosNecessarios();
		}
	}

	async function buscarNoAparelho(doc, nome_doc) {
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
					formulario.append("matricula", `${associado_atendimento.matricula}`);
					formulario.append("dependente", `${dependente.cont}`);
					formulario.append("tipo", doc);
					formulario.append("nome_tipo", nome_doc);
					formulario.append("file", {
						uri,
						type: `image/${extensao}`,
						name: `${
							associado_atendimento.matricula
						}_${new Date().toJSON()}.${extensao}`,
					});

					const { data } = await api.post(
						"/enviarDocumentoTitular",
						formulario,
						{
							headers: {
								"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
								"x-access-token": token,
							},
						}
					);

					setAlerta({
						visible: true,
						title: data.title,
						message: data.message,
						type: data.status ? "success" : "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});

					listarRequerimentos();
					listarRequerimentosNecessarios();
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
					confirmFunction: () => buscarNoAparelho(doc),
				});
				break;
		}
	}

	useEffect(() => {
		listarTipos();
		listarRequerimentos();
	}, []);

	useEffect(() => {
		alterarTipo(tipo.Value);
	}, [tipo]);

	return (
		<>
			<Header titulo="Ativar Dependente" {...props} />
			<Modal animationType="fade" transparent={true} visible={modal} {...props}>
				<View style={[s.fl1, s.bgcm, s.jcc, s.aic]}>
					<View
						style={[
							s.pdv10,
							s.pdh10,
							s.m20,
							s.bgcw,
							s.br9,
							s.smd,
							s.el5,
							s.w95p,
							s.h90p,
						]}
					>
						{carregar ? (
							<View style={[s.fl1, s.aic, s.jcc]}>
								<Loading size={120} />
							</View>
						) : link.split(".")[link.split(".").length - 1].toLowerCase() ===
						  "pdf" ? (
							<PDFReader source={{ uri: link }} />
						) : (
							<WebView
								source={{ uri: link }}
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
					</View>
					<TouchableOpacity
						onPress={() => setModal(false)}
						style={[s.w50, s.h50, s.br50, s.bgcp, s.b15, s.pd10, s.jcc, s.aic]}
					>
						<Image
							source={images.fechar}
							style={[s.w20, s.h20, s.tcw]}
							tintColor={tema.colors.background}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<SafeAreaView style={s.fl1}>
				<View style={s.mh20}>
					<Text style={[s.tac, s.mt10, s.mb20, s.fs18]}>
						Selecione o tipo de dependência para ativar o dependente.
					</Text>
					<View style={[s.row, s.mb10]}>
						<View style={s.fl1}>
							<Input
								label={"Nome"}
								value={[nome, setNome]}
								disabled={true}
								returnKeyType={"next"}
								maxLength={40}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={[s.fl1, s.mr10]}>
							<Combo
								label={"Sexo"}
								pronome={"o"}
								lista={[
									{ Name: "MASCULINO", Value: "M" },
									{ Name: "FEMININO", Value: "F" },
								]}
								style={s.fs15}
								item={[sexo, setSexo]}
							/>
						</View>
						<View style={[s.fl1, s.mr10]}>
							<InputMask
								label={"Nascimento"}
								value={[nascimento, setNascimento]}
								keyboardType={"numeric"}
								mask="99/99/9999"
								maxLength={10}
							/>
						</View>
						<View style={s.fl1}>
							<InputMask
								label={"CPF"}
								value={[cpf, setCpf]}
								keyboardType={"numeric"}
								mask="999.999.999-99"
								maxLength={14}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={[s.fl1, s.mr10]}>
							<Input
								label={"Instagram"}
								value={[instagram, setInstagram]}
								maxLength={100}
							/>
						</View>
						<View style={s.fl1}>
							<Input
								label={"Facebook"}
								value={[facebook, setFacebook]}
								maxLength={100}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={s.fl1}>
							<Combo
								label={"Tipo de Dependência"}
								pronome={"o"}
								lista={tipos}
								item={[tipo, setTipo]}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={[s.fl1, s.mr10]}>
							<InputMask
								label={"Telefone"}
								value={[telefone, setTelefone]}
								keyboardType={"numeric"}
								mask="(99) 9999-9999"
								maxLength={14}
							/>
						</View>
						<View style={[s.fl1, s.mr10]}>
							<InputMask
								label={"Celular"}
								value={[celular, setCelular]}
								keyboardType={"numeric"}
								mask="(99) 9 9999-9999"
								maxLength={16}
							/>
						</View>
						<View style={s.fl2}>
							<Input
								label={"E-mail"}
								value={[email, setEmail]}
								maxLength={100}
							/>
						</View>
					</View>
				</View>
				{codDep !== "23" && mostrarTaxa && (
					<View style={[s.h100, s.mh20, s.mb20]}>
						<Messages
							titulo="ATENÇÃO!"
							subtitulo="LEMBRE O ASSOCIADO SOBRE O PAGAMENTO DA TAXA SUPLEMENTAR DE DEPENDENTE."
							cor={tema.colors.info}
							imagem={images.info}
						/>
					</View>
				)}
				{requerimentos.length > 0 ? (
					<View
						style={[
							s.fl1,
							s.mh20,
							{ maxHeight: requerimentosNecessarios.length > 0 ? 300 : 500 },
						]}
					>
						<View style={[s.row, s.aic]}>
							<View style={[s.fl1, s.h1, s.bgcp]} />
							<View>
								<Text style={[s.mh20, s.tac]}>DOCUMENTOS JÁ CADASTRADOS</Text>
							</View>
							<View style={[s.fl1, s.h1, s.bgcp]} />
						</View>
						<FlatList
							data={requerimentos}
							keyExtractor={(item) => item.sequencia + "-" + item.cont}
							numColumns={1}
							ListEmptyComponent={
								<Messages
									titulo={"Nenhum Requerimento Cadastrado"}
									subtitulo={
										"Não há nenhum requerimento ou formulário cadastrado para esta matrícula."
									}
									imagem={images.info}
									cor={tema.colors.info}
								/>
							}
							renderItem={({ item, index }) => {
								return (
									<Documento
										item={item}
										setLink={setLink}
										setCarregar={setCarregar}
										setModal={setModal}
									/>
								);
							}}
						/>
						{requerimentos.length > 9 && (
							<View style={[s.row, s.jcc, s.aic, s.mv20]}>
								<Image
									source={images.seta}
									style={[s.w20, s.h20, s.tr90, , s.tcp]}
									tintColor={tema.colors.primary}
								/>
								<Text style={[s.fs15, s.ml10, s.fcp]}>
									ARRASTE PARA VER MAIS REQUERIMENTOS
								</Text>
							</View>
						)}
					</View>
				) : null}
				{requerimentosNecessarios.length > 0 ? (
					<View style={[s.fl1, s.mxh300, s.mh20]}>
						<View style={[s.row, s.aic]}>
							<View style={[s.fl1, s.h1, s.bgcp]} />
							<View>
								<Text style={[s.mh20, s.tac]}>DOCUMENTOS NECESSÁRIOS</Text>
							</View>
							<View style={[s.fl1, s.h1, s.bgcp]} />
						</View>
						<FlatList
							data={requerimentosNecessarios}
							keyExtractor={(item) => item.cd_doc}
							numColumns={1}
							renderItem={({ item, index }) => {
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
											<Text>{item.descricao}</Text>
											<Text style={[s.fs10, s.mt10]}>AGUARDANDO O ENVIO</Text>
										</View>
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
																tirarFoto(item.cd_doc, item.nome_doc);
															},
														},
														{
															text: "BUSCAR ",
															onPress: () => {
																buscarNoAparelho(item.cd_doc, item.nome_doc);
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
									</View>
								);
							}}
						/>
						{requerimentos.length > 9 && (
							<View style={[s.row, s.jcc, s.aic, s.mv20]}>
								<Image
									source={images.seta}
									style={[s.w20, s.h20, s.tr90, , s.tcp]}
									tintColor={tema.colors.primary}
								/>
								<Text style={[s.fs15, s.ml10, s.fcp]}>
									ARRASTE PARA VER MAIS REQUERIMENTOS
								</Text>
							</View>
						)}
					</View>
				) : null}
				{tipo?.Name !== "" && requerimentosNecessarios.length <= 0 ? (
					<View style={[s.jcc, s.aic, s.mt20]}>
						<TouchableOpacity
							onPress={() => ativarDependente()}
							style={[s.row, s.jcc, s.aic, s.pd20, s.br6, s.bgcp]}
						>
							<Image
								source={images.sucesso}
								style={[s.w20, s.h20, s.tcw]}
								tintColor={tema.colors.background}
							/>
							<Text style={[s.fcw, s.fs20, s.ml10]}>ATIVAR DEPENDENTE</Text>
						</TouchableOpacity>
					</View>
				) : null}
			</SafeAreaView>
			<Alerta {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default AtivarDependente;
