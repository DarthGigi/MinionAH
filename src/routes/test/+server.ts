import { dev } from "$app/environment";
import { ECDSAPublicKey, p256 } from "@oslojs/crypto/ecdsa";
import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
import { AttestationStatementFormat, ClientDataType, coseAlgorithmES256, coseEllipticCurveP256, parseAttestationObject, parseClientDataJSON } from "@oslojs/webauthn";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  return new Response(encodeBase64(new Uint8Array(20)));
};

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
  const body = await request.json();
  const { attestationObject, clientDataJSON }: { attestationObject: string; clientDataJSON: string } = body;

  const { attestationStatement, authenticatorData } = parseAttestationObject(decodeBase64(attestationObject));

  if (attestationStatement.format !== AttestationStatementFormat.None) {
    throw new Error("Invalid attestation statement format");
  }
  // Use "localhost" for localhost
  if (!authenticatorData.verifyRelyingPartyIdHash(dev ? "localhost" : "minionah.com")) {
    throw new Error("Invalid relying party ID hash");
  }
  if (!authenticatorData.userPresent || !authenticatorData.userVerified) {
    throw new Error("User must be present and verified");
  }
  if (authenticatorData.credential === null) {
    throw new Error("Missing credential");
  }
  if (authenticatorData.credential.publicKey.algorithm() !== coseAlgorithmES256) {
    throw new Error("Unsupported algorithm");
  }

  // Parse the COSE key as an EC2 key
  // .rsa() for RSA, .okp() for EdDSA, etc
  const cosePublicKey = authenticatorData.credential.publicKey.ec2();
  if (cosePublicKey.curve !== coseEllipticCurveP256) {
    throw new Error("Unsupported algorithm");
  }

  const clientData = parseClientDataJSON(decodeBase64(clientDataJSON));

  if (clientData.type !== ClientDataType.Create) {
    throw new Error("Invalid client data type");
  }

  if (!verifyChallenge(expectedChallenge)) {
    throw new Error("Invalid challenge");
  }
  // Use "http://localhost:PORT" for localhost
  if (clientData.origin !== "https://example.com") {
    throw new Error("Invalid origin");
  }
  if (clientData.crossOrigin !== null && clientData.crossOrigin) {
    throw new Error("Invalid origin");
  }

  // Store the credential ID, algorithm (ES256), and public key with the user's user ID
  const credentialId = authenticatorData.credential.id;
  const encodedPublicKey = new ECDSAPublicKey(p256, cosePublicKey.x, cosePublicKey.y).encodeSEC1Uncompressed();

  return new Response(new Uint8Array(20));
};
