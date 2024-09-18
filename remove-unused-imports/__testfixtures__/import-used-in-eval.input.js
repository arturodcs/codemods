import { secretKey } from "./secrets";

function getSecret() {
  return eval("secretKey");
}

export default getSecret;
