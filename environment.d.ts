declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PAYMENT_PRIVATE_KEY: string;
			BUNDLR_NODE_ADDRESS: string;
			PAYmENT_PUBLIC_KEY: string;
			RPC: string;
		}
	}
}
