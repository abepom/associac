import React, { useState, useEffect } from "react";
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
import HTMLView from "react-native-htmlview";
import Alert from "../components/Alert";
import Loading from "../components/Loading";
import compararValores from "../functions/compararValores";
import images from "../utils/images";

function CadastrarDependente(props) {
	const { navigation } = props;
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

	useEffect(() => {
		listarTermoDependenteLegal();
		listarTermoDependenteEspecial();
		listarTiposDependente();
	}, []);

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
				};

				let dependentes = [...associado_atendimento.dependentes, dependente];
				dependentes = dependentes
					.sort(compararValores("nome", "asc"))
					.sort(compararValores("pre_cadastro", "desc"));

				setUsuario({
					...usuario,
					associado_atendimento: { ...associado_atendimento, dependentes },
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
						<TouchableOpacity
							style={{
								flexDirection: "row",
								flex: 1,
								margin: 0,
								padding: 15,
								borderRadius: 5,
								justifyContent: "center",
								alignItems: "center",
								backgroundColor: tema.colors.primary,
								borderWidth: 1,
								borderColor: tema.colors.accent,
							}}
							onPress={() => cadastrar()}
						>
							<Image
								source={images.sucesso}
								style={[s.w20, s.h20, s.tcw]}
								tintColor={tema.colors.background}
							/>
							<Text style={{ color: "#fff", marginLeft: 10 }}>
								PRÉ-CADASTRAR
							</Text>
						</TouchableOpacity>
					)}
					<View style={{ height: 100 }} />
				</ScrollView>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default CadastrarDependente;
