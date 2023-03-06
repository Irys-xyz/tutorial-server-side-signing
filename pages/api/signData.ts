import Bundlr from "@bundlr-network/client/build/node";
import type { NextApiRequest, NextApiResponse } from "next";
import HexInjectedSolanaSigner from "arbundles/src/signing/chains/HexInjectedSolanaSigner";

/**
 *
 * @returns A signed version of the data, signatureData, as sent by the client.
 */
export async function signDataOnServer(signatureData: Buffer): Promise<Buffer> {
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

	const encodedMessage = Buffer.from(signatureData);

	const signature = await serverBundlr.currencyConfig.sign(encodedMessage);

	const isValid = await HexInjectedSolanaSigner.verify(
		serverBundlr.currencyConfig.getPublicKey() as Buffer,
		signatureData,
		signature,
	);

	return Buffer.from(signature);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const body = JSON.parse(req.body);
	const signatureData = Buffer.from(body.signatureData, "hex");
	const signature = await signDataOnServer(signatureData);
	res.status(200).json({ signature: signature.toString("hex") });
}
