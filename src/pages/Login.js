import React, { useRef, useState } from "react";
import {
	View,
	SafeAreaView,
	ImageBackground,
	Image,
	TouchableOpacity,
	Text,
	Keyboard,
} from "react-native";
import { TextInput } from "react-native-paper";
import { tema } from "../../assets/style/Style";
import images from "../utils/images";
import Alert from "../components/Alert";
import api from "../../services/api";
import { useUsuario } from "../store/Usuario";
import Loading from "../components/Loading";

function Login(props) {
	const [usuario, setUsuario] = useUsuario();
	const [login, setLogin] = useState("");
	const [senha, setSenha] = useState("");
	const [alerta, setAlerta] = useState({ visible: false });

	const senhaRef = useRef(null);

	const entrar = async () => {
		if (login !== "" && senha !== "") {
			Keyboard.dismiss();

			setAlerta({
				visible: true,
				title: "EFETUANDO LOGIN",
				message: <Loading size={120} />,
				showIcon: false,
				showCancel: false,
				showConfirm: false,
			});

			const { data } = await api.intranet.post("/login", {
				usuario: login,
				senha,
			});

			if (data.status) {
				setUsuario({
					usuario: login,
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
									value={login}
									theme={tema}
									onChangeText={(text) => setLogin(text)}
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
									onChangeText={(text) => setSenha(text)}
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
				</SafeAreaView>
			</ImageBackground>
			<Alert {...props} alerta={alerta} setAlerta={setAlerta} />
		</>
	);
}

export default Login;
