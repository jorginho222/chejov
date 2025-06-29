import { cosineSimilarity } from 'ai';

async function getEmbeddings(
  texts: string[],
  model: string = 'nomic-embed-text',
) {
  try {
    const results = [];

    for (const text of texts) {
      const response = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      results.push({
        text,
        embedding: data.embedding,
      });
    }

    return results.map((item) => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

export {};

// Example usage
const texts = ['House', 'Car', 'Bike', 'Plane', 'Train'];

// Get embeddings and log them
(async () => {
  const embeddings = await getEmbeddings(texts, 'nomic-embed-text');
  const vectorDataBase = embeddings.map((embedding, index) => ({
    value: texts[index],
    embedding,
  }));

  // Search for similar words
  const searchTerm = 'fly';
  console.log(`\nSearching for terms similar to: "${searchTerm}"`);

  try {
    // Get embedding for the search term
    const searchEmbedding = (
      await getEmbeddings([searchTerm], 'nomic-embed-text')
    )[0];

    // Calculate similarity scores for all items in the database
    const results = vectorDataBase.map((item) => ({
      text: item.value,
      similarity: cosineSimilarity(searchEmbedding, item.embedding),
    }));

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    console.log('\nTop 3 most similar terms:');
    results.slice(0, 3).forEach((result, i) => {
      console.log(
        `${i + 1}. "${result.text}" (similarity: ${result.similarity.toFixed(4)})`,
      );
    });
  } catch (error) {
    console.error('Error during search:', error);
  }
})();
