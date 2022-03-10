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
import { TextInputMask } from "react-native-masked-text";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import api from "../../services/api";
import isDate from "../functions/isDate";
import removerAcentos from "../functions/removerAcentos";
import formatDate from "../functions/formatDate";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";
import Header from "../components/Header";
import s, { tema } from "../../assets/style/Style";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import Combo from "../components/Combo";
import images from "../utils/images";
import ModalLoading from "../components/ModalLoading";

function CadastrarAssociado(props) {
	const { navigation } = props;
	const [usuario, setUsuario] = useUsuario();
	const { token, associado_atendimento } = usuario;
	const [cidades, setCidades] = useState([]);
	const [orgaos, setOrgaos] = useState([]);
	const [lotacoes, setLotacoes] = useState([]);
	const [funcoes, setFuncoes] = useState([]);
	const [bancos, setBancos] = useState([]);
	const [formas, setFormas] = useState([]);
	const [activeStep, setActiveStep] = useState(0);
	const [nextStep, setNextStep] = useState(true);
	const [prevStep, setPrevStep] = useState(false);
	const [textNext, setTextNext] = useState("PRÓXIMO");
	const [imagemCpf, setImagemCpf] = useState("");
	const [imagemRg, setImagemRg] = useState("");
	const [imagemContraCheque, setImagemContraCheque] = useState("");
	const [imagemComprovanteResidencia, setImagemComprovanteResidencia] =
		useState("");
	const [imagemAmpliada, setImagemAmpliada] = useState("");
	const [modal, setModal] = useState(false);
	const [modalJoia, setModalJoia] = useState(false);
	const [modalCarregando, setModalCarregando] = useState(false);
	const [alerta, setAlerta] = useState({});
	const [carregando, setCarregando] = useState(false);

	const [nome, setNome] = useState(associado_atendimento?.nome ?? "");
	const [nascimento, setNascimento] = useState(
		associado_atendimento?.nascimento ?? ""
	);
	const [sexo, setSexo] = useState(
		associado_atendimento?.sexo ?? { Name: "MASCULINO", Value: "M" }
	);
	const [cpf, setCpf] = useState(associado_atendimento?.cpf ?? "");
	const [rg, setRg] = useState(associado_atendimento?.rg ?? "");
	const [telefoneComercial, setTelefoneComercial] = useState(
		associado_atendimento?.telefone_comercial ?? ""
	);
	const [telefoneResidencial, setTelefoneResidencial] = useState(
		associado_atendimento?.telefone_residencial ?? ""
	);
	const [celular, setCelular] = useState(associado_atendimento?.celular ?? "");
	const [email, setEmail] = useState(associado_atendimento?.email ?? "");
	const [digito, setDigito] = useState(associado_atendimento?.digito ?? "");
	const [cep, setCep] = useState(associado_atendimento?.cep ?? "");
	const [endereco, setEndereco] = useState(
		associado_atendimento?.endereco ?? ""
	);
	const [numero, setNumero] = useState(associado_atendimento?.numero ?? "");
	const [complemento, setComplemento] = useState(
		associado_atendimento?.complemento ?? ""
	);
	const [bairro, setBairro] = useState(associado_atendimento?.bairro ?? "");
	const [cidade, setCidade] = useState(
		associado_atendimento?.cidade ?? { Name: "", Value: "" }
	);
	const [orgao, setOrgao] = useState(
		associado_atendimento?.orgao ?? { Name: "", Value: "" }
	);
	const [localTrabalho, setLocalTrabalho] = useState(
		associado_atendimento?.local_trabalho ?? { Name: "", Value: "" }
	);
	const [funcao, setFuncao] = useState(
		associado_atendimento?.funcao ?? { Name: "", Value: "" }
	);
	const [mesano, setMesano] = useState(associado_atendimento?.mesano ?? "");
	const [identificador, setIdentificador] = useState(
		associado_atendimento?.identificador ?? ""
	);
	const [formaDesconto, setFormaDesconto] = useState(
		associado_atendimento?.forma_desconto ?? { Name: "", Value: "" }
	);
	const [banco, setBanco] = useState(
		associado_atendimento?.banco ?? { Name: "", Value: "" }
	);
	const [agencia, setAgencia] = useState(associado_atendimento?.agencia ?? "");
	const [conta, setConta] = useState(associado_atendimento?.conta ?? "");
	const [digitoConta, setDigitoConta] = useState(
		associado_atendimento?.digito_conta ?? ""
	);
	const [estornado, setEstornado] = useState(
		associado_atendimento?.estornado ?? false
	);
	const [indica, setIndica] = useState(associado_atendimento?.indica ?? false);
	const [observacao, setObservacao] = useState(
		associado_atendimento?.observacao ?? ""
	);

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

	const onToggleEstornado = () => setEstornado(!estornado);
	const onToggleIndica = () => setIndica(!indica);

	useEffect(() => {
		if (associado_atendimento.matricula?.length < 6) {
			setNextStep(false);
		}
	}, [associado_atendimento.matricula]);

	useEffect(() => {
		console.log(associado_atendimento);
		listarCidades();
		listarOrgaos();
		listarBancos();
		listarFuncoes();
		listarLotacoes();
		listarFormas();
	}, []);

	async function listarCidades() {
		try {
			const { data } = await api({
				url: "/listarCidades",
				method: "GET",
				headers: { "x-access-token": token },
			});

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
			const { data } = await api({
				url: "/listarOrgaos",
				method: "GET",
				headers: { "x-access-token": token },
			});

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
			const { data } = await api({
				url: "/listarBancos",
				method: "GET",
				headers: { "x-access-token": token },
			});

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
			const { data } = await api({
				url: "/listarFuncoes",
				method: "GET",
				headers: { "x-access-token": token },
			});

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
			const { data } = await api({
				url: "/listarLotacoes",
				method: "GET",
				headers: { "x-access-token": token },
			});

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
			const { data } = await api({
				url: "/listarFormasDesconto",
				method: "GET",
				headers: { "x-access-token": token },
			});

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

	const cadastrarAssociado = async () => {
		setAlerta({
			visible: true,
			title: "CADASTRANDO ASSOCIADO",
			message: <Loading size={125} />,
			showConfirm: false,
			showCancel: false,
			showIcon: false,
		});

		try {
			const { data } = await api({
				url: "/cadastrarAssociado",
				method: "POST",
				data: {
					associado: {
						matricula: associado_atendimento.matricula,
						nome,
						nascimento,
						sexo,
						cpf: cpf.replace(/[.-]/g, "").trim(),
						rg,
						telefone_comercial: telefoneComercial.replace(/[()-]/g, "").trim(),
						telefone_residencial: telefoneResidencial
							.replace(/[()-]/g, "")
							.trim(),
						celular: celular.replace(/[()-]/g, "").trim(),
						email,
						endereco,
						numero: numero.trim(),
						complemento,
						bairro,
						cidade,
						cep,
						orgao,
						local_trabalho: localTrabalho,
						funcao,
						mesano,
						identificador,
						banco,
						agencia,
						conta,
						digito_conta: digitoConta,
						digito,
						forma_desconto: formaDesconto,
						estornado,
						indica,
						vinculo: 1,
						observacao: (
							associado_atendimento.observacao +
							" " +
							observacao
						).trim(),
						tipo: "01",
						status: true,
						recadastrado: true,
						paga_joia: associado_atendimento.paga_joia,
					},
				},
				headers: { "x-access-token": token },
			});

			if (data.status) {
				setActiveStep(0);
				setPrevStep(false);
				setTextNext("PRÓXIMO");
				setImagemCpf("");
				setImagemRg("");
				setImagemContraCheque("");
				setImagemComprovanteResidencia("");

				setUsuario({
					...usuario,
					associado_atendimento: {
						...associado_atendimento,
						nome: nome.toUpperCase(),
						nascimento,
						sexo,
						cpf: cpf.replace(/[.-]/g, "").trim(),
						rg,
						telefone_comercial: telefoneComercial.replace(/[()-]/g, "").trim(),
						telefone_residencial: telefoneResidencial
							.replace(/[()-]/g, "")
							.trim(),
						celular: celular.replace(/[()-]/g, "").trim(),
						email,
						endereco,
						numero: numero.trim(),
						complemento,
						bairro,
						cidade,
						cep,
						orgao,
						local_trabalho: localTrabalho,
						funcao,
						mesano,
						identificador,
						banco,
						agencia,
						conta,
						digito_conta: digitoConta,
						digito,
						forma_desconto: formaDesconto,
						estornado,
						indica,
						observacao: (
							usuario.associado_atendimento.observacao +
							" " +
							observacao
						).trim(),
						tipo: "01",
						status: true,
						recadastrado: true,
					},
				});

				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
					type: "success",
					confirmFunction: () => navigation.navigate("Inicio"),
				});
			} else {
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
					type: "danger",
				});
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
		if (cpf === "") {
			return false;
		} else {
			if (nascimento == "") {
				return false;
			} else {
				try {
					const { data } = await api({
						url: "/associados/verificarCpf",
						method: "GET",
						params: {
							cartao: associado_atendimento.matricula + "00001",
							cpf,
							nascimento: formatDate(nascimento, "AMD"),
						},
						headers: { "x-access-token": token },
					});

					return data.status;
				} catch (error) {
					return false;
				}
			}
		}
	}

	async function buscarCep() {
		setCarregando(true);

		if (cep === "" || cep?.length < 8) {
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
				`https://viacep.com.br/ws/${cep.replace(/[-.]/g, "")}/json/`,
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
				let cid = cidade;

				cidades.map((cidade) => {
					if (
						removerAcentos(cidade.Name).toUpperCase() ==
						removerAcentos(dados.localidade).toUpperCase()
					) {
						cid = cidade;
					}
				});

				setEndereco(dados.logradouro);
				setComplemento(dados.complemento);
				setBairro(dados.bairro);
				setCidade(cid);
			}
		}

		setCarregando(false);
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
				formulario.append("matricula", `${associado_atendimento.matricula}`);
				formulario.append("dependente", `00`);
				formulario.append("tipo", tipo);
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

				if (data.status) {
					switch (tipo) {
						case "CPF":
							setImagemCpf(data.link);
							break;
						case "RG":
							setImagemRg(data.link);
							break;
						case "CC":
							setImagemContraCheque(data.link);
							break;
						case "CR":
							setImagemComprovanteResidencia(data.link);
							break;
						default:
							break;
					}
				} else {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: data.message,
						showCancel: false,
						showConfirm: true,
						confirmText: "FECHAR",
						type: "danger",
					});
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

		setModalCarregando(true);

		switch (activeStep) {
			case 0:
				erros = 0;
				msgErro = "";

				const cpfValido = await verificarCpf();

				let data = new Date(formatDate(nascimento, "AMD"));

				if (!isDate(data)) {
					erros++;
					msgErro += "O campo DATA DE NASCIMENTO está incorreto.\n";
				}

				if (nome?.length < 3) {
					erros++;
					msgErro += "O campo NOME não pode ser menor do que 3 caracteres.\n";
				}

				if (sexo?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o SEXO.\n";
				}

				if (!cpfValido) {
					erros++;
					msgErro += "O campo CPF está inválido.\n";
				}

				if (rg === "") {
					erros++;
					msgErro += "É obrigatório preencher o RG.\n";
				}

				if (digito === "") {
					erros++;
					msgErro += "É obrigatório preencher o DÍGITO DA MATRÍCULA.\n";
				}

				if (
					telefoneComercial === "" &&
					telefoneResidencial === "" &&
					celular === ""
				) {
					erros++;
					msgErro +=
						"É obrigatório preencher pelo menos um telefone (RESIDENCIAL, COMERCIAL OU CELULAR).\n";
				}

				if (cep?.length < 8) {
					erros++;
					msgErro += "O CEP informado está incorreto.\n";
				}

				if (endereco === "") {
					erros++;
					msgErro += "É obrigatório preencher o ENDEREÇO.\n";
				}

				if (bairro === "") {
					erros++;
					msgErro += "É obrigatório preencher o BAIRRO.\n";
				}

				if (cidade === "") {
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
					setPrevStep(true);
					setActiveStep(1);
					setTextNext("PRÓXIMO");
				}

				break;
			case 1:
				erros = 0;
				msgErro = "";

				if (orgao?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o ÓRGÃO DE RECEBIMENTO.\n";
				}

				if (localTrabalho?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o LOCAL DE TRABALHO.\n";
				}

				if (funcao?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar a FUNÇÃO.\n";
				}

				if (banco?.Name === "") {
					erros++;
					msgErro += "É obrigatório selecionar o BANCO.\n";
				}

				if (agencia === "") {
					erros++;
					msgErro += "É obrigatório preencher a AGÊNCIA.\n";
				}

				if (conta === "") {
					erros++;
					msgErro += "É obrigatório preencher a CONTA.\n";
				}

				if (formaDesconto?.Name === "") {
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
					setPrevStep(true);
					setActiveStep(2);
					setTextNext("CADASTRAR");
				}

				break;
			case 2:
				erros = 0;
				msgErro = "";

				if (imagemCpf === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem do CPF.\n";
				}

				if (imagemRg === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem do RG.\n";
				}

				if (imagemContraCheque === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem do CONTRA CHEQUE.\n";
				}

				if (imagemComprovanteResidencia === "") {
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
					if (associado_atendimento.data_saida == 1) {
						showModal();
					} else {
						cadastrarAssociado();
					}
				}

				break;
			default:
				break;
		}

		setModalCarregando(false);
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
			<ModalLoading visible={modalCarregando} />
			<Modal animationType="fade" transparent={true} visible={modal} {...props}>
				<View style={[s.fl1, s.bgcm, s.jcc, s.aic]}>
					<View style={[s.pd10, s.m20, s.bgcw, s.bgcw, s.br9, s.smd, s.el5]}>
						{imagemAmpliada !== "" ? (
							<Image
								source={{ uri: imagemAmpliada }}
								style={{ width: 600, height: 800 }}
							/>
						) : (
							<Text>NENHUMA IMAGEM ENCONTRADA</Text>
						)}
					</View>
					<TouchableOpacity
						onPress={() => {
							setModal(false);
							setImagemAmpliada("");
						}}
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
			<Modal animationType="fade" transparent visible={modalJoia}>
				<View style={[s.fl1, s.aic, s.jcc, s.bgcm]}>
					<View style={[s.jcc, s.aic, s.pd20, s.m10, s.br6, s.bgcw]}>
						<Text>
							Atenção {usuario.nome}, este associado pagará joia, e esta será
							descontada em {associado_atendimento.parcelas_joia} parcelas.
							Deseja continuar?
						</Text>
						<TouchableOpacity
							onPress={() => {
								setUsuario({
									...usuario,
									associado_atendimento: {
										...associado_atendimento,
										paga_joia: 1,
									},
								});
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
			<SafeAreaView style={s.fl1}>
				<View style={[s.fl1, s.m20]}>
					<Text style={[s.tac, s.mt10, s.mb20, s.fs18]}>
						Preencha os campos abaixo para efetuar a inclusão do associado.
					</Text>
					<View style={s.fl1}>
						<ProgressSteps
							activeStep={activeStep}
							activeStepIconBorderColor="#031e3f"
							completedProgressBarColor="#031e3f"
							completedStepIconColor="#031e3f"
							activeLabelColor="#031e3f"
							labelFontSize={18}
							marginBottom={50}
							style={{ zIndex: 12 }}
						>
							<ProgressStep label="Geral" removeBtnRow>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl4, s.mr5]}>
										<TextInput
											label="Nome"
											mode={"outlined"}
											theme={tema}
											value={nome}
											maxLength={40}
											style={s.fs18}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												nascimentoRef?.current?._inputElement.focus()
											}
											onChangeText={(text) => setNome(text)}
										/>
									</View>
									<View style={s.fl2}>
										<TextInput
											label="Data de Nascimento"
											mode={"outlined"}
											theme={tema}
											value={nascimento}
											keyboardType={"numeric"}
											style={s.fs18}
											maxLength={10}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												cpfRef?.current?._inputElement.focus()
											}
											onChangeText={(text) => setNascimento(text)}
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
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl2, s.mr5]}>
										<Combo
											label={"Sexo"}
											pronome={"o"}
											lista={[
												{ Name: "MASCULINO", Value: "M" },
												{ Name: "FEMININO", Value: "F" },
											]}
											item={[sexo, setSexo]}
										/>
									</View>
									<View style={[s.fl2, s.mr5]}>
										<TextInput
											label="CPF"
											mode={"outlined"}
											theme={tema}
											value={cpf}
											maxLength={14}
											style={s.fs18}
											keyboardType={"number-pad"}
											returnKeyType={"next"}
											onSubmitEditing={() => rgRef?.current?.focus()}
											onChangeText={(text) => setCpf(text)}
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
									<View style={s.fl2}>
										<TextInput
											label="RG"
											mode={"outlined"}
											theme={tema}
											value={rg}
											maxLength={15}
											ref={rgRef}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												comercialRef?.current?._inputElement.focus()
											}
											keyboardType={"number-pad"}
											style={s.fs18}
											onChangeText={(text) => setRg(text)}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Telefone Comercial"
											mode={"outlined"}
											theme={tema}
											value={telefoneComercial}
											keyboardType={"number-pad"}
											style={s.fs18}
											maxLength={15}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												residencialRef?.current?._inputElement.focus()
											}
											onChangeText={(text) => setTelefoneComercial(text)}
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
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Telefone Residencial"
											mode={"outlined"}
											theme={tema}
											value={telefoneResidencial}
											maxLength={15}
											keyboardType={"number-pad"}
											style={s.fs18}
											returnKeyType={"next"}
											onSubmitEditing={() =>
												celularRef?.current?._inputElement.focus()
											}
											onChangeText={(text) => setTelefoneResidencial(text)}
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
									<View style={s.fl1}>
										<TextInput
											label="Celular"
											mode={"outlined"}
											theme={tema}
											value={celular}
											maxLength={16}
											keyboardType={"numeric"}
											style={s.fs18}
											returnKeyType={"next"}
											onSubmitEditing={() => emailRef?.current?.focus()}
											onChangeText={(text) => setCelular(text)}
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
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl4, s.mr5]}>
										<TextInput
											label="E-mail"
											mode={"outlined"}
											theme={tema}
											textContentType={"emailAddress"}
											maxLength={60}
											value={email}
											style={s.fs18}
											ref={emailRef}
											returnKeyType={"next"}
											onSubmitEditing={() => digitoRef.current.focus()}
											onChangeText={(text) => setEmail(text)}
										/>
									</View>
									<View style={s.fl2}>
										<TextInput
											label="Díg. da Matrícula"
											mode={"outlined"}
											theme={tema}
											value={digito}
											maxLength={1}
											style={s.fs18}
											ref={digitoRef}
											keyboardType="number-pad"
											onChangeText={(text) => setDigito(text)}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="CEP"
											mode={"outlined"}
											theme={tema}
											value={cep}
											maxLength={10}
											style={s.fs18}
											keyboardType={"numeric"}
											onChangeText={(text) => setCep(text)}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{ mask: "99999-999" }}
												/>
											)}
										/>
									</View>
									<View style={[s.fl2, s.mr5, s.pdt7]}>
										<TouchableOpacity
											onPress={() => buscarCep()}
											style={[s.fl1, s.row, s.aic, s.jcc, s.bgcp, s.br6]}
										>
											<IconButton icon="magnify" color={"#fff"} size={20} />
											<Text style={[s.fcw, s.fs18, s.mr10]}>BUSCAR CEP</Text>
										</TouchableOpacity>
									</View>
									<View style={[s.fl3, s.mr5]}>
										{carregando ? (
											<View style={[s.row, s.aic]}>
												<Loading size={45} />
												<Text style={[s.fs18, s.fcp]}>CARREGANDO...</Text>
											</View>
										) : null}
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={s.fl1}>
										<TextInput
											label="Endereço"
											mode={"outlined"}
											theme={tema}
											value={endereco}
											maxLength={50}
											style={s.fs18}
											returnKeyType={"next"}
											onSubmitEditing={() => numeroRef?.current?.focus()}
											onChangeText={(text) => setEndereco(text)}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Número"
											mode={"outlined"}
											theme={tema}
											ref={numeroRef}
											style={s.fs18}
											value={numero}
											returnKeyType={"next"}
											onSubmitEditing={() => complementoRef?.current?.focus()}
											onChangeText={(text) => setNumero(text)}
										/>
									</View>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Complemento"
											mode={"outlined"}
											ref={complementoRef}
											theme={tema}
											style={s.fs18}
											value={complemento}
											maxLength={40}
											returnKeyType={"next"}
											onSubmitEditing={() => bairroRef?.current?.focus()}
											onChangeText={(text) => setComplemento(text)}
										/>
									</View>
									<View style={s.fl1}>
										<TextInput
											label="Bairro"
											ref={bairroRef}
											value={bairro}
											maxLength={35}
											mode={"outlined"}
											theme={tema}
											style={s.fs18}
											onChangeText={(text) => setBairro(text)}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={s.fl1}>
										<Combo
											label={"Cidade"}
											pronome={"o"}
											lista={cidades}
											item={[cidade, setCidade]}
										/>
									</View>
								</View>
							</ProgressStep>
							<ProgressStep label="Outros" removeBtnRow>
								<View style={[s.row, s.mb10]}>
									<View style={s.fl1}>
										<Combo
											label={"Órgão"}
											pronome={"o"}
											lista={orgaos}
											item={[orgao, setOrgao]}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={s.fl1}>
										<Combo
											label={"Local de Trabalho"}
											pronome={"o"}
											lista={lotacoes}
											item={[localTrabalho, setLocalTrabalho]}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl2, s.mr5]}>
										<Combo
											label={"Função"}
											pronome={"a"}
											lista={funcoes}
											item={[funcao, setFuncao]}
										/>
									</View>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Mês / Ano Últ. Desc."
											mode={"outlined"}
											theme={tema}
											style={s.fs18}
											value={mesano}
											maxLength={7}
											returnKeyType={"next"}
											onSubmitEditing={() => identificadorRef?.current?.focus()}
											onChangeText={(text) => setMesano(text)}
											render={(props) => (
												<TextInputMask
													{...props}
													type={"custom"}
													options={{ mask: "99/9999" }}
												/>
											)}
										/>
									</View>
									<View style={s.fl1}>
										<TextInput
											label="Identificador"
											ref={identificadorRef}
											mode={"outlined"}
											theme={tema}
											style={s.fs18}
											value={identificador}
											maxLength={15}
											returnKeyType={"next"}
											onSubmitEditing={() => agenciaRef?.current?.focus()}
											onChangeText={(text) => setIdentificador(text)}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl2, s.mr5]}>
										<Combo
											label={"Banco"}
											pronome={"o"}
											lista={bancos}
											item={[banco, setBanco]}
										/>
									</View>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Agência"
											mode={"outlined"}
											ref={agenciaRef}
											theme={tema}
											style={s.fs18}
											value={agencia}
											maxLength={7}
											returnKeyType={"next"}
											keyboardType={"number-pad"}
											onSubmitEditing={() => contaRef?.current?.focus()}
											onChangeText={(text) => setAgencia(text)}
										/>
									</View>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Conta"
											ref={contaRef}
											mode={"outlined"}
											theme={tema}
											style={s.fs18}
											value={conta}
											maxLength={8}
											returnKeyType={"next"}
											keyboardType={"number-pad"}
											onSubmitEditing={() => digitoContaRef?.current?.focus()}
											onChangeText={(text) => setConta(text)}
										/>
									</View>
									<View style={s.fl1}>
										<TextInput
											label="Dígito"
											ref={digitoContaRef}
											mode={"outlined"}
											theme={tema}
											style={s.fs18}
											value={digitoConta}
											maxLength={1}
											returnKeyType={"next"}
											keyboardType={"number-pad"}
											onSubmitEditing={() => mensalidadeRef?.current?.focus()}
											onChangeText={(text) => setDigitoConta(text)}
										/>
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl3, s.mr5]}>
										<Combo
											label={"Forma de Desconto"}
											pronome={"a"}
											lista={formas}
											item={[formaDesconto, setFormaDesconto]}
										/>
									</View>
									<View style={[s.fl1, s.mr5, s.aic]}>
										<Text>ESTORNADO</Text>
										<Switch
											value={estornado}
											onValueChange={onToggleEstornado}
										/>
									</View>
									<View style={[s.fl1, s.aic]}>
										<Text>INDICA ASSOC. ESP.</Text>
										<Switch value={indica} onValueChange={onToggleIndica} />
									</View>
								</View>
								<View style={[s.row, s.mb10]}>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Observação"
											ref={obsRef}
											mode={"outlined"}
											theme={tema}
											style={s.fs18}
											value={observacao}
											multiline
											numberOfLines={10}
											returnKeyType={"done"}
											onChangeText={(text) => setObservacao(text)}
										/>
									</View>
								</View>
							</ProgressStep>
							<ProgressStep label="Arquivos" removeBtnRow>
								<Text style={[s.tac, s.mb20]}>
									Clique nos botões abaixo para tirar foto dos documentos e
									clique nas imagens para ampliá-las.
								</Text>
								<ScrollView>
									<View style={s.row}>
										<View style={[s.fl1, s.aic, s.mv20]}>
											{imagemCpf.length > 0 ? (
												<TouchableOpacity
													onPress={() => {
														setImagemAmpliada(imagemCpf);
														setModal(true);
													}}
												>
													<Image
														source={{ uri: imagemCpf }}
														style={[s.w200, s.h200, s.mv25]}
													/>
												</TouchableOpacity>
											) : (
												<Image
													source={images.imagem_padrao}
													style={[s.w250, s.h250]}
												/>
											)}

											<TouchableOpacity
												style={[
													s.bgcp,
													s.pd20,
													s.br6,
													s.w70p,
													s.aic,
													s.row,
													s.jcc,
												]}
												onPress={() => tirarFoto("CPF")}
											>
												<IconButton icon="camera" color={"#fff"} size={20} />
												<Text style={[s.fcw, s.fs20]}>CPF</Text>
											</TouchableOpacity>
										</View>
										<View style={[s.fl1, s.aic, s.mv20]}>
											{imagemRg.length > 0 ? (
												<TouchableOpacity
													onPress={() => {
														setImagemAmpliada(imagemRg);
														setModal(true);
													}}
												>
													<Image
														source={{ uri: imagemRg }}
														style={[s.w200, s.h200, s.mv25]}
													/>
												</TouchableOpacity>
											) : (
												<Image
													source={images.imagem_padrao}
													style={[s.w250, s.h250]}
												/>
											)}
											<TouchableOpacity
												style={[
													s.bgcp,
													s.pd20,
													s.br6,
													s.w70p,
													s.aic,
													s.jcc,
													s.row,
												]}
												onPress={() => tirarFoto("RG")}
											>
												<IconButton icon="camera" color={"#fff"} size={20} />
												<Text style={[s.fcw, s.fs20]}>RG</Text>
											</TouchableOpacity>
										</View>
									</View>
									<View style={s.row}>
										<View style={[s.fl1, s.aic, s.mv20]}>
											{imagemContraCheque.length > 0 ? (
												<TouchableOpacity
													onPress={() => {
														setImagemAmpliada(imagemContraCheque);
														setModal(true);
													}}
												>
													<Image
														source={{ uri: imagemContraCheque }}
														style={[s.w200, s.h200, s.mv25]}
													/>
												</TouchableOpacity>
											) : (
												<Image
													source={images.imagem_padrao}
													style={[s.w250, s.h250]}
												/>
											)}
											<TouchableOpacity
												style={[
													s.bgcp,
													s.pd20,
													s.br6,
													s.w70p,
													s.aic,
													s.jcc,
													s.row,
												]}
												onPress={() => tirarFoto("CC")}
											>
												<IconButton icon="camera" color={"#fff"} size={20} />
												<Text style={[s.fcw, s.fs20]}>CONTRA CHEQUE</Text>
											</TouchableOpacity>
										</View>
										<View style={[s.fl1, s.aic, s.mv20]}>
											{imagemComprovanteResidencia.length > 0 ? (
												<TouchableOpacity
													onPress={() => {
														setImagemAmpliada(imagemComprovanteResidencia);
														setModal(true);
													}}
												>
													<Image
														source={{ uri: imagemComprovanteResidencia }}
														style={[s.w200, s.h200, s.mv25]}
													/>
												</TouchableOpacity>
											) : (
												<Image
													source={images.imagem_padrao}
													style={[s.w250, s.h250]}
												/>
											)}
											<TouchableOpacity
												style={[
													s.bgcp,
													s.pd20,
													s.br6,
													s.w70p,
													s.aic,
													s.jcc,
													s.row,
												]}
												onPress={() => tirarFoto("CR")}
											>
												<IconButton icon="camera" color={"#fff"} size={20} />
												<Text style={[s.fcw, s.fs20]}>COMP. DE RESID.</Text>
											</TouchableOpacity>
										</View>
									</View>
									<View style={s.h100}></View>
								</ScrollView>
							</ProgressStep>
						</ProgressSteps>
						{prevStep && (
							<TouchableOpacity
								onPress={goToPrevStep}
								style={[
									s.bgcp,
									s.pd20,
									s.br6,
									s.psa,
									s.l50,
									s.b40,
									s.row,
									s.jcc,
									s.aic,
								]}
							>
								<Image
									source={images.seta}
									style={[s.w20, s.h20, s.tcw, s.mr10, s.tr180]}
									tintColor={tema.colors.background}
								/>
								<Text style={[s.fcw, s.fs20]}>ANTERIOR</Text>
							</TouchableOpacity>
						)}
						<TouchableOpacity
							disabled={!nextStep}
							onPress={goToNextStep}
							style={[
								s.pd20,
								s.br6,
								s.psa,
								s.r50,
								s.b40,
								s.row,
								s.jcc,
								s.aic,
								{
									backgroundColor: nextStep
										? activeStep === 2
											? "#188038"
											: "#031e3f"
										: "#aaa",
								},
							]}
						>
							<Text style={[s.fs20, { color: nextStep ? "#fff" : "#000" }]}>
								{textNext}
							</Text>
							{nextStep ? (
								activeStep === 2 ? (
									<Image
										source={images.sucesso}
										style={[s.w20, s.h20, s.tcw, s.ml10]}
										tintColor={tema.colors.background}
									/>
								) : (
									<Image
										source={images.seta}
										style={[s.w20, s.h20, s.tcw, s.ml10]}
										tintColor={tema.colors.background}
									/>
								)
							) : null}
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default CadastrarAssociado;
