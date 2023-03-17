import { useState } from "react";
import WebBundlr from "@bundlr-network/client/build/web";
import fileReaderStream from "filereader-stream";



export default function Home() {
	const [message, setMessage] = useState<string>("");
	const [fileUploadedURL, setFileUploadedURL] = useState<string>("");
	const [uploadedURL, setUploadedURL] = useState<string>("");
	const [fileToUpload, setFileToUpload] = useState();
	const [fileType, setFileType] = useState<string>("");

	const handleFile = async (e) => {
		setMessage("");
		const newFiles = e.target.files;
		if (newFiles.length === 0) return;

		setFileToUpload(newFiles[0]);
		setFileType(newFiles[0]["type"]);
	};

	/**
	 * Called when a user clicks the "Upload" button
	 */
	const uploadDataBundlr = async () => {
		// clear the message
		setMessage("");

		// check that a file has been chosen
		if (!fileToUpload || !fileType) {
			setMessage("Please choose a file to upload first.");
			return;
		}

		// obtain the server's public key
		const pubKeyRes = (await (await fetch("/api/publicKey")).json()) as unknown as {
			pubKey: string;
		};
		const pubKey = Buffer.from(pubKeyRes.pubKey, "hex");

		// create a provider
		const provider = {
			// for ETH wallets
			getPublicKey: async () => {
				return pubKey;
			},
			getSigner: () => {
				return provider;
			},
			signMessage: async (message: any) => {
				let convertedMsg = Buffer.from(message).toString("hex");
				const res = await fetch("/api/signData", {
					method: "POST",
					body: JSON.stringify({
						signatureData: convertedMsg,
					}),
				});
				const { signature } = await res.json();
				const bSig = Buffer.from(signature, "hex");
				if (message === "sign this message to connect to Bundlr.Network") return bSig;
				// pad & convert so it's in the format the signer expects to have to convert from.
				const pad = Buffer.concat([Buffer.from([0]), Buffer.from(bSig)]).toString("hex");
				return pad;

			},
		};

		// if your app is lazy-funding uploads, this next section
		// can be used. alternatively you can delete this section and
		// do a bulk up-front funding of a node.
		// 1. first create the datastream and get the size
		const dataStream = fileReaderStream(fileToUpload);

		// 2. then pass the size to the lazyFund API route
		const fundTx = await fetch("/api/lazyFund", {
			method: "POST",
			body: dataStream.size,
		});

		console.log("Funding successful fundTx=", fundTx);

		// finally create a new WebBundlr object using the
		// provider created with server info.
		const bundlr = new WebBundlr("https://devnet.bundlr.network", "matic", provider);
		await bundlr.ready();
		console.log("bundlr.ready()=", bundlr);

		// and upload the file
		const tx = await bundlr.upload(dataStream, {
			tags: [{ name: "Content-Type", value: fileType }],
		});
		console.log("upload tx=", tx);

		// and share the results
		console.log(`File uploaded ==> https://arweave.net/${tx.id}`);
		setMessage(`File uploaded ==>`);
		setFileUploadedURL("https://arweave.net/" + tx.id);
	};

	return (
		<div id="about" className="w-full h-screen bg-background text-text pt-10">
			<div className="flex flex-col items-start w-full h-full">
				<div className="pl-5 w-full">
					<div className="text-left pb-8">
						<p className="text-4xl font-bold inline border-b-4 border-[#D3D9EF]">
							Server-Side Signing Uploader ...
						</p>
						<p className="text-base mt-3 ml-5">
							Demo of using server-side signing to upload a file.
							<br />
						</p>
					</div>
				</div>

				<div className="w-full ">
					<div className="flex flex-col py-5 ml-10">
						<label className="pr-5 block mb-2 font-bold text-black underline decoration-[#D3D9EF]">
							Upload file
						</label>
						<div className="flex flex-row">
							<input
								type="file"
								onChange={handleFile}
								className="w-1/3 px-1 py-2 block text-sm text-black border-[#D3D9EF] rounded-lg cursor-pointer bg-[#D3D9EF]"
								multiple="single"
								name="files[]"
							/>
							<button
								className="ml-5 bg-primary hover:bg-[#D3D9EF] text-background font-bold py-1 px-3 border-4 border-[#D3D9EF]"
								onClick={uploadDataBundlr}
							>
								Upload
							</button>
						</div>

						<p className="text-messageText text-sm text-red">{message}</p>
						{fileUploadedURL && (
							<p className="text-messageText text-sm text-red">
								<a className="underline" href={fileUploadedURL} target="_blank">
									{fileUploadedURL}
								</a>
							</p>
						)}
						<p className="text-black text-sm">
							{uploadedURL && (
								<a className="underline" href={uploadedURL} target="_blank">
									{uploadedURL}
								</a>
							)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
