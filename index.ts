import axios from "axios";
import { fetch } from "bun";

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
    console.log("Token removed successfully.");
  } catch (error) {
    console.error(error);
  }
}

Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    console.log("URL is : " + url.toString());
    console.log("Juice Token is : " + url.searchParams.get("juice"));
    console.log("Code is : " + url.searchParams.get("code"));

    if (url.pathname === "/add") {
      const code = url.searchParams.get("code");
      const juicetoken = url.searchParams.get("juice");
      fetch(
        "https://slack.com/api/oauth.v2.access?code=" +
          code +
          "&client_id=" +
          CLIENT_ID +
          "&client_secret=" +
          CLIENT_SECRET,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          console.log("Adding token:", data.access_token + " " + juicetoken);
          addToken(data.access_token, juicetoken);
        })
        .catch((error) => {
          console.error("Error adding token:", error);
        });
    }
    if (url.pathname === "/remove") {
      const code = url.searchParams.get("code");
      axios
        .post("https://slack.com/api/oauth.v2.access", {
          code: code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        })
        .then((response) => {
          removeToken(response.data.access_token);
        })
        .catch((error) => {
          console.error("Error removing token:", error);
        });
    }
    return new Response("JuiceStats!");
  },
});
