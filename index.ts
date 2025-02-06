import { fetch } from "bun";
require("better-logging")(console);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const file_path = "tokens.json";
const PORT = process.env.PORT;

async function addToken(newToken: any, newJuiceToken: any) {
  try {
    const file = Bun.file(file_path);
    const jsonData = await file.json();

    jsonData[newToken] = newJuiceToken;

    await Bun.write(file_path, JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function removeToken(tokenToRemove: any) {
  try {
    const file = Bun.file(file_path);
    const jsonData = await file.json();
    delete jsonData[tokenToRemove];
    await Bun.write(file_path, JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error(error);
  }
}

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/add") {
      const code = url.searchParams.get("code");
      const juicetoken = url.searchParams.get("juice");
      fetch(
        "https://slack.com/api/oauth.v2.access?code=" +
          code +
          "&client_id=" +
          CLIENT_ID +
          "&client_secret=" +
          CLIENT_SECRET +
          "&redirect_uri=https://juicestats.spectralo.hackclub.app/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.info(
            "Added 1 user with token : " + data.authed_user.access_token,
          );
          addToken(data.authed_user.access_token, juicetoken);
        })
        .catch((error) => {
          console.error("Error adding token:", error);
        });
    }
    if (url.pathname === "/remove") {
      const code = url.searchParams.get("code");
      fetch(
        "https://slack.com/api/oauth.v2.access?code=" +
          code +
          "&client_id=" +
          CLIENT_ID +
          "&client_secret=" +
          CLIENT_SECRET +
          "&redirect_uri=https://juicestats.spectralo.hackclub.app/remove",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.info(
            "Removed 1 user with token : " + data.authed_user.access_token,
          );
          console.info(data);
          removeToken(data.authed_user.access_token);
        });
    }
    return new Response("JuiceStats!");
  },
});
