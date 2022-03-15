import React, { useState, useEffect, useRef } from "react";
import {
	SafeAreaView,
	Platform,
	ScrollView,
	TouchableOpacity,
	Text,
	View,
	Image,
} from "react-native";
import Header from "../components/Header";
import { TextInput } from "react-native-paper";
import { TextInputMask } from "react-native-masked-text";
import api from "../../services/api";
import { useUsuario } from "../store/Usuario";
import s, { tema } from "../../assets/style/Style";
import Combo from "../components/Combo";
import * as Print from "expo-print";
import HTMLView from "react-native-htmlview";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import compararValores from "../functions/compararValores";
import images from "../utils/images";
import Signature from "react-native-signature-canvas";

function CadastrarDependente(props) {
	const { navigation } = props;
	const refAssoc = useRef();
	const [usuario, setUsuario] = useUsuario();
	const { token, associado_atendimento } = usuario;
	const [nome, setNome] = useState("");
	const [cpf, setCpf] = useState("");
	const [nascimento, setNascimento] = useState("");
	const [sexo, setSexo] = useState({ Name: "MASCULINO", Value: "M" });
	const [alerta, setAlerta] = useState({});
	const [carregando, setCarregando] = useState(false);
	const [tipo, setTipo] = useState({
		Name: "",
		Value: "",
		CobraMensalidade: false,
	});
	const [tiposDependente, setTiposDependente] = useState([]);
	const [termoDependenteLegal, setTermoDependenteLegal] = useState({
		id: 0,
		texto: "",
	});
	const [termoDependenteEspecial, setTermoDependenteEspecial] = useState({
		id: 0,
		texto: "",
	});
	const [assinaturaAssociado, setAssinaturaAssociado] = useState("");

	useEffect(() => {
		listarTermoDependenteLegal();
		listarTermoDependenteEspecial();
		listarTiposDependente();
	}, []);

	const handleOKAssoc = (signature) => {
		setAssinaturaAssociado(signature);

		return true;
	};

	const handleEndAssociado = () => {
		refAssoc.current.readSignature();
	};

	const handleClear = () => {
		refAssoc.current.clearSignature();
	};

	async function listarTiposDependente() {
		const { data } = await api({
			url: "/listarTiposDependente",
			method: "GET",
			params: {},
			headers: { "x-access-token": token },
		});

		let tipos = [];

		data.tipos.map((tipo, index) => {
			tipos.push({
				Name: tipo.descricao,
				Value: tipo.codigo,
				CobraMensalidade: tipo.cobra_mensalidade === 1 ? true : false,
			});
		});

		setTiposDependente(tipos);
	}

	async function listarTermoDependenteLegal() {
		const { data } = await api({
			url: "/associados/visualizarTermo",
			method: "GET",
			params: { id_local: associado_atendimento.tipo === "31" ? 16 : 10 },
			headers: { "x-access-token": token },
		});

		let termo = data.termo;

		if (Platform.OS === "ios") {
			termo = termo
				.replace(/font-size: 12pt !important;/g, `font-size: 30pt !important;`)
				.replace(
					/h3 style="text-align: center;"><span style="font-family: Arial, Helvetica, sans-serif;"/g,
					`h3 style="text-align: center;font-size: 40pt"><span style="font-family: Arial, Helvetica, sans-serif;"`
				);
		}

		setTermoDependenteLegal({
			id: data.id_termo,
			texto: termo,
		});
	}

	async function listarTermoDependenteEspecial() {
		const { data } = await api({
			url: "/associados/visualizarTermo",
			method: "GET",
			params: { id_local: associado_atendimento.tipo === "31" ? 16 : 11 },
			headers: { "x-access-token": token },
		});

		let termo = data.termo;
		termo = termo
			.replace("@TITULAR", associado_atendimento.nome)
			.replace(
				"@DEPENDENTE",
				nome !== "" ? `<b>${nome.toUpperCase()}</b>` : ""
			);

		if (Platform.OS === "ios") {
			termo = termo
				.replace(/font-size: 12pt !important;/g, `font-size: 30pt !important;`)
				.replace(
					/h3 style="text-align: center;"><span style="font-family: Arial, Helvetica, sans-serif;"/g,
					`h3 style="text-align: center;font-size: 40pt"><span style="font-family: Arial, Helvetica, sans-serif;"`
				);
		}

		setTermoDependenteEspecial({
			id: data.id_termo,
			texto: termo,
		});
	}

	async function cadastrar() {
		setCarregando(true);

		if (
			nome === "" ||
			cpf === "" ||
			nascimento === "" ||
			sexo.Value === "" ||
			tipo.Value === ""
		) {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Para prosseguir com o cadastro é necessário preencher todos os campos do formulário.",
				type: "danger",
				confirmText: "FECHAR",
				showConfirm: true,
				showCancel: false,
			});
		} else {
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
					url: "/requerimentoInclusaoDependente",
					method: "POST",
					data: {
						associado: associado_atendimento,
						dependente: {
							nome_dependente: nome,
							sexo_dependente: sexo,
							nascimento_dependente: nascimento,
							cpf_dependente: cpf,
							tipo_dependente: tipo,
						},
						termo: tipo.CobraMensalidade
							? termoDependenteEspecial.texto
							: termoDependenteLegal.texto,
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
					formulario.append("dep", "00");
					formulario.append(
						"nome_doc",
						"REQUERIMENTO DE INCLUSÃO DE DEPENDENTE"
					);
					formulario.append("tipo_doc", 14);
					formulario.append("usuario", usuario.usuario);
					formulario.append("file", {
						uri,
						type: `application/pdf`,
						name: `REQUERIMENTO_INCLUSAO_DEPENDENTE_${associado_atendimento.matricula}.pdf`,
					});

					const retorno = await api.post(
						"/associados/enviarDocumento",
						formulario,
						{
							headers: {
								"Content-Type": `multipart/form-data; boundary=${formulario._boundary}`,
								"x-access-token": usuario.token,
							},
						}
					);

					if (retorno.data.status) {
						const { data } = await api({
							url: "/associados/cadastrarDependente",
							method: "POST",
							data: {
								cartao: associado_atendimento.cartao,
								nome,
								cpf,
								nascimento,
								sexo: sexo.Value,
								tipo: tipo.Value,
								origem: "Associac Mobile",
								termo: tipo.CobraMensalidade
									? termoDependenteEspecial
									: termoDependenteLegal,
							},
							headers: { "x-access-token": token },
						});

						if (data.status) {
							let dependente = {
								caminho_imagem: "",
								cartao: "",
								cartao_enviado: 0,
								cartao_recebido: 0,
								cartao_solicitado: 0,
								celular: "",
								cod_dep: tipo.Value,
								cont: data.cont,
								cpf,
								data_nascimento: nascimento,
								email: "",
								facebook: "",
								instagram: "",
								nome,
								nome_plano: "",
								possui_plano: 0,
								pre_cadastro: 1,
								sexo: sexo.Value,
								telefone: "",
								tipo: tipo.Name,
								inativo: 0,
								data_inativo: "",
							};

							let dependentes = [
								...associado_atendimento.dependentes,
								dependente,
							];
							dependentes = dependentes
								.sort(compararValores("nome", "asc"))
								.sort(compararValores("pre_cadastro", "desc"))
								.sort(compararValores("inativo", "asc"));

							setUsuario({
								...usuario,
								associado_atendimento: {
									...associado_atendimento,
									dependentes,
								},
							});

							setNome("");
							setCpf("");
							setNascimento("");
							setSexo({ Name: "MASCULINO", Value: "M" });
							setTipo({ Name: "", Value: "", CobraMensalidade: false });

							setAlerta({
								visible: true,
								title: data.title,
								message: data.message.replace(/@@@@/g, `\n`),
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
								message: data.message.replace(/@@@@/g, `\n`),
								type: "danger",
								confirmText: "FECHAR",
								showConfirm: true,
								showCancel: false,
							});
						}
					} else {
						setAlerta({
							visible: true,
							title: retorno.data.title,
							message: retorno.data.message,
							type: "danger",
							cancelText: "FECHAR",
							showConfirm: false,
							showCancel: true,
						});
					}
				} else {
					setAlerta({
						visible: true,
						title: requerimento.data.title,
						message: requerimento.data.message,
						type: "danger",
						cancelText: "FECHAR",
						showConfirm: false,
						showCancel: true,
					});
				}
			}
		}

		setCarregando(false);
	}

	function renderNode(node, index, siblings, parent, defaultRenderer) {
		if (node.name == "p") {
			return (
				<Text
					key={index}
					style={{
						textAlign: "justify",
						fontSize: 17,
					}}
				>
					{defaultRenderer(node.children, parent)}
				</Text>
			);
		}
	}

	return (
		<>
			<Header
				titulo="Cadastrar Dependente"
				{...props}
				voltar={true}
				voltarPara={{ name: "Inicio" }}
			/>
			<SafeAreaView style={s.fl1}>
				<View style={[s.aic, s.m10]}>
					<>
						<HTMLView
							value={
								tipo.CobraMensalidade
									? termoDependenteEspecial.texto
									: termoDependenteLegal.texto
							}
							paragraphBreak={"\n"}
							renderNode={renderNode}
							style={[s.mt20, s.pdh20]}
						/>
					</>
				</View>
				<ScrollView style={{ flex: 1, padding: 30 }}>
					<TextInput
						label="Nome"
						value={nome}
						mode="outlined"
						style={{ marginBottom: 10 }}
						theme={tema}
						onChangeText={(texto) => {
							setTermoDependenteEspecial({
								...termoDependenteEspecial,
								texto:
									termoDependenteEspecial.texto.split("<strong>")[0] +
									`<strong>${texto.toUpperCase()}</strong>` +
									termoDependenteEspecial.texto.split("</strong>")[1],
							});
							setNome(texto);
						}}
					/>
					<TextInput
						label="CPF"
						value={cpf}
						mode="outlined"
						style={{ marginBottom: 10 }}
						theme={tema}
						onChangeText={(texto) => setCpf(texto)}
						render={(props) => <TextInputMask {...props} type={"cpf"} />}
						returnKeyType="done"
					/>
					<View style={{ flexDirection: "row" }}>
						<View style={{ flex: 1, marginRight: 5 }}>
							<TextInput
								label="Nascimento"
								value={nascimento}
								mode="outlined"
								keyboardType="numeric"
								style={{ marginBottom: 10 }}
								theme={tema}
								onChangeText={(texto) => setNascimento(texto)}
								returnKeyType="done"
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
						<View style={{ flex: 1, marginLeft: 5 }}>
							<Combo
								label={"Sexo"}
								pronome={"o"}
								lista={[
									{ Name: "FEMININO", Value: "FEMININO" },
									{ Name: "MASCULINO", Value: "MASCULINO" },
								]}
								item={[sexo, setSexo]}
								style={{ marginBottom: 10 }}
							/>
						</View>
					</View>
					<View style={{ flexDirection: "row" }}>
						<View style={{ flex: 1, marginRight: 5 }}>
							<Combo
								label={"Tipo da Dependência"}
								pronome={"o"}
								lista={tiposDependente}
								item={[tipo, setTipo]}
								style={{ marginBottom: 10 }}
							/>
						</View>
						{associado_atendimento.tipo === "31" ? (
							<View style={{ flex: 1, marginLeft: 5 }}>
								<TextInput
									label="TAXA DE ADESÃO"
									value={"R$ 30,00"}
									mode="outlined"
									disabled={true}
									style={{ marginBottom: 20 }}
								/>
							</View>
						) : (
							<>
								{tipo.CobraMensalidade && (
									<View style={{ flex: 1, marginLeft: 5 }}>
										<TextInput
											label="TAXA MENSAL"
											value={"R$ 20,00"}
											mode="outlined"
											disabled={true}
											style={{ marginBottom: 20 }}
										/>
									</View>
								)}
							</>
						)}
					</View>
					<Text style={[s.tac, s.mt20]}>Assinatura de</Text>
					<Text style={[s.bold, s.mb20, s.tac]}>
						{associado_atendimento?.nome?.toUpperCase()}
					</Text>
					<Signature
						ref={refAssoc}
						style={s.h300}
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
						html {background: #f1f1f1}
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
					{carregando ? (
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								flex: 1,
							}}
						>
							<Loading size={95} />
						</View>
					) : (
						<View style={s.row}>
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
									s.bgcp,
									s.ml10,
								]}
								onPress={() => cadastrar()}
							>
								<Image
									source={images.sucesso}
									style={[s.w20, s.h20, s.tcw]}
									tintColor={tema.colors.background}
								/>
								<Text style={[s.fcw, s.ml10]}>PRÉ-CADASTRAR</Text>
							</TouchableOpacity>
						</View>
					)}
					<View style={{ height: 100 }} />
				</ScrollView>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default CadastrarDependente;
