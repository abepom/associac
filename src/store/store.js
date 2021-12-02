import React, { createContext, useState, useContext, useEffect } from "react";
import { AsyncStorage } from "react-native";

const StoreContext = createContext([{}, () => {}]);

export const useStore = () => {
	const [state, setState] = useContext(StoreContext);
	return [state, setState];
};

export const deleteStore = () => {
	const [state, setState] = useContext(StoreContext);
	return [state, setState];
};

export const StoreProvider = ({ children }) => {
	const [state, setState] = useState({ cartao: null, senha: null });

	const carregarDados = async () => {
		try {
			const data = await AsyncStorage.getItem("usuario");

			if (!!data) {
				setState({ ...JSON.parse(data) });
			} else {
				setState({ cartao: null, senha: null });
			}
		} catch (error) {}
	};

	useEffect(() => {
		carregarDados();
	}, []);

	const salvarDados = async () => {
		try {
			const dadosAntigos = await AsyncStorage.getItem("usuario");

			if (state != dadosAntigos && state != null) {
				await AsyncStorage.setItem("usuario", JSON.stringify(state));
			}
		} catch (error) {}
	};

	useEffect(() => {
		salvarDados();
	}, [state]);

	return (
		<StoreContext.Provider value={[state, setState]}>
			{children}
		</StoreContext.Provider>
	);
};
