import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	Alert,
	ScrollView,
	Modal,
} from "react-native";
import { TextInput, Switch, IconButton } from "react-native-paper";
import { TextInputMask, MaskService } from "react-native-masked-text";
import PickerModal from "react-native-picker-modal-view";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import images from "../utils/images";
import api from "../../services/api";
import isDate from "../functions/isDate";
import removerAcentos from "../functions/removerAcentos";
import formatDate from "../functions/formatDate";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";
import Header from "../components/Header";
import styles, { tema } from "../../assets/style/Style";

function CadastrarAssociado(props) {
	const [associado, setAssociado] = useState({
		matricula: "",
		sexo: { Name: "", Value: "" },
		cidade: { Name: "", Value: "" },
		orgao: { Name: "", Value: "" },
		funcao: { Name: "", Value: "" },
		local_trabalho: { Name: "", Value: "" },
		banco: { Name: "", Value: "" },
		forma_desconto: { Name: "", Value: "" },
		valor_mensalidade: 0,
		paga_joia: 0,
	});
	const [cidades, setCidades] = useState([]);
	const [orgaos, setOrgaos] = useState([]);
	const [lotacoes, setLotacoes] = useState([]);
	const [funcoes, setFuncoes] = useState([]);
	const [bancos, setBancos] = useState([]);
	const [formas, setFormas] = useState([]);
	const [mostrarDadosAssociado, setMostrarDadosAssociado] = useState(false);
	const [btnRecadastrar, setBtnRecadastrar] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [nextStep, setNextStep] = useState(false);
	const [prevStep, setPrevStep] = useState(false);
	const [textNext, setTextNext] = useState("PRÓXIMO");
	const [cpf, setCpf] = useState("1");
	const [rg, setRg] = useState("1");
	const [contraCheque, setContraCheque] = useState("1");
	const [comprovanteResidencia, setComprovanteResidencia] = useState("1");
	const [visible, setVisible] = useState(false);
	const showModal = () => setVisible(true);
	const hideModal = () => setVisible(false);

	const onToggleEstornado = () =>
		setAssociado({ ...associado, estornado: !associado.estornado });

	const onToggleIndica = () =>
		setAssociado({ ...associado, indica: !associado.indica });

	useEffect(() => {
		if (associado.matricula?.length < 6) {
			setNextStep(false);
		}
	}, [associado.matricula]);

	useEffect(() => {
		listarCidades();
		listarOrgaos();
		listarBancos();
		listarFuncoes();
		listarLotacoes();
		listarFormas();
	}, []);

	async function listarCidades() {
		const response = await api.geral.get("/listarCidades");

		let cids = [];

		response.cidades.map((cidade) => {
			cids.push({
				Name: cidade.nome_cidade,
				Value: cidade.cod_cidade,
			});
		});

		setCidades(cids);
	}

	async function listarOrgaos() {
		const response = await api.geral.get("/listarOrgaos");

		let orgs = [];

		response.orgaos.map((orgao) => {
			orgs.push({
				Name: `${orgao.descricao} (${orgao.codigo})`,
				Value: orgao.codigo,
			});
		});

		setOrgaos(orgs);
	}

	async function listarBancos() {
		const response = await api.geral.get("/listarBancos");

		let bancs = [];

		response.bancos.map((banco) => {
			bancs.push({
				Name: banco.nome_banco,
				Value: banco.cod_banco,
			});
		});

		setBancos(bancs);
	}

	async function listarFuncoes() {
		const response = await api.geral.get("/listarFuncoes");

		let funcs = [];

		response.funcoes.map((funcao) => {
			funcs.push({
				Name: funcao.descricao,
				Value: funcao.codigo,
			});
		});

		setFuncoes(funcs);
	}

	async function listarLotacoes() {
		const response = await api.geral.get("/listarLotacoes");

		let lots = [];

		response.lotacoes.map((lotacao) => {
			lots.push({
				Name: `${lotacao.descricao} (${lotacao.codigo})`,
				Value: lotacao.codigo,
			});
		});

		setLotacoes(lots);
	}

	async function listarFormas() {
		const response = await api.geral.get("/listarFormasDesconto");

		let forms = [];

		response.formas.map((forma) => {
			forms.push({
				Name: `${forma.descricao} (${forma.codigo})`,
				Value: forma.codigo,
			});
		});

		setFormas(forms);
	}

	const verificarMatricula = async () => {
		if (associado.matricula?.length == 6) {
			if (!isNaN(associado.matricula)) {
				const data = await api.associados.get("/verificarMatricula", {
					cartao: associado.matricula,
				});

				setMostrarDadosAssociado(true);
				setAssociado(data);

				if (data.status) {
					if (data.tipo === "01") {
						setBtnRecadastrar(true);
						setNextStep(false);
					} else {
						setBtnRecadastrar(false);
						setNextStep(true);
					}
				} else {
					setBtnRecadastrar(false);
					setNextStep(true);
				}
			} else {
				setBtnRecadastrar(false);
				setMostrarDadosAssociado(false);
				setNextStep(false);
				Alert.alert("ATENÇÃO", "CUIDADO");
			}
		} else {
			Alert.alert("ATENÇÃO!", "Digita só numero né ô cabeça mole.");
		}
	};

	const cadastrarAssociado = async () => {
		const data = await api.geral.post("/cadastrarAssociado", {
			associado,
			usuario: "bruno.horn",
		});

		Alert.alert(data.title, data.message);

		if (data.status) {
			setActiveStep(0);
			setAssociado({
				matricula: "",
				sexo: { Name: "", Value: "" },
				cidade: { Name: "", Value: "" },
				orgao: { Name: "", Value: "" },
				funcao: { Name: "", Value: "" },
				local_trabalho: { Name: "", Value: "" },
				banco: { Name: "", Value: "" },
				forma_desconto: { Name: "", Value: "" },
				valor_mensalidade: 0,
			});
			setPrevStep(false);
			setTextNext("PRÓXIMO");
			setMostrarDadosAssociado(false);
			setCpf("");
			setRg("");
			setContraCheque("");
			setComprovanteResidencia("");
		}
	};

	async function verificarCpf() {
		if (associado.cpf === "") {
			return false;
		} else {
			const data = await api.associados.get("/verificarCpf", {
				cartao: associado.matricula + "00001",
				cpf: associado.cpf,
				usuario: "bruno.horn",
			});

			return data.status;
		}
	}

	async function buscarCep() {
		if (associado.cep === "" || associado.cep?.length < 8) {
			Alert.alert("ATENÇÃO!", "CABEÇA DE BIGORNA!");
		} else {
			const response = await fetch(
				`https://viacep.com.br/ws/${associado.cep.replace(/-/g, "")}/json/`,
				{
					method: "GET",
					mode: "no-cors",
				}
			);

			let dados = await response.json();

			if (dados.erro) {
				Alert.alert("ATENÇÃO!", "CEP informado inválido.");
			} else {
				let cid = associado.cidade;

				cidades.map((cidade) => {
					if (
						removerAcentos(cidade.Name).toUpperCase() ==
						removerAcentos(dados.localidade).toUpperCase()
					) {
						cid = cidade;
					}
				});

				setAssociado({
					...associado,
					endereco: `${dados.logradouro}`,
					complemento: `${dados.complemento}`,
					bairro: `${dados.bairro}`,
					cidade: cid,
				});
			}
		}
	}

	async function tirarFoto(tipo) {
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
			const { uri } = result;

			let extensao = uri.split(".")[uri.split(".").length - 1];

			const formulario = new FormData();
			formulario.append("matricula", `${associado.matricula}`);
			formulario.append("usuario", "bruno.horn");
			formulario.append("tipo", tipo);
			formulario.append("file", {
				uri,
				type: `image/${extensao}`,
				name: `${associado.matricula}_${new Date().toJSON()}.${extensao}`,
			});

			const data = await api.geral.post(
				"/enviarDocumentoTitular",
				formulario,
				"multipart/form-data"
			);

			if (data.status) {
				switch (tipo) {
					case "CPF":
						setCpf(data.link);
						break;
					case "RG":
						setRg(data.link);
						break;
					case "CC":
						setContraCheque(data.link);
						break;
					case "CR":
						setComprovanteResidencia(data.link);
						break;
					default:
						break;
				}
			}
		}
	}

	const goToNextStep = async () => {
		switch (activeStep) {
			case 0:
				if (associado.matricula?.length < 6 || isNaN(associado.matricula)) {
					Alert.alert("ATENÇÃO!", "NAO PASSOU");
					setPrevStep(false);
				} else {
					setPrevStep(true);
					setActiveStep(1);
				}
				break;
			case 1:
				const cpfValido = await verificarCpf();

				let data = new Date(formatDate(associado.nascimento, "AMD"));

				if (
					associado.nome?.length < 3 ||
					!isDate(data) ||
					associado.sexo.Name === "" ||
					associado.rg === "" ||
					associado.digito === "" ||
					(associado.telefone_comercial === "" &&
						associado.telefone_residencial === "" &&
						associado.celular === "") ||
					!cpfValido
				) {
					Alert.alert("ATENÇÃO!", "NÃO PASSOU 2!");
				} else {
					setActiveStep(2);
					setTextNext("PRÓXIMO");
				}

				break;
			case 2:
				if (
					associado.cep.length < 8 ||
					associado.endereco === "" ||
					associado.bairro === "" ||
					associado.cidade.Value === ""
				) {
					Alert.alert("ATENÇÃO!", "NÃO PASSOU");
				} else {
					setActiveStep(3);
					setTextNext("PRÓXIMO");
				}

				break;
			case 3:
				if (associado.valor_mensalidade !== "") {
					if (associado?.valor_mensalidade?.toString().indexOf("R$") >= 0) {
						setAssociado({
							...associado,
							valor_mensalidade: MaskService.toRawValue(
								"money",
								associado.valor_mensalidade
							),
						});
					}
				}

				if (
					associado.orgao.Name === "" ||
					associado.local_trabalho.Name === "" ||
					associado.funcao.Name === "" ||
					associado.banco.Name === "" ||
					associado.agencia === "" ||
					associado.conta === "" ||
					associado.forma_desconto.Name === ""
				) {
					Alert.alert("ATENÇÃO!", "NÃO PASSOU");
				} else {
					setActiveStep(4);
					setTextNext("CADASTRAR");
				}

				break;
			case 4:
				if (
					cpf === "" ||
					rg === "" ||
					contraCheque === "" ||
					comprovanteResidencia === ""
				) {
					Alert.alert("ATENÇÃO!", "Não passou. Precisa preencher tudo.");
				} else {
					if (associado.data_saida == 1) {
						showModal();
					} else {
						cadastrarAssociado();
					}
				}

				break;
			default:
				break;
		}
	};

	const goToPrevStep = () => {
		if (activeStep - 1 == 0) {
			setPrevStep(false);
		}

		setActiveStep(activeStep - 1);
		setTextNext("PRÓXIMO");
	};

	return (
		<>
			<Header titulo={"Cadastrar Associado"} {...props} />
			<Modal animationType="fade" transparent visible={visible}>
				<View
					style={{
						flex: 1,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "#000C",
					}}
				>
					<View
						style={[
							styles.centralizado,
							{
								padding: 20,
								margin: 10,
								borderRadius: 6,
								backgroundColor: "#fff",
							},
						]}
					>
						<Text>
							Atenção bruno.horn, este associado pagará joia, e esta será
							descontada em {associado.parcelas_joia} parcelas. Deseja
							continuar?
						</Text>
						<TouchableOpacity
							onPress={() => {
								setAssociado({ ...associado, paga_joia: 1 });
								cadastrarAssociado();
							}}
						>
							<Text>SIM</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => hideModal()}>
							<Text>NÃO</Text>
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
						Preencha os campos abaixo para efetuar a inclusão do associado.
					</Text>
					<View style={{ flex: 1 }}>
						<ProgressSteps
							activeStep={activeStep}
							activeStepIconBorderColor="#031e3f"
							completedProgressBarColor="#031e3f"
							completedStepIconColor="#031e3f"
							activeLabelColor="#031e3f"
							marginBottom={100}
							style={{ zIndex: 12 }}
						>
							<ProgressStep label="Matrícula" removeBtnRow>
								<View style={{ flexDirection: "row" }}>
									<View style={{ flex: 1 }}></View>
									<View style={{ flex: 1 }}>
										<TextInput
											label="Matrícula"
											value={associado.matricula}
											keyboardType={"numeric"}
											maxLength={6}
											onChangeText={(text) =>
												setAssociado({ ...associado, matricula: text })
											}
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
									<View style={{ flex: 1 }}></View>
								</View>
								<View style={{ flexDirection: "row", marginTop: 20 }}>
									<View style={{ flex: 1 }}></View>
									<View style={{ flex: 1 }}>
										<TouchableOpacity
											onPress={() => verificarMatricula()}
											style={{
												flexDirection: "row",
												alignItems: "center",
												justifyContent: "center",
												backgroundColor: "#031e3f",
												borderRadius: 6,
												height: 50,
											}}
										>
											<IconButton icon="magnify" color={"#fff"} size={20} />
											<Text style={{ color: "#fff", fontSize: 17 }}>
												VERIFICAR MATRÍCULA
											</Text>
										</TouchableOpacity>
									</View>
									<View style={{ flex: 1 }}></View>
								</View>
								{mostrarDadosAssociado && (
									<View
										style={{
											flex: 1,
											margin: 20,
											backgroundColor: "#fff",
											borderWidth: associado.tipo === "01" ? 2 : 0,
											borderColor: associado.tipo === "01" ? "#07A85C" : "#fff",
											padding: 20,
											borderRadius: 6,
											elevation: 1,
										}}
									>
										{associado.status ? (
											<>
												<Text style={{ fontSize: 20, fontWeight: "bold" }}>
													{associado.nome} ({associado.matricula})
												</Text>
												<Text style={{ fontSize: 18 }}>
													SITUAÇÃO ATUAL:{" "}
													<Text style={{ fontWeight: "bold" }}>
														{associado.tipo !== "01"
															? "NÃO ASSOCIADO - COM DADOS PRÉ-PREENCHIDOS"
															: "ASSOCIADO ABEPOM"}
													</Text>
												</Text>
												{associado.data_saida == 1 && (
													<Text
														style={{
															color: tema.colors.vermelho,
															fontSize: 15,
														}}
													>
														O ASSOCIADO DEVERÁ PAGAR JOIA
													</Text>
												)}
											</>
										) : (
											<>
												<Text style={{ fontSize: 20, fontWeight: "bold" }}>
													MILITAR SEM REGISTRO COM A ABEPOM
												</Text>
											</>
										)}
									</View>
								)}
								{btnRecadastrar && (
									<View style={{ flexDirection: "row" }}>
										<View style={{ flex: 1 }}></View>
										<View style={{ flex: 2 }}>
											<TouchableOpacity
												onPress={() => console.log("RECADASTRAR")}
												style={{
													flexDirection: "row",
													flex: 1,
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
													RECADASTRAR ASSOCIADO
												</Text>
												<Image
													source={images.seta}
													style={{ width: 20, height: 20, tintColor: "#fff" }}
													tintColor={"#fff"}
												/>
											</TouchableOpacity>
										</View>
										<View style={{ flex: 1 }}></View>
									</View>
								)}
							</ProgressStep>
							<ProgressStep label="Dados Gerais" removeBtnRow>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 3, marginRight: 5 }}>
										<TextInput
											label="Nome"
											value={associado.nome}
											maxLength={40}
											onChangeText={(text) =>
												setAssociado({ ...associado, nome: text })
											}
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Data de Nascimento"
											value={associado.nascimento}
											keyboardType={"numeric"}
											onChangeText={(text) =>
												setAssociado({ ...associado, nascimento: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{
														mask: "99/99/9999",
													}}
												/>
											)}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Sexo"
											value={associado.sexo.Name.substring(0, 1).toUpperCase()}
											onChangeText={(text) =>
												setAssociado({ ...associado, sexo: text })
											}
											render={(props) => (
												<PickerModal
													renderSelectView={(disabled, selected, showModal) => (
														<TouchableOpacity
															style={{
																flexDirection: "row",
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "center",
																paddingLeft: 10,
															}}
															disabled={disabled}
															onPress={showModal}
														>
															<View style={{ flex: 3, paddingTop: 15 }}>
																<Text
																	style={{ fontSize: associado.sexo ? 15 : 12 }}
																>
																	{associado.sexo.Name
																		? associado.sexo.Name === "F"
																			? "FEMININO"
																			: "MASCULINO"
																		: "SELECIONE"}
																</Text>
															</View>
															<View
																style={{
																	flex: 1,
																	alignItems: "flex-end",
																	paddingRight: 10,
																}}
															>
																<Image
																	source={images.seta}
																	tintColor={"#031e3f"}
																	style={{
																		width: 10,
																		height: 10,
																		right: 0,
																		tintColor: "#031e3f",
																		transform: [{ rotate: "90deg" }],
																	}}
																/>
															</View>
														</TouchableOpacity>
													)}
													modalAnimationType="fade"
													selected={
														associado.sexo.Name.substring(0, 1).toUpperCase() ==
														"M"
															? { Name: "MASCULINO", Value: "M" }
															: { Name: "FEMININO", Value: "F" }
													}
													selectPlaceholderText="SELECIONE O SEXO"
													searchPlaceholderText="DIGITE O SEXO"
													onSelected={(key) =>
														setAssociado({ ...associado, sexo: key })
													}
													onClosed={() =>
														setAssociado({ ...associado, sexo: associado.sexo })
													}
													items={[
														{ Name: "MASCULINO", Value: "M" },
														{ Name: "FEMININO", Value: "F" },
													]}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="CPF"
											value={associado.cpf}
											maxLength={14}
											onChangeText={(text) =>
												setAssociado({ ...associado, cpf: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{
														mask: "999.999.999-99",
													}}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="RG"
											value={associado.rg}
											maxLength={15}
											onChangeText={(text) =>
												setAssociado({ ...associado, rg: text })
											}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Telefone Comercial"
											value={associado.telefone_comercial}
											keyboardType={"numeric"}
											onChangeText={(text) =>
												setAssociado({ ...associado, telefone_comercial: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{
														mask: "(99) 9999-9999",
													}}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Telefone Residencial"
											value={associado.telefone_residencial}
											maxLength={15}
											keyboardType={"numeric"}
											onChangeText={(text) =>
												setAssociado({
													...associado,
													telefone_residencial: text,
												})
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{
														mask: "(99) 9999-9999",
													}}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Celular"
											value={associado.celular}
											maxLength={15}
											keyboardType={"numeric"}
											onChangeText={(text) =>
												setAssociado({ ...associado, celular: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{
														mask: "(99) 9 9999-9999",
													}}
												/>
											)}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="E-mail"
											textContentType={"emailAddress"}
											maxLength={60}
											value={associado.email}
											onChangeText={(text) =>
												setAssociado({ ...associado, email: text })
											}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Dígito"
											value={associado.digito}
											maxLength={1}
											onChangeText={(text) =>
												setAssociado({ ...associado, digito: text })
											}
										/>
									</View>
									<View style={{ flex: 3, marginRight: 5 }}></View>
								</View>
							</ProgressStep>
							<ProgressStep label="Endereço" removeBtnRow>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="CEP"
											value={associado.cep}
											maxLength={10}
											keyboardType={"numeric"}
											onChangeText={(text) =>
												setAssociado({ ...associado, cep: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{
														mask: "99999-999",
													}}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TouchableOpacity
											onPress={() => buscarCep()}
											style={{
												flex: 1,
												flexDirection: "row",
												alignItems: "center",
												justifyContent: "center",
												backgroundColor: "#031e3f",
												borderRadius: 6,
											}}
										>
											<IconButton icon="magnify" color={"#fff"} size={20} />
											<Text
												style={{ color: "#fff", fontSize: 17, marginRight: 10 }}
											>
												BUSCAR CEP
											</Text>
										</TouchableOpacity>
									</View>
									<View style={{ flex: 3, marginRight: 5 }}></View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 4, marginRight: 5 }}>
										<TextInput
											label="Endereço"
											value={associado.endereco}
											maxLength={50}
											onChangeText={(text) =>
												setAssociado({ ...associado, endereco: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Número"
											value={associado.numero}
											onChangeText={(text) =>
												setAssociado({ ...associado, numero: text })
											}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Complemento"
											value={associado.complemento}
											maxLength={40}
											onChangeText={(text) =>
												setAssociado({ ...associado, complemento: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Bairro"
											value={associado.bairro}
											maxLength={35}
											onChangeText={(text) =>
												setAssociado({ ...associado, bairro: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Cidade"
											value={
												associado.cidade.Value == ""
													? "SELECIONE A CIDADE"
													: associado.cidade.Value
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, cidade: text })
											}
											render={(props) => (
												<PickerModal
													renderSelectView={(disabled, selected, showModal) => (
														<TouchableOpacity
															style={{
																flexDirection: "row",
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "center",
																paddingLeft: 10,
															}}
															disabled={disabled}
															onPress={showModal}
														>
															<View style={{ flex: 3, paddingTop: 15 }}>
																<Text
																	style={{
																		fontSize: associado.cidade ? 15 : 12,
																	}}
																>
																	{associado.cidade.Name !== ""
																		? associado.cidade.Name
																		: "SELECIONE A CIDADE"}
																</Text>
															</View>
															<View
																style={{
																	flex: 1,
																	alignItems: "flex-end",
																	paddingRight: 10,
																}}
															>
																<Image
																	source={images.seta}
																	tintColor={"#031e3f"}
																	style={{
																		width: 10,
																		height: 10,
																		right: 0,
																		tintColor: "#031e3f",
																		transform: [{ rotate: "90deg" }],
																	}}
																/>
															</View>
														</TouchableOpacity>
													)}
													sortingLanguage={"pt-br"}
													autoGenerateAlphabeticalIndex={true}
													showAlphabeticalIndex={true}
													modalAnimationType="fade"
													selected={associado.cidade}
													selectPlaceholderText="SELECIONE A CIDADE"
													searchPlaceholderText="DIGITE A CIDADE"
													onSelected={(key) =>
														setAssociado({ ...associado, cidade: key })
													}
													onClosed={() =>
														setAssociado({
															...associado,
															cidade: associado.cidade,
														})
													}
													items={cidades}
												/>
											)}
										/>
									</View>
								</View>
							</ProgressStep>
							<ProgressStep label="Outros" removeBtnRow>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Órgão"
											value={
												associado.orgao.Value == ""
													? "SELECIONE O ÓRGÃO"
													: associado.orgao.Value
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, orgao: text })
											}
											render={(props) => (
												<PickerModal
													renderSelectView={(disabled, selected, showModal) => (
														<TouchableOpacity
															style={{
																flexDirection: "row",
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "center",
																paddingLeft: 10,
															}}
															disabled={disabled}
															onPress={showModal}
														>
															<View style={{ flex: 3, paddingTop: 15 }}>
																<Text
																	style={{
																		fontSize: associado.orgao ? 15 : 12,
																	}}
																>
																	{associado.orgao.Name !== ""
																		? associado.orgao.Name
																		: "SELECIONE"}
																</Text>
															</View>
															<View
																style={{
																	flex: 1,
																	alignItems: "flex-end",
																	paddingRight: 10,
																}}
															>
																<Image
																	source={images.seta}
																	tintColor={"#031e3f"}
																	style={{
																		width: 10,
																		height: 10,
																		right: 0,
																		tintColor: "#031e3f",
																		transform: [{ rotate: "90deg" }],
																	}}
																/>
															</View>
														</TouchableOpacity>
													)}
													modalAnimationType="fade"
													selected={associado.orgao}
													selectPlaceholderText="SELECIONE O ÓRGÃO"
													searchPlaceholderText="DIGITE O ÓRGÃO"
													onSelected={(key) =>
														setAssociado({ ...associado, orgao: key })
													}
													onClosed={() =>
														setAssociado({
															...associado,
															orgao: associado.orgao,
														})
													}
													items={orgaos}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="Local de Trabalho"
											value={
												associado.local_trabalho.Name === ""
													? "SELECIONE"
													: associado.local_trabalho.Name
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, local_trabalho: text })
											}
											render={(props) => (
												<PickerModal
													renderSelectView={(disabled, selected, showModal) => (
														<TouchableOpacity
															style={{
																flexDirection: "row",
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "center",
																paddingLeft: 10,
															}}
															disabled={disabled}
															onPress={showModal}
														>
															<View style={{ flex: 3, paddingTop: 15 }}>
																<Text
																	style={{
																		fontSize:
																			associado.local_trabalho.Name !== ""
																				? 15
																				: 12,
																	}}
																>
																	{associado.local_trabalho.Name === ""
																		? "SELECIONE"
																		: associado.local_trabalho.Name}
																</Text>
															</View>
															<View
																style={{
																	flex: 1,
																	alignItems: "flex-end",
																	paddingRight: 10,
																}}
															>
																<Image
																	source={images.seta}
																	tintColor={"#031e3f"}
																	style={{
																		width: 10,
																		height: 10,
																		right: 0,
																		tintColor: "#031e3f",
																		transform: [{ rotate: "90deg" }],
																	}}
																/>
															</View>
														</TouchableOpacity>
													)}
													modalAnimationType="fade"
													selected={associado.local_trabalho}
													selectPlaceholderText="SELECIONE O LOCAL DE TRABALHO"
													searchPlaceholderText="DIGITE O LOCAL DE TRABALHO"
													onSelected={(key) =>
														setAssociado({ ...associado, local_trabalho: key })
													}
													onClosed={() =>
														setAssociado({
															...associado,
															local_trabalho: associado.local_trabalho,
														})
													}
													items={lotacoes}
												/>
											)}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Função"
											value={
												associado.funcao.Name === ""
													? "SELECIONE"
													: associado.funcao.Name
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, funcao: text })
											}
											render={(props) => (
												<PickerModal
													renderSelectView={(disabled, selected, showModal) => (
														<TouchableOpacity
															style={{
																flexDirection: "row",
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "center",
																paddingLeft: 10,
															}}
															disabled={disabled}
															onPress={showModal}
														>
															<View style={{ flex: 3, paddingTop: 15 }}>
																<Text
																	style={{
																		fontSize: associado.funcao !== "" ? 15 : 12,
																	}}
																>
																	{associado.funcao.Name === ""
																		? "SELECIONE"
																		: associado.funcao.Name}
																</Text>
															</View>
															<View
																style={{
																	flex: 1,
																	alignItems: "flex-end",
																	paddingRight: 10,
																}}
															>
																<Image
																	source={images.seta}
																	tintColor={"#031e3f"}
																	style={{
																		width: 10,
																		height: 10,
																		right: 0,
																		tintColor: "#031e3f",
																		transform: [{ rotate: "90deg" }],
																	}}
																/>
															</View>
														</TouchableOpacity>
													)}
													modalAnimationType="fade"
													selected={associado.funcao}
													selectPlaceholderText="SELECIONE A FUNÇÃO"
													searchPlaceholderText="DIGITE A FUNÇÃO"
													onSelected={(key) =>
														setAssociado({ ...associado, funcao: key })
													}
													onClosed={() =>
														setAssociado({
															...associado,
															funcao: associado.funcao,
														})
													}
													items={funcoes}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="Mês / Ano Últ. Desc."
											value={associado.mesano}
											maxLength={7}
											onChangeText={(text) =>
												setAssociado({ ...associado, mesano: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{
														mask: "99/9999",
													}}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Identificador"
											value={associado.identificador}
											maxLength={15}
											onChangeText={(text) =>
												setAssociado({ ...associado, identificador: text })
											}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Banco"
											value={
												associado.banco.Name === ""
													? "SELECIONE"
													: associado.banco.Name
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, banco: text })
											}
											render={(props) => (
												<PickerModal
													renderSelectView={(disabled, selected, showModal) => (
														<TouchableOpacity
															style={{
																flexDirection: "row",
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "center",
																paddingLeft: 10,
															}}
															disabled={disabled}
															onPress={showModal}
														>
															<View style={{ flex: 3, paddingTop: 15 }}>
																<Text
																	style={{
																		fontSize: associado.banco !== "" ? 15 : 12,
																	}}
																>
																	{associado.banco.Name === ""
																		? "SELECIONE"
																		: associado.banco.Name}
																</Text>
															</View>
															<View
																style={{
																	flex: 1,
																	alignItems: "flex-end",
																	paddingRight: 10,
																}}
															>
																<Image
																	source={images.seta}
																	tintColor={"#031e3f"}
																	style={{
																		width: 10,
																		height: 10,
																		right: 0,
																		tintColor: "#031e3f",
																		transform: [{ rotate: "90deg" }],
																	}}
																/>
															</View>
														</TouchableOpacity>
													)}
													modalAnimationType="fade"
													selected={associado.banco}
													selectPlaceholderText="SELECIONE O BANCO"
													searchPlaceholderText="DIGITE O BANCO"
													onSelected={(key) =>
														setAssociado({ ...associado, banco: key })
													}
													onClosed={() =>
														setAssociado({
															...associado,
															banco: associado.banco,
														})
													}
													items={bancos}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Agência"
											value={associado.agencia}
											maxLength={7}
											onChangeText={(text) =>
												setAssociado({ ...associado, agencia: text })
											}
										/>
									</View>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="Conta Corrente"
											value={associado.conta}
											maxLength={8}
											onChangeText={(text) =>
												setAssociado({ ...associado, conta: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Dígito"
											value={associado.digito_conta}
											maxLength={1}
											onChangeText={(text) =>
												setAssociado({ ...associado, digito_conta: text })
											}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="Forma de Desconto"
											value={
												associado.forma_desconto.Name === ""
													? "SELECIONE"
													: associado.forma_desconto.Name
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, forma_desconto: text })
											}
											render={(props) => (
												<PickerModal
													renderSelectView={(disabled, selected, showModal) => (
														<TouchableOpacity
															style={{
																flexDirection: "row",
																flex: 1,
																justifyContent: "flex-start",
																alignItems: "center",
																paddingLeft: 10,
															}}
															disabled={disabled}
															onPress={showModal}
														>
															<View style={{ flex: 3, paddingTop: 15 }}>
																<Text
																	style={{
																		fontSize:
																			associado.forma_desconto !== "" ? 15 : 12,
																	}}
																>
																	{associado.forma_desconto.Name === ""
																		? "SELECIONE"
																		: associado.forma_desconto.Name}
																</Text>
															</View>
															<View
																style={{
																	flex: 1,
																	alignItems: "flex-end",
																	paddingRight: 10,
																}}
															>
																<Image
																	source={images.seta}
																	tintColor={"#031e3f"}
																	style={{
																		width: 10,
																		height: 10,
																		right: 0,
																		tintColor: "#031e3f",
																		transform: [{ rotate: "90deg" }],
																	}}
																/>
															</View>
														</TouchableOpacity>
													)}
													modalAnimationType="fade"
													selected={associado.forma_desconto}
													selectPlaceholderText="SELECIONE A FORMA DE DESCONTO"
													searchPlaceholderText="DIGITE A FORMA DE DESCONTO"
													onSelected={(key) =>
														setAssociado({ ...associado, forma_desconto: key })
													}
													onClosed={() =>
														setAssociado({
															...associado,
															forma_desconto: associado.forma_desconto,
														})
													}
													items={formas}
												/>
											)}
										/>
									</View>

									<View
										style={{ flex: 2, marginRight: 5, alignItems: "center" }}
									>
										<Text>ESTORNADO</Text>
										<Switch
											value={associado.estornado}
											onValueChange={onToggleEstornado}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Valor da Mensalidade"
											value={associado.valor_mensalidade.toString()}
											onChangeText={(text) =>
												setAssociado({ ...associado, valor_mensalidade: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"money"}
													options={{
														precision: 2,
														separator: ",",
														delimiter: ".",
														unit: "R$ ",
														suffixUnit: "",
													}}
												/>
											)}
										/>
									</View>
									<View
										style={{ flex: 1, marginRight: 5, alignItems: "center" }}
									>
										<Text>INDICA ASSOC. ESP.</Text>
										<Switch
											value={associado.indica}
											onValueChange={onToggleIndica}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Observação"
											value={associado.observacao}
											multiline
											numberOfLines={10}
											onChangeText={(text) =>
												setAssociado({ ...associado, observacao: text })
											}
										/>
									</View>
								</View>
							</ProgressStep>
							<ProgressStep label="Arquivos" removeBtnRow>
								<Text style={{ textAlign: "center", marginBottom: 20 }}>
									Clique nos botões abaixo para tirar foto dos documentos:
								</Text>
								<ScrollView>
									<View style={{ flexDirection: "row" }}>
										<View
											style={{
												flex: 1,
												alignItems: "center",
												marginVertical: 20,
											}}
										>
											<TouchableOpacity
												style={{
													backgroundColor: "#031e3f",
													padding: 20,
													borderRadius: 6,
													width: "70%",
													alignItems: "center",
												}}
												onPress={() => tirarFoto("CPF")}
											>
												<Text style={{ color: "#fff", fontSize: 20 }}>CPF</Text>
											</TouchableOpacity>
											{cpf.length > 0 && (
												<View
													style={{
														flex: 1,
														alignItems: "center",
														marginVertical: 20,
													}}
												>
													<Image
														source={{ uri: cpf }}
														style={{ width: 300, height: 300 }}
													/>
												</View>
											)}
										</View>
										<View
											style={{
												flex: 1,
												alignItems: "center",
												marginVertical: 20,
											}}
										>
											<TouchableOpacity
												style={{
													backgroundColor: "#031e3f",
													padding: 20,
													borderRadius: 6,
													width: "70%",
													alignItems: "center",
												}}
												onPress={() => tirarFoto("RG")}
											>
												<Text style={{ color: "#fff", fontSize: 20 }}>RG</Text>
											</TouchableOpacity>
											{rg.length > 0 && (
												<View
													style={{
														flex: 1,
														alignItems: "center",
														marginVertical: 20,
													}}
												>
													<Image
														source={{ uri: rg }}
														style={{ width: 300, height: 300 }}
													/>
												</View>
											)}
										</View>
									</View>
									<View style={{ flexDirection: "row" }}>
										<View
											style={{
												flex: 1,
												alignItems: "center",
												marginVertical: 20,
											}}
										>
											<TouchableOpacity
												style={{
													backgroundColor: "#031e3f",
													padding: 20,
													borderRadius: 6,
													width: "70%",
													alignItems: "center",
												}}
												onPress={() => tirarFoto("CC")}
											>
												<Text style={{ color: "#fff", fontSize: 20 }}>
													CONTRA CHEQUE
												</Text>
											</TouchableOpacity>
											{contraCheque.length > 0 && (
												<View
													style={{
														flex: 1,
														alignItems: "center",
														marginVertical: 20,
													}}
												>
													<Image
														source={{ uri: contraCheque }}
														style={{ width: 300, height: 300 }}
													/>
												</View>
											)}
										</View>
										<View
											style={{
												flex: 1,
												alignItems: "center",
												marginVertical: 20,
											}}
										>
											<TouchableOpacity
												style={{
													backgroundColor: "#031e3f",
													padding: 20,
													borderRadius: 6,
													width: "70%",
													alignItems: "center",
												}}
												onPress={() => tirarFoto("CR")}
											>
												<Text style={{ color: "#fff", fontSize: 20 }}>
													COMPROV. DE RESIDÊNCIA
												</Text>
											</TouchableOpacity>
											{comprovanteResidencia.length > 0 && (
												<View
													style={{
														flex: 1,
														alignItems: "center",
														marginVertical: 20,
													}}
												>
													<Image
														source={{ uri: comprovanteResidencia }}
														style={{ width: 300, height: 300 }}
													/>
												</View>
											)}
										</View>
									</View>
									<View style={{ height: 110 }}></View>
								</ScrollView>
							</ProgressStep>
						</ProgressSteps>
						{prevStep && (
							<TouchableOpacity
								onPress={goToPrevStep}
								style={{
									backgroundColor: "#031e3f",
									padding: 20,
									borderRadius: 6,
									position: "absolute",
									left: 50,
									bottom: 40,
								}}
							>
								<Text style={{ color: "#fff", fontSize: 20 }}>ANTERIOR</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity
							disabled={!nextStep}
							onPress={goToNextStep}
							style={{
								backgroundColor: nextStep
									? activeStep === 4
										? "#188038"
										: "#031e3f"
									: "#aaa",
								padding: 20,
								borderRadius: 6,
								position: "absolute",
								right: 50,
								bottom: 40,
							}}
						>
							<Text style={{ color: nextStep ? "#fff" : "#000", fontSize: 20 }}>
								{textNext}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		</>
	);
}

export default CadastrarAssociado;
