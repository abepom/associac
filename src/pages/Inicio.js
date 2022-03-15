import React, { useState, useRef } from "react";
import {
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	Image,
	Keyboard,
	FlatList,
	Modal,
	Platform,
} from "react-native";
import images from "../utils/images";
import app from "../../app.json";
import s, { tema } from "../../assets/style/Style";
import { useUsuario } from "../store/Usuario";
import { Button, IconButton, TextInput } from "react-native-paper";
import { TextInputMask } from "react-native-masked-text";
import Header from "../components/Header";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import Input from "../components/Input";
import WebView from "react-native-webview";
import MenuInicio from "../components/MenuInicio";
import Dependente from "../components/Dependente";
import compararValores from "../functions/compararValores";
import Signature from "react-native-signature-canvas";
import api from "../../services/api";
import * as Print from "expo-print";

function Inicio(props) {
	const { navigation } = props;
	const refAssoc = useRef();
	let data_atual = new Date();
	const [usuario, setUsuario] = useUsuario();
	const { associado_atendimento } = usuario;
	const [matricula, setMatricula] = useState("999354");
	const [alerta, setAlerta] = useState({ visible: false });
	const [carregando, setCarregando] = useState(false);
	const [dependenteEscolhido, setDependenteEscolhido] = useState({});
	const [motivoExclusao, setMotivoExclusao] = useState("");
	const [modalTermoExclusao, setModalTermoEsclusao] = useState(false);
	const [modalExcluirDependente, setModalExcluirDependente] = useState(false);
	const [termo, setTermo] = useState({});
	const [assinaturaAssociado, setAssinaturaAssociado] = useState("");

	async function iniciarAtendimento() {
		Keyboard.dismiss();

		if (matricula !== "" && matricula.length == 6) {
			setCarregando(true);

			try {
				const { data } = await api({
					url: "/associados/verificarMatricula",
					method: "GET",
					params: { cartao: matricula },
					headers: { "x-access-token": usuario.token },
				});

				if (data.status) {
					listarDependentes(data);
				} else {
					setUsuario({
						...usuario,
						associado_atendimento: { matricula, dependentes: [] },
					});
				}
			} catch (error) {
				setUsuario({ ...usuario, associado_atendimento: null });
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

			setCarregando(false);
		} else {
			setUsuario({ ...usuario, associado_atendimento: null });
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: `Para prosseguir com o atendimento é${"\n"}necessário informar a matrícula corretamente.`,
				type: "danger",
				showConfirm: true,
				showCancel: false,
				confirmText: "FECHAR",
			});
		}
	}

	async function listarDependentes(dados) {
		const { data } = await api({
			url: "/associados/listarDependentes",
			method: "GET",
			params: {
				cartao: `${matricula}00001`,
				todos: 1,
			},
			headers: { "x-access-token": usuario.token },
		});

		setUsuario({
			...usuario,
			associado_atendimento: { ...dados, dependentes: data.dependentes },
		});
	}

	async function visualizarTermoExclusaoDependente() {
		setModalExcluirDependente(false);
		setModalTermoEsclusao(true);

		const { data } = await api({
			url: "/associados/visualizarTermo",
			method: "GET",
			params: { id_local: 8 },
			headers: { "x-access-token": usuario.token },
		});

		let t = data.termo;
		t = t.replace(
			"@DEPENDENTE",
			dependenteEscolhido.nome !== ""
				? `<b>${dependenteEscolhido.nome.toUpperCase()}</b>`
				: ""
		);

		if (Platform.OS === "ios") {
			t = t
				.replace(/font-size: 12pt !important;/g, `font-size: 30pt !important;`)
				.replace(
					/h3 style="text-align: center;"><span style="font-family: Arial, Helvetica, sans-serif;"/g,
					`h3 style="text-align: center;font-size: 40pt"><span style="font-family: Arial, Helvetica, sans-serif;"`
				);
		}

		setTermo({
			id: data.id_termo,
			texto: t,
		});
	}

	const handleEndAssociado = () => {
		refAssoc.current.readSignature();
	};

	const handleClear = () => {
		refAssoc.current.clearSignature();
	};

	const handleOK = async () => {
		setModalExcluirDependente(false);
		setModalTermoEsclusao(false);

		try {
			const requerimento = await api({
				url: "/requerimentoExclusaoDependente",
				method: "POST",
				data: {
					associado: associado_atendimento,
					dependente: {
						nome_dependente: dependenteEscolhido.nome,
						sexo_dependente:
							dependenteEscolhido.sexo === "F"
								? { Name: "Feminino", Value: "F" }
								: { Name: "Masculino", Value: "M" },
						nascimento_dependente: dependenteEscolhido.data_nascimento,
						cpf_dependente: dependenteEscolhido.cpf,
						tipo_dependente: { Name: dependenteEscolhido.tipo },
					},
					termo: termo.texto,
					assinatura: assinaturaAssociado,
					motivo: motivoExclusao,
				},
				headers: { "x-access-token": usuario.token },
			});

			if (requerimento.data.status) {
				const { uri } = await Print.printToFileAsync({
					html: requerimento.data.requerimento,
				});

				const formulario = new FormData();
				formulario.append("matricula", `${matricula}`);
				formulario.append(
					"dep",
					dependenteEscolhido.pre_cadastro ? "00" : dependenteEscolhido.cont
				);
				formulario.append(
					"nome_doc",
					`REQUERIMENTO DE EXCLUSÃO DE DEPENDENTE ${
						dependenteEscolhido.pre_cadastro ? " - PRÉ CADASTRAD" : ""
					}`
				);
				formulario.append("tipo_doc", 15);
				formulario.append("usuario", usuario.usuario);
				formulario.append("file", {
					uri,
					type: `application/pdf`,
					name: `REQUERIMENTO_EXCLUSAO_${matricula}.pdf`,
				});

				const { data } = await api.post(
					"/associados/enviarDocumento",
					formulario,
					{
						headers: {
							"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
							"x-access-token": usuario.token,
						},
					}
				);

				if (data.status) {
					const retorno = await api({
						url: "/associados/excluirDependente",
						method: "POST",
						data: {
							cartao: associado_atendimento.cartao,
							dep: dependenteEscolhido.cont,
							cd_dep: dependenteEscolhido.cod_dep,
							nome: dependenteEscolhido.nome,
							tipo: dependenteEscolhido.pre_cadastro ? 2 : 1,
							motivo: motivoExclusao,
							origem: "Associac Mobile",
						},
						headers: { "x-access-token": usuario.token },
					});

					if (retorno.data.status) {
						if (dependenteEscolhido.pre_cadastro) {
							let dependentes = associado_atendimento.dependentes.filter(
								(dep) => dep.cont !== dependenteEscolhido.cont
							);

							dependentes = dependentes
								.sort(compararValores("nome", "asc"))
								.sort(compararValores("pre_cadastro", "desc"))
								.sort(compararValores("inativo"), "asc");

							setUsuario({
								...usuario,
								associado_atendimento: {
									...associado_atendimento,
									dependentes,
								},
							});
						} else {
							let dependente = associado_atendimento.dependentes.find(
								(dep) => dep.cont === dependenteEscolhido.cont
							);

							dependente = {
								...dependente,
								inativo: 1,
								data_inativo:
									("0" + data_atual.getDate()).slice(-2) +
									"/" +
									("0" + (data_atual.getMonth() + 1)).slice(-2) +
									"/" +
									data_atual.getFullYear(),
							};

							let dependentes = associado_atendimento.dependentes.filter(
								(dep) => dep.cont !== dependenteEscolhido.cont
							);

							dependentes = [...dependentes, dependente];
							dependentes = dependentes
								.sort(compararValores("nome", "asc"))
								.sort(compararValores("pre_cadastro", "desc"))
								.sort(compararValores("inativo"), "asc");

							setUsuario({
								...usuario,
								associado_atendimento: {
									...associado_atendimento,
									dependentes,
								},
							});
						}
					}

					setAlerta({
						visible: true,
						title: retorno.data.title,
						message: retorno.data.message.replace(/@@/g, `\n`),
						type: retorno.data.status ? "success" : "danger",
						confirmText: "FECHAR",
						showConfirm: true,
						showCancel: false,
					});

					setDependenteEscolhido({});
					setMotivoExclusao("");
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
					});
				}
			} else {
				console.log(requerimento);

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
		} catch (error) {
			console.log(error);
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

	const handleOKAssoc = (signature) => {
		setAssinaturaAssociado(signature);

		return true;
	};

	const handleConfirm = () => {
		if (assinaturaAssociado !== "") {
			setAlerta({
				visible: true,
				title: "CADASTRANDO ASSINATURA",
				message: <Loading size={125} />,
				showConfirm: false,
				showCancel: false,
				showIcon: false,
			});

			handleOK();
		}
	};

	return (
		<>
			<Header titulo={"Associac Mobile"} {...props} />
			<Modal visible={modalExcluirDependente} transparent>
				<View style={[s.fl1, s.jcc, s.aic, s.bgcm]}>
					<View
						style={[
							s.jcc,
							s.aic,
							s.pd20,
							s.m20,
							s.br6,
							s.bgcw,
							{
								width: "85%",
							},
						]}
					>
						<Text style={[s.tac, s.mb10, s.fs20]}>
							Você realmente deseja excluir o dependente{`\n`}
							<Text style={s.bold}>{dependenteEscolhido.nome}</Text>?
						</Text>
						<View style={[s.row, s.mt10]}>
							<Input
								label={"MOTIVO"}
								value={[motivoExclusao, setMotivoExclusao]}
								maxLength={300}
								returnKeyType={"done"}
								style={s.fullw}
							/>
						</View>
						{motivoExclusao.length < 5 ? (
							<TouchableOpacity
								onPress={() =>
									setAlerta({
										visible: true,
										title: "ATENÇÃO!",
										message: "Para prosseguir preencha o motivo de exclusão.",
										type: "warning",
										showConfirm: true,
										confirmText: "FECHAR",
										showCancel: false,
									})
								}
								style={[s.row, s.mt20, s.br6, s.jcc, s.aic, s.bgcd, s.pd20]}
							>
								<Image
									source={images.atencao}
									style={[s.w20, s.h20, s.tcw]}
									tintColor={tema.colors.background}
								/>
								<Text style={[s.fcw, s.fs20, s.ml10]}>PREENCHA O MOTIVO</Text>
							</TouchableOpacity>
						) : (
							<TouchableOpacity
								onPress={() => visualizarTermoExclusaoDependente()}
								style={[s.row, s.mt20, s.br6, s.jcc, s.aic, s.pd20, s.bgcp]}
							>
								<Image
									source={images.assinatura}
									style={[s.w20, s.h20, s.tcw]}
									tintColor={tema.colors.background}
								/>
								<Text style={[s.fcw, s.fs20, s.ml10]}>RECOLHER ASSINATURA</Text>
							</TouchableOpacity>
						)}
					</View>
					<TouchableOpacity
						onPress={() => setModalExcluirDependente(false)}
						style={[s.row, s.bgcp, s.br50, s.pd15]}
					>
						<Image
							source={images.fechar}
							style={[s.w20, s.h20, s.tcw]}
							tintColor={tema.colors.background}
						/>
					</TouchableOpacity>
				</View>
			</Modal>
			<Modal animationType="fade" visible={modalTermoExclusao}>
				<View style={[s.row, s.fl1, s.jcc, s.aic, s.bgcm]}>
					<View style={[s.fl1, s.br6, s.m20]}>
						<View style={[s.fl1, s.br6, s.bgcw]}>
							<Text style={[s.tac, s.fs25, s.bold, s.mt50]}>
								Termo de Exclusão de Dependente
							</Text>
							<Text style={[s.tac, s.fs25, s.bold, s.mt20]}>
								{associado_atendimento?.nome?.toUpperCase()}
							</Text>
							<>
								<WebView
									source={{ html: termo.texto }}
									style={[s.jcc, s.aic, s.mv6]}
									textZoom={170}
									containerStyle={[s.fs15, s.pd20]}
									startInLoadingState={true}
									renderLoading={() => (
										<View style={[s.fl1, s.jcc, s.aic]}>
											<Loading size={80} />
										</View>
									)}
								/>
							</>
							<View style={s.fl3}>
								<Text style={s.tac}>Assinatura de</Text>
								<Text style={[s.tac, s.bold]}>
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
							</View>
							<View style={[s.row, s.jcsb, s.aic, s.b20, s.m20]}>
								<Button onPress={handleClear} color={"#fff"} style={s.bgcr}>
									LIMPAR ASSINATURA
								</Button>
								<Button onPress={handleConfirm} color={"#fff"} style={s.bgcg}>
									CONFIRMAR ASSINATURA E EXCLUIR DEPENDENTE
								</Button>
							</View>
						</View>
						<View style={[s.jcc, s.aic, s.m10]}>
							<TouchableOpacity
								onPress={() => {
									setModalTermoEsclusao(false);
									setModalExcluirDependente(false);
									setMotivoExclusao("");
									setAssinaturaAssociado("");
								}}
								style={[s.row, s.bgcp, s.br50, s.pd15, s.w50, s.h50]}
							>
								<Image
									source={images.fechar}
									style={[s.w20, s.h20, s.tcw]}
									tintColor={tema.colors.background}
								/>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			<SafeAreaView style={s.fl1}>
				<View style={[s.jcc, s.aic, s.mt20]}>
					<View style={s.row}>
						<View style={s.fl1} />
						<View style={s.fl2}>
							<TextInput
								label="Matrícula"
								mode={"outlined"}
								value={matricula}
								keyboardType={"numeric"}
								maxLength={6}
								theme={tema}
								style={s.fs25}
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
						<View style={s.fl1} />
					</View>
					<View style={[s.row, s.mt10]}>
						<View style={s.fl1} />
						<View style={s.fl2}>
							<TouchableOpacity
								onPress={() => iniciarAtendimento()}
								style={[s.row, s.aic, s.jcc, s.bgcp, s.br6, s.h50]}
							>
								<IconButton
									icon="arrow-right-drop-circle-outline"
									color={"#fff"}
									size={25}
								/>
								<Text style={[s.fcw, s.fs20]}>INICIAR ATENDIMENTO</Text>
							</TouchableOpacity>
						</View>
						<View style={s.fl1} />
					</View>
				</View>
				{carregando ? (
					<Loading size={95} />
				) : (
					<>
						{usuario?.associado_atendimento ? (
							<>
								<View
									style={[
										s.mh20,
										s.mv10,
										s.bgcw,
										s.pd20,
										s.br6,
										s.el1,
										{
											borderWidth:
												usuario?.associado_atendimento?.tipo === "01" ? 2 : 0,
											borderColor:
												usuario?.associado_atendimento?.tipo === "01"
													? "#07A85C"
													: "#fff",
										},
									]}
								>
									{usuario?.associado_atendimento?.status ? (
										<>
											<Text style={[s.fs20, s.bold]}>
												{usuario?.associado_atendimento?.nome} (
												{usuario?.associado_atendimento?.matricula})
											</Text>
											<Text style={[s.fs18]}>
												SITUAÇÃO ATUAL:{" "}
												<Text style={[s.bold, s.ml10]}>
													{usuario?.associado_atendimento?.tipo === "01"
														? "ASSOCIADO ABEPOM"
														: usuario?.associado_atendimento?.tipo === "31"
														? "ASSOCIADO SINPOFESC"
														: "NÃO ASSOCIADO - COM DADOS PRÉ-PREENCHIDOS"}
												</Text>
											</Text>
											{usuario?.associado_atendimento?.data_saida == 1 && (
												<Text style={[s.fcr, s.fs15]}>
													O ASSOCIADO DEVERÁ PAGAR JOIA
												</Text>
											)}
										</>
									) : (
										<>
											<Text style={[s.fs20, s.bold]}>
												MILITAR SEM REGISTRO COM A ABEPOM
											</Text>
										</>
									)}
								</View>
								<FlatList
									data={usuario?.associado_atendimento?.dependentes}
									keyExtractor={(item) => item.cont}
									numColumns={1}
									style={[s.fl1, s.mb20, s.mih200, s.mxh340, s.mh20]}
									renderItem={({ item }) => {
										return (
											<Dependente
												item={item}
												{...props}
												setDependenteEscolhido={setDependenteEscolhido}
												setModalExcluirDependente={setModalExcluirDependente}
												setAlerta={setAlerta}
											/>
										);
									}}
								/>
								{usuario?.associado_atendimento?.dependentes?.length > 3 ? (
									<View style={[s.row, s.jcc, s.aic, s.mb20]}>
										<Image
											source={images.seta}
											style={[s.w20, s.h20, s.tr90, , s.tcp]}
											tintColor={tema.colors.primary}
										/>
										<Text style={[s.fs15, s.ml10, s.fcp]}>
											ARRASTE PARA VER MAIS DEPENDENTES
										</Text>
									</View>
								) : null}
								<MenuInicio
									{...props}
									associado={usuario?.associado_atendimento}
								/>
							</>
						) : null}
					</>
				)}

				<View style={[s.bgcp, s.b0, s.psa, s.fullw, s.h60, s.jcc]}>
					<TouchableOpacity
						onPress={() => navigation.navigate("Sair")}
						style={[s.row, s.r0, s.psa, s.h60, s.w60, s.jcc, s.aic, s.zit]}
					>
						<Image
							source={images.sair}
							style={[s.w35, s.h35, s.tcw, s.mr10]}
							tintColor={"#fff"}
						/>
					</TouchableOpacity>
					<Text style={[s.fcw, s.tac]}>
						Versão: {app.expo.version.substring(0, 3)}
					</Text>
					<Text style={[s.fcw, s.tac]}>
						Usuário: <Text style={s.bold}>{usuario.nome}</Text>
					</Text>
				</View>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default Inicio;
