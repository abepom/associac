import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	Alert,
	ScrollView,
} from "react-native";
import { TextInput, Switch, IconButton } from "react-native-paper";
import { TextInputMask } from "react-native-masked-text";
import PickerModal from "react-native-picker-modal-view";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import images from "../utils/images";
import api from "../../services/api";
import isDate from "../functions/isDate";
import removerAcentos from "../functions/removerAcentos";
import formatDate from "../functions/formatDate";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";

function CadastrarAssociado() {
	const [matricula, setMatricula] = useState("");
	const [digito, setDigito] = useState("");
	const [nome, setNome] = useState("");
	const [dataNascimento, setDataNascimento] = useState("");
	const [sexo, setSexo] = useState({ Name: "Masculino", Value: "M" });
	const [email, setEmail] = useState("");
	const [telefoneResidencial, setTelefoneResidencial] = useState("");
	const [telefoneComercial, setTelefoneComercial] = useState("");
	const [celular, setCelular] = useState("");
	const [cpf, setCpf] = useState("");
	const [rg, setRg] = useState("");
	const [cep, setCep] = useState("");
	const [endereco, setEndereco] = useState("");
	const [numero, setNumero] = useState("");
	const [complemento, setComplemento] = useState("");
	const [bairro, setBairro] = useState("");
	const [cidades, setCidades] = useState([]);
	const [cidade, setCidade] = useState({ Name: "", Value: "" });
	const [orgaos, setOrgaos] = useState([]);
	const [orgao, setOrgao] = useState({ Name: "", Value: "" });
	const [lotacoes, setLotacoes] = useState([]);
	const [localTrabalho, setLocalTrabalho] = useState({ Name: "", Value: "" });
	const [funcoes, setFuncoes] = useState([]);
	const [funcao, setFuncao] = useState({ Name: "", Value: "" });
	const [bancos, setBancos] = useState([]);
	const [banco, setBanco] = useState({ Name: "", Value: "" });
	const [agencia, setAgencia] = useState("");
	const [conta, setConta] = useState("");
	const [digitoConta, setDigitoConta] = useState("");
	const [formas, setFormas] = useState([]);
	const [formaDesconto, setFormaDesconto] = useState({ Name: "", Value: "" });
	const [estornado, setEstornado] = useState(false);
	const [naoIndica, setNaoIndica] = useState(false);
	const [mesanoUltimo, setMesanoUltimo] = useState("");
	const [identificador, setIdentificador] = useState("");
	const [valorMensalidade, setValorMensalidade] = useState("");
	const [observacao, setObservacao] = useState("");
	const [associado, setAssociado] = useState({});
	const [mostrarDadosAssociado, setMostrarDadosAssociado] = useState(false);
	const [btnRecadastrar, setBtnRecadastrar] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [nextStep, setNextStep] = useState(false);
	const [prevStep, setPrevStep] = useState(false);
	const [textNext, setTextNext] = useState("PRÓXIMO");
	const [imagemCPF, setImagemCPF] = useState("");
	const [imagemRG, setImagemRG] = useState("");
	const [imagemContraCheque, setImagemContraCheque] = useState("");
	const [imagemComprovanteEndereco, setImagemComprovanteEndereco] =
		useState("");

	const onToggleEstornado = () => setEstornado(!estornado);
	const onToggleNaoIndica = () => setNaoIndica(!naoIndica);

	useEffect(() => {
		if (matricula?.length < 6) {
			setNextStep(false);
		}
	}, [matricula]);

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
		if (matricula?.length == 6) {
			if (!isNaN(matricula)) {
				const data = await api.associados.get("/verificarMatricula", {
					cartao: matricula,
				});

				setMostrarDadosAssociado(true);
				setAssociado(data);

				if (data.status) {
					if (data.tipo === "01") {
						setBtnRecadastrar(true);
						setNextStep(false);
					} else {
						let nascimento = "";

						if (data.nascimento !== "") {
							nascimento += data.nascimento.substring(8) + "/";
							nascimento += data.nascimento.substring(5, 7) + "/";
							nascimento += data.nascimento.substring(0, 4);
						}

						setNome(data.nome);
						setDataNascimento(nascimento);
						setCpf(data.cpf);
						setRg(data.rg);
						setTelefoneComercial(data.telefone_comercial);
						setTelefoneResidencial(data.telefone_residencial);
						setCelular(data.celular);
						setEmail(data.email);
						setDigito(data.digito);

						if (data.sexo === "M") {
							setSexo({ Name: "MASCULINO", Value: "M" });
						} else {
							setSexo({ Name: "FEMININO", Value: "F" });
						}

						setCep(data.cep);
						setEndereco(data.endereco);
						setNumero(data.numero);
						setComplemento(data.complemento);
						setBairro(data.bairro);
						setCidade({ Name: data.nome_cidade, Value: data.codigo_cidade });

						setOrgao({ Name: data.nome_orgao, Value: data.codigo_orgao });
						setLocalTrabalho({
							Name: data.nome_local,
							Value: data.codigo_local,
						});
						setFuncao({ Name: data.nome_funcao, Value: data.codigo_funcao });
						setMesanoUltimo(data.mesano);
						setIdentificador(data.naturalidade);
						setBanco({ Name: data.nome_banco, Value: data.codigo_banco });
						setAgencia(data.agencia);
						setConta(data.conta);
						setDigitoConta(data.digito_conta);

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
		});

		if (data.status) {
		}
	};

	async function verificarCpf() {
		if (cpf === "") {
			return false;
		} else {
			const data = await api.associados.get("/verificarCpf", {
				cartao: matricula + "00001",
				cpf,
				usuario: "bruno.horn",
			});

			return data.status;
		}
	}

	async function buscarCep() {
		if (cep === "" || cep?.length < 8) {
			Alert.alert("ATENÇÃO!", "CABEÇA DE BIGORNA!");
		} else {
			const response = await fetch(
				`https://viacep.com.br/ws/${cep.replace(/-/g, "")}/json/`,
				{
					method: "GET",
					mode: "no-cors",
				}
			);

			let dados = await response.json();

			if (dados.erro) {
				Alert.alert("ATENÇÃO!", "CEP informado inválido.");
			} else {
				setEndereco(dados.logradouro);
				setComplemento(dados.complemento);
				setBairro(dados.bairro);

				cidades.map((cidade) => {
					if (
						removerAcentos(cidade.Name).toUpperCase() ==
						removerAcentos(dados.localidade).toUpperCase()
					) {
						setCidade(cidade);
					}
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
						setImagemCPF(data.link);
						break;
					case "RG":
						setImagemRG(data.link);
						break;
					case "CC":
						setImagemContraCheque(data.link);
						break;
					case "CR":
						setImagemComprovanteEndereco(data.link);
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
				if (matricula?.length < 6 || isNaN(matricula)) {
					Alert.alert("ATENÇÃO!", "NAO PASSOU");
					setPrevStep(false);
				} else {
					setPrevStep(true);
					setActiveStep(1);
				}
				break;
			case 1:
				const cpfValido = await verificarCpf();

				let data = new Date(formatDate(dataNascimento, "AMD"));

				if (
					nome?.length < 3 ||
					!isDate(data) ||
					sexo.Name === "" ||
					rg === "" ||
					celular === "" ||
					digito === "" ||
					(telefoneComercial === "" &&
						telefoneResidencial === "" &&
						celular === "") ||
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
					cep.length < 8 ||
					endereco === "" ||
					bairro === "" ||
					cidade.Value === ""
				) {
					Alert.alert("ATENÇÃO!", "NÃO PASSOU");
				} else {
					setActiveStep(3);
					setTextNext("PRÓXIMO");
				}

				break;
			case 3:
				if (
					orgao.Name === "" ||
					localTrabalho.Name === "" ||
					funcao.Name === "" ||
					banco.Name === "" ||
					agencia === "" ||
					conta === "" ||
					formaDesconto.Name === ""
				) {
					Alert.alert("ATENÇÃO!", "NÃO PASSOU");
				} else {
					setActiveStep(4);
					setTextNext("CADASTRAR");
				}

				break;
			case 4:
				if (
					imagemCPF === "" ||
					imagemRG === "" ||
					imagemContraCheque === "" ||
					imagemComprovanteEndereco === ""
				) {
					Alert.alert("ATENÇÃO!", "Não passou. Precisa preencher tudo.");
				} else {
					cadastrarAssociado();
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
										value={matricula}
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
												style={{ color: "#fff", fontSize: 17, marginRight: 10 }}
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
										value={nome}
										onChangeText={(text) => setNome(text)}
									/>
								</View>
								<View style={{ flex: 2 }}>
									<TextInput
										label="Data de Nascimento"
										value={dataNascimento}
										keyboardType={"numeric"}
										onChangeText={(text) => setDataNascimento(text)}
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
										value={sexo.Name.substring(0, 1).toUpperCase()}
										onChangeText={(text) => setSexo(text)}
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
															<Text style={{ fontSize: sexo ? 15 : 12 }}>
																{sexo.Name
																	? sexo.Name === "F"
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
												modalAnimationType="fade" // TIPO DE ANIMAÇÃO: FADE / SLIDE OU NONE
												selected={
													sexo.Name.substring(0, 1).toUpperCase() == "M"
														? { Name: "MASCULINO", Value: "M" }
														: { Name: "FEMININO", Value: "F" }
												}
												selectPlaceholderText="SELECIONE O SEXO" // TEXTO DO PLACEHOLDER
												searchPlaceholderText="SELECIONE O SEXO" // TEXTO DE BUSCA
												onSelected={(key) => setSexo(key)} // QUANDO SELECIONAR
												onClosed={() => setSexo({ ...sexo })}
												items={[
													{ Name: "MASCULINO", Value: "M" },
													{ Name: "FEMININO", Value: "F" },
												]} // ITENS DO SELECT
											/>
										)}
									/>
								</View>
								<View style={{ flex: 2, marginRight: 5 }}>
									<TextInput
										label="CPF"
										value={cpf}
										onChangeText={(text) => setCpf(text)}
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
										value={rg}
										onChangeText={(text) => setRg(text)}
									/>
								</View>
							</View>
							<View style={{ flexDirection: "row", marginBottom: 15 }}>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Telefone Comercial"
										value={telefoneComercial}
										keyboardType={"numeric"}
										onChangeText={(text) => setTelefoneComercial(text)}
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
										value={telefoneResidencial}
										keyboardType={"numeric"}
										onChangeText={(text) => setTelefoneResidencial(text)}
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
										value={celular}
										keyboardType={"numeric"}
										onChangeText={(text) => setCelular(text)}
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
										value={email}
										onChangeText={(text) => setEmail(text)}
									/>
								</View>
							</View>
							<View style={{ flexDirection: "row", marginBottom: 15 }}>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Dígito"
										value={digito}
										onChangeText={(text) => setDigito(text)}
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
										value={cep}
										keyboardType={"numeric"}
										onChangeText={(text) => setCep(text)}
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
										value={endereco}
										onChangeText={(text) => setEndereco(text)}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Número"
										value={numero}
										onChangeText={(text) => setNumero(text)}
									/>
								</View>
							</View>
							<View style={{ flexDirection: "row", marginBottom: 15 }}>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Complemento"
										value={complemento}
										onChangeText={(text) => setComplemento(text)}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Bairro"
										value={bairro}
										onChangeText={(text) => setBairro(text)}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Cidade"
										value={
											cidade.Value == "" ? "SELECIONE A CIDADE" : cidade.Value
										}
										onChangeText={(text) => setCidade(text)}
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
															<Text style={{ fontSize: sexo ? 15 : 12 }}>
																{cidade.Name !== ""
																	? cidade.Name
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
												selected={cidade}
												selectPlaceholderText="SELECIONE A CIDADE"
												searchPlaceholderText="SELECIONE A CIDADE"
												onSelected={(key) => setCidade(key)}
												onClosed={() => setCidade({ ...cidade })}
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
											orgao.Value == "" ? "SELECIONE O ÓRGÃO" : orgao.Value
										}
										onChangeText={(text) => setOrgao(text)}
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
															<Text style={{ fontSize: sexo ? 15 : 12 }}>
																{orgao.Name !== "" ? orgao.Name : "SELECIONE"}
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
												selected={orgao}
												selectPlaceholderText="SELECIONE O ÓRGÃO"
												searchPlaceholderText="SELECIONE O ÓRGÃO"
												onSelected={(key) => setOrgao(key)}
												onClosed={() => setOrgao({ ...orgao })}
												items={orgaos}
											/>
										)}
									/>
								</View>
								<View style={{ flex: 2, marginRight: 5 }}>
									<TextInput
										label="Local de Trabalho"
										value={
											localTrabalho.Name === ""
												? "SELECIONE"
												: localTrabalho.Name
										}
										onChangeText={(text) => setLocalTrabalho(text)}
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
															<Text style={{ fontSize: sexo ? 15 : 12 }}>
																{localTrabalho.Name === ""
																	? "SELECIONE"
																	: localTrabalho.Name}
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
												selected={localTrabalho}
												selectPlaceholderText="SELECIONE O LOCAL DE TRABALHO"
												searchPlaceholderText="SELECIONE O LOCAL DE TRABALHO"
												onSelected={(key) => setLocalTrabalho(key)}
												onClosed={() => setLocalTrabalho({ ...localTrabalho })}
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
										value={funcao.Name === "" ? "SELECIONE" : funcao.Name}
										onChangeText={(text) => setFuncao(text)}
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
															<Text style={{ fontSize: sexo ? 15 : 12 }}>
																{funcao.Name === "" ? "SELECIONE" : funcao.Name}
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
												selected={funcao}
												selectPlaceholderText="SELECIONE A FUNÇÃO"
												searchPlaceholderText="SELECIONE A FUNÇÃO"
												onSelected={(key) => setFuncao(key)}
												onClosed={() => setFuncao({ ...funcao })}
												items={funcoes}
											/>
										)}
									/>
								</View>
								<View style={{ flex: 2, marginRight: 5 }}>
									<TextInput
										label="Mês / Ano Últ. Desc."
										value={mesanoUltimo}
										onChangeText={(text) => setMesanoUltimo(text)}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Identificador"
										value={identificador}
										onChangeText={(text) => setIdentificador(text)}
									/>
								</View>
							</View>
							<View style={{ flexDirection: "row", marginBottom: 15 }}>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Banco"
										value={banco.Name === "" ? "SELECIONE" : banco.Name}
										onChangeText={(text) => setBanco(text)}
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
															<Text style={{ fontSize: sexo ? 15 : 12 }}>
																{banco.Name === "" ? "SELECIONE" : banco.Name}
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
												selected={banco}
												selectPlaceholderText="SELECIONE O BANCO"
												searchPlaceholderText="SELECIONE O BANCO"
												onSelected={(key) => setBanco(key)}
												onClosed={() => setBanco({ ...banco })}
												items={bancos}
											/>
										)}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Agência"
										value={agencia}
										onChangeText={(text) => setAgencia(text)}
									/>
								</View>
								<View style={{ flex: 2, marginRight: 5 }}>
									<TextInput
										label="Conta Corrente"
										value={conta}
										onChangeText={(text) => setConta(text)}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Dígito"
										value={digitoConta}
										onChangeText={(text) => setDigitoConta(text)}
									/>
								</View>
							</View>
							<View style={{ flexDirection: "row", marginBottom: 15 }}>
								<View style={{ flex: 2, marginRight: 5 }}>
									<TextInput
										label="Forma de Desconto"
										value={
											formaDesconto.Name === ""
												? "SELECIONE"
												: formaDesconto.Name
										}
										onChangeText={(text) => setFormaDesconto(text)}
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
															<Text style={{ fontSize: sexo ? 15 : 12 }}>
																{formaDesconto.Name === ""
																	? "SELECIONE"
																	: formaDesconto.Name}
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
												selected={formaDesconto}
												selectPlaceholderText="SELECIONE A FORMA DE DESCONTO"
												searchPlaceholderText="SELECIONE A FORMA DE DESCONTO"
												onSelected={(key) => setFormaDesconto(key)}
												onClosed={() => setFormaDesconto({ ...formaDesconto })}
												items={formas}
											/>
										)}
									/>
								</View>

								<View style={{ flex: 2, marginRight: 5, alignItems: "center" }}>
									<Text>ESTORNADO</Text>
									<Switch value={estornado} onValueChange={onToggleEstornado} />
								</View>
							</View>
							<View style={{ flexDirection: "row", marginBottom: 15 }}>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Valor da Mensalidade"
										value={valorMensalidade}
										onChangeText={(text) => setValorMensalidade(text)}
									/>
								</View>
								<View style={{ flex: 1, marginRight: 5, alignItems: "center" }}>
									<Text>NÃO INDICA ASSOC. ESP.</Text>
									<Switch value={naoIndica} onValueChange={onToggleNaoIndica} />
								</View>
							</View>
							<View style={{ flexDirection: "row", marginBottom: 15 }}>
								<View style={{ flex: 1, marginRight: 5 }}>
									<TextInput
										label="Observação"
										value={observacao}
										multiline
										numberOfLines={10}
										onChangeText={(text) => setObservacao(text)}
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
												width: "90%",
												alignItems: "center",
											}}
											onPress={() => tirarFoto("CPF")}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>CPF</Text>
										</TouchableOpacity>
										{imagemCPF.length > 0 && (
											<View
												style={{
													flex: 1,
													alignItems: "center",
													marginVertical: 20,
												}}
											>
												<Image
													source={{ uri: imagemCPF }}
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
												width: "90%",
												alignItems: "center",
											}}
											onPress={() => tirarFoto("RG")}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>RG</Text>
										</TouchableOpacity>
										{imagemRG.length > 0 && (
											<View
												style={{
													flex: 1,
													alignItems: "center",
													marginVertical: 20,
												}}
											>
												<Image
													source={{ uri: imagemRG }}
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
												width: "90%",
												alignItems: "center",
											}}
											onPress={() => tirarFoto("CC")}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>
												CONTRA CHEQUE
											</Text>
										</TouchableOpacity>
										{imagemContraCheque.length > 0 && (
											<View
												style={{
													flex: 1,
													alignItems: "center",
													marginVertical: 20,
												}}
											>
												<Image
													source={{ uri: imagemCPF }}
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
												width: "90%",
												alignItems: "center",
											}}
											onPress={() => tirarFoto("CR")}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>
												COMPROVANTE DE RESIDÊNCIA
											</Text>
										</TouchableOpacity>
										{imagemComprovanteEndereco.length > 0 && (
											<View
												style={{
													flex: 1,
													alignItems: "center",
													marginVertical: 20,
												}}
											>
												<Image
													source={{ uri: imagemCPF }}
													style={{ width: 300, height: 300 }}
												/>
											</View>
										)}
									</View>
								</View>
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
	);
}

export default CadastrarAssociado;
