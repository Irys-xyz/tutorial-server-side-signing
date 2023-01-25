import Bundlr from "@bundlr-network/client/build/node";
import { NextApiRequest, NextApiResponse } from "next";

/**
 *
 * @returns The server's private key.
 */
export async function serverInit(): Promise<Buffer> {
	const key = process.env.PAYMENT_PRIVATE_KEY; // your private key
	const bundlrNodeAddress = process.env.BUNDLR_NODE_ADDRESS;
	const rpcUrl = process.env.RPC;

	const serverBundlr = new Bundlr(
		//@ts-ignore
		bundlrNodeAddress,
		"solana",
		key,
		{
			providerUrl: rpcUrl,
		},
	);
	const publicKey = serverBundlr.currencyConfig.getSigner().publicKey;
	return publicKey;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	res.status(200).json({ pubKey: (await serverInit()).toString("hex") });
}
