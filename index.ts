import axios from "axios";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const file_path = "tokens.json";
const PORT = process.env.PORT;

async function addToken(newToken: string, newJuiceToken: any) {
  try {
    const file = Bun.file(file_path);
    const jsonData = await file.json();

    jsonData[newToken] = newJuiceToken;

    await Bun.write(file_path, JSON.stringify(jsonData, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function removeToken(tokenToRemove: string) {
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
      try {
        axios
          .post("https://slack.com/api/oauth.v2.access", {
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
          })
          .then((response) => {
            addToken(response.data.access_token, juicetoken);
          });
      } catch (error) {
        console.log("failed : /");
      }
    }
    if (url.pathname === "/remove") {
      const code = url.searchParams.get("code");
      try {
        axios
          .post("https://slack.com/api/oauth.v2.access", {
            code: code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
          })
          .then((response) => {
            removeToken(response.data.access_token);
          });
      } catch (error) {
        console.log("failed : /");
      }
    }
    return new Response("JuiceStats!");
  },
});
