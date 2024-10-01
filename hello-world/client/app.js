async function callServer() {
  const response = await fetch("http://localhost:9000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "query {greeting}",
    }),
  });

  const { data } = await response.json();
  return data;
}

callServer().then((data) => {
  document.getElementById("greeting").textContent = data.greeting;
});
