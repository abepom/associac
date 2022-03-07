import React, { useEffect, useState } from "react";
import {
	AsyncStorage,
	Image,
	SafeAreaView,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import s, { tema } from "../../assets/style/Style";
import api from "../../services/api";
import Alert from "../components/Alert";
import Header from "../components/Header";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";
import Loading from "../components/Loading";
import { useUsuario } from "../store/Usuario";
import Input from "../components/Input";
import Combo from "../components/Combo";
import InputMask from "../components/InputMask";
import Messages from "../components/Messages";
import images from "../utils/images";
import compararValores from "../functions/compararValores";

function AlterarTipoDependente(props) {
	const { navigation } = props;
	const data_atual = new Date();
	const [usuario, setUsuario] = useUsuario();
	const { token, associado_atendimento } = usuario;
	const dependente = props?.route?.params?.dependente;
	const [tipos, setTipos] = useState([]);
	const [mostrarTaxa, setMostrarTaxa] = useState(false);
	const [solicitarAtestado, setSolicitarAtestado] = useState(false);
	const [alerta, setAlerta] = useState({});
	const [atestado, setAtestado] = useState("");
	const [cont, setCont] = useState(dependente.cont ?? "");
	const [codDep, setCodDep] = useState(dependente.cod_dep ?? "");
	const [nome, setNome] = useState(dependente.nome ?? "");
	const [sexo, setSexo] = useState(
		dependente.sexo
			? dependente.sexo == "M"
				? { Name: "MASCULINO", Value: "M" }
				: { Name: "FEMININO", Value: "F" }
			: { Name: "MASCULINO", Value: "M" }
	);
	const [nascimento, setNascimento] = useState(
		dependente.data_nascimento ?? ""
	);
	const [tipo, setTipo] = useState(
		dependente.tipo && dependente.cod_dep
			? { Name: dependente.tipo, Value: dependente.cod_dep }
			: { Name: "", Value: "" }
	);
	const [cpf, setCpf] = useState(dependente.cpf ?? "");
	const [instagram, setInstagram] = useState(dependente.instagram ?? "");
	const [facebook, setFacebook] = useState(dependente.facebook ?? "");
	const [telefone, setTelefone] = useState(dependente.telefone ?? "");
	const [celular, setCelular] = useState(dependente.celular ?? "");
	const [email, setEmail] = useState(dependente.email ?? "");

	const listarTipos = async () => {
		let ano_aniversario = parseInt(nascimento.substring(6, 10));

		switch (tipo.Value) {
			case "01":
				if (!isNaN(ano_aniversario)) {
					if (parseInt(data_atual.getFullYear()) - ano_aniversario >= 18) {
						setTipos([
							{ Name: "FILHOS MAIORES", Value: "31" },
							parseInt(data_atual.getFullYear()) - ano_aniversario < 24 && {
								Name: "UNIVERSITÁRIO(A)",
								Value: "20",
							},
						]);
					} else {
						setTipos(tipo);
					}
				} else {
					setTipos(tipo);
				}

				break;
			case "09":
				if (!isNaN(ano_aniversario)) {
					if (parseInt(data_atual.getFullYear()) - ano_aniversario >= 18) {
						setTipos([
							{ Name: "ENDEADO(A) MAIOR", Value: "15" },
							parseInt(data_atual.getFullYear()) - ano_aniversario < 24 && {
								Name: "UNIVERSITÁRIO(A)",
								Value: "20",
							},
						]);
					} else {
						setTipos(tipo);
					}
				} else {
					setTipos(tipo);
				}
				break;
			case "20":
				if (!isNaN(ano_aniversario)) {
					if (parseInt(data_atual.getFullYear()) - ano_aniversario >= 24) {
						setTipos([{ Name: "FILHOS MAIORES", Value: "31" }]);
					} else {
						setTipos(tipo);
					}
				} else {
					setTipos(tipo);
				}
				break;
			case "23":
			case "99":
				try {
					const { data } = await api({
						url: "/listarTiposDependente",
						method: "GET",
						headers: { "x-access-token": token },
					});

					let list_tipos = [];

					data.tipos.map((tipo) => {
						if (tipo.cobra_mensalidade) {
							list_tipos.push({ Name: tipo.descricao, Value: tipo.codigo });
						}
					});

					setTipos(list_tipos);
				} catch (error) {
					setTipos([]);
				}

				break;
			case "08":
				setTipos([
					{
						Name: tipo.Name.toUpperCase(),
						Value: tipo.Value,
					},
					{
						Name: "CONJUGE",
						Value: "02",
					},
				]);
				break;
			case "02":
				setTipos([
					{
						Name: tipo.Name.toUpperCase(),
						Value: tipo.Value,
					},
					{
						Name: "COMPANHEIRO(A)",
						Value: "08",
					},
				]);
				break;
			default:
				setTipos([
					{
						Name: tipo.Name.toUpperCase(),
						Value: tipo.Value,
					},
				]);
				break;
		}
	};

	function alterarTipo(codigo) {
		switch (codigo) {
			case "07":
			case "11":
			case "12":
			case "13":
			case "14":
			case "15":
			case "16":
			case "17":
			case "21":
			case "31":
			case "34":
				setMostrarTaxa(true);
				setSolicitarAtestado(false);
				break;
			case "20":
				setMostrarTaxa(false);
				setSolicitarAtestado(true);
				break;
			default:
				setMostrarTaxa(false);
				setSolicitarAtestado(false);
				break;
		}
	}

	const salvarAlteracoes = async () => {
		if (solicitarAtestado && atestado === "") {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message:
					"Para prosseguir é necessário enviar o atestado de frequência.",
				type: "danger",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
			});
			return;
		} else {
			let data_valida = new Date(
				nascimento.substring(6, 10) +
					"-" +
					nascimento.substring(3, 5) +
					"-" +
					nascimento.substring(0, 2)
			);

			if (isNaN(data_valida.getTime()) || data_valida.getFullYear() <= 1910) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "A data de nascimento informada está incorreta.",
					type: "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
				return;
			}

			if (tipo?.Name === "") {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message:
						"Para prosseguir com a alteração dos dados é necessário selecionar o tipo de dependente.",
					type: "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
				return;
			}

			setAlerta({
				visible: true,
				title: "SALVANDO INFORMAÇÕES",
				message: <Loading size={120} />,
				showIcon: false,
				showCancel: false,
				showConfirm: false,
			});

			const { data, status } = await api({
				url: "/associados/alterarTipoDependente",
				method: "POST",
				data: {
					dependente: {
						cont,
						novo_tipo: tipo,
						sexo,
						data_nascimento: nascimento,
						cpf,
						instagram,
						facebook,
						telefone,
						celular,
						email,
					},
					matricula: associado_atendimento.matricula,
				},
				headers: { "x-access-token": token },
			});

			if (status == 401) {
				setAlerta({
					visible: true,
					title: "SESSÃO EXPIRADA!",
					message: `A sua sessão expirou. Você será deslogado em 5 segundos.`,
					type: "warning",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});

				setTimeout(async () => {
					await AsyncStorage.clear().then(() =>
						navigation.navigate("Login", { id: new Date().toJSON() })
					);
				}, 5000);
			} else {
				if (data.status) {
					let dependente = associado_atendimento.dependentes.find(
						(dep) => dep.cont === cont
					);

					dependente = {
						...dependente,
						celular,
						cod_dep: tipo.Value,
						cpf,
						data_nascimento: nascimento,
						email,
						facebook,
						instagram,
						sexo: sexo.Value,
						telefone,
						tipo: tipo.Name,
					};

					let dependentes = associado_atendimento.dependentes.filter(
						(dep) => dep.cont !== cont
					);

					dependentes = [...dependentes, dependente];
					dependentes = dependentes
						.sort(compararValores("nome", "asc"))
						.sort(compararValores("pre_cadastro", "desc"));

					setUsuario({
						...usuario,
						associado_atendimento: { ...associado_atendimento, dependentes },
					});

					setAlerta({
						visible: true,
						title: data.title,
						message: data.message,
						type: "success",
						showCancel: false,
						showConfirm: true,
						confirmText: "FECHAR",
						confirmFunction: () => navigation.navigate("Inicio"),
					});
				} else {
					setAlerta({
						visible: true,
						title: data.title,
						message: data.message,
						type: "danger",
						showCancel: false,
						showConfirm: true,
						confirmText: "FECHAR",
					});
				}
			}
		}
	};

	const enviarAtestado = async () => {
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
				formulario.append("dependente", `${cont}`);
				formulario.append("tipo", "AF");
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
					setAtestado(data.link);
				}
			} catch (error) {
				setAtestado("");
			}
		}
	};

	useEffect(() => {
		listarTipos();
	}, []);

	useEffect(() => {
		alterarTipo(tipo.Value);
	}, [tipo]);

	return (
		<>
			<Header titulo="Alterar Dados de Dependente" {...props} />
			<SafeAreaView style={s.fl1}>
				<ScrollView style={[s.fl1, s.m20]}>
					<Text style={[s.tac, s.mt10, s.mb20, s.fs18]}>
						Altere os dados do dependente abaixo.
					</Text>
					<View style={[s.row, s.mb10]}>
						<View style={s.fl1}>
							<Input
								label={"Nome"}
								value={[nome, setNome]}
								disabled={true}
								returnKeyType={"next"}
								maxLength={40}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={[s.fl1, s.mr10]}>
							<Combo
								label={"Sexo"}
								pronome={"o"}
								lista={[
									{ Name: "MASCULINO", Value: "M" },
									{ Name: "FEMININO", Value: "F" },
								]}
								style={s.fs15}
								item={[sexo, setSexo]}
							/>
						</View>
						<View style={[s.fl1, s.mr10]}>
							<InputMask
								label={"Nascimento"}
								value={[nascimento, setNascimento]}
								keyboardType={"numeric"}
								mask="99/99/9999"
								maxLength={10}
							/>
						</View>
						<View style={s.fl1}>
							<InputMask
								label={"CPF"}
								value={[cpf, setCpf]}
								keyboardType={"numeric"}
								mask="999.999.999-99"
								maxLength={14}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={[s.fl1, s.mr10]}>
							<Input
								label={"Instagram"}
								value={[instagram, setInstagram]}
								maxLength={100}
							/>
						</View>
						<View style={s.fl1}>
							<Input
								label={"Facebook"}
								value={[facebook, setFacebook]}
								maxLength={100}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={s.fl1}>
							<Combo
								label={"Tipo de Dependência"}
								pronome={"o"}
								lista={tipos}
								item={[tipo, setTipo]}
							/>
						</View>
					</View>
					<View style={[s.row, s.mb10]}>
						<View style={[s.fl1, s.mr10]}>
							<InputMask
								label={"Telefone"}
								value={[telefone, setTelefone]}
								keyboardType={"numeric"}
								mask="(99) 9999-9999"
								maxLength={14}
							/>
						</View>
						<View style={s.fl1}>
							<InputMask
								label={"Celular"}
								value={[celular, setCelular]}
								keyboardType={"numeric"}
								mask="(99) 9 9999-9999"
								maxLength={16}
							/>
						</View>
					</View>
					<View style={[s.fl1, s.mb20]}>
						<View style={s.fl1}>
							<Input
								label={"E-mail"}
								value={[email, setEmail]}
								maxLength={100}
							/>
						</View>
					</View>
					{codDep !== "23" && mostrarTaxa && (
						<Messages
							titulo="ATENÇÃO!"
							subtitulo="LEMBRE O ASSOCIADO SOBRE O PAGAMENTO DA TAXA SUPLEMENTAR DE
								DEPENDENTE."
							cor={tema.colors.info}
							imagem={images.info}
							style={{ marginBottom: 20 }}
						/>
					)}
					{solicitarAtestado && (
						<View style={[s.jcc, s.aic, s.mv20]}>
							<TouchableOpacity
								onPress={() => enviarAtestado()}
								style={[s.bgcp, s.pd20, s.br6]}
							>
								<Text style={[s.fcw, s.fs20]}>
									ENVIAR ATESTADO DE FREQUÊNCIA
								</Text>
							</TouchableOpacity>
							{atestado !== "" && (
								<Image
									source={{ uri: atestado }}
									style={[s.w250, s.h250, s.mv20]}
								/>
							)}
						</View>
					)}
					<View style={[s.jcc, s.aic]}>
						<TouchableOpacity
							onPress={() => (tipo?.Name !== "" ? salvarAlteracoes() : null)}
							style={[
								s.row,
								s.jcc,
								s.aic,
								s.pd20,
								s.br6,
								{
									backgroundColor:
										tipo?.Name === ""
											? tema.colors.backdrop
											: tema.colors.primary,
								},
							]}
						>
							<Image
								source={images.sucesso}
								style={[s.w20, s.h20, s.tcw]}
								tintColor={tema.colors.background}
							/>
							<Text style={[s.fcw, s.fs20, s.ml10]}>SALVAR ALTERAÇÕES</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</SafeAreaView>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default AlterarTipoDependente;
