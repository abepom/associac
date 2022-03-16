import React, { useEffect, useRef, useState } from "react";
import {
	View,
	SafeAreaView,
	ImageBackground,
	Image,
	TouchableOpacity,
	Text,
	Keyboard,
	AsyncStorage,
} from "react-native";
import { TextInput } from "react-native-paper";
import { tema } from "../../assets/style/Style";
import Loading from "../components/Loading";
import Alert from "../components/Alert";
import api from "../../services/api";
import { useUsuario } from "../store/Usuario";
import images from "../utils/images";
import * as Updates from "expo-updates";
import Constants from "expo-constants";
import app from "../../app.json";
import s from "../../assets/style/Style";

function Login(props) {
	const [usuario, setUsuario] = useUsuario();
	const [nome, setNome] = useState("");
	const [senha, setSenha] = useState("");
	const [alerta, setAlerta] = useState({ visible: false });

	const senhaRef = useRef(null);

	useEffect(() => {
		AsyncStorage.clear();
		verificarAtualizacoes();
	}, []);

	async function verificarAtualizacoes() {
		if (Constants.isDevice) {
			const { isAvailable } = await Updates.checkForUpdateAsync();
			if (isAvailable) {
				await Updates.fetchUpdateAsync();
			}
		}
	}

	const entrar = async () => {
		if (nome && senha) {
			Keyboard.dismiss();

			setAlerta({
				visible: true,
				title: "EFETUANDO LOGIN",
				message: <Loading size={120} />,
				showIcon: false,
				showCancel: false,
				showConfirm: false,
				width: "40%",
			});

			try {
				const { data } = await api.post("/intranet/login", {
					usuario: nome,
					senha,
				});

				if (data.status) {
					setUsuario({
						usuario: nome,
						senha,
						codigo_local: data.dados.codigo_local,
						nome: data.dados.nome,
						email: data.dados.email,
						token: data.token,
						administrador: true,
						assinatura: data.dados.assinatura,
					});

					props.navigation.reset({ index: 0, routes: [{ name: "Inicio" }] });
					props.navigation.navigate("Inicio");
				} else {
					setAlerta({
						visible: true,
						title: "ATENÇÃO!",
						message: data.message,
						type: "danger",
						showCancel: false,
						showConfirm: true,
						confirmText: "FECHAR",
					});
				}
			} catch (error) {
				setAlerta({
					visible: true,
					title: "ATENÇÃO!",
					message: "Ocorreu um erro ao tentar efetuar o login.",
					type: "danger",
					showCancel: false,
					showConfirm: true,
					confirmText: "FECHAR",
				});
			}
		} else {
			setAlerta({
				visible: true,
				title: "ATENÇÃO!",
				message: "Para prosseguir é necessário preencher o usuário e a senha.",
				type: "danger",
				showCancel: false,
				showConfirm: true,
				confirmText: "FECHAR",
			});
		}
	};

	return (
		<>
			<ImageBackground
				source={images.bg}
				style={[s.fl1, s.bgcib, s.fullw, s.fullh]}
				resizeMode={"cover"}
			>
				<SafeAreaView style={[s.fl1, s.psa, s.t0, s.b0, s.l0, s.r0]}>
					<View style={[s.fl1, s.jcc, s.aic]}>
						<View style={[s.fl1, s.jcfe]}>
							<Image source={images.logo_abepom} style={[s.w200, s.h200]} />
						</View>
						<View style={[s.fl1, s.fullw, s.pd65, s.aic, s.jcc]}>
							<View style={[s.fl1, s.fullw]}>
								<TextInput
									label="Usuário"
									value={nome}
									theme={tema}
									onChangeText={setNome}
									style={s.fs25}
									returnKeyType={"next"}
									onSubmitEditing={() => senhaRef?.current?.focus()}
								/>
								<TextInput
									label="Senha"
									ref={senhaRef}
									secureTextEntry
									textContentType={"password"}
									value={senha}
									theme={tema}
									onChangeText={setSenha}
									style={[s.mt20, s.fs25]}
								/>
								<View style={s.row}>
									<View style={s.fl1}>
										<TouchableOpacity
											onPress={entrar}
											style={[s.bgcw, s.pd15, s.mt20, s.br6]}
										>
											<Text style={[s.fcp, s.fs25, s.tac]}>ENTRAR</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</View>
					</View>
					<Text style={[s.fcw, s.tac, s.mb10]}>
						Versão: {app.expo.version.substring(0, 3)}
					</Text>
				</SafeAreaView>
			</ImageBackground>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default Login;
