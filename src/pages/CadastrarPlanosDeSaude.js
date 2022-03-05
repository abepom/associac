import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	ScrollView,
	Modal,
	Keyboard,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { TextInputMask } from "react-native-masked-text";
import PickerModal from "react-native-picker-modal-view";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import images from "../utils/images";
import api from "../../services/api";
import isDate from "../functions/isDate";
import formatDate from "../functions/formatDate";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";
import Header from "../components/Header";
import s,{ tema } from "../../assets/style/Style";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import Signature from "react-native-signature-canvas";
import calculateAge from "../functions/calculateAge";
import WebView from "react-native-webview";
import * as Print from "expo-print";
import * as ScreenOrientation from "expo-screen-orientation";
import Combo from '../components/Combo';

const BENEFICIARIO_INITIAL = {
	Name: "",
	Value: "",
	data_nascimento: "",
	idade: 0,
	estado_civil: { Name: "", Value: "" },
	sexo: "",
	tipo: "",
	local_cobranca: { Name: "", Value: "" },
	cpf: "",
	valor_mensalidade: 0,
	possui_plano: false,
	nome_plano: "",
};

const PLANO_INITIAL = { Name: "", Value: "", valor_faixas: [], nome_plano: "" };

function CadastrarPlanosDeSaude(props) {
	let d = new Date();
	const { navigation } = props;
	const [usuario, setUsuario] = useUsuario();
	const { token, associado_atendimento } = usuario;
	const [dependentes, setDependentes] = useState([]);
	const [beneficiario, setBeneficiario] = useState(BENEFICIARIO_INITIAL);
	const [planos, setPlanos] = useState([]);
	const [plano, setPlano] = useState(PLANO_INITIAL);
	const [activeStep, setActiveStep] = useState(0);
	const [nextStep, setNextStep] = useState(true);
	const [prevStep, setPrevStep] = useState(false);
	const [textNext, setTextNext] = useState("PRÓXIMO");
	const [imagemCpf, setImagemCpf] = useState("");
	const [imagemRg, setImagemRg] = useState("");
	const [imagemCartaoSUS, setImagemCartaoSUS] = useState("");
	const [imagemComprovanteResidencia, setImagemComprovanteResidencia] =
		useState("");
	const [imagemDeclaracaoSaude, setImagemDeclaracaoSaude] = useState("");
	const [alerta, setAlerta] = useState({});
	const [modal, setModal] = useState(false);
	const [modalAssinatura, setModalAssinatura] = useState(false);
	const [imagemAmpliada, setImagemAmpliada] = useState("");
	const [dataVigencia, setDataVigencia] = useState(
		("0" + d.getDate()).slice(-2) +
			"/" +
			("0" + (d.getMonth() + 1)).slice(-2) +
			"/" +
			d.getFullYear()
	);
	const [dataMovimentacao] = useState(
		("0" + d.getDate()).slice(-2) +
			"/" +
			("0" + (d.getMonth() + 1)).slice(-2) +
			"/" +
			d.getFullYear()
	);
	const [termos, setTermos] = useState([]);
	const [pdf, setPdf] = useState("");
	const [logo, setLogo] = useState("");
	const [logos, setLogos] = useState([]);
	const [nomePlano, setNomePlano] = useState("");
	const [assinaturaAssociado, setAssinaturaAssociado] = useState("");
	const [assinaturaBeneficiario, setAssinaturaBeneficiario] = useState("");
	const [mostrarBotoes, setMostrarBotoes] = useState(true);
	const [nome, setNome] = useState(associado_atendimento?.nome ?? "");
	const [nascimento, setNascimento] = useState(
		associado_atendimento?.nascimento ?? ""
	);
	const [endereco, setEndereco] = useState(associado_atendimento?.endereco ?? "");
	const [numero, setNumero] = useState(associado_atendimento?.numero ?? "");
	const [complemento, setComplemento] = useState(associado_atendimento?.complemento ?? "");
	const [cidade, setCidade] = useState(associado_atendimento?.cidade ?? {Name: "", Value: ""});
	const [cep, setCep] = useState(associado_atendimento?.cep ?? "");
	const [telefoneComercial, setTelefoneComercial] = useState(associado_atendimento?.telefone_comercial ?? "");
	const [telefoneResidencial, setTelefoneResidencial] = useState(associado_atendimento?.telefone_residencial ?? "");
	const [celular, setCelular] = useState(associado_atendimento?.celular ?? "");
	const [email, setEmail] = useState(associado_atendimento?.email ?? "");

	const refAssociado = useRef();
	const refBeneficiario = useRef();

	const listarPlanos = async () => {
		try {
			const { data } = await api({
				url: "/listarPlanosDeSaude",
				method: "GET",
				headers: { "x-access-token": token },
			});

			let plans = [];

			data.planos.map((plano) => {
				plans.push({
					Name: plano.plano + " | " + plano.nome_plano,
					Value: plano.plano,
					valor_mensalidade: plano.valor_mensalidade,
					nome_plano: plano.nome_plano_documento,
				});
			});

			setPlanos(plans);

			const retorno = await api({
				url: "/planosDisponiveis",
				method: "GET",
				headers: { "x-access-token": token },
			});

			setLogos(retorno.data);
		} catch (error) {
			setPlanos([]);
		}
	};

	const listarTermos = async () => {
		try {
			const { data } = await api({
				url: "/listarTermosPlanos",
				method: "GET",
				headers: { "x-access-token": token },
			});

			setTermos(data.termos);
		} catch (error) {
			setTermos([]);
		}
	};

	const listarBeneficiarios = async () => {
		let dataFormat = "";
		let age = 0;

		setBeneficiario(BENEFICIARIO_INITIAL);
		setDependentes([]);
		setPlano(PLANO_INITIAL);

		let deps = [];

		
		if(!associado_atendimento?.possui_plano){
			dataFormat = formatDate(associado_atendimento.nascimento, "AMD");
	
			if (isDate(new Date(dataFormat))) {
				age = calculateAge(dataFormat);
			} else {
				age = 0;
			}
			
			deps.push({
				Name: associado_atendimento.nome,
				Value: associado_atendimento.cd_dependente,
				data_nascimento: associado_atendimento.nascimento,
				idade: age,
				estado_civil: { Name: "", Value: "" },
				sexo: associado_atendimento.sexo.Name,
				tipo: "TITULAR",
				codigo_tipo: "00",
				local_cobranca: { Name: "", Value: "" },
				cpf: associado_atendimento.cpf,
				valor_mensalidade: 0,
				possui_plano: associado_atendimento.possui_plano == 1 ? true : false,
				nome_plano: associado_atendimento.nome_plano,
			});
		}

		associado_atendimento?.dependentes?.map((dependente) => {
			if(!dependente.possui_plano){
				dataFormat = formatDate(dependente.data_nascimento, "AMD");
	
				if (isDate(new Date(dataFormat))) {
					age = calculateAge(dataFormat);
				} else {
					age = 0;
				}
	
				deps.push({
					Name: dependente.nome,
					Value: dependente.cont,
					data_nascimento: dependente.data_nascimento,
					idade: age,
					estado_civil: { Name: "", Value: "" },
					sexo: dependente.sexo === "M" ? "MASCULINO" : "FEMININO",
					tipo: dependente.tipo.toUpperCase(),
					codigo_tipo: dependente.cod_dep,
					local_cobranca: { Name: "", Value: "" },
					cpf: dependente.cpf,
					valor_mensalidade: 0,
					possui_plano: dependente.possui_plano == 1 ? true : false,
					nome_plano: dependente.nome_plano,
				});
			}
		});

		let todos_com_plano = true;

		console.log(deps)

		deps.map((integrante) => {
			if (!integrante.possui_plano) {
				todos_com_plano = false;
			}
		});

		if (todos_com_plano) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					`O titular e todos os seus dependentes já possuem plano de saúde.{'\n'}Portanto, só é possível realizar a migração.`,
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
				width: "70%",
				confirmFunction: () => {
					navigation.navigate("Inicio");
				},
			});

			setNextStep(false);
		} else {
			setDependentes(deps);
		}
	};

	const selecionarPlano = (key, ben = beneficiario) => {
		let id = ben.idade;
		let index = 1;

		setPlano(key);

		switch (true) {
			case id >= 0 && id <= 18:
				//00 - 18
				index = 1;
				break;
			case id >= 19 && id <= 23:
				//19 - 23
				index = 2;
				break;
			case id >= 24 && id <= 28:
				//24 - 28
				index = 3;
				break;
			case id >= 29 && id <= 33:
				//29 - 33
				index = 4;
				break;
			case id >= 34 && id <= 38:
				//34 - 38
				index = 5;
				break;
			case id >= 39 && id <= 43:
				//39 - 43
				index = 6;
				break;
			case id >= 44 && id <= 48:
				//44 - 48
				index = 7;
				break;
			case id >= 49 && id <= 53:
				//49 - 53
				index = 8;
				break;
			case id >= 54 && id <= 58:
				//54 - 58
				index = 9;
				break;
			case id >= 59:
				//59+
				index = 10;
				break;
			default:
				index = 0;
				break;
		}

		switch (key.Value) {
			case "UEAP00":
			case "UEAP50":
			case "UEAP20":
			case "UEEN00":
			case "UEEN50":
			case "UEEN20":
			case "UNAP00":
			case "UNAP50":
			case "UNAP20":
			case "UNEN00":
			case "UNEN50":
			case "UNEN20":
			case "UREN50":
			case "UREN30":
			case "9417EN":
			case "9417AP":
				// UNIMED
				setPdf(termos[0].descricao);
				setLogo(logos[0].image);
				setNomePlano(logos[0].name);
				break;
			case "CLINEN":
			case "CLINAP":
				// CLINIPAM
				setPdf(termos[1].descricao);
				setLogo(logos[1].image);
				setNomePlano(logos[1].name);
				break;
			case "SJEN20":
			case "SJEN50":
				// SÃO JOSÉ
				setPdf(termos[2].descricao);
				setLogo(logos[4].image);
				setNomePlano(logos[4].name);
				break;
			case "PLAS20":
			case "PLAS40":
			case "PLAP20":
			case "PLAP40":
				// PLADISA
				setPdf(termos[3].descricao);
				setLogo(logos[3].image);
				setNomePlano(logos[3].name);
				break;
			case "LIFEEN":
			case "LIFEAP":
				// LIFEDAY
				setPdf(termos[4].descricao);
				setLogo(logos[2].image);
				setNomePlano(logos[2].name);
				break;
			case "HMEN30":
			case "HMAP30":
				// HAPPYMED
				setPdf(termos[5].descricao);
				setLogo(logos[5].image);
				setNomePlano(logos[5].name);
				break;
			default:
				setPdf(termos[0].descricao);
				setLogo(logos[0].image);
				setNomePlano(logos[0].name);
				break;
		}

		let { valor } = key.valor_mensalidade.find((item) => item.faixa == index);

		setBeneficiario({
			...ben,
			valor_mensalidade: valor,
		});

		if (beneficiario?.Name !== "") {
			setNextStep(true);
		} else {
			setNextStep(false);
		}
	};

	const selecionarBeneficiario = (key) => {
		setBeneficiario(key);

		if (plano?.Name !== "") {
			selecionarPlano(plano, key);
			setNextStep(true);
		} else {
			setNextStep(false);
		}
	};

	const confirmarCancelamento = () => {
		incluirNoPlano(true);
	};

	const incluirNoPlano = async (cancelar = false) => {
		setAlerta({
			visible: true,
			title: "CADASTRANDO DADOS DO PLANO",
			message: <Loading size={125} />,
			showConfirm: false,
			showCancel: false,
			showIcon: false,
		});

		let html =
			`<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>REQUERIMENTO DE INCLUSÃO NO PLANO</title>
		</head>
		<body>
			<div style="display: flex; flex: 1; flex-direction: column; margin:20px;font-family: sans-serif;">
				<div style="display: flex; flex: 1">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
					<div style="display: flex; flex: 1;justify-content: flex-start; aalign-items: center;">
						<img src="https://www.abepom.org.br/images/logomarca.png" />
					</div>
					<div style="display: flex; flex: 2; justify-content: center; align-items: center;">
						<h4 style="display: flex; flex: 1; justify-content: center; align-items: center;text-align:center">REQUERIMENTO DE INCLUSÃO<br />NO PLANO DE SAÚDE</h4>
					</div>
					<div style="display: flex; flex: 1;justify-content: flex-end; align-items: center;">
						<img src="${logo}" />
					</div>
					</div>
				</div>
				<div style="display: flex; flex: 1;">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
					<h5>QUALIFICAÇÃO DO ASSOCIADO</h5>
					</div>
				</div>
				<div style="display: flex; flex: 1; flex-direction: column">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center">
						<div style="display: flex; flex: 5;">
							Nome: ${associado_atendimento.nome}
						</div>
						<div style="display: flex; flex: 2">
							Matrícula: ${associado_atendimento.matricula}
						</div>
					</div>
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center">
						<div style="display: flex; flex: 5;">
							E-mail: ${email}
						</div>
					</div>
				</div>
				<div style="display: flex; flex: 1;">
					<div style="display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
						<h4 style="text-align: center">ESCOLHA DO PLANO - ${nomePlano}<br />${
				plano.nome_plano
			}</h4>
					</div>
				</div>
				<div style="display: flex; flex: 1;">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
					<h5>DATA DE INÍCIO DE VIGÊNCIA: ${dataVigencia} (SUJEITA A ANÁLISE DA OPERADORA)</h5>
					</div>
				</div>
				<div style="display: flex; flex: 1;">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
					<h4>BENEFICIÁRIOS A SEREM INCLUÍDOS</h4>
					</div>
				</div>
				<div style="display: flex; flex: 1;">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
					<table style="width: 100%;font-size: 12px !important;" border="1" cellspacing="0" cellpadding="10">
						<tr>
						<td style="width: 60%">NOME</td>
						<td style="text-align: center">CPF</td>
						<td style="text-align: center">GRAU DE DEPENDÊNCIA</td>
						</tr>
						<tr>
						<td>${beneficiario.Name}</td>
						<td style="text-align: center">${beneficiario.cpf}</td>
						<td style="text-align: center">${beneficiario.tipo}</td>
						</tr>
					</table>
					</div>
				</div>
				<div style="display: flex; flex: 1; margin-top: 30px;">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
						${
							beneficiario?.codigo_tipo == "00"
								? `
						<div style="display: flex; flex: 1; justify-content: center">
							<center>
								<img src="${assinaturaAssociado}" style="width: 350px" />
								<br />
								<hr style="width: 80%" />
								<br />
								${nome}<br />
								Assinatura do Associado
							</center>
						</div>`
								: `<div style="display: flex; flex: 1; justify-content: center">
									<center>
										<img src="${assinaturaAssociado}" style="width: 350px" />
										<br />
										<hr style="width: 80%" />
										<br />
										${nome}<br />
										Assinatura do Associado
									</center>
								</div>
								<div style="display: flex; flex: 1; justify-content: center">
								<center>
									<img src="${assinaturaBeneficiario}" style="width: 350px" />
									<br />
									<hr style="width: 80%" />
									<br />
									${beneficiario.Name} <br />
									Assinatura do Titular do Plano de Saúde
								</center>
							</div>
							`
						}
					</div>
				</div>
				<div style="display: flex; flex: 1; margin-top: 20px;">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
						<h4>TERMOS</h4>
					</div>
				</div>
			</div><div style="font-size: 12px !important;">` +
			pdf +
			`</div>	
				<p align="justify" style="font-size: 12px">Local: Florianpolis<br />Data: 25/11/1990</p>
				<div style="display: flex; flex: 1; margin-top: 30px;">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
						${
							beneficiario?.codigo_tipo == "00"
								? `
						<div style="display: flex; flex: 1; justify-content: center">
							<center>
								<img src="${assinaturaAssociado}" style="width: 350px" />
								<br />
								<hr style="width: 80%" />
								<br />
								${nome}<br />
								Assinatura do Associado
							</center>
						</div>`
								: `<div style="display: flex; flex: 1; justify-content: center">
								<center>
									<img src="${assinaturaAssociado}" style="width: 350px" />
									<br />
									<hr style="width: 80%" />
									<br />
									${nome}<br />
									Assinatura do Associado
								</center>
							</div>
							<div style="display: flex; flex: 1; justify-content: center">
								<center>
									<img src="${assinaturaBeneficiario}" style="width: 350px" />
									<br />
									<hr style="width: 80%" />
									<br />
									${beneficiario.Name} <br />
									Assinatura do Titular do Plano de Saúde
								</center>
							</div>`
						}
					</div>
				</div>
			</body>
		</html>`;

		try {
			const { uri } = await Print.printToFileAsync({ html });
			const formulario = new FormData();
			formulario.append("matricula", `${associado_atendimento.matricula}`);
			formulario.append("dependente", `${beneficiario?.Value}`);
			formulario.append("plano", `${plano?.Value}`);
			formulario.append("file", {
				uri,
				type: `application/pdf`,
				name: `REQUERIMENTO_INCLUSAO_PLANO_${associado_atendimento.matricula}.pdf`,
			});

			const { data } = await api.post(
				"/associados/cadastrarRequerimentoInclusaoPlano",
				formulario,
				{
					headers: {
						"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
						"x-access-token": token,
					},
				}
			);

			if (data.status) {
				let erros = 0;
				let msg = "Para prosseguir é necessário: \n\n";

				if (plano?.Name === "" || beneficiario?.Name === "") {
					erros++;
					msg = "Selecionar o beneficiário e o plano.\n";
				}

				if (beneficiario?.local_cobranca?.Name == "") {
					erros++;
					msg += "Selecionar o local de cobrança.\n";
				}

				if (beneficiario?.estado_civil?.Name == "") {
					erros++;
					msg += "Selecionar o estado civil do beneficiário.\n";
				}

				if (erros > 0) {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: msg,
						type: "danger",
						showCancel: false,
						showConfirm: true,
						confirmText: "FECHAR",
					});
				} else {
					try {
						const retorno = await api({
							url: "/associados/cadastrarPlanoDeSaude",
							method: "POST",
							data: {
								beneficiario: {
									...beneficiario,
									data_nascimento: formatDate(
										beneficiario.data_nascimento,
										"AMD"
									),
								},
								plano,
								associado: associado_atendimento,
								cancelar,
								dataVigencia,
							},
							headers: { "x-access-token": token },
						});

						setAlerta({
							visible: true,
							title: retorno.data.title,
							message: retorno.data.message,
							type: retorno.data.status ? "success" : "danger",
							showCancel: false,
							showConfirm: true,
							confirmText: "FECHAR",
						});

						if (retorno.data.status) {
							setActiveStep(0);
							setPrevStep(false);
							setTextNext("PRÓXIMO");
							setImagemCpf("1");
							setImagemRg("1");
							setImagemCartaoSUS("1");
							setImagemComprovanteResidencia("1");
							setImagemDeclaracaoSaude("1");
							setBeneficiario(BENEFICIARIO_INITIAL);
							setPlano(PLANO_INITIAL);
							setDependentes([]);
						}
					} catch (error) {
						setAlerta({
							visible: true,
							title: "ATENÇÃO!",
							message: "Ocorreu um erro ao tentar cadastrar o plano de saúde.",
							type: "danger",
							showCancel: false,
							showConfirm: true,
							confirmText: "FECHAR",
						});
					}
				}
			} else {
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: "danger",
					cancelText: "FECHAR",
					showConfirm: false,
					showCancel: true,
				});
			}
		} catch (error) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Ocorreu um erro ao tentar recolher a assinatura do associado.",
				type: "danger",
				cancelText: "FECHAR",
				showConfirm: false,
				showCancel: true,
			});
		}
	};

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

		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

		if (!result.cancelled) {
			try {
				const { uri } = result;

				let extensao = uri.split(".")[uri.split(".").length - 1];

				const formulario = new FormData();
				formulario.append("matricula", `${associado_atendimento.matricula}`);
				formulario.append("dependente", `${beneficiario?.Value}`);
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
						case "SUS":
							setImagemCartaoSUS(data.link);
							break;
						case "CR":
							setImagemComprovanteResidencia(data.link);
							break;
						case "DS":
							setImagemDeclaracaoSaude(data.link);
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

		switch (activeStep) {
			case 0:
				erros = 0;
				msgErro = "";

				if (plano?.Name === "" || beneficiario?.Name === "") {
					erros++;
					msgErro = "Selecionar o beneficiário e o plano.\n";
				}

				if (beneficiario?.local_cobranca?.Name == "") {
					erros++;
					msgErro += "Selecionar o local de cobrança.\n";
				}

				if (beneficiario?.estado_civil?.Name == "") {
					erros++;
					msgErro += "Selecionar o estado civil do beneficiário.\n";
				}

				if (dataVigencia == "") {
					erros++;
					msgErro += "Informe a data de vigência do plano.\n";
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
					setActiveStep(1);
					setTextNext("PRÓXIMO");
				}

				break;
			case 1:
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

				if (imagemCartaoSUS === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem do CARTÃO SUS.\n";
				}

				if (imagemComprovanteResidencia === "") {
					erros++;
					msgErro +=
						"É obrigatório enviar a imagem do COMPROVANTE DE RESIDÊNCIA.\n";
				}

				if (imagemDeclaracaoSaude === "") {
					erros++;
					msgErro += "É obrigatório enviar a imagem da DECLARAÇÃO DE SAÚDE.\n";
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
					setNextStep(false);
					setTextNext("CONCLUIR CADASTRO");
				}

				break;
			case 2:
				if (beneficiario?.possui_plano) {
					setAlerta({
						visible: true,
						title: "ATENÇÃO",
						message:
							"O beneficiário escolhido já possui um plano ativo. Deseja cancelá-lo?",
						type: "warning",
						showConfirm: true,
						showCancel: true,
						cancelText: "FECHAR",
						confirmText: "SIM, CANCELAR",
						confirmFunction: () => confirmarCancelamento(),
					});
				} else {
					incluirNoPlano(false);
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

	const handleOK = async () => {
		setModalAssinatura(false);
		setNextStep(true);
	};

	const handleOKAssoc = async (signature) => {
		await setAssinaturaAssociado(signature);

		return true;
	};

	const handleOKBenef = async (signature) => {
		await setAssinaturaBeneficiario(signature);

		return signature;
	};

	const handleClear = () => {
		refAssociado.current.clearSignature();
		if (beneficiario?.codigo_tipo !== "00") {
			refBeneficiario.current.clearSignature();
		}
	};

	const handleConfirm = async () => {
		if (beneficiario?.codigo_tipo !== "00") {
			if (assinaturaAssociado !== "" && assinaturaBeneficiario !== "") {
				handleOK();
			}
		} else {
			if (assinaturaAssociado !== "") {
				handleOK();
			}
		}
	};

	const handleEndAssociado = () => {
		refAssociado.current.readSignature();
	};

	const handleEndBeneficiario = () => {
		refBeneficiario.current.readSignature();
	};

	const _keyboardDidShow = () => {
		setMostrarBotoes(false);
	};

	const _keyboardDidHide = () => {
		setMostrarBotoes(true);
	};

	useEffect(() => {
		Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
		Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

		listarPlanos();
		listarTermos();
		listarBeneficiarios();

		return () => {
			Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
			Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
		};
	}, []);

	return (
		<>
			<Header titulo={"Cadastrar Planos de Saúde"} {...props} />
			<Modal animationType="fade" transparent={true} visible={modal} {...props}>
				<View style={[s.fl1, s.bgcm, s.jcc, s.aic]}>
					<View
						style={{
							paddingVertical: 10,
							paddingHorizontal: 5,
							margin: 20,
							backgroundColor: "#fff",
							borderRadius: 9,
							shadowColor: "#000",
							shadowOffset: {
								width: 0,
								height: 2,
							},
							shadowOpacity: 0.25,
							shadowRadius: 3.84,
							elevation: 5,
						}}
					>
						{imagemAmpliada !== "" ? (
							<Image
								source={{ uri: imagemAmpliada }}
								style={{ width: 550, height: 550 }}
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
						style={{
							width: 50,
							height: 50,
							borderRadius: 50,
							backgroundColor: tema.colors.primary,
							bottom: 15,
							padding: 10,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Image
							source={images.fechar}
							style={{ width: 20, height: 20, tintColor: "#fff" }}
							tintColor={"#fff"}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<Modal visible={modalAssinatura}>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignContent: "center",
						alignItems: "center",
						paddingTop: 35,
					}}
				>
					<Text style={{ fontSize: 20, marginBottom: 10 }}>
						Recolha a assinatura do associado na área destacada abaixo:{" "}
					</Text>
					<Text>Assinatura de</Text>
					<Text style={{ fontWeight: "bold" }}>
						{nome?.toUpperCase()}
					</Text>
					<Signature
						ref={refAssociado}
						style={{ height: 150 }}
						onOK={handleOKAssoc}
						onEmpty={() =>
							setAlerta({
								visible: true,
								title: "ATENÇÃO!",
								message:
									"Para confirmar é necessário preencher a assinatura do associado.",
								showCancel: false,
								showConfirm: true,
								confirmText: "FECHAR",
							})
						}
						onEnd={handleEndAssociado}
						descriptionText=""
						webStyle={`
						.m-signature-pad {width: 80%; height: 250px; margin-left: auto; margin-right: auto; margin-top: 10px; margin-bottom: 0px; }
						.m-signature-pad::before{
							position: absolute;
							top: 210px;
							content: " ";
							width: 70%;
							background: #aaa;
							height:2px;
							left: 15%;
							right: 15%;
						}
						.m-signature-pad--body {border: none;}
						.m-signature-pad--footer{ display: none;}
						`}
					/>
					{beneficiario?.codigo_tipo !== "00" && (
						<>
							<Text style={{ fontSize: 20, marginBottom: 10 }}>
								Recolha a assinatura do beneficiário na área destacada abaixo:{" "}
							</Text>
							<Text>Assinatura de</Text>
							<Text style={{ fontWeight: "bold" }}>
								{beneficiario?.Name?.toUpperCase()}
							</Text>
							<Signature
								ref={refBeneficiario}
								style={{ height: 100 }}
								onOK={handleOKBenef}
								onEmpty={() =>
									setAlerta({
										visible: true,
										title: "ATENÇÃO!",
										message:
											"Para confirmar é necessário preencher a assinatura do beneficiário.",
										showCancel: false,
										showConfirm: true,
										confirmText: "FECHAR",
									})
								}
								onEnd={handleEndBeneficiario}
								descriptionText=""
								webStyle={`
								.m-signature-pad {width: 80%; height: 250px; margin-left: auto; margin-right: auto; margin-top: 10px; }
								.m-signature-pad::before{
									position: absolute;
									top: 210px;
									content: " ";
									width: 70%;
									background: #aaa;
									height:2px;
									left: 15%;
									right: 15%;
								}
								.m-signature-pad--body {border: none;}
								.m-signature-pad--footer{ display: none;}
								`}
							/>
						</>
					)}
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							width: "90%",
							alignItems: "center",
							bottom: 20,
						}}
					>
						<Button
							onPress={handleClear}
							color={"#fff"}
							style={{ backgroundColor: tema.colors.vermelho }}
						>
							LIMPAR ASSINATURAS
						</Button>
						<Button
							onPress={handleConfirm}
							color={"#fff"}
							style={{
								backgroundColor: tema.colors.verde,
							}}
						>
							CONFIRMAR ASSINATURAS
						</Button>
						<Button
							onPress={() => {
								setModalAssinatura(false);
							}}
							color={"#fff"}
							style={{ backgroundColor: tema.colors.primary }}
						>
							FECHAR
						</Button>
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
						Preencha os campos abaixo para efetuar a inclusão do plano de saúde.
					</Text>
					<View style={{ flex: 1 }}>
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
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 4, marginRight: 5 }}>
										<TextInput
											label="Nome"
											mode={"outlined"}
											theme={tema}
											value={nome}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Data de Nascimento"
											mode={"outlined"}
											theme={tema}
											value={nascimento}
											style={{ fontSize: 18 }}
											disabled
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
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 3, marginRight: 5 }}>
										<TextInput
											label="Endereço"
											mode={"outlined"}
											theme={tema}
											value={endereco}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Número"
											mode={"outlined"}
											theme={tema}
											value={numero}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Complemento"
											mode={"outlined"}
											theme={tema}
											value={complemento}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 4, marginRight: 5 }}>
										<TextInput
											label="Cidade"
											mode={"outlined"}
											theme={tema}
											value={cidade.Name + " / SC"}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
									<View style={{ flex: 1 }}>
										<TextInput
											label="CEP"
											mode={"outlined"}
											theme={tema}
											value={cep}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Telefone Comercial"
											mode={"outlined"}
											theme={tema}
											value={telefoneComercial}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Telefone Residencial"
											mode={"outlined"}
											theme={tema}
											value={telefoneResidencial}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
									<View style={{ flex: 1 }}>
										<TextInput
											label="Celular"
											mode={"outlined"}
											theme={tema}
											value={celular}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 1 }}>
										<TextInput
											label="E-mail"
											mode={"outlined"}
											theme={tema}
											value={email}
											style={{ fontSize: 18 }}
											disabled
										/>
									</View>
								</View>
								<View
									style={{
										flexDirection: "row",
										justifyContent: "flex-end",
									}}
								>
									<Text
										style={{
											fontSize: 18,
											color: tema.colors.vermelho,
										}}
									>
										Ultima atualização em {associado_atendimento.data_recadastro}
									</Text>
								</View>
								<ScrollView>
									<View
										style={{
											flexDirection: "row",
											marginBottom: 5,
											marginTop: 20,
										}}
									>
										<View style={{ flex: 1, marginRight: 5 }}>
											<Combo label={"Beneficiário"} pronome={"o"} lista={dependentes} item={[beneficiario, setBeneficiario]} />
										</View>
									</View>
									{beneficiario?.possui_plano && (
										<View
											style={{
												backgroundColor: tema.colors.amarelo,
												padding: 10,
												borderRadius: 6,
												marginVertical: 5,
											}}
										>
											<Text style={{ textAlign: "justify" }}>
												O beneficiário escolhido já possui o plano de saúde
												ativo:{" "}
												<Text style={{ fontWeight: "bold" }}>
													{beneficiario?.nome_plano?.toString()}
												</Text>
												. Caso continue, ao final do cadastro será solicitado o
												cancelamento do plano ativo.
											</Text>
										</View>
									)}
									<View
										style={{
											flexDirection: "row",
											marginBottom: 5,
										}}
									>
										<View style={{ flex: 1 }}>
											<Combo label={"Plano"} pronome={"o"} lista={planos} item={[plano, setPlano]} />
										</View>
									</View>
									<View style={{ flexDirection: "row", marginBottom: 5 }}>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Data de Nascimento"
												mode={"outlined"}
												theme={tema}
												value={beneficiario.data_nascimento}
												style={{ fontSize: 18 }}
												disabled
											/>
										</View>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Idade"
												mode={"outlined"}
												theme={tema}
												value={beneficiario.idade.toString()}
												style={{ fontSize: 18 }}
												disabled
											/>
										</View>
										<View style={{ flex: 1 }}>
											<TextInput
												label="Estado Civil"
												mode={"outlined"}
												theme={tema}
												value={beneficiario.estado_civil}
												style={{ fontSize: 18 }}
												onChangeText={(text) =>
													setBeneficiario({
														...beneficiario,
														estado_civil: text,
													})
												}
												render={() => (
													<PickerModal
														renderSelectView={(
															disabled,
															selected,
															showModal
														) => (
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
																			fontSize: beneficiario ? 15 : 12,
																		}}
																	>
																		{beneficiario.estado_civil.Name === ""
																			? "SELECIONE"
																			: beneficiario.estado_civil.Name}
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
														selected={beneficiario.estado_civil}
														selectPlaceholderText="SELECIONE O ESTADO CIVIL"
														searchPlaceholderText="DIGITE O ESTADO CIVIL"
														onSelected={(key) =>
															setBeneficiario({
																...beneficiario,
																estado_civil: key,
															})
														}
														onClosed={() => setBeneficiario(beneficiario)}
														items={[
															{
																Name: "Solteiro(a)",
																Value: "Solteiro(a)",
															},
															{ Name: "Casado(a)", Value: "Casado(a)" },
															{
																Name: "Desquitado(a)",
																Value: "Desquitado(a)",
															},
															{ Name: "Viúvo(a)", Value: "Viúvo(a)" },
															{
																Name: "Divorciado(a)",
																Value: "Divorciado(a)",
															},
															{
																Name: "Separado(a) Judicialmente",
																Value: "Separado(a) Judicialmente",
															},
															{
																Name: "Amasiado(a)",
																Value: "Amasiado(a)",
															},
															{ Name: "Outro", Value: "Outro" },
														]}
													/>
												)}
											/>
										</View>
									</View>
									<View style={{ flexDirection: "row", marginBottom: 5 }}>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Sexo"
												mode={"outlined"}
												theme={tema}
												value={beneficiario.sexo}
												style={{ fontSize: 18 }}
												disabled
											/>
										</View>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Tipo de Dependente"
												mode={"outlined"}
												theme={tema}
												value={beneficiario.tipo}
												style={{ fontSize: 18 }}
												disabled
											/>
										</View>
										<View style={{ flex: 1 }}>
											<TextInput
												label="CPF"
												mode={"outlined"}
												theme={tema}
												value={beneficiario.cpf}
												style={{ fontSize: 18 }}
												disabled={beneficiario?.cpf === "" ? false : true}
												maxLength={14}
												keyboardType={"number-pad"}
												onChangeText={(text) =>
													setBeneficiario({ ...beneficiario, cpf: text })
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
									</View>
									<View
										style={{
											flexDirection: "row",
											justifyContent: "flex-start",
											marginBottom: 5,
										}}
									>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Local de Cobrança"
												mode={"outlined"}
												theme={tema}
												value={beneficiario.local_cobranca}
												style={{ fontSize: 18 }}
												onChangeText={(text) =>
													setBeneficiario({
														...beneficiario,
														local_cobranca: text,
													})
												}
												render={() => (
													<PickerModal
														renderSelectView={(
															disabled,
															selected,
															showModal
														) => (
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
																			fontSize: beneficiario ? 15 : 12,
																		}}
																	>
																		{beneficiario.local_cobranca.Name === ""
																			? "SELECIONE"
																			: beneficiario.local_cobranca.Name}
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
														selected={beneficiario.local_cobranca}
														selectPlaceholderText="SELECIONE O LOCAL DE COBRANÇA"
														searchPlaceholderText="DIGITE O LOCAL DE COBRANÇA"
														onSelected={(key) =>
															setBeneficiario({
																...beneficiario,
																local_cobranca: key,
															})
														}
														onClosed={() => setBeneficiario(beneficiario)}
														items={[
															{ Name: "Folha", Value: "1-Folha" },
															{ Name: "Boleto", Value: "2-Boleto" },
															{
																Name: "Conta Corrente",
																Value: "3-Conta Corrente",
															},
														]}
													/>
												)}
											/>
										</View>
										<View style={{ flex: 1 }}>
											<TextInput
												label="Valor Mensal do Plano"
												mode={"outlined"}
												theme={tema}
												style={{
													fontSize: 20,
													fontWeight: "bold",
													color: tema.colors.primary,
												}}
												value={beneficiario.valor_mensalidade.toString()}
												disabled
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
									</View>
									<View
										style={{
											flexDirection: "row",
											justifyContent: "flex-start",
											marginBottom: 5,
										}}
									>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Data de Movimentação"
												mode={"outlined"}
												theme={tema}
												value={dataMovimentacao}
												style={{ fontSize: 18 }}
												disabled
											/>
										</View>
										<View style={{ flex: 1 }}>
											<TextInput
												label="Data de Vigência do Plano"
												mode={"outlined"}
												theme={tema}
												value={dataVigencia}
												style={{ fontSize: 18 }}
												maxLength={14}
												keyboardType={"number-pad"}
												onChangeText={(text) => setDataVigencia(text)}
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
									<View style={{ height: 150 }} />
								</ScrollView>
							</ProgressStep>
							<ProgressStep label="Arquivos" removeBtnRow>
								<Text style={{ textAlign: "center", marginBottom: 20 }}>
									Clique nos botões abaixo para tirar foto dos documentos:
								</Text>
								<ScrollView>
									<View
										style={{
											flex: 1,
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<TouchableOpacity
											onPress={() => tirarFoto("CPF")}
											style={{
												backgroundColor: "#031e3f",
												padding: 20,
												borderRadius: 6,
												width: "70%",
												alignItems: "center",
												marginVertical: 5,
											}}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>
												TIRAR FOTO DO CPF
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => tirarFoto("RG")}
											style={{
												backgroundColor: "#031e3f",
												padding: 20,
												borderRadius: 6,
												width: "70%",
												alignItems: "center",
												marginVertical: 5,
											}}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>
												TIRAR FOTO DO RG
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => tirarFoto("SUS")}
											style={{
												backgroundColor: "#031e3f",
												padding: 20,
												borderRadius: 6,
												width: "70%",
												alignItems: "center",
												marginVertical: 5,
											}}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>
												TIRAR FOTO DO CARTÃO SUS
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => tirarFoto("CR")}
											style={{
												backgroundColor: "#031e3f",
												padding: 20,
												borderRadius: 6,
												width: "70%",
												alignItems: "center",
												marginVertical: 5,
											}}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>
												TIRAR FOTO DO COMPROV. DE RESIDÊNCIA
											</Text>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => tirarFoto("DS")}
											style={{
												backgroundColor: "#031e3f",
												padding: 20,
												borderRadius: 6,
												width: "70%",
												alignItems: "center",
												marginVertical: 5,
											}}
										>
											<Text style={{ color: "#fff", fontSize: 20 }}>
												TIRAR FOTO DA DECLARAÇÃO DE SAÚDE
											</Text>
										</TouchableOpacity>
									</View>
									<View
										style={{
											flexDirection: "row",
											marginTop: 10,
										}}
									>
										<View
											style={{
												flex: 1,
												marginHorizontal: 5,
											}}
										>
											{imagemCpf !== "" && (
												<TouchableOpacity
													onPress={() => {
														setModal(true);
														setImagemAmpliada(imagemCpf);
													}}
													style={{
														width: "100%",
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													<Image
														source={{ uri: imagemCpf }}
														style={{ width: "100%", height: 150 }}
													/>
													<Text style={{ fontSize: 13 }}>CPF</Text>
												</TouchableOpacity>
											)}
										</View>
										<View
											style={{
												flex: 1,
												marginHorizontal: 5,
											}}
										>
											{imagemRg !== "" && (
												<TouchableOpacity
													onPress={() => {
														setModal(true);
														setImagemAmpliada(imagemRg);
													}}
													style={{
														width: "100%",
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													<Image
														source={{ uri: imagemRg }}
														style={{ width: "100%", height: 150 }}
													/>
													<Text style={{ fontSize: 13 }}>RG</Text>
												</TouchableOpacity>
											)}
										</View>
										<View
											style={{
												flex: 1,
												marginHorizontal: 5,
											}}
										>
											{imagemCartaoSUS !== "" && (
												<TouchableOpacity
													onPress={() => {
														setModal(true);
														setImagemAmpliada(imagemCartaoSUS);
													}}
													style={{
														width: "100%",
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													<Image
														source={{ uri: imagemCartaoSUS }}
														style={{ width: "100%", height: 150 }}
													/>
													<Text style={{ fontSize: 13 }}>CARTÃO SUS</Text>
												</TouchableOpacity>
											)}
										</View>
										<View
											style={{
												flex: 1,
												marginHorizontal: 5,
											}}
										>
											{imagemComprovanteResidencia !== "" && (
												<TouchableOpacity
													onPress={() => {
														setModal(true);
														setImagemAmpliada(imagemComprovanteResidencia);
													}}
													style={{
														width: "100%",
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													<Image
														source={{ uri: imagemComprovanteResidencia }}
														style={{ width: "100%", height: 150 }}
													/>
													<Text style={{ fontSize: 13 }}>COMPROV. DE RES.</Text>
												</TouchableOpacity>
											)}
										</View>
										<View
											style={{
												flex: 1,
												marginHorizontal: 5,
											}}
										>
											{imagemDeclaracaoSaude !== "" && (
												<TouchableOpacity
													onPress={() => {
														setModal(true);
														setImagemAmpliada(imagemDeclaracaoSaude);
													}}
													style={{
														width: "100%",
														justifyContent: "center",
														alignItems: "center",
													}}
												>
													<Image
														source={{ uri: imagemDeclaracaoSaude }}
														style={{ width: "100%", height: 150 }}
													/>
													<Text style={{ fontSize: 13 }}>DECLAR. DE SAÚDE</Text>
												</TouchableOpacity>
											)}
										</View>
									</View>
								</ScrollView>
							</ProgressStep>
							<ProgressStep label="Assinatura" removeBtnRow>
								<View
									style={{
										flex: 1,
										height: 700,
									}}
								>
									<WebView
										source={{ html: pdf }}
										style={{ backgroundColor: "#f1f1f1", flex: 2 }}
									/>
									<View style={{ flexDirection: "row" }}>
										<View style={{ flex: 1 }}></View>
										<View style={{ flex: 2 }}>
											<TouchableOpacity
												onPress={() => setModalAssinatura(true)}
												style={{
													backgroundColor: tema.colors.primary,
													padding: 20,
													borderRadius: 6,
													marginTop: 20,
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<Text style={{ color: "#fff", fontSize: 20 }}>
													RECOLHER ASSINATURA
												</Text>
											</TouchableOpacity>
										</View>
										<View style={{ flex: 1 }}></View>
									</View>
								</View>
							</ProgressStep>
						</ProgressSteps>
						{mostrarBotoes && (
							<>
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
										<Text style={{ color: "#fff", fontSize: 20 }}>
											ANTERIOR
										</Text>
									</TouchableOpacity>
								)}
								<TouchableOpacity
									disabled={!nextStep}
									onPress={goToNextStep}
									style={{
										backgroundColor: nextStep
											? activeStep === 3
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
									<Text
										style={{ color: nextStep ? "#fff" : "#000", fontSize: 20 }}
									>
										{textNext}
									</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default CadastrarPlanosDeSaude;
