export type MCAuthProfile = {
  id: string;
  name: string;
  properties: {
    name: string;
    value: {
      timestamp: number;
      profileId: string;
      profileName: string;
      signatureRequired: boolean;
      textures: {
        SKIN: {
          url: string;
        };
        CAPE?: {
          url: string;
        };
      };
    };
    signature: string;
  }[];
  profileActions: string[];
  legacy: boolean;
};

export async function getMcAuthInfo(access_token: string): Promise<MCAuthProfile> {
  const res = await fetch("https://mc-auth.com/api/v2/profile ", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token
    }
  });
  return await parseMinecraftProfile(res);
}

export async function getMinecraftInfo(uuid: string): Promise<MCAuthProfile> {
  const res = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, {
    method: "GET"
  });
  return await parseMinecraftProfile(res);
}

export async function parseMinecraftProfile(res: Response) {
  if (res.status != 200) {
    console.error(res.status, res.statusText);
    throw new Error("Error getting MC profile");
  }
  const body = await res.json();
  const data = body.profile ?? body;
  const properties = data.properties;
  const propertiesValueJSON = JSON.parse(Buffer.from(properties[0].value, "base64").toString("utf-8"));
  return {
    id: data.id,
    name: data.name,
    properties: [
      {
        name: properties[0].name,
        value: propertiesValueJSON,
        signature: properties[0].signature
      }
    ],
    profileActions: data.profileActions,
    legacy: data.legacy
  };
}
