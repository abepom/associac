import React from "react";
import { Platform, View, TouchableOpacity, Image, Text } from "react-native";
import Constants from "expo-constants";
import styles, { tema } from "../../assets/style/Style";
import imagens from "../utils/images";

function Header(props) {
	const { navigation } = props;

	return (
		<>
			<View
				style={{
					flexDirection: "row",
					backgroundColor: tema.colors.primary,
					height: Platform.OS === "ios" ? 60 + Constants.statusBarHeight : 60,
					width: "100%",
					paddingTop: Platform.OS == "ios" ? Constants.statusBarHeight : 0,
				}}
			>
				<View style={[styles.centralizado, { flex: 1 }]}>
					<TouchableOpacity
						style={{
							height: "100%",
							width: "100%",
							justifyContent: "center",
							alignItems: "center",
						}}
						onPress={() => navigation.goBack()}
					>
						<Image
							source={imagens.seta}
							style={{
								width: 25,
								height: 25,
								transform: [{ rotateY: "180deg" }],
								tintColor: "#fff",
							}}
							tintColor="#fff"
						/>
					</TouchableOpacity>
				</View>
				<View style={[styles.centralizado, styles.linha, { flex: 4 }]}>
					<View style={{ paddingRight: 10 }}>
						<Image
							source={imagens.logo_abepom}
							style={{ width: 25, height: 25 }}
						/>
					</View>
					<View style={{ justifyContent: "center", alignItems: "center" }}>
						{props.titulo.length > 21 ? (
							<View style={styles.linha}>
								<Text style={{ color: "#fff", fontSize: 14 }}>
									{props.titulo.substring(0, 26)}
								</Text>
								{props.titulo.length > 26 ? (
									<Text
										style={{
											color: "#fff",
											fontSize: 10,
											textAlignVertical: "bottom",
										}}
									>
										...
									</Text>
								) : null}
							</View>
						) : (
							<Text style={{ color: "#fff", fontSize: 17 }}>
								{props.titulo}
							</Text>
						)}
						{!!props.subtitulo ? (
							<Text style={{ color: "#fff", fontSize: 11 }}>
								{props.subtitulo}
							</Text>
						) : null}
					</View>
				</View>
				<View style={[styles.centralizado, { flex: 1 }]}>
					<View></View>
				</View>
			</View>
		</>
	);
}

export default Header;
