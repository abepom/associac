import { useCallback } from "react";
import { useStore } from "./store";

export const useUsuario = () => {
	const [store, setStore] = useStore();

	const setUsuario = useCallback(
		(usuario) => setStore((prev) => ({ ...prev, usuario })),
		[]
	);

	return [store && store.usuario, setUsuario];
};
