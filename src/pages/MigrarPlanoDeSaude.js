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
import { TextInput, IconButton, Button } from "react-native-paper";
import { TextInputMask } from "react-native-masked-text";
import PickerModal from "react-native-picker-modal-view";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import images from "../utils/images";
import api from "../../services/api";
import isDate from "../functions/isDate";
import formatDate from "../functions/formatDate";
import Header from "../components/Header";
import { tema } from "../../assets/style/Style";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import Signature from "react-native-signature-canvas";
import calculateAge from "../functions/calculateAge";
import WebView from "react-native-webview";
import * as Print from "expo-print";

const ASSOCIADO_INITIAL = {
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
	possui_plano: false,
	idade: 0,
	estado_civil: { Name: "", Value: "" },
	tipo: "TITULAR",
	codigo_tipo: "00",
	local_cobranca: { Name: "", Value: "" },
	valor_plano: 0,
};

const PLANO_INITIAL = { Name: "", Value: "", valor_faixas: [], nome_plano: "" };

function MigrarPlanoDeSaude(props) {
	let d = new Date();
	const { navigation } = props;
	const [{ token }] = useUsuario();
	const [matricula, setMatricula] = useState("003959");
	const [associado, setAssociado] = useState(ASSOCIADO_INITIAL);
	const [planos, setPlanos] = useState([]);
	const [plano, setPlano] = useState(PLANO_INITIAL);
	const [mostrarDadosAssociado, setMostrarDadosAssociado] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [nextStep, setNextStep] = useState(false);
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
		if (matricula.length == 6) {
			if (!isNaN(matricula)) {
				setCarregando(true);
				setAssociado(ASSOCIADO_INITIAL);
				setPlano(PLANO_INITIAL);

				try {
					const { data } = await api({
						url: "/associados/verificarMatricula",
						method: "GET",
						params: { cartao: matricula },
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
						setMostrarDadosAssociado(true);

						if (data.tipo === "01") {
							setNextStep(true);
						} else {
							setNextStep(false);
						}

						if (!data.possui_plano) {
							setAlerta({
								visible: true,
								title: "ATENÇÃO!",
								message:
									"O titular não possui nenhum plano ativo. Para efetuar a migração é necessário possuir um plano.",
								type: "danger",
								confirmText: "FECHAR",
								showConfirm: true,
								showCancel: false,
								confirmFunction: () => {
									navigation.navigate("MigrarPlanoDeSaude", {
										id: new Date().toJSON(),
									});
								},
							});

							setNextStep(false);
							setMostrarDadosAssociado(false);
						} else {
							setMostrarDadosAssociado(true);
						}
					} else {
						setAssociado({ ...ASSOCIADO_INITIAL, matricula });
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
					setAssociado(ASSOCIADO_INITIAL);
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
				setAssociado(ASSOCIADO_INITIAL);
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
			setAssociado(ASSOCIADO_INITIAL);
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

	const selecionarPlano = (key, associado) => {
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

		setAssociado({
			...associado,
			valor_plano: valor,
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
							Nome: ${associado.nome}
						</div>
						<div style="display: flex; flex: 2">
							Matrícula: ${associado.matricula}
						</div>
					</div>
					<div style="display: flex; flex-direction: row; flex: 1; justify-content: center; align-items: center">
						<div style="display: flex; flex: 5;">
							E-mail: ${associado.email}
						</div>
					</div>
				</div>
        <div style="display: flex; flex: 1; flex-direction: column; margin-top: 20px;">
							Data para migração: ${associado.nome} (Sempre dia 1º de cada mês, sujeita a análise da operadora)
				</div>
        <div style="display: flex; flex: 1; flex-direction: column; margin-top: 10px;">
							Nome do Beneficiário Titular: ${associado.nome}<br />
              **A migração dos dependentes é compulsória.
				</div>
				<div style="display: flex; flex: 1;">
					<div style="display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: center;">
						<h4 style="text-align: center">ESCOLHA DO PLANO</h4>
					</div>
				</div>
        <div style="display: flex; flex: 1; flex-direction: column; margin-top: 10px;">
							Plano Atual: ${associado.nome_plano}
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
								${associado.nome}<br />
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
			formulario.append("matricula", `${associado.matricula}`);
			formulario.append("dependente", `${associado?.codigo_tipo}`);
			formulario.append("plano", `${plano?.Value}`);
			formulario.append("file", {
				uri,
				type: `application/pdf`,
				name: `REQUERIMENTO_INCLUSAO_PLANO_${associado.matricula}.pdf`,
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

				if (plano?.Name === "" || associado?.nome === "") {
					erros++;
					msg = "Selecionar o beneficiário e o plano.\n";
				}

				if (associado?.local_cobranca?.Name == "") {
					erros++;
					msg += "Selecionar o local de cobrança.\n";
				}

				if (associado?.estado_civil?.Name == "") {
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
								associado,
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
							setAssociado(ASSOCIADO_INITIAL);
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

					if (associado?.nome !== "" && plano?.Name !== "") {
						setNextStep(true);
					} else {
						setNextStep(false);
					}
					setActiveStep(1);
				}
				break;
			case 1:
				erros = 0;
				msgErro = "";

				if (plano?.Name === "" || associado?.nome === "") {
					erros++;
					msgErro = "Selecionar o beneficiário e o plano.\n";
				}

				if (associado?.local_cobranca?.Name == "") {
					erros++;
					msgErro += "Selecionar o local de cobrança.\n";
				}

				if (associado?.estado_civil?.Name == "") {
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
			case 2:
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
		if (associado?.codigo_tipo !== "00") {
			refBeneficiario.current.clearSignature();
		}
	};

	const handleConfirm = async () => {
		if (associado?.codigo_tipo !== "00") {
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
						{associado?.nome?.toUpperCase()}
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
					{associado?.codigo_tipo !== "00" && (
						<>
							<Text style={{ fontSize: 20, marginBottom: 10 }}>
								Recolha a assinatura do beneficiário na área destacada abaixo:{" "}
							</Text>
							<Text>Assinatura de</Text>
							<Text style={{ fontWeight: "bold" }}>
								{associado?.nome?.toUpperCase()}
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
						Preencha os campos abaixo para efetuar a migração do plano de saúde.
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
													borderWidth: associado.status
														? associado.tipo === "01"
															? 2
															: 0
														: 0,
													borderColor: associado.status
														? associado.tipo === "01"
															? "#07A85C"
															: "#fff"
														: "#fff",
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
																	? "NÃO ASSOCIADO"
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
									</>
								)}
							</ProgressStep>
							<ProgressStep label="Geral" removeBtnRow>
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 4, marginRight: 5 }}>
										<TextInput
											label="Nome"
											mode={"outlined"}
											theme={tema}
											value={associado.nome}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Data de Nascimento"
											mode={"outlined"}
											theme={tema}
											dense
											value={associado.nascimento}
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
											value={associado.endereco}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Número"
											mode={"outlined"}
											theme={tema}
											value={associado.numero}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
									<View style={{ flex: 2 }}>
										<TextInput
											label="Complemento"
											mode={"outlined"}
											theme={tema}
											value={associado.complemento}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 4, marginRight: 5 }}>
										<TextInput
											label="Cidade"
											mode={"outlined"}
											theme={tema}
											value={associado.cidade.Name + " / SC"}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
									<View style={{ flex: 1 }}>
										<TextInput
											label="CEP"
											mode={"outlined"}
											theme={tema}
											value={associado.cep}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Telefone Comercial"
											mode={"outlined"}
											theme={tema}
											value={associado.telefone_comercial}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
									<View style={{ flex: 1, marginRight: 5 }}>
										<TextInput
											label="Telefone Residencial"
											mode={"outlined"}
											theme={tema}
											value={associado.telefone_residencial}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
									<View style={{ flex: 1 }}>
										<TextInput
											label="Celular"
											mode={"outlined"}
											theme={tema}
											value={associado.celular}
											style={{ fontSize: 18 }}
											disabled
											dense
										/>
									</View>
								</View>
								<View style={{ flexDirection: "row", marginBottom: 5 }}>
									<View style={{ flex: 1 }}>
										<TextInput
											label="E-mail"
											mode={"outlined"}
											theme={tema}
											value={associado.email}
											style={{ fontSize: 18 }}
											disabled
											dense
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
										Ultima atualização em {associado.data_recadastro}
									</Text>
								</View>
								<ScrollView>
									{associado.possui_plano && (
										<View
											style={{
												backgroundColor: tema.colors.amarelo,
												padding: 10,
												borderRadius: 6,
												marginVertical: 15,
											}}
										>
											<Text style={{ textAlign: "justify" }}>
												O beneficiário escolhido já possui o plano de saúde
												ativo:{" "}
												<Text style={{ fontWeight: "bold" }}>
													{associado?.nome_plano?.toString()}
												</Text>
												.
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
											<TextInput
												label="Plano"
												mode={"outlined"}
												theme={tema}
												style={{ fontSize: 18 }}
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
															selecionarPlano(key, associado)
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
												value={associado.nascimento}
												style={{ fontSize: 18 }}
												disabled
												dense
											/>
										</View>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Idade"
												mode={"outlined"}
												theme={tema}
												value={associado.idade.toString()}
												style={{ fontSize: 18 }}
												disabled
												dense
											/>
										</View>
										<View style={{ flex: 1 }}>
											<TextInput
												label="Estado Civil"
												mode={"outlined"}
												theme={tema}
												value={associado.estado_civil}
												dense
												style={{ fontSize: 18 }}
												onChangeText={(text) =>
													setAssociado({
														...associado,
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
																			fontSize: associado ? 15 : 12,
																		}}
																	>
																		{associado.estado_civil.Name === ""
																			? "SELECIONE"
																			: associado.estado_civil.Name}
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
														selected={associado.estado_civil}
														selectPlaceholderText="SELECIONE O ESTADO CIVIL"
														searchPlaceholderText="DIGITE O ESTADO CIVIL"
														onSelected={(key) =>
															setAssociado({
																...associado,
																estado_civil: key,
															})
														}
														onClosed={() => setAssociado(associado)}
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
												value={associado.sexo.Name}
												style={{ fontSize: 18 }}
												disabled
												dense
											/>
										</View>
										<View style={{ flex: 1, marginRight: 5 }}>
											<TextInput
												label="Tipo de Dependente"
												mode={"outlined"}
												theme={tema}
												value={associado.tipo}
												style={{ fontSize: 18 }}
												disabled
												dense
											/>
										</View>
										<View style={{ flex: 1 }}>
											<TextInput
												label="CPF"
												mode={"outlined"}
												theme={tema}
												value={associado.cpf}
												style={{ fontSize: 18 }}
												disabled={associado?.cpf === "" ? false : true}
												maxLength={14}
												dense
												keyboardType={"number-pad"}
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
												value={associado.local_cobranca}
												style={{ fontSize: 18 }}
												dense
												onChangeText={(text) =>
													setAssociado({
														...associado,
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
																			fontSize: associado ? 15 : 12,
																		}}
																	>
																		{associado.local_cobranca.Name === ""
																			? "SELECIONE"
																			: associado.local_cobranca.Name}
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
														selected={associado.local_cobranca}
														selectPlaceholderText="SELECIONE O LOCAL DE COBRANÇA"
														searchPlaceholderText="DIGITE O LOCAL DE COBRANÇA"
														onSelected={(key) =>
															setAssociado({
																...associado,
																local_cobranca: key,
															})
														}
														onClosed={() => setAssociado(associado)}
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
												dense
												value={associado.valor_plano.toString()}
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

export default MigrarPlanoDeSaude;
