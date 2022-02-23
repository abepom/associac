import React from "react";
import { Modal, Text, View } from "react-native";
import s from "../../assets/style/Style";
import Loading from "./Loading";

export default (props) => {
	const { visible } = props;

	return (
		<Modal animationType="fade" transparent visible={visible}>
			<View style={[s.fl1, s.jcc, s.aic, s.bgcm]}>
				<View style={[s.jcc, s.aic, s.pd20, s.m10, s.br6, s.bgcw]}>
					<Loading size={90} />
					<Text>CARREGANDO...</Text>
				</View>
			</View>
		</Modal>
	);
};
