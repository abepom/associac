import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
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
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";

function CadastrarAssociado(props) {
	const { navigation } = props;
	const [{ usuario, nome, token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
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
	const [modalJoia, setModalJoia] = useState(false);
	const [alerta, setAlerta] = useState({});
	const [carregando, setCarregando] = useState(false);

	const nascimentoRef = useRef(null);
	const cpfRef = useRef(null);
	const rgRef = useRef(null);
	const comercialRef = useRef(null);
	const residencialRef = useRef(null);
	const celularRef = useRef(null);
	const emailRef = useRef(null);
	const digitoRef = useRef(null);
	const numeroRef = useRef(null);
	const complementoRef = useRef(null);
	const bairroRef = useRef(null);
	const identificadorRef = useRef(null);
	const agenciaRef = useRef(null);
	const contaRef = useRef(null);
	const digitoContaRef = useRef(null);
	const mensalidadeRef = useRef(null);
	const obsRef = useRef(null);

	const showModal = () => setModalJoia(true);
	const hideModal = () => setModalJoia(false);

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
		try {
			const { data } = await api.geral.get("/listarCidades");
			let cids = [];

			data.cidades.map((cidade) => {
				cids.push({
					Name: cidade.nome_cidade,
					Value: cidade.cod_cidade,
				});
			});

			setCidades(cids);
		} catch (error) {
			setCidades([]);
		}
	}

	async function listarOrgaos() {
		try {
			const { data } = await api.geral.get("/listarOrgaos");

			let orgs = [];

			data.orgaos.map((orgao) => {
				orgs.push({
					Name: `${orgao.descricao} (${orgao.codigo})`,
					Value: orgao.codigo,
				});
			});

			setOrgaos(orgs);
		} catch (error) {
			setOrgaos([]);
		}
	}

	async function listarBancos() {
		try {
			const { data } = await api.geral.get("/listarBancos");

			let bancs = [];

			data.bancos.map((banco) => {
				bancs.push({
					Name: banco.nome_banco,
					Value: banco.cod_banco,
				});
			});

			setBancos(bancs);
		} catch (error) {
			setBancos([]);
		}
	}

	async function listarFuncoes() {
		try {
			const { data } = await api.geral.get("/listarFuncoes");

			let funcs = [];

			data.funcoes.map((funcao) => {
				funcs.push({
					Name: funcao.descricao,
					Value: funcao.codigo,
				});
			});

			setFuncoes(funcs);
		} catch (error) {
			setFuncoes([]);
		}
	}

	async function listarLotacoes() {
		try {
			const { data } = await api.geral.get("/listarLotacoes");

			let lots = [];

			data.lotacoes.map((lotacao) => {
				lots.push({
					Name: `${lotacao.descricao} (${lotacao.codigo})`,
					Value: lotacao.codigo,
				});
			});

			setLotacoes(lots);
		} catch (error) {
			setLotacoes([]);
		}
	}

	async function listarFormas() {
		try {
			const { data } = await api.geral.get("/listarFormasDesconto");

			let forms = [];

			data.formas.map((forma) => {
				forms.push({
					Name: `${forma.descricao} (${forma.codigo})`,
					Value: forma.codigo,
				});
			});

			setFormas(forms);
		} catch (error) {
			setFormas([]);
		}
	}

	const verificarMatricula = async () => {
		if (matricula.length == 6) {
			if (!isNaN(matricula)) {
				setCarregando(true);

				try {
					const { data } = await api.associados.get("/verificarMatricula", {
						cartao: matricula,
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

					setCarregando(false);
				} catch (error) {
					setCarregando(false);
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
						paga_joia: 0,
					});
					setBtnRecadastrar(false);
					setNextStep(false);
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
				setBtnRecadastrar(false);
				setMostrarDadosAssociado(false);
				setNextStep(false);
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "A matrícula informada está inválida.",
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
				message:
					"Para prosseguir é necessário informar a matrícula corretamente.",
				type: "warning",
				confirmText: "Ok, Informar a Matrícula!",
				showConfirm: true,
				showCancel: false,
			});
		}
	};

	const cadastrarAssociado = async () => {
		try {
			const { data } = await api.geral.post("/cadastrarAssociado", {
				associado,
			});

			setAlerta({
				visible: true,
				title: data.title,
				message: data.message,
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
				type: data.status ? "success" : "danger",
			});

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
				setMatricula("");
			}
		} catch (error) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Ocorreu um erro ao tentar cadastrar o associado.",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
				type: "danger",
			});
		}
	};

	async function verificarCpf() {
		if (associado.cpf === "") {
			return false;
		} else {
			if (associado.nascimento == "") {
				return false;
			} else {
				try {
					const { data } = await api.associados.get("/verificarCpf", {
						cartao: associado.matricula + "00001",
						cpf: associado.cpf,
						nascimento: formatDate(associado.nascimento, "AMD"),
					});

					return data.status;
				} catch (error) {
					return false;
				}
			}
		}
	}

	async function buscarCep() {
		if (associado.cep === "" || associado.cep?.length < 8) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Para prosseguir é necessário preencher o CEP.",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
				type: "danger",
			});
		} else {
			const response = await fetch(
				`https://viacep.com.br/ws/${associado.cep.replace(/[-.]/g, "")}/json/`,
				{
					method: "GET",
					mode: "no-cors",
				}
			);

			let dados = await response.json();

			if (dados.erro) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "O CEP informado é incorreto.",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
					type: "danger",
				});
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
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Você não forneceu permissão para acessar a câmera.",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
					type: "danger",
				});
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
			try {
				const { uri } = result;

				let extensao = uri.split(".")[uri.split(".").length - 1];

				const formulario = new FormData();
				formulario.append("matricula", `${associado.matricula}`);
				formulario.append("dependente", `00`);
				formulario.append("tipo", tipo);
				formulario.append("file", {
					uri,
					type: `image/${extensao}`,
					name: `${associado.matricula}_${new Date().toJSON()}.${extensao}`,
				});

				const { data } = await api.geral.post(
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
			} catch (error) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao enviar o documento.",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
					type: "danger",
				});
			}
		}
	}

	const goToNextStep = async () => {
		let erros = 0;
		let msgErro = "";

		switch (activeStep) {
			case 0:
				if (associado.matricula?.length < 6 || isNaN(associado.matricula)) {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: "A matrícula encontra-se incorreta.",
						showCancel: false,
						showConfirm: true,
						confirmText: "FECHAR",
						type: "danger",
					});

					setPrevStep(false);
				} else {
					setPrevStep(true);
					setActiveStep(1);
				}
				break;
			case 1:
				erros = 0;
				msgErro = "";

				const cpfValido = await verificarCpf();

				let data = new Date(formatDate(associado.nascimento, "AMD"));

				if (associado?.nome?.length < 3) {
					erros++;
					msgErro += "O campo NOME não pode ser menor do que 3 caracteres.\n";
				}

				if (!isDate(data)) {
					erros++;
					msgErro += "O campo DATA DE NASCIMENTO está incorreto.\n";
				}

				if (associado?.sexo?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o SEXO.\n";
				}

				if (associado?.rg === "") {
					erros++;
					msgErro += "É obrigatório preencher o RG.\n";
				}

				if (associado?.digito === "") {
					erros++;
					msgErro += "É obrigatório preencher o DÍGITO DA MATRÍCULA.\n";
				}

				if (
					associado?.telefone_comercial === "" &&
					associado?.telefone_residencial === "" &&
					associado?.celular === ""
				) {
					erros++;
					msgErro +=
						"É obrigatório preencher pelo menos um telefone (RESIDENCIAL, COMERCIAL OU CELULAR).\n";
				}

				if (!cpfValido) {
					erros++;
					msgErro += "O campo CPF está inválido.\n";
				}

				if (erros > 0) {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: `Para prosseguir é necessário preencher corretamente os campos:\n\n${msgErro}`,
						showCancel: false,
						showConfirm: true,
						confirmText: "OK, Corrigir campos",
						type: "warning",
					});
				} else {
					setActiveStep(2);
					setTextNext("PRÓXIMO");
				}

				break;
			case 2:
				erros = 0;
				msgErro = "";

				if (associado?.cep?.length < 8) {
					erros++;
					msgErro += "O CEP informado está incorreto.\n";
				}

				if (associado?.endereco === "") {
					erros++;
					msgErro += "É obrigatório preencher o ENDEREÇO.\n";
				}

				if (associado?.bairro === "") {
					erros++;
					msgErro += "É obrigatório preencher o BAIRRO.\n";
				}

				if (associado?.cidade === "") {
					erros++;
					msgErro += "É obrigatório selecionar a CIDADE.\n";
				}

				if (erros > 0) {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: `Para prosseguir é necessário preencher corretamente os campos:\n\n${msgErro}`,
						showCancel: false,
						showConfirm: true,
						confirmText: "OK, Corrigir campos",
						type: "warning",
					});
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

				erros = 0;
				msgErro = "";

				if (associado?.orgao?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o ÓRGÃO DE RECEBIMENTO.\n";
				}

				if (associado?.local_trabalho?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o LOCAL DE TRABALHO.\n";
				}

				if (associado?.funcao?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar a FUNÇÃO.\n";
				}

				if (associado?.banco?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o BANCO.\n";
				}

				if (associado?.agencia === "") {
					erros++;
					msgErro += "É obrigatório preencher a AGÊNCIA.\n";
				}

				if (associado?.conta === "") {
					erros++;
					msgErro += "É obrigatório preencher a CONTA.\n";
				}

				if (associado?.forma_desconto?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar a FORMA DE DESCONTO.\n";
				}

				if (erros > 0) {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: `Para prosseguir é necessário preencher corretamente os campos:\n\n${msgErro}`,
						showCancel: false,
						showConfirm: true,
						confirmText: "OK, Corrigir campos",
						type: "warning",
					});
				} else {
					setActiveStep(4);
					setTextNext("CADASTRAR");
				}

				break;
			case 4:
				erros = 0;
				msgErro = "";

				if (cpf === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem do CPF.\n";
				}

				if (rg === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem do RG.\n";
				}

				if (contraCheque === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem do CONTRA CHEQUE.\n";
				}

				if (comprovanteResidencia === "") {
					erros++;
					msgErro +=
						"É obrigatório enviar a imagem do COMPROVANTE DE RESIDÊNCIA.\n";
				}

				if (erros > 0) {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: `Para prosseguir é necessário preencher corretamente os campos:\n\n${msgErro}`,
						showCancel: false,
						showConfirm: true,
						confirmText: "OK, Corrigir campos",
						type: "warning",
					});
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
			<Modal animationType="fade" transparent visible={modalJoia}>
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
							Atenção {nome}, este associado pagará joia, e esta será descontada
							em {associado.parcelas_joia} parcelas. Deseja continuar?
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
							fontSize: 18,
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
							labelFontSize={18}
							marginBottom={100}
							style={{ zIndex: 12 }}
						>
							<ProgressStep label="Matrícula" removeBtnRow>
								<View style={{ flexDirection: "row" }}>
									<View style={{ flex: 1 }}></View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Matrícula"
											mode={"outlined"}
											value={matricula}
											keyboardType={"numeric"}
											maxLength={6}
											theme={tema}
											style={{ fontSize: 25 }}
											placeholder={"Digite a matrícula"}
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
									<View style={{ flex: 2 }}>
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
								{carregando ? (
									<View
										style={{
											justifyContent: "center",
											alignItems: "center",
											marginTop: 40,
										}}
									>
										<Loading size={110} />
									</View>
								) : (
									<>
										{mostrarDadosAssociado && (
											<View
												style={{
													flex: 1,
													margin: 20,
													backgroundColor: "#fff",
													borderWidth: associado.tipo === "01" ? 2 : 0,
													borderColor:
														associado.tipo === "01" ? "#07A85C" : "#fff",
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
														onPress={() =>
															navigation.navigate("RecadastrarAssociado", {
																associado,
															})
														}
														style={{
															flexDirection: "row",
															flex: 1,
															marginVertical: 20,
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
															style={{
																width: 20,
																height: 20,
																tintColor: "#fff",
															}}
															tintColor={"#fff"}
														/>
													</TouchableOpacity>
												</View>
												<View style={{ flex: 1 }}></View>
											</View>
										)}
									</>
								)}
							</ProgressStep>
							<ProgressStep label="Geral" removeBtnRow>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 4, marginRight: 5 }}>
										<TextInput
											label="Nome"
											mode={"outlined"}
											theme={tema}
											value={associado.nome}
											maxLength={40}
											style={{ fontSize: 18 }}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												nascimentoRef?.current?._inputElement.focus()
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, nome: text })
											}
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Data de Nascimento"
											mode={"outlined"}
											theme={tema}
											value={associado.nascimento}
											keyboardType={"numeric"}
											style={{ fontSize: 18 }}
											maxLength={10}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												cpfRef?.current?._inputElement.focus()
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, nascimento: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													ref={nascimentoRef}
													options={{
														mask: "99/99/9999",
													}}
												/>
											)}
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="Sexo"
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.sexo.Name.substring(0, 1).toUpperCase()}
											onChangeText={(text) =>
												setAssociado({ ...associado, sexo: text })
											}
											render={() => (
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
															<View style={{ flex: 3 }}>
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
											mode={"outlined"}
											theme={tema}
											value={associado.cpf}
											maxLength={14}
											style={{ fontSize: 18 }}
											keyboardType={"number-pad"}
											returnKeyType={"next"}
											onSubmitEditing={() => rgRef?.current?.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, cpf: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													ref={cpfRef}
													type={"custom"}
													options={{
														mask: "999.999.999-99",
													}}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="RG"
											mode={"outlined"}
											theme={tema}
											value={associado.rg}
											maxLength={15}
											ref={rgRef}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												comercialRef?.current?._inputElement.focus()
											}
											keyboardType={"number-pad"}
											style={{ fontSize: 18 }}
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
											mode={"outlined"}
											theme={tema}
											value={associado.telefone_comercial}
											keyboardType={"number-pad"}
											style={{ fontSize: 18 }}
											maxLength={15}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												residencialRef?.current?._inputElement.focus()
											}
											onChangeText={(text) =>
												setAssociado({ ...associado, telefone_comercial: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													ref={comercialRef}
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
											mode={"outlined"}
											theme={tema}
											value={associado.telefone_residencial}
											maxLength={15}
											keyboardType={"number-pad"}
											style={{ fontSize: 18 }}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												celularRef?.current?._inputElement.focus()
											}
											onChangeText={(text) =>
												setAssociado({
													...associado,
													telefone_residencial: text,
												})
											}
											render={(props) => (
												<TextInputMask
													{...props}
													ref={residencialRef}
													type={"custom"}
													options={{
														mask: "(99) 9999-9999",
													}}
												/>
											)}
										/>
									</View>
									<View style={{ flex: 1 }}>
										<TextInput
											label="Celular"
											mode={"outlined"}
											theme={tema}
											value={associado.celular}
											maxLength={16}
											keyboardType={"numeric"}
											style={{ fontSize: 18 }}
											returnKeyType={"next"}
											onSubmitEditing={() => emailRef?.current?.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, celular: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													ref={celularRef}
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
									<View style={{ flex: 4, marginRight: 5 }}>
										<TextInput
											label="E-mail"
											mode={"outlined"}
											theme={tema}
											textContentType={"emailAddress"}
											maxLength={60}
											value={associado.email}
											style={{ fontSize: 18 }}
											ref={emailRef}
											returnKeyType={"next"}
											onSubmitEditing={() => digitoRef.current.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, email: text })
											}
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Díg. da Matrícula"
											mode={"outlined"}
											theme={tema}
											value={associado.digito}
											maxLength={1}
											style={{ fontSize: 18 }}
											ref={digitoRef}
											onChangeText={(text) =>
												setAssociado({ ...associado, digito: text })
											}
										/>
									</View>
								</View>
							</ProgressStep>
							<ProgressStep label="Endereço" removeBtnRow>
								<View style={{ flexDirection: "row", marginBottom: 15 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="CEP"
											mode={"outlined"}
											theme={tema}
											value={associado.cep}
											maxLength={10}
											style={{ fontSize: 18 }}
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
											mode={"outlined"}
											theme={tema}
											value={associado.endereco}
											maxLength={50}
											style={{ fontSize: 18 }}
											returnKeyType={"next"}
											onSubmitEditing={() => numeroRef?.current?.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, endereco: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Número"
											mode={"outlined"}
											theme={tema}
											ref={numeroRef}
											style={{ fontSize: 18 }}
											value={associado.numero}
											returnKeyType={"next"}
											onSubmitEditing={() => complementoRef?.current?.focus()}
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
											mode={"outlined"}
											ref={complementoRef}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.complemento}
											maxLength={40}
											returnKeyType={"next"}
											onSubmitEditing={() => bairroRef?.current?.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, complemento: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Bairro"
											ref={bairroRef}
											value={associado.bairro}
											maxLength={35}
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											onChangeText={(text) =>
												setAssociado({ ...associado, bairro: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Cidade"
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
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
															<View style={{ flex: 3 }}>
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
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
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
															<View style={{ flex: 3 }}>
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
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
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
															<View style={{ flex: 3 }}>
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
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
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
															<View style={{ flex: 3 }}>
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
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.mesano}
											maxLength={7}
											returnKeyType={"next"}
											onSubmitEditing={() => identificadorRef?.current?.focus()}
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
											ref={identificadorRef}
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.identificador}
											maxLength={15}
											returnKeyType={"next"}
											onSubmitEditing={() => agenciaRef?.current?.focus()}
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
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
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
															<View style={{ flex: 3 }}>
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
											mode={"outlined"}
											ref={agenciaRef}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.agencia}
											maxLength={7}
											returnKeyType={"next"}
											onSubmitEditing={() => contaRef?.current?.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, agencia: text })
											}
										/>
									</View>
									<View style={{ flex: 2, marginRight: 5 }}>
										<TextInput
											label="Conta Corrente"
											ref={contaRef}
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.conta}
											maxLength={8}
											returnKeyType={"next"}
											onSubmitEditing={() => digitoContaRef?.current?.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, conta: text })
											}
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Dígito"
											ref={digitoContaRef}
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.digito_conta}
											maxLength={1}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												mensalidadeRef?.current?._inputElement.focus()
											}
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
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
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
															<View style={{ flex: 3 }}>
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
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.valor_mensalidade.toString()}
											returnKeyType={"next"}
											onSubmitEditing={() => obsRef?.current?.focus()}
											onChangeText={(text) =>
												setAssociado({ ...associado, valor_mensalidade: text })
											}
											render={(props) => (
												<TextInputMask
													{...props}
													ref={mensalidadeRef}
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
											ref={obsRef}
											mode={"outlined"}
											theme={tema}
											style={{ fontSize: 18 }}
											value={associado.observacao}
											multiline
											numberOfLines={10}
											returnKeyType={"done"}
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
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default CadastrarAssociado;
