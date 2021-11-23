import React, { useState } from "react";
import { View, Animated, Image, Easing } from "react-native";
import imagens from "../utils/images";

export default function Loading(props) {
	let { color, size = 80, icon = true } = props;

	const [arcoVerde] = useState(new Animated.Value(0));
	const [arcoVermelho] = useState(new Animated.Value(0));

	Animated.loop(
		Animated.sequence([
			Animated.parallel([
				Animated.timing(arcoVerde, {
					toValue: 1,
					duration: 600,
					useNativeDriver: false,
					easing: Easing.linear,
				}),
				Animated.timing(arcoVermelho, {
					toValue: 1,
					duration: 600,
					useNativeDriver: false,
					easing: Easing.linear,
				}),
			]),
			Animated.delay(650),
		])
	).start();

	const giroVerde = arcoVerde.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "-360deg"],
	});

	const giroVermelho = arcoVermelho.interpolate({
		inputRange: [0, 1],
		outputRange: ["0deg", "360deg"],
	});

	return (
		<View
			style={{
				width: size,
				height: size,
				alignSelf: "center",
				alignItems: "center",
				justifyContent: "center",
				margin: 10,
			}}
		>
			<Animated.View
				style={{
					width: size,
					height: size,
					transform: [{ rotate: giroVerde }],
					position: "absolute",
				}}
			>
				<Image
					source={imagens.linha_verde}
					style={{ width: size, height: size, tintColor: color ?? "#00A758" }}
					tintColor={color ?? "#00A758"}
				/>
			</Animated.View>
			<Animated.View
				style={{
					width: size,
					height: size,
					transform: [{ rotate: giroVermelho }],
					position: "absolute",
				}}
			>
				<Image
					source={imagens.linha_vermelha}
					style={{ width: size, height: size, tintColor: color ?? "#EE2E32" }}
					tintColor={color ?? "#EE2E32"}
				/>
			</Animated.View>
			{icon ? (
				<>
					{!color ? (
						<Image
							source={imagens.circulo_branco}
							style={{ width: size, height: size }}
						/>
					) : null}
					<Image
						source={imagens.circulo_estrela_vazada}
						style={{
							width: size,
							height: size,
							position: "absolute",
							tintColor: color ?? "#3D3F94",
						}}
						tintColor={color ?? "#3D3F94"}
					/>
				</>
			) : null}
		</View>
	);
}
