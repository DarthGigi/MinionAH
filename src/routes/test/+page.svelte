<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { decodeBase64, encodeBase64 } from "@oslojs/encoding";
  import type { PageData } from "./$types";

  export let data: PageData;

  const userId = new Uint8Array(20);
  crypto.getRandomValues(userId);

  const passkey = async () => {
    const challenge = await (await fetch("/test")).text();
    console.log(decodeBase64(challenge));
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: decodeBase64(challenge),
        user: {
          displayName: data.user!.username,
          id: userId,
          name: data.user!.username // user identifier like username or email
        },
        rp: {
          name: "MinionAH"
        },
        pubKeyCredParams: [
          {
            alg: -7, // ECDSA with P-256 and SHA-256
            type: "public-key"
          }
        ],
        attestation: "none", // none for passkeys
        authenticatorSelection: {
          userVerification: "required"
        }
      }
    });
    if (!(credential instanceof PublicKeyCredential)) {
      throw new Error("Failed to create public key");
    }
    if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
      throw new Error("Unexpected error");
    }

    const response = await fetch("/test", {
      method: "POST",
      // this example uses JSON but you can use something like CBOR to get something more compact
      body: JSON.stringify({
        attestationObject: encodeBase64(new Uint8Array(credential.response.attestationObject)),
        clientDataJSON: encodeBase64(new Uint8Array(credential.response.clientDataJSON))
      })
    });
  };
</script>

<Button on:click={passkey}>Passkey</Button>
