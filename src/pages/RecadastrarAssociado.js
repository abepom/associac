import React, { useState, useEffect, useRef } from "react";
import {
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Image,
	ScrollView,
	Modal,
} from "react-native";
import { Button, IconButton, TextInput } from "react-native-paper";
import s, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Header from "../components/Header";
import Loading from "../components/Loading";
import removerAcentos from "../functions/removerAcentos";
import Signature from "react-native-signature-canvas";
import * as Print from "expo-print";
import { WebView } from "react-native-webview";
import Alert from "../components/Alert";
import { useUsuario } from "../store/Usuario";
import InputMask from "../components/InputMask";
import Combo from "../components/Combo";
import Input from "../components/Input";
import ModalLoading from "../components/ModalLoading";
import images from "../utils/images";

function RecadastrarAssociado(props) {
	const { navigation } = props;
	const refAssoc = useRef();
	const refColab = useRef();
	const [usuario, setUsuario] = useUsuario();
	const { nome, token, associado_atendimento } = usuario;
	const [nascimento, setNascimento] = useState("");
	const [sexo, setSexo] = useState({ Name: "MASCULINO", Value: "M" });
	const [cpf, setCpf] = useState("");
	const [rg, setRg] = useState("");
	const [telefoneComercial, setTelefoneComercial] = useState("");
	const [telefoneResidencial, setTelefoneResidencial] = useState("");
	const [celular, setCelular] = useState("");
	const [email, setEmail] = useState("");
	const [cep, setCep] = useState("");
	const [endereco, setEndereco] = useState("");
	const [numero, setNumero] = useState("");
	const [complemento, setComplemento] = useState("");
	const [bairro, setBairro] = useState("");
	const [cidade, setCidade] = useState({ Name: "", Value: "" });
	const [localTrabalho, setLocalTrabalho] = useState("");
	const [observacao, setObservacao] = useState("");
	const [carregando, setCarregando] = useState(false);
	const [cidades, setCidades] = useState([]);
	const [lotacoes, setLotacoes] = useState([]);
	const [modalLoading, setModalLoading] = useState(false);
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
		verificarMatricula();
	}, []);

	const verificarMatricula = async () => {
		if (associado_atendimento.matricula !== "") {
			setCarregando(true);

			try {
				setBtnRecadastrar(false);
				setPdf("");
				setCarregando(false);
				setAssinaturaAssociado("");
				setAssinaturaColaborador("");

				if (associado_atendimento.status) {
					setNascimento(associado_atendimento.nascimento);
					setSexo(associado_atendimento.sexo);
					setCpf(associado_atendimento.cpf);
					setRg(associado_atendimento.rg);
					setTelefoneComercial(associado_atendimento.telefone_comercial);
					setTelefoneResidencial(associado_atendimento.telefone_residencial);
					setCelular(associado_atendimento.celular);
					setEmail(associado_atendimento.email);
					setCep(associado_atendimento.cep);
					setEndereco(associado_atendimento.endereco);
					setNumero(associado_atendimento.numero);
					setComplemento(associado_atendimento.complemento);
					setBairro(associado_atendimento.bairro);
					setCidade(associado_atendimento.cidade);
					setLocalTrabalho(associado_atendimento.local_trabalho);
					setObservacao(associado_atendimento.observacao);
				} else {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: associado_atendimento.message,
						type: "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});
				}
			} catch (error) {
				setCarregando(false);
				setBtnRecadastrar(true);

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
		setModalLoading(true);

		if (cep === "" || cep.length < 8) {
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
					message: "O CEP informado é inválido.",
					type: "danger",
					confirmText: "FECHAR",
					showConfirm: true,
					showCancel: false,
				});
			} else {
				let cid = cidade;

				cidades.map((c) => {
					if (
						removerAcentos(c.Name).toUpperCase() ==
						removerAcentos(dados.localidade).toUpperCase()
					) {
						cid = c;
					}
				});

				setEndereco(dados.logradouro);
				setComplemento(dados.complemento);
				setBairro(dados.bairro);
				setCidade(cid);
			}
		}

		setModalLoading(false);
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
				data: {
					associado: {
						matricula: associado_atendimento.matricula,
						nascimento,
						sexo,
						cpf,
						rg,
						telefone_residencial: telefoneResidencial,
						telefone_comercial: telefoneComercial,
						celular,
						email,
						cep,
						endereco,
						numero,
						complemento,
						bairro,
						local_trabalho: localTrabalho,
						observacao,
						cidade,
					},
				},
				headers: { "x-access-token": token },
			});

			if (data.status) {
				setUsuario({
					...usuario,
					associado_atendimento: {
						...associado_atendimento,
						nascimento,
						sexo,
						cpf,
						rg,
						telefone_comercial: telefoneComercial,
						telefone_residencial: telefoneResidencial,
						celular,
						email,
						cep,
						endereco,
						numero,
						complemento,
						bairro,
						cidade,
						local_trabalho: localTrabalho,
						observacao,
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
						<td style="width: 33%"><b>NOME:</b> ${associado_atendimento.nome}</td>
						<td style="width: 33%"><b>MATRÍCULA:</b> ${associado_atendimento.matricula}</td>
						<td style="width: 33%"><b>SEXO:</b> ${sexo.Name}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>E-MAIL:</b> ${email}</td>
						<td style="width: 33%"><b>NASCIMENTO:</b> ${nascimento}</td>
						<td style="width: 33%"><b>CPF:</b> ${cpf}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>RG:</b> ${rg}</td>
						<td colspan="2" style="width: 66%"><b>LOCAL DE TRAB.:</b> ${
							localTrabalho.Name
						}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>TELEFONE RES.:</b> ${telefoneResidencial}</td>
						<td style="width: 33%"><b>TELEFONE COM.:</b> ${telefoneComercial}</td>
						<td style="width: 33%"><b>CELULAR:</b> ${celular}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>ENDEREÇO:</b> 
							${endereco} 
							${complemento ? ` - ${complemento}` : null}
						</td>
						<td style="width: 33%"><b>Nº:</b> ${numero}</td>
						<td style="width: 33%"><b>BAIRRO:</b> ${bairro}</td>
					</tr>
					<tr>
						<td style="width: 33%"><b>CEP:</b> ${cep}</td>
						<td colspan="2" style="width: 66%"><b>CIDADE:</b> ${cidade.Name}</td>
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
					<p style="font-size:12px !important;">Assinatura de<br/><b>${associado_atendimento?.nome?.toUpperCase()}</b></p>
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
			formulario.append("matricula", `${associado_atendimento.matricula}`);
			formulario.append("file", {
				uri,
				type: `application/pdf`,
				name: `REQUERIMENTO_RECADASTRO_${associado_atendimento.matricula}.pdf`,
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

	return (
		<>
			<Header titulo="Recadastrar Associado" {...props} />
			<ModalLoading visible={modalLoading} />
			<Modal visible={modal}>
				<View style={[s.fl1, s.jcc, s.acc, s.aic, s.pdt20]}>
					<View style={[s.fl2, s.mb20, { width: "90%" }]}>
						<WebView source={{ html: pdf }} />
					</View>
					<View style={[s.fl1, s.aic]}>
						{assinaturaAssociado === "" ? (
							<Button
								onPress={() => {
									setModal(false);
									setModalAssinatura(true);
								}}
								color={"#fff"}
								style={s.bgcp}
							>
								CLIQUE AQUI PARA ASSINAR
							</Button>
						) : (
							<>
								<Image
									source={{ uri: assinaturaAssociado }}
									style={[s.w400, s.h100]}
								/>
								<Text>Assinatura de</Text>
								<Text style={s.bold}>
									{associado_atendimento?.nome?.toUpperCase()}
								</Text>
								<View style={[s.row, s.mt5]}>
									<Text style={s.mh7}>LOCAL: FLORIANOPOLIS</Text>
									<Text style={s.mh7}>DATA: 25/11/2021</Text>
								</View>
							</>
						)}
					</View>
					<View style={[s.fl1, s.row, s.jcc, s.aic]}>
						<View style={[s.fl1, s.jcc, s.aic]}>
							{assinaturaColaborador !== "" && (
								<Image
									source={{ uri: assinaturaColaborador }}
									style={{ width: 280, height: 70 }}
								/>
							)}
							<Text style={[s.bold, s.tac, s.mt40]}>{nome}</Text>
							<Text style={s.tac}>Representante ABEPOM</Text>
						</View>
						<View style={[s.fl1, s.jcc, s.aic]}>
							<Text style={s.mt40}>bruno.horn</Text>
							<Text>Presidente da ABEPOM</Text>
						</View>
					</View>
					<View
						style={[
							s.row,
							s.jcc,
							s.aic,
							s.b20,
							{
								width: "90%",
							},
						]}
					>
						<Button
							onPress={() => setModal(false)}
							color={"#fff"}
							style={s.bgcp}
						>
							FECHAR
						</Button>
					</View>
				</View>
			</Modal>
			<Modal visible={modalAssinatura}>
				<View style={[s.fl1, s.jcc, s.acc, s.aic, s.pdt35]}>
					<Text style={[s.fs20, s.mb10]}>
						Recolha a assinatura do associado na área destacada abaixo:
					</Text>
					<Text>Assinatura de</Text>
					<Text style={s.bold}>
						{associado_atendimento?.nome?.toUpperCase()}
					</Text>
					<Signature
						ref={refAssoc}
						style={s.h150}
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
					<Text style={[s.fs20, s.mb10]}>
						Recolha a assinatura do colaborador na área destacada abaixo:{" "}
					</Text>
					<Text>Assinatura de</Text>
					<Text style={s.bold}>{nome?.toUpperCase()}</Text>
					<Signature
						ref={refColab}
						style={s.h100}
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
						style={[
							s.row,
							s.jcsb,
							s.aic,
							s.b20,
							{
								width: "90%",
							},
						]}
					>
						<Button onPress={handleClear} color={"#fff"} style={s.bgcr}>
							LIMPAR ASSINATURAS
						</Button>
						<Button onPress={handleConfirm} color={"#fff"} style={s.bgcg}>
							CONFIRMAR ASSINATURAS
						</Button>
						<Button
							onPress={() => {
								setModal(true);
								setModalAssinatura(false);
							}}
							color={"#fff"}
							style={s.bgcp}
						>
							FECHAR
						</Button>
					</View>
				</View>
			</Modal>
			<SafeAreaView style={s.fl1}>
				<View style={[s.fl1, s.m20]}>
					<View style={[s.fl1, s.mt50]}>
						{carregando ? (
							<View style={[s.jcc, s.aic, s.fl1]}>
								<Loading size={120} />
							</View>
						) : (
							<>
								{associado_atendimento.recadastrado && (
									<View style={[s.mb20, s.br6, s.pd20, s.bgcg]}>
										<Text style={[s.fs20, s.fcw]}>
											O associado foi recadastrado em{" "}
											{associado_atendimento.data_recadastro}.
										</Text>
									</View>
								)}
								<ScrollView>
									<View style={[s.row, s.mb10]}>
										<View style={[s.fl3, s.mr10]}>
											<TextInput
												label="Nome"
												value={associado_atendimento.nome}
												maxLength={40}
												disabled
												mode={"outlined"}
												style={s.fs18}
												theme={tema}
											/>
										</View>
										<View style={s.fl2}>
											<InputMask
												label={"Data de Nascimento"}
												value={[nascimento, setNascimento]}
												keyboardType={"numeric"}
												mask="99/99/9999"
											/>
										</View>
									</View>
									<View style={[s.row, s.mb10]}>
										<View style={[s.fl2, s.mr10]}>
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
										<View style={[s.fl2, s.mr10]}>
											<InputMask
												label={"CPF"}
												value={[cpf, setCpf]}
												keyboardType={"numeric"}
												mask="999.999.999-99"
												maxLength={14}
											/>
										</View>
										<View style={s.fl2}>
											<Input label="RG" value={[rg, setRg]} maxLength={15} />
										</View>
									</View>
									<View style={[s.row, s.mb10]}>
										<View style={[s.fl1, s.mr10]}>
											<InputMask
												label={"Telefone Comercial"}
												value={[telefoneComercial, setTelefoneComercial]}
												keyboardType={"numeric"}
												mask="(99) 9999-9999"
											/>
										</View>
										<View style={[s.fl1, s.mr10]}>
											<InputMask
												label={"Telefone Residencial"}
												value={[telefoneResidencial, setTelefoneResidencial]}
												keyboardType={"numeric"}
												mask="(99) 9999-9999"
											/>
										</View>
										<View style={s.fl1}>
											<InputMask
												label={"Celular"}
												value={[celular, setCelular]}
												keyboardType={"numeric"}
												mask="(99) 9 9999-9999"
											/>
										</View>
									</View>
									<View style={[s.row, s.mb10]}>
										<View style={s.fl1}>
											<Input
												label={"E-mail"}
												value={[email, setEmail]}
												maxLength={60}
												textContentType={"emailAddress"}
											/>
										</View>
									</View>
									<View style={[s.row, s.mb10]}>
										<View style={[s.fl1, s.mr10]}>
											<InputMask
												label={"CEP"}
												value={[cep, setCep]}
												keyboardType={"numeric"}
												mask="99999-999"
												maxLength={10}
											/>
										</View>
										<View style={[s.fl1, s.mr10]}>
											<TouchableOpacity
												onPress={() => buscarCep()}
												style={[
													s.fl1,
													s.row,
													s.aic,
													s.jcc,
													s.bgcp,
													s.br6,
													s.pdh20,
													s.mt8,
												]}
											>
												<IconButton icon="magnify" color={"#fff"} size={20} />
												<Text style={[s.fcw, s.fs18, s.mr10]}>BUSCAR CEP</Text>
											</TouchableOpacity>
										</View>
										<View style={s.fl2}></View>
									</View>
									<View style={[s.row, s.mb10]}>
										<View style={[s.fl4, s.mr10]}>
											<Input
												label={"Endereço"}
												value={[endereco, setEndereco]}
												maxLength={50}
											/>
										</View>
										<View style={s.fl1}>
											<Input label={"Número"} value={[numero, setNumero]} />
										</View>
									</View>
									<View style={[s.row, s.mb10]}>
										<View style={[s.fl1, s.mr10]}>
											<Input
												label={"Complemento"}
												value={[complemento, setComplemento]}
												maxLength={40}
											/>
										</View>
										<View style={s.fl1}>
											<Input
												label={"Bairro"}
												value={[bairro, setBairro]}
												maxLength={35}
											/>
										</View>
									</View>
									<View style={[s.row, s.mb10]}>
										<View style={s.fl1}>
											<Combo
												label={"Cidade"}
												pronome={"a"}
												lista={cidades}
												item={[cidade, setCidade]}
											/>
										</View>
									</View>
									<View style={[s.fl1, s.mb10]}>
										<Combo
											label={"Local de Trabalho"}
											pronome={"o"}
											lista={lotacoes}
											item={[localTrabalho, setLocalTrabalho]}
										/>
									</View>
									<View style={[s.fl1, s.mb10]}>
										<TextInput
											label="Observação"
											value={observacao}
											multiline
											numberOfLines={7}
											mode={"outlined"}
											theme={tema}
											style={[s.fs18, s.mxh200]}
											onChangeText={(text) => setObservacao(text)}
										/>
									</View>
									<View style={[s.fl1, s.row]}>
										<View style={s.fl1} />
										<View style={s.fl4}>
											{btnRecadastrar ? (
												<View style={s.row}>
													<TouchableOpacity
														onPress={() => recadastrar()}
														style={[
															s.bgcg,
															s.jcc,
															s.acc,
															s.aic,
															s.pd15,
															s.br6,
															s.mr10,
															s.row,
														]}
													>
														<Image
															source={images.recadastrar_associado}
															style={[s.w35, s.h35, s.tcw]}
															tintColor={tema.colors.background}
														/>
														<Text style={[s.fcw, s.fs18, s.ml10]}>
															RECADASTRAR ASSOCIADO
														</Text>
													</TouchableOpacity>
													<TouchableOpacity
														onPress={() => abrirModal()}
														style={[
															s.bgcp,
															s.jcc,
															s.acc,
															s.aic,
															s.pd15,
															s.br6,
															s.row,
														]}
													>
														<Image
															source={images.assinatura}
															style={[s.w35, s.h35, s.tcw]}
															tintColor={tema.colors.background}
														/>
														<Text style={[s.fcw, s.fs18, s.ml10]}>
															RECOLHER ASSINATURA
														</Text>
													</TouchableOpacity>
												</View>
											) : (
												<TouchableOpacity
													onPress={() => abrirModal()}
													style={[
														s.bgcp,
														s.jcc,
														s.acc,
														s.aic,
														s.pd15,
														s.br6,
														s.row,
													]}
												>
													<Image
														source={images.assinatura}
														style={[s.w35, s.h35, s.tcw]}
														tintColor={tema.colors.background}
													/>
													<Text style={[s.fcw, s.fs18, s.ml10]}>
														RECOLHER ASSINATURA
													</Text>
												</TouchableOpacity>
											)}
										</View>
										<View style={s.fl1} />
									</View>
								</ScrollView>
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
