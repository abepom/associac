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
	const [assinaturaAssociado, setAssinaturaAssociado] = useState("");
	const [btnRecadastrar, setBtnRecadastrar] = useState(false);
	const [alerta, setAlerta] = useState({});
	const [termo, setTermo] = useState({});

	useEffect(() => {
		listarCidades();
		listarLotacoes();
		verificarMatricula();
		listarTermoRecadastro();
	}, []);

	const verificarMatricula = async () => {
		if (associado_atendimento.matricula !== "") {
			setCarregando(true);

			try {
				setBtnRecadastrar(false);
				setCarregando(false);
				setAssinaturaAssociado("");

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

	async function listarTermoRecadastro() {
		const { data } = await api({
			url: "/associados/visualizarTermo",
			method: "GET",
			params: { id_local: 18 },
			headers: { "x-access-token": token },
		});

		setTermo({
			id: data.id_termo,
			texto: data.termo,
		});
	}

	const abrirModal = () => {
		setAssinaturaAssociado("");
		setModal(true);
	};

	const handleOKAssoc = (signature) => {
		setAssinaturaAssociado(signature);

		return true;
	};

	const handleOK = async () => {
		setModal(false);

		try {
			if (usuario?.assinatura?.length <= 0) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: `Para prosseguir é necessário cadastrar${"\n"}a assinatura do usuário.`,
					type: "danger",
					cancelText: "FECHAR",
					confirmText: "OK, CADASTRAR ASSINATURA",
					showConfirm: true,
					showCancel: true,
					confirmFunction: () => navigation.navigate("Perfil"),
				});
			} else {
				const requerimento = await api({
					url: "/requerimentoRecadastroAssociado",
					method: "POST",
					data: {
						associado: {
							matricula: associado_atendimento.matricula,
							nome: associado_atendimento.nome,
							sexo,
							email,
							nascimento,
							cpf,
							rg,
							local_trabalho: localTrabalho,
							telefone_residencial: telefoneResidencial,
							telefone_comercial: telefoneComercial,
							celular,
							endereco,
							complemento,
							numero,
							bairro,
							cep,
							cidade,
						},
						termo: termo.texto,
						assinatura: assinaturaAssociado,
						assinatura_colaborador: usuario.assinatura,
					},
					headers: { "x-access-token": token },
				});

				if (requerimento.data.status) {
					const { uri } = await Print.printToFileAsync({
						html: requerimento.data.requerimento,
					});

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
				} else {
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
		} else {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: `Para prosseguir é necessário solicitar${"\n"}a assinatura ao associado.`,
				type: "warning",
				showConfirm: true,
				showCancel: false,
				confirmText: "FECHAR",
			});
		}
	};

	const handleEndAssociado = () => {
		refAssoc.current.readSignature();
	};

	return (
		<>
			<Header titulo="Recadastrar Associado" {...props} />
			<ModalLoading visible={modalLoading} />
			<Modal visible={modal}>
				<View style={[s.fl1, s.jcc, s.acc, s.aic, s.pdt20]}>
					<View style={[s.fl2, s.mb20, { width: "90%" }]}>
						<Text style={[s.mt40, s.bold, s.fs20, s.tac, s.mb10]}>
							{associado_atendimento.nome.toUpperCase()}
						</Text>
						<WebView
							source={{ html: termo.texto }}
							textZoom={175}
							style={[s.fl3, s.mb20]}
						/>
						<View style={s.fl1}>
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
							<View style={[s.row, s.aic, s.mh20, s.mb50]}>
								<TouchableOpacity
									style={[
										s.row,
										s.fl1,
										s.m0,
										s.pd15,
										s.br6,
										s.jcc,
										s.aic,
										s.bgcr,
										s.mr10,
									]}
									onPress={handleClear}
								>
									<Image
										source={images.trash}
										style={[s.w20, s.h20, s.tcw]}
										tintColor={tema.colors.background}
									/>
									<Text style={[s.fcw, s.ml10]}>LIMPAR ASSINATURA</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										s.row,
										s.fl1,
										s.m0,
										s.pd15,
										s.br6,
										s.jcc,
										s.aic,
										s.bgcg,
										s.mr10,
									]}
									onPress={handleConfirm}
								>
									<Image
										source={images.sucesso}
										style={[s.w20, s.h20, s.tcw]}
										tintColor={tema.colors.background}
									/>
									<Text style={[s.fcw, s.ml10]}>CONFIRMAR ASSINATURA</Text>
								</TouchableOpacity>
							</View>
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
											style={[s.fs18, s.mxh200, s.mb50]}
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
