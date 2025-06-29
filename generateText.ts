import { OpenAI } from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:11434/v1',
  apiKey: 'ollama', // API key is required but not used with Ollama
});

const answerMyQuestion = async (prompt: string) => {
  try {
    const response = await client.chat.completions.create({
      model: 'llama3', // or any other model you've pulled
      messages: [
        {
          role: 'system',
          content:
            'You are an expert text summarizer.' +
            ' Your task is to provide clear, concise, and accurate summaries of the given text.' +
            ' Focus on the main ideas, key points, and essential information while maintaining the original meaning.' +
            ' Keep the summary brief yet comprehensive enough to convey the core message of the original text.',
        },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

// Example usage
async function main() {
  try {
    console.log('Sending request to Ollama...');
    const response = await answerMyQuestion(
      'Algunos Ayuntamientos españoles aplican una medida para acabar con la mendicidad, que consiste en imponer una multa de varios cientos de euros a quienes la practican. La sanción puede llegar a los 500 del ala.\n' +
        '\n' +
        'Yo creo que es una decisión muy adecuada, porque los mendigos no respetan lo suficiente a los demás ciudadanos. Nos agobian.\n' +
        '\n' +
        'En la plaza donde vivo anidan unos cuantos tipos de esta clase. Y los madrileños sencillos nos vemos molestados por ellos con demasiada frecuencia. Van sucios y a veces mienten, porque dicen que es para comer y se lo gastan en tetrabriks de vino malo cuyos envases no siempre colocan en las papeleras cuando están vacíos.\n' +
        '\n' +
        'Pero esa justa y caritativa medida plantea algunos inconvenientes. Al parecer, los mendigos no tienen un domicilio fijo al que hacer llegar la notificación de la multa. No hay una manera segura de obligarles a hacer frente al castigo. Y ellos, con astucia, no suelen llevar en efectivo el dinero suficiente para afrontar su responsabilidad. Acumulan multas sin pagar como muchos conductores pillados a 200 por hora en una autopista.\n' +
        '\n' +
        'Por eso, seguramente, algunos consistorios (¡necesitaba escribir esa palabra alguna vez!) están dando marcha atrás. El Ayuntamiento de Barcelona entre otros. Si los alcaldes que han intentado erradicar así la mendicidad leyeran algo de historia sabrían que el propio marqués de Tamarón, que fue gobernador franquista de Madrid en 1941, tuvo que dejar de multar a los cojos y maltrechos supervivientes del Ejército republicano, que pedían de comer por la calle, por esa razón, porque no pagaban.\n' +
        '\n' +
        'Pero hay que pensar alguna alternativa. Es intolerable que haya tanta gente exhibiendo la miseria con semejante impudicia.\n' +
        '\n' +
        'Sucios, borrachos y malos pagadores.',
    );
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Start the program
main();
