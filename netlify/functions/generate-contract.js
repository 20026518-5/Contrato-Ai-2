exports.handler = async function(event, context) {
    const API_KEY = process.env.API_KEY;
    
    // ATUALIZADO: Modelo 2.5 Flash (Padrão 2026)
    const MODEL = "gemini-2.5-flash";

    const { prompt } = JSON.parse(event.body);

    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
       // Mantemos v1beta, que é compatível com os modelos 2.5
       const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro detalhado da API:", errorData);
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
        console.error("Erro interno:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Ocorreu um erro ao processar a sua requisição.' })
        };
    }
};
