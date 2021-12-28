import React, { useState, useEffect, useRef } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	ScrollView,
	Modal,
	Keyboard,
} from "react-native";
import { TextInputMask } from "react-native-masked-text";
import { Button, IconButton, TextInput } from "react-native-paper";
import PickerModal from "react-native-picker-modal-view";
import styles, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import removerAcentos from "../functions/removerAcentos";
import images from "../utils/images";
import Signature from "react-native-signature-canvas";
import * as Print from "expo-print";
import { WebView } from "react-native-webview";
import Alert from "../components/Alert";
import { useUsuario } from "../store/Usuario";

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
};

function RecadastrarAssociado(props) {
	const refAssoc = useRef();
	const refColab = useRef();
	const [{ nome, token }] = useUsuario();
	const [matricula, setMatricula] = useState("");
	const [associado, setAssociado] = useState(ASSOCIADO_INITIAL);
	const [carregando, setCarregando] = useState(false);
	const [mostrarDados, setMostrarDados] = useState(false);
	const [cidades, setCidades] = useState([]);
	const [lotacoes, setLotacoes] = useState([]);
	const [modal, setModal] = useState(false);
	const [modalAssinatura, setModalAssinatura] = useState(false);
	const [assinaturaAssociado, setAssinaturaAssociado] = useState("");
	const [assinaturaColaborador, setAssinaturaColaborador] = useState("");
	const [pdf, setPdf] = useState("");
	const [btnRecadastrar, setBtnRecadastrar] = useState(false);
	const [alerta, setAlerta] = useState({});

	useEffect(() => {
		listarCidades();
		listarLotacoes();
	}, []);

	const verificarMatricula = async () => {
		if (matricula !== "") {
			setCarregando(true);

			try {
				const { data } = await api({
					url: "/associados/verificarMatricula",
					method: "GET",
					params: { cartao: matricula },
					headers: { "x-access-token": token },
				});

				setBtnRecadastrar(false);
				setPdf("");
				setCarregando(false);
				setAssinaturaAssociado("");
				setAssinaturaColaborador("");

				if (data.status) {
					setAssociado(data);
					setMostrarDados(true);
					Keyboard.dismiss();
				} else {
					setAssociado(ASSOCIADO_INITIAL);
					setMostrarDados(false);
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
			} catch (error) {
				setAssociado(ASSOCIADO_INITIAL);
				setCarregando(false);
				setMostrarDados(false);
				setBtnRecadastrar(true);
				Keyboard.dismiss();

				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao tentar verificar a matrícula",
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			}
		} else {
			setAssociado(ASSOCIADO_INITIAL);
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

	async function buscarCep() {
		if (associado.cep === "" || associado.cep?.length < 8) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Para prosseguir é obrigatório informar o CEP.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
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
					message: "O CEP informado é inválido.",
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
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

	async function recadastrar() {
		setAlerta({
			visible: true,
			title: "EFETUANDO RECADASTRAMENTO",
			message: <Loading size={125} />,
			showConfirm: false,
			showCancel: false,
			showIcon: false,
		});

		try {
			const { data } = await api({
				url: "/associados/recadastrar",
				method: "POST",
				data: { associado },
				headers: { "x-access-token": token },
			});

			if (data.status) {
				setAssociado({
					sexo: { Name: "", Value: "" },
					cidade: { Name: "", Value: "0000" },
					local_trabalho: { Name: "", Value: "" },
				});
				setMatricula("");
				setMostrarDados(false);

				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: "success",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
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
		} catch (error) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Ocorreu um erro ao tentar recadastrar o associado.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});
		}
	}

	const abrirModal = () => {
		setAssinaturaAssociado("");
		setAssinaturaColaborador("");

		setPdf(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>REQUERIMENTO DE RECADASTRAMENTO</title>
		</head>
		<body>
			<center>
				<img src="https://www.abepom.org.br/images/logomarca.png" style="width: 60px" />
				<h5 style="margin-top:0px;">ASSOCIAÇÃO BENEFICENTE DOS MILITARES ESTADUAIS DE SANTA <br />REQUERIMENTO DE RECADASTRAMENTO</h5>
			</center>  
			<table width="100%" border="1" cellspacing="0" cellpadding="4" align="center" style="font-size:11px">
				<tbody>
					<tr>
						<td style="width: 33%"><b>NOME:</b> ${associado.nome}</td>
						<td style="width: 33%"><b>MATRÍCULA:</b> ${associado.matricula}</td>
						<td style="width: 33%"><b>SEXO:</b> ${associado.sexo.Name}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>E-MAIL:</b> ${associado.email}</td>
						<td style="width: 33%"><b>NASCIMENTO:</b> ${associado.nascimento}</td>
						<td style="width: 33%"><b>CPF:</b> ${associado.cpf}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>RG:</b> ${associado.rg}</td>
						<td colspan="2" style="width: 66%"><b>LOCAL DE TRAB.:</b> ${
							associado.local_trabalho.Name
						}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>TELEFONE RES.:</b> ${
							associado.telefone_residencial
						}</td>
						<td style="width: 33%"><b>TELEFONE COM.:</b> ${
							associado.telefone_comercial
						}</td>
						<td style="width: 33%"><b>CELULAR:</b> ${associado.celular}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>ENDEREÇO:</b> 
							${associado.endereco} 
							${associado.complemento ? ` - ${associado.complemento}` : null}
						</td>
						<td style="width: 33%"><b>Nº:</b> ${associado.numero}</td>
						<td style="width: 33%"><b>BAIRRO:</b> ${associado.bairro}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>CEP:</b> ${associado.cep}</td>
						<td colspan="2" style="width: 66%"><b>CIDADE:</b> ${associado.cidade.Name}</td>
					</tr>
				</tbody>
			</table>
			<p align="justify" style="font-size: 12px">
				O associado acima qualificado vem por meio do presente instrumento, isento de qualquer tipo de constrangimento ou coação, requerer seu recadastramento junto ao quadro 
				social da ABEPOM, com base nos termos dos artigos 3º, 4º, 5º, 6º, 7º e 8º do Estatuto Social vigente cujo teor tem amplo conhecimento, autorizando desde já, que a sua 
				contribuição mensal bem como, quaisquer outros encargos devidos, decorrentes da prestação de serviços ou fruição dos benefícios, sejam descontados mediante consignação 
				em sua folha de pagamento. Caso a consignação em folha de pagamento não possa, por qualquer motivo ser efetivada, autoriza expressamente em caráter irrevogável e 
				irretratável, que também, tais descontos (Contribuição Mensal e/ou Prestações Financeiras decorrentes da utilização dos serviços ou a fruição dos benefícios previstos 
				no seu Plano e Regulamento de BENEFÍCIOS e SERVIÇOS, cujo teor também conhece) sejam debitados em sua conta corrente bancária, através da qual recebe os seus 
				vencimentos. Declaro também, que estou ciente nas previsões do artigo 7º, §1º e § 2º do Estatuto Social*.
			</p> 
			<p align="justify" style="font-size: 12px">
				Sendo empregado da ABEPOM, autorizo na Rescisão Contratual, que quaisquer débitos contraídos junto a associação, sejam descontados no ato da rescisão.
			</p>  
			<p align="justify" style="font-size: 10px">
				* “7º - São dependentes dos associados, a esposa ou o esposo, a companheira ou o companheiro em união estável devidamente comprovada, os filhos até 18 (dezoito) anos 
				de idade e os filhos absolutamente incapazes. §1º - O limite de idade para os filhos previsto no caput, poderá ser ampliado até o ser comprovada semestralmente. §2º - 
				Podem ainda ser inscritos como dependentes o enteado e o menor que se ache sob sua guarda judicial, o pai, a mãe, o sogro ou dependência econômica do associado 
				devidamente comprovada, cuja regulamentação sobre a comprovação da dependência econômica, meio de Diretriz fixada pelo Conselho de Administração.
			</p>  
			<p align="justify" style="font-size:12px">Nestes termos, pede deferimento.</p>
			`);

		setModal(true);
	};

	const handleOKAssoc = (signature) => {
		setAssinaturaAssociado(signature);

		return true;
	};

	const handleOKColab = (signature) => {
		setAssinaturaColaborador(signature);

		return true;
	};

	const handleOK = async () => {
		setModal(false);
		setModalAssinatura(false);
		let html =
			pdf +
			` 
				<p align="justify" style="font-size: 12px;">Local: Florianpolis</p>
				<p align="justify" style="font-size: 12px;">Data: 25/11/1990</p>
				<center>
					<img src="${assinaturaAssociado}" style="width: 300px;" />
					<hr style="width: 60%; margin-top: -15px;" />
					<p style="font-size:12px !important;">Assinatura de<br/><b>${associado?.nome?.toUpperCase()}</b></p>
				</center>
				<div style="display: flex; flex: 1; flex-direction: row; width: 100%;margin-top: 50px;">
					<div style="display: flex; flex: 1; justify-content: center;">
						<center>
							<img src="${assinaturaColaborador}" style="width: 250px;" /><br />
							<hr style="width: 80%; margin-top: -15px;" />
							<p style="text-align: center; font-size:12px !important;"><b>${nome}</b>
							<br />Representante ABEPOM</p>
						</center>
					</div>
					<div style="display: flex; flex: 1; justify-content: center;">
						<center>
							<img src="${assinaturaColaborador}" style="width: 250px;" /><br />
							<hr style="width: 80%; margin-top: -15px;" />
							<p style="text-align: center; font-size:12px !important;">Cel Aroldo<br />Presidente da ABEPOM</p>
						</center>
					</div>
				</div>
			</body>
		</html>`;

		try {
			const { uri } = await Print.printToFileAsync({ html });

			const formulario = new FormData();
			formulario.append("matricula", `${associado.matricula}`);
			formulario.append("file", {
				uri,
				type: `application/pdf`,
				name: `REQUERIMENTO_RECADASTRO_${associado.matricula}.pdf`,
			});

			const { data } = await api.post(
				"/associados/cadastrarAssinatura",
				formulario,
				{
					headers: {
						"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
						"x-access-token": token,
					},
				}
			);

			if (data.status) {
				setAlerta({ visible: false });
				setBtnRecadastrar(true);
			} else {
				setAlerta({
					visible: true,
					title: data.title,
					message: data.message,
					type: "danger",
					cancelText: "FECHAR",
					confirmText: "OK",
					showConfirm: true,
					showCancel: true,
					confirmFunction: () => setModal(true),
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

	const handleClear = () => {
		refAssoc.current.clearSignature();
		refColab.current.clearSignature();
	};

	const handleConfirm = () => {
		if (assinaturaAssociado !== "" && assinaturaColaborador !== "") {
			setAlerta({
				visible: true,
				title: "CARREGANDO ASSINATURA",
				message: <Loading size={125} />,
				showConfirm: false,
				showCancel: false,
				showIcon: false,
			});

			handleOK();
		}
	};

	const handleEndAssociado = () => {
		refAssoc.current.readSignature();
	};

	const handleEndColaborador = () => {
		refColab.current.readSignature();
	};

	useEffect(() => {
		if (props?.route?.params?.associado) {
			setAssociado(props.route.params.associado);
			setMatricula(props.route.params.associado.matricula);
			setMostrarDados(true);
		}
	}, []);

	return (
		<>
			<Header titulo="Recadastrar Associado" {...props} />
			<Modal visible={modal}>
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignContent: "center",
						alignItems: "center",
						paddingTop: 20,
					}}
				>
					<View
						style={{
							flex: 2,
							width: "90%",
							marginBottom: 20,
						}}
					>
						<WebView source={{ html: pdf }} />
					</View>
					<View
						style={{
							flex: 1,
							alignItems: "center",
						}}
					>
						{assinaturaAssociado === "" ? (
							<Button
								onPress={() => {
									setModal(false);
									setModalAssinatura(true);
								}}
								color={"#fff"}
								style={{ backgroundColor: tema.colors.primary }}
							>
								CLIQUE AQUI PARA ASSINAR
							</Button>
						) : (
							<>
								<Image
									source={{ uri: assinaturaAssociado }}
									style={{ width: 400, height: 100 }}
								/>
								<Text>Assinatura de</Text>
								<Text style={{ fontWeight: "bold" }}>
									{associado?.nome?.toUpperCase()}
								</Text>
								<View style={{ flexDirection: "row", marginTop: 5 }}>
									<Text style={{ marginHorizontal: 7 }}>
										LOCAL: FLORIANOPOLIS{" "}
									</Text>
									<Text style={{ marginHorizontal: 7 }}>DATA: 25/11/2021</Text>
								</View>
							</>
						)}
					</View>
					<View
						style={{
							flex: 1,
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<View
							style={{
								flex: 1,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							{assinaturaColaborador !== "" && (
								<Image
									source={{ uri: assinaturaColaborador }}
									style={{ width: 280, height: 70 }}
								/>
							)}
							<Text
								style={{
									marginTop: 40,
									textAlign: "center",
									fontWeight: "bold",
								}}
							>
								{nome}
							</Text>
							<Text style={{ textAlign: "center" }}>Representante ABEPOM</Text>
						</View>
						<View
							style={{
								flex: 1,
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<Text style={{ marginTop: 40 }}>bruno.horn</Text>
							<Text>Presidente da ABEPOM</Text>
						</View>
					</View>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "center",
							width: "90%",
							alignItems: "center",
							bottom: 20,
						}}
					>
						<Button
							onPress={() => setModal(false)}
							color={"#fff"}
							style={{ backgroundColor: tema.colors.primary }}
						>
							FECHAR
						</Button>
					</View>
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
						ref={refAssoc}
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
					<Text style={{ fontSize: 20, marginBottom: 10 }}>
						Recolha a assinatura do colaborador na área destacada abaixo:{" "}
					</Text>
					<Text>Assinatura de</Text>
					<Text style={{ fontWeight: "bold" }}>{nome?.toUpperCase()}</Text>
					<Signature
						ref={refColab}
						style={{ height: 100 }}
						onOK={handleOKColab}
						onEmpty={() =>
							setAlerta({
								visible: true,
								title: "ATENÇÃO!",
								message:
									"Para confirmar é necessário preencher a assinatura do colaborador.",
								showCancel: false,
								showConfirm: true,
								confirmText: "FECHAR",
							})
						}
						onEnd={handleEndColaborador}
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
							style={{ backgroundColor: tema.colors.verde }}
						>
							CONFIRMAR ASSINATURAS
						</Button>
						<Button
							onPress={() => {
								setModal(true);
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
							fontSize: 17,
						}}
					>
						Preencha os campos abaixo para efetuar o recadastramento do
						associado.
					</Text>
					<View style={{ flexDirection: "row" }}>
						<View style={{ flex: 1 }}></View>
						<View style={{ flex: 1, marginHorizontal: 5 }}>
							<TextInput
								label="Matrícula"
								value={matricula}
								mode="outlined"
								theme={tema}
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
						<View style={{ flex: 1 }}>
							<TouchableOpacity
								onPress={() => verificarMatricula()}
								style={[
									styles.linha,
									{
										justifyContent: "center",
										alignContent: "center",
										alignItems: "center",
										height: 55,
										backgroundColor: tema.colors.primary,
										marginTop: 8,
										borderRadius: 6,
									},
								]}
							>
								<Image
									source={images.buscar}
									style={{
										tintColor: "#fff",
										width: 20,
										height: 20,
										marginRight: 10,
									}}
								/>
								<Text style={{ color: "#fff", fontSize: 20 }}>BUSCAR</Text>
							</TouchableOpacity>
						</View>
						<View style={{ flex: 1 }}></View>
					</View>

					<View style={{ flex: 1, marginTop: 50 }}>
						{carregando ? (
							<View style={[styles.centralizado, { flex: 1 }]}>
								<Loading size={120} />
							</View>
						) : (
							<>
								{mostrarDados && (
									<>
										{associado.recadastrado && (
											<View
												style={{
													backgroundColor: tema.colors.verde,
													paddingVertical: 15,
													paddingHorizontal: 10,
													borderRadius: 6,
													marginBottom: 20,
												}}
											>
												<Text style={{ color: "#fff" }}>
													O associado foi recadastrado em{" "}
													{associado.data_recadastro}.
												</Text>
											</View>
										)}

										<ScrollView>
											<View style={{ flexDirection: "row", marginBottom: 15 }}>
												<View style={{ flex: 3, marginRight: 5 }}>
													<TextInput
														label="Nome"
														value={associado.nome}
														maxLength={40}
														dense
														disabled
														mode={"outlined"}
													/>
												</View>
												<View style={{ flex: 2 }}>
													<TextInput
														label="Data de Nascimento"
														value={associado.nascimento}
														keyboardType={"numeric"}
														mode={"outlined"}
														dense
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
														value={associado.sexo.Name.substring(
															0,
															1
														).toUpperCase()}
														onChangeText={(text) =>
															setAssociado({ ...associado, sexo: text })
														}
														dense
														mode={"outlined"}
														render={(props) => (
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
																		<View style={{ flex: 3, paddingTop: 5 }}>
																			<Text
																				style={{
																					fontSize: associado.sexo ? 15 : 12,
																				}}
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
																	associado.sexo.Name.substring(
																		0,
																		1
																	).toUpperCase() == "M"
																		? { Name: "MASCULINO", Value: "M" }
																		: { Name: "FEMININO", Value: "F" }
																}
																selectPlaceholderText="SELECIONE O SEXO"
																searchPlaceholderText="DIGITE O SEXO"
																onSelected={(key) =>
																	setAssociado({ ...associado, sexo: key })
																}
																onClosed={() =>
																	setAssociado({
																		...associado,
																		sexo: associado.sexo,
																	})
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
														dense
														mode={"outlined"}
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
												<View style={{ flex: 2 }}>
													<TextInput
														label="RG"
														value={associado.rg}
														maxLength={15}
														dense
														mode={"outlined"}
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
														dense
														mode={"outlined"}
														onChangeText={(text) =>
															setAssociado({
																...associado,
																telefone_comercial: text,
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
														label="Telefone Residencial"
														value={associado.telefone_residencial}
														maxLength={15}
														dense
														mode={"outlined"}
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
												<View style={{ flex: 1 }}>
													<TextInput
														label="Celular"
														value={associado.celular}
														maxLength={15}
														dense
														mode={"outlined"}
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
												<View style={{ flex: 1 }}>
													<TextInput
														label="E-mail"
														textContentType={"emailAddress"}
														maxLength={60}
														dense
														mode={"outlined"}
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
														label="CEP"
														value={associado.cep}
														maxLength={10}
														dense
														mode={"outlined"}
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
												<View style={{ flex: 2, marginRight: 5 }}>
													<TouchableOpacity
														onPress={() => buscarCep()}
														style={{
															flex: 1,
															flexDirection: "row",
															alignItems: "center",
															justifyContent: "center",
															backgroundColor: "#031e3f",
															borderRadius: 6,
															marginTop: 8,
															paddingHorizontal: 10,
														}}
													>
														<IconButton
															icon="magnify"
															color={"#fff"}
															size={20}
														/>
														<Text
															style={{
																color: "#fff",
																fontSize: 17,
																marginRight: 10,
															}}
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
														dense
														mode={"outlined"}
														maxLength={50}
														onChangeText={(text) =>
															setAssociado({ ...associado, endereco: text })
														}
													/>
												</View>
												<View style={{ flex: 1 }}>
													<TextInput
														label="Número"
														value={associado.numero}
														dense
														mode={"outlined"}
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
														dense
														mode={"outlined"}
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
														dense
														mode={"outlined"}
														maxLength={35}
														onChangeText={(text) =>
															setAssociado({ ...associado, bairro: text })
														}
													/>
												</View>
												<View style={{ flex: 1 }}>
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
														dense
														mode={"outlined"}
														render={(props) => (
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
																		<View style={{ flex: 3, paddingTop: 5 }}>
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
											<View style={{ flex: 1 }}>
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
													dense
													mode={"outlined"}
													render={(props) => (
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
																	<View style={{ flex: 3, paddingTop: 5 }}>
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
																setAssociado({
																	...associado,
																	local_trabalho: key,
																})
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
											<View style={{ flex: 1, marginVertical: 15 }}>
												<TextInput
													label="Observação"
													value={associado.observacao}
													multiline
													numberOfLines={7}
													mode={"outlined"}
													style={{ maxHeight: 200 }}
													onChangeText={(text) =>
														setAssociado({ ...associado, observacao: text })
													}
												/>
											</View>
											<View style={{ flex: 1, flexDirection: "row" }}>
												<View style={{ flex: 1 }} />
												<View style={{ flex: 2 }}>
													{btnRecadastrar ? (
														<View style={{ flexDirection: "row" }}>
															<TouchableOpacity
																onPress={() => recadastrar()}
																style={{
																	backgroundColor: tema.colors.verde,
																	justifyContent: "center",
																	alignContent: "center",
																	alignItems: "center",
																	padding: 15,
																	borderRadius: 6,
																	marginRight: 10,
																}}
															>
																<Text style={{ color: "#fff", fontSize: 15 }}>
																	RECADASTRAR ASSOCIADO
																</Text>
															</TouchableOpacity>
															<TouchableOpacity
																onPress={() => abrirModal()}
																style={{
																	backgroundColor: tema.colors.primary,
																	justifyContent: "center",
																	alignContent: "center",
																	alignItems: "center",
																	padding: 15,
																	borderRadius: 6,
																}}
															>
																<Text style={{ color: "#fff", fontSize: 15 }}>
																	RECOLHER ASSINATURA
																</Text>
															</TouchableOpacity>
														</View>
													) : (
														<TouchableOpacity
															onPress={() => abrirModal()}
															style={{
																backgroundColor: tema.colors.primary,
																justifyContent: "center",
																alignContent: "center",
																alignItems: "center",
																padding: 15,
																borderRadius: 6,
															}}
														>
															<Text style={{ color: "#fff", fontSize: 15 }}>
																RECOLHER ASSINATURA
															</Text>
														</TouchableOpacity>
													)}
												</View>
												<View style={{ flex: 1 }} />
											</View>
										</ScrollView>
									</>
								)}
							</>
						)}
					</View>
				</View>
			</SafeAreaView>
			{alerta.visible && (
				<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
			)}
		</>
	);
}

export default RecadastrarAssociado;
