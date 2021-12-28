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
			});

			try {
				const { data } = await api.post("/intranet/login", {
					usuario: nome,
					senha,
				});

				if (data.status) {
					setUsuario({
						usuario: nome,
						senha: senha,
						codigo_local: data.dados.codigo_local,
						nome: data.dados.nome,
						email: data.dados.email,
						token: data.token,
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
				style={{
					flex: 1,
					backgroundColor: "#031e3f",
					width: "100%",
					height: "100%",
				}}
				resizeMode={"cover"}
			>
				<SafeAreaView
					style={{
						flex: 1,
						position: "absolute",
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
					}}
				>
					<View
						style={{
							flex: 1,
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<View
							style={{
								flex: 1,
								justifyContent: "flex-end",
							}}
						>
							<Image
								source={images.logo_abepom}
								style={{ width: 200, height: 200 }}
							/>
						</View>
						<View
							style={{
								flex: 1,
								width: "100%",
								padding: 65,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<View
								style={{
									flex: 1,
									width: "100%",
								}}
							>
								<TextInput
									label="Usuário"
									value={nome}
									theme={tema}
									onChangeText={setNome}
									style={{ fontSize: 25 }}
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
									style={{ marginTop: 20, fontSize: 25 }}
								/>
								<View style={{ flexDirection: "row" }}>
									<View style={{ flex: 1 }}></View>
									<View style={{ flex: 1 }}>
										<TouchableOpacity
											onPress={() => entrar()}
											style={{
												backgroundColor: tema.colors.background,
												padding: 30,
												marginTop: 20,
												borderRadius: 6,
											}}
										>
											<Text
												style={{
													color: tema.colors.primary,
													fontSize: 22,
													textAlign: "center",
												}}
											>
												ENTRAR
											</Text>
										</TouchableOpacity>
									</View>
									<View style={{ flex: 1 }}></View>
								</View>
							</View>
						</View>
					</View>
					<Text
						style={{ color: "#fff", textAlign: "center", marginBottom: 10 }}
					>
						Versão: {app.expo.version.substring(0, 3)}
					</Text>
				</SafeAreaView>
			</ImageBackground>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default Login;
