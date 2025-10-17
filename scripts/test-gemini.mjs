const API_TARGETS = [
  { version: "v1beta", model: "gemini-1.5-flash" },
  { version: "v1beta", model: "gemini-1.0-pro" },
  { version: "v1", model: "gemini-pro" }
];
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Erro: defina a variável de ambiente GEMINI_API_KEY antes de executar o teste.");
  process.exit(1);
}

const prompt = "Elabore um contrato de prestação de serviços de desenvolvimento de software web entre a empresa AlphaTech e o cliente BetaCorp.";
const payload = { contents: [{ parts: [{ text: prompt }] }] };

async function tryGenerate() {
  let lastErrorMessage = "";

  for (const [index, { version, model }] of API_TARGETS.entries()) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responseBody = await response.json();

      if (response.ok) {
        const generatedText = responseBody?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          console.log(`Contrato gerado com a API ${version}/${model}:\n`);
          console.log(generatedText);
          return;
        }

        lastErrorMessage = `Resposta sem conteúdo de contrato na API ${version}/${model}.`;
        continue;
      }

      const apiMessage = responseBody?.error?.message ?? response.statusText;
      lastErrorMessage = `Erro na API (${version}/${model}): ${apiMessage}`;

      const isModelVersionError = response.status === 404
        || (apiMessage && /is not found for API version|is not supported for generateContent/i.test(apiMessage));
      if (!isModelVersionError || index === API_TARGETS.length - 1) {
        break;
      }
    } catch (err) {
      lastErrorMessage = `Falha ao chamar API (${version}/${model}): ${err.message}`;
      break;
    }
  }

  throw new Error(lastErrorMessage || "Não foi possível gerar um contrato com a API Gemini.");
}

tryGenerate().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
