interface XboxServiceTokenResponse {
  IssueInstant: string;
  NotAfter: string;
  Token: string;
  DisplayClaims: DisplayClaim;
}

interface MCTokenResponse {
  username: string;
  roles: any[];
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MCUserInfo {
  id: string;
  name: string;
  skins: MCSkinInfo[];
  capes: MCCapeInfo[];
}

interface MCInfo {
  id: string;
  state: "ACTIVE" | "INACTIVE";
  url: string;
}
interface MCSkinInfo extends MCInfo {
  variant: string;
}
interface MCCapeInfo extends MCInfo {
  alias: string;
}

interface AuthInfo {
  mc_info: MCUserInfo;
}

interface DisplayClaim {
  xui: {
    uhs: string;
  }[];
}

export async function getMinecraftInfo(access_token: string): Promise<MCUserInfo> {
  if (!access_token) throw Error("No access_token provided.");
  const xbl: XboxServiceTokenResponse = await authTokenToXBL(access_token);
  const xsts: XboxServiceTokenResponse = await xblToXsts(xbl);
  const mcToken: MCTokenResponse = await xstsToMc(xsts);
  const mcInfo: MCUserInfo = await getMCInfo(mcToken);

  return mcInfo;
}

async function authTokenToXBL(access_token: string): Promise<XboxServiceTokenResponse> {
  return await fetch("https://user.auth.xboxlive.com/user/authenticate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: `{
      "Properties": {
        "AuthMethod": "RPS",
        "SiteName": "user.auth.xboxlive.com",
        "RpsTicket": "d=${access_token}"
      },
      "RelyingParty": "http://auth.xboxlive.com",
      "TokenType": "JWT"
    }`
  }).then(async (res) => {
    if (res.status != 200) {
      console.error(res.status, res.statusText);
      throw new Error("Error getting XBL token");
    }

    return await res.json();
  });
}

async function xblToXsts(token: XboxServiceTokenResponse): Promise<XboxServiceTokenResponse> {
  return await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: `{
      "Properties": {
        "SandboxId": "RETAIL",
        "UserTokens": [
            "${token.Token}"
        ]
      },
      "RelyingParty": "rp://api.minecraftservices.com/",
      "TokenType": "JWT"
    }`
  }).then(async (res) => {
    if (res.status != 200) {
      console.error(res.status, res.statusText);
      throw new Error("Error getting XSTS token");
    }

    return await res.json();
  });
}

async function xstsToMc(token: XboxServiceTokenResponse): Promise<MCTokenResponse> {
  return await fetch("https://api.minecraftservices.com/authentication/login_with_xbox", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: `{
      "identityToken": "XBL3.0 x=${token.DisplayClaims.xui[0].uhs};${token.Token}"
    }`
  }).then(async (res) => {
    if (res.status != 200) {
      console.error(res.status, res.statusText);
      throw new Error("Error getting MC token");
    }

    return await res.json();
  });
}

async function getMCInfo(mc_token: MCTokenResponse): Promise<MCUserInfo> {
  return await fetch("https://api.minecraftservices.com/minecraft/profile", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + mc_token.access_token
    }
  }).then(async (res) => {
    if (res.status != 200) {
      console.error(res.status, res.statusText);
      throw new Error("Error getting MC info");
    }

    return await res.json();
  });
}

async function waitForRequestText(req: Request): Promise<any> {
  return await fetch(req).then(async (res) => {
    if (res.status != 200) {
      console.error(res.status, res.statusText);
      throw new Error("Error getting request text");
    }

    return await res.json();
  });
}
