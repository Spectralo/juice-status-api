Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    // Handle OPTIONS preflight request
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

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

    return new Response("JuiceStats!", {
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow any origin
        "Content-Type": "text/plain",
      },
    });
  },
});
