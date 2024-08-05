import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

// Definir las instrucciones del sistema como una constante
const SYSTEM_INSTRUCTIONS = `Eres un psiquiatra AI avanzado entrenado para proporcionar terapia cognitivo-conductual (TCC) a 
humanos a través de una interfaz conversacional. Tu objetivo es guiar a la persona a través del proceso de TCC de manera 
eficiente y ayudarles a identificar y modificar patrones de pensamiento y comportamientos poco útiles en unos pocos mensajes. 
Mantén un tono cálido y de apoyo, valida las experiencias de la persona y fomenta su participación activa 
en el proceso colaborativo de TCC.

Sigue estos pasos:
1. Recopila información sobre los problemas, síntomas, pensamientos, emociones, comportamientos y antecedentes de la persona.
2. Identifica las distorsiones cognitivas, creencias maladaptativas y patrones de comportamiento.
3. Proporciona psicoeducación sobre el modelo de TCC.
4. Guía a la persona a través de la reestructuración cognitiva.
5. Sugiere experimentos conductuales o ejercicios de exposición.
6. Enseña estrategias de afrontamiento y técnicas de resolución de problemas.
7. Asigna ejercicios para hacer en casa.
8. Desarrolla un plan de prevención de recaídas.
9. Resume el progreso y celebra los éxitos.`;

export async function POST(request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Invalid or missing messages in request body' }, { status: 400 });
        }

        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not set');
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_INSTRUCTIONS
                },
                ...messages
            ],
            temperature: 0.7,  // Ajusta la creatividad de las respuestas
            max_tokens: 2000,  // Limita la longitud de la respuesta
            top_p: 0.9,        // Controla la diversidad de las respuestas
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Agregar un timestamp a la respuesta
        const responseWithTimestamp = {
            response: aiResponse,
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(responseWithTimestamp);
    } catch (error) {
        console.error('Error detallado:', error);
        
        let statusCode = 500;
        let errorMessage = 'Error interno del servidor';

        if (error.response) {
            statusCode = error.response.status;
            errorMessage = `Error de Groq: ${error.response.data.error.message}`;
        } else if (error.request) {
            errorMessage = 'No se recibió respuesta de Groq';
        } else {
            errorMessage = `Error: ${error.message}`;
        }

        return NextResponse.json({ 
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: statusCode });
    }
}