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
import Header from "../components/Header";
import s, { tema } from "../../assets/style/Style";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import Signature from "react-native-signature-canvas";
import calculateAge from "../functions/calculateAge";
import WebView from "react-native-webview";
import * as Print from "expo-print";
import Combo from "../components/Combo";

const PLANO_INITIAL = { Name: "", Value: "", valor_faixas: [], nome_plano: "" };

function MigrarPlanoDeSaude(props) {
	let d = new Date();
	const { navigation } = props;
	const [usuario, setUsuario] = useUsuario();
	const { token, associado_atendimento } = usuario;
	console.log(associado_atendimento);
	const [planos, setPlanos] = useState([]);
	const [plano, setPlano] = useState(PLANO_INITIAL);
	const [mostrarDadosAssociado, setMostrarDadosAssociado] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [nextStep, setNextStep] = useState(true);
	const [prevStep, setPrevStep] = useState(false);
	const [textNext, setTextNext] = useState("PRÓXIMO");
	const [alerta, setAlerta] = useState({});
	const [carregando, setCarregando] = useState(false);
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

	const [estadoCivil, setEstadoCivil] = useState({ Name: "", Value: "" });
	const [localCobranca, setLocalCobranca] = useState({ Name: "", Value: "" });

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
					valor_plano: plano.valor_mensalidade,
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

	const verificarIdade = () => {
		let nascimento = formatDate(associado_atendimento.nascimento, "AMD");
		if (isDate(new Date(nascimento))) {
			setUsuario({
				...usuario,
				associado_atendimento: {
					...associado_atendimento,
					idade: calculateAge(nascimento),
				},
			});
		}
	};

	const verificarPlano = () => {
		let plano_selecionado = planos.find(
			(p) => p.Value === associado_atendimento.codigo_plano
		);

		selecionarPlano(plano_selecionado, associado_atendimento);
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

	const verificarMatricula = async () => {
		if (associado_atendimento.matricula.length == 6) {
			if (!isNaN(associado_atendimento.matricula)) {
				setCarregando(true);
				setPlano(PLANO_INITIAL);

				try {
					const { data } = await api({
						url: "/associados/verificarMatricula",
						method: "GET",
						params: { cartao: associado_atendimento.matricula },
						headers: { "x-access-token": token },
					});

					if (data.status) {
						let dataFormat = formatDate(data.nascimento, "AMD");
						let idade = 0;
						if (isDate(new Date(dataFormat))) {
							idade = calculateAge(dataFormat);
						} else {
							idade = 0;
						}

						let assoc = {
							...data,
							idade,
							estado_civil: { Name: "", Value: "" },
							tipo: "TITULAR",
							codigo_tipo: "00",
							local_cobranca: { Name: "", Value: "" },
							valor_plano: 0,
						};

						let plano_selecionado = planos.find(
							(p) => p.Value === data.codigo_plano
						);

						selecionarPlano(plano_selecionado, assoc);
					} else {
						setNextStep(false);

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
					setMostrarDadosAssociado(false);
					setNextStep(false);
					Keyboard.dismiss();

					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: "Ocorreu um erro ao tentar verificar a matrícula.",
						type: "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});
				}
			} else {
				setCarregando(false);
				setMostrarDadosAssociado(false);
				setNextStep(false);
				Keyboard.dismiss();
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
		} else {
			setCarregando(false);
			setMostrarDadosAssociado(false);
			setNextStep(false);
			Keyboard.dismiss();
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

	const selecionarPlano = (key, associado = associado_atendimento) => {
		let id = associado.idade;
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

		let { valor } = key.valor_plano.find((item) => item.faixa == index);

		setUsuario({
			...usuario,
			associado_atendimento: { ...associado, valor_plano: valor },
		});

		if (associado?.nome !== "") {
			setNextStep(true);
		} else {
			setNextStep(false);
		}
	};

	const incluirNoPlano = async () => {
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
			<title>REQUERIMENTO DE MIGRAÇÃO DO PLANO</title>
		</head>
		<body>
			<div style="display: flex; flex: 1; flex-direction: column; margin:20px;font-family: sans-serif;">
				<div style="display: flex; flex: 1">
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center;">
					<div style="display: flex; flex: 1;justify-content: flex-start; aalign-items: center;">
						<img src="https://www.abepom.org.br/images/logomarca.png" />
					</div>
					<div style="display: flex; flex: 2; justify-content: center; align-items: center;">
						<h4 style="display: flex; flex: 1; justify-content: center; align-items: center;text-align:center">REQUERIMENTO DE MIGRAÇÃO<br />DO PLANO DE SAÚDE</h4>
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
							E-mail: ${associado_atendimento.email}
						</div>
					</div>
				</div>
        <div style="display: flex; flex: 1; flex-direction: column; margin-top: 20px;">
							Data para migração: ${associado_atendimento.nome} (Sempre dia 1º de cada mês, sujeita a análise da operadora)
				</div>
        <div style="display: flex; flex: 1; flex-direction: column; margin-top: 10px;">
							Nome do Beneficiário Titular: ${associado_atendimento.nome}<br />
              **A migração dos dependentes é compulsória.
				</div>
				<div style="display: flex; flex: 1;">
					<div style="display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
						<h4 style="text-align: center">ESCOLHA DO PLANO</h4>
					</div>
				</div>
        <div style="display: flex; flex: 1; flex-direction: column; margin-top: 10px;">
							Plano Atual: ${associado_atendimento.nome_plano}
				</div>
        <div style="display: flex; flex: 1; flex-direction: column; margin-top: 10px;">
							Migrando para: ${plano.codigo_plano} - ${plano.nome_plano}
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
						<div style="display: flex; flex: 1; justify-content: center">
							<center>
								<img src="${assinaturaAssociado}" style="width: 350px" />
								<br />
								<hr style="width: 80%" />
								<br />
								${associado_atendimento.nome}<br />
								Assinatura do Associado
							</center>
						</div>
					</div>
				</div>
			</body>
		</html>`;

		try {
			const { uri } = await Print.printToFileAsync({ html });
			const formulario = new FormData();
			formulario.append("matricula", `${associado_atendimento.matricula}`);
			formulario.append("dependente", `${associado_atendimento?.codigo_tipo}`);
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

				if (plano?.Name === "" || associado_atendimento?.nome === "") {
					erros++;
					msg = "Selecionar o beneficiário e o plano.\n";
				}

				if (localCobranca?.Name == "") {
					erros++;
					msg += "Selecionar o local de cobrança.\n";
				}

				if (estadoCivil?.Name == "") {
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
							url: "/associados/migrarPlanoDeSaude",
							method: "POST",
							data: {
								plano,
								associado: associado_atendimento,
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
							setMostrarDadosAssociado(false);
							setMatricula("");
							setPlano(PLANO_INITIAL);
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

	const goToNextStep = async () => {
		let erros = 0;
		let msgErro = "";

		switch (activeStep) {
			case 0:
				erros = 0;
				msgErro = "";

				if (plano?.Name === "" || associado_atendimento?.nome === "") {
					erros++;
					msgErro = "Selecionar o beneficiário e o plano.\n";
				}

				if (localCobranca?.Name == "") {
					erros++;
					msgErro += "Selecionar o local de cobrança.\n";
				}

				if (estadoCivil?.Name == "") {
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
					setActiveStep(2);
					setNextStep(false);
					setTextNext("CONCLUIR CADASTRO");
				}

				break;
			case 1:
				incluirNoPlano(false);
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
		if (associado_atendimento?.codigo_tipo !== "00") {
			refBeneficiario.current.clearSignature();
		}
	};

	const handleConfirm = async () => {
		if (associado_atendimento?.codigo_tipo !== "00") {
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
		verificarIdade();
		verificarPlano();

		return () => {
			Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
			Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
		};
	}, []);

	return (
		<>
			<Header titulo={"Migrar Planos de Saúde"} {...props} />
			<Modal animationType="fade" transparent={true} visible={modal} {...props}>
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
						{associado_atendimento?.nome?.toUpperCase()}
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
					{associado_atendimento?.codigo_tipo !== "00" && (
						<>
							<Text style={{ fontSize: 20, marginBottom: 10 }}>
								Recolha a assinatura do beneficiário na área destacada abaixo:{" "}
							</Text>
							<Text>Assinatura de</Text>
							<Text style={{ fontWeight: "bold" }}>
								{associado_atendimento?.nome?.toUpperCase()}
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
			<SafeAreaView style={s.fl1}>
				<View style={[s.fl1, s.m20]}>
					<Text style={[s.tac, s.mt10, s.fs18]}>
						Preencha os campos abaixo para efetuar a migração do plano de saúde.
					</Text>
					<View style={s.fl1}>
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
							<ProgressStep label="Geral" removeBtnRow>
								<View style={[s.row, s.mb5]}>
									<View style={[s.fl4, s.mr5]}>
										<TextInput
											label="Nome"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.nome}
											style={s.fs18}
											disabled
										/>
									</View>
									<View style={s.fl2}>
										<TextInput
											label="Data de Nascimento"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.nascimento}
											style={s.fs18}
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
								<View style={[s.row, s.mb5]}>
									<View style={[s.fl3, s.mr5]}>
										<TextInput
											label="Endereço"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.endereco}
											style={s.fs18}
											disabled
										/>
									</View>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Número"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.numero}
											style={s.fs18}
											disabled
										/>
									</View>
									<View style={s.fl2}>
										<TextInput
											label="Complemento"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.complemento}
											style={s.fs18}
											disabled
										/>
									</View>
								</View>
								<View style={[s.row, s.mb5]}>
									<View style={[s.fl4, s.mr5]}>
										<TextInput
											label="Cidade"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.cidade.Name + " / SC"}
											style={s.fs18}
											disabled
										/>
									</View>
									<View style={s.fl1}>
										<TextInput
											label="CEP"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.cep}
											style={s.fs18}
											disabled
										/>
									</View>
								</View>
								<View style={[s.row, s.mb5]}>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Telefone Comercial"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.telefone_comercial}
											style={s.fs18}
											disabled
										/>
									</View>
									<View style={[s.fl1, s.mr5]}>
										<TextInput
											label="Telefone Residencial"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.telefone_residencial}
											style={s.fs18}
											disabled
										/>
									</View>
									<View style={s.fl1}>
										<TextInput
											label="Celular"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.celular}
											style={s.fs18}
											disabled
										/>
									</View>
								</View>
								<View style={[s.row, s.mb5]}>
									<View style={s.fl1}>
										<TextInput
											label="E-mail"
											mode={"outlined"}
											theme={tema}
											value={associado_atendimento.email}
											style={s.fs18}
											disabled
										/>
									</View>
								</View>
								<View style={[s.row, s.jcfe]}>
									<Text style={[s.fs18, s.fcr]}>
										Última atualização em{" "}
										{associado_atendimento.data_recadastro}
									</Text>
								</View>
								<ScrollView>
									{associado_atendimento.possui_plano && (
										<View style={[s.bgca, s.pd10, s.br6, s.mv20]}>
											<Text style={s.taj}>
												O beneficiário escolhido já possui o plano de saúde
												ativo:{" "}
												<Text style={s.bold}>
													{associado_atendimento?.nome_plano?.toString()}
												</Text>
												.
											</Text>
										</View>
									)}
									<View style={[s.row, s.mb5]}>
										<View style={s.fl1}>
											<TextInput
												label="Plano"
												mode={"outlined"}
												theme={tema}
												style={s.fs18}
												value={plano}
												onChangeText={(text) => setPlano(text)}
												dense
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
																			fontSize: plano ? 15 : 12,
																		}}
																	>
																		{plano.Name === ""
																			? "SELECIONE"
																			: plano.Name}
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
														selected={plano}
														selectPlaceholderText="SELECIONE O PLANO"
														searchPlaceholderText="DIGITE O PLANO"
														onSelected={(key) =>
															selecionarPlano(key, associado_atendimento)
														}
														onClosed={() => setPlano(plano)}
														items={planos}
													/>
												)}
											/>
										</View>
									</View>
									<View style={{ flexDirection: "row", marginBottom: 5 }}>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Data de Nascimento"
												mode={"outlined"}
												theme={tema}
												value={associado_atendimento.nascimento}
												style={s.fs18}
												disabled
												dense
											/>
										</View>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Idade"
												mode={"outlined"}
												theme={tema}
												value={associado_atendimento.idade}
												style={s.fs18}
												disabled
												dense
											/>
										</View>
										<View style={s.fl1}>
											<Combo
												label={"Estado Civil"}
												pronome={"o"}
												lista={[
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
												item={[estadoCivil, setEstadoCivil]}
											/>
										</View>
									</View>
									<View style={{ flexDirection: "row", marginBottom: 5 }}>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Sexo"
												mode={"outlined"}
												theme={tema}
												value={associado_atendimento.sexo.Name}
												style={s.fs18}
												disabled
												dense
											/>
										</View>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Tipo de Dependente"
												mode={"outlined"}
												theme={tema}
												value={associado_atendimento.tipo}
												style={s.fs18}
												disabled
												dense
											/>
										</View>
										<View style={s.fl1}>
											<TextInput
												label="CPF"
												mode={"outlined"}
												theme={tema}
												value={associado_atendimento.cpf}
												style={s.fs18}
												disabled={
													associado_atendimento?.cpf === "" ? false : true
												}
												maxLength={14}
												dense
												keyboardType={"number-pad"}
												onChangeText={
													(text) => console.log(text)
													//setAssociado({ ...associado_atendimento, cpf: text })
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
											<Combo
												label={"Local de Cobrança"}
												pronome={"o"}
												lista={[
													{ Name: "Folha", Value: "1-Folha" },
													{ Name: "Boleto", Value: "2-Boleto" },
													{
														Name: "Conta Corrente",
														Value: "3-Conta Corrente",
													},
												]}
												item={[localCobranca, setLocalCobranca]}
											/>
										</View>
										<View style={s.fl1}>
											<TextInput
												label="Valor Mensal do Plano"
												mode={"outlined"}
												theme={tema}
												style={{
													fontSize: 20,
													fontWeight: "bold",
													color: tema.colors.primary,
												}}
												dense
												value={associado_atendimento.valor_plano}
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
												dense
												value={dataMovimentacao}
												style={s.fs18}
												disabled
											/>
										</View>
										<View style={s.fl1}>
											<TextInput
												label="Data de Vigência do Plano"
												mode={"outlined"}
												theme={tema}
												value={dataVigencia}
												style={s.fs18}
												maxLength={14}
												dense
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
										<View style={s.fl1}></View>
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
										<View style={s.fl1}></View>
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

export default MigrarPlanoDeSaude;
