exports.handler = async function(event, context) {
    // A API Key será acessada através das variáveis de ambiente do Netlify
    const API_KEY = process.env.API_KEY;
    const MODEL = "gemini-1.5-flash-latest";

    // O prompt enviado pelo frontend estará no corpo da requisição
    const { prompt } = JSON.parse(event.body);

    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Erro na API: ${errorData.error.message}` })
            };
        }

        const data = await response.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return {
            statusCode: 200,
            body: JSON.stringify({ text: generatedText })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro ao processar a sua requisição.' })
        };
    }
};
