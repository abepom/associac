import React from "react";
import { Dimensions, Text, View } from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import LottieView from "lottie-react-native";
import { tema } from "../../assets/style/Style";

//https://lottiefiles.com/share/xd0c8rja
//https://iconscout.com/lotties/success?price=free

function Alert(props) {
	const { alerta, setAlerta } = props;

	const {
		visible = false,
		title = "ATENÇÃO!",
		message = "Ocorreu um erro ao tentar executar a função.",
		type = "danger",
		showCancel = true,
		cancelText = "FECHAR",
		showConfirm = false,
		confirmText = "OK!",
		confirmFunction = () => hideAlert(),
		closeOnTouch = false,
		showIcon = true,
	} = alerta;

	let icon = { caminho: "", largura: 250, altura: 250 };
	let confirmColor = tema.colors.primary;

	switch (type) {
		case "success":
			icon = {
				caminho: require(`../../assets/img/alert-success.json`),
				largura: 180,
				altura: 180,
			};

			confirmColor = tema.colors.verde;
			break;
		case "warning":
			icon = {
				caminho: require(`../../assets/img/alert-warning.json`),
				largura: 180,
				altura: 180,
			};

			confirmColor = tema.colors.amarelo;

			break;
		case "danger":
			icon = {
				caminho: require(`../../assets/img/alert-danger.json`),
				largura: 150,
				altura: 150,
			};

			confirmColor = tema.colors.vermelho;

			break;
		default:
			icon = { caminho: require(`../../assets/img/alert-success.json`) };
			break;
	}

	const hideAlert = () => {
		return setAlerta({ ...alerta, visible: false });
	};

	return (
		<>
			<AwesomeAlert
				show={visible}
				showProgress={false}
				title={title}
				message={
					<View
						style={{
							alignItems: "center",
							flex: 1,
							width: Dimensions.get("screen").width - 230,
						}}
					>
						{showIcon && (
							<LottieView
								source={icon.caminho}
								autoPlay
								loop={false}
								style={{
									width: icon.largura,
									height: icon.altura,
								}}
							/>
						)}
						<View style={{ flexGrow: 1, flexDirection: "row" }}>
							<Text
								style={{
									flex: 1,
									textAlign: "center",
									marginBottom: 20,
									fontSize: 18,
								}}
							>
								{message}
							</Text>
						</View>
					</View>
				}
				closeOnTouchOutside={closeOnTouch}
				closeOnHardwareBackPress={false}
				showCancelButton={showCancel}
				showConfirmButton={showConfirm}
				cancelText={cancelText}
				confirmText={confirmText}
				onCancelPressed={() => {
					hideAlert();
				}}
				onConfirmPressed={confirmFunction}
				contentContainerStyle={{
					width: "90%",
				}}
				overlayStyle={{
					backgroundColor: "#03254EDD",
				}}
				titleStyle={{
					width: "100%",
					textAlign: "center",
					borderBottomWidth: 1,
					borderBottomColor: "#ccc",
					paddingBottom: 20,
					marginBottom: 20,
					fontSize: 25,
					fontWeight: "bold",
				}}
				messageStyle={{
					alignContent: "center",
					alignItems: "center",
				}}
				confirmButtonStyle={{
					backgroundColor: confirmColor,
				}}
				confirmButtonTextStyle={{ fontSize: 20, margin: 10, color: "#fff" }}
				cancelButtonStyle={{ backgroundColor: tema.colors.backdrop }}
				cancelButtonTextStyle={{ fontSize: 20, margin: 10, color: "#fff" }}
			/>
		</>
	);
}

export default Alert;
