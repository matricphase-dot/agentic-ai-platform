import { ChromaClient } from 'chromadb';
import { queryOllama } from './ollamaService';

// Initialize ChromaDB client
const chromaClient = new ChromaClient({ path: 'http://localhost:8000' }); // Adjust if different
const COLLECTION_NAME = 'documents';

/**
 * Split text into chunks of approximately chunkSize characters,
 * trying to break at paragraph or sentence boundaries.
 */
function splitTextIntoChunks(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  // First split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    // If adding this paragraph would exceed chunk size, push current chunk and start new one
    if (currentChunk.length + para.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      // Start new chunk with overlap from the end of previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5)).join(' '); // rough overlap
      currentChunk = overlapWords + '\n\n' + para;
    } else {
      if (currentChunk.length > 0) currentChunk += '\n\n';
      currentChunk += para;
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  // If any chunk is still too large, split it by sentences
  const finalChunks: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= chunkSize + overlap) {
      finalChunks.push(chunk);
    } else {
      // Split by sentences (simple regex)
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
      let tempChunk = '';
      for (const sent of sentences) {
        if (tempChunk.length + sent.length > chunkSize && tempChunk.length > 0) {
          finalChunks.push(tempChunk.trim());
          tempChunk = sent;
        } else {
          tempChunk += ' ' + sent;
        }
      }
      if (tempChunk.trim().length > 0) finalChunks.push(tempChunk.trim());
    }
  }
  return finalChunks;
}

/**
 * Generate embedding using Ollama's nomic-embed-text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'nomic-embed-text',
        prompt: text,
      }),
    });
    if (!response.ok) {
      throw new Error(`Embedding failed: ${response.statusText}`);
    }
    const data = await response.json() as { embedding: number[] };
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Add a document to ChromaDB (split into chunks, embed, store)
 */
export async function addDocumentToVectorStore(
  userId: string,
  fileName: string,
  content: string
): Promise<void> {
  try {
    // Get or create collection
    let collection;
    try {
      collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
    } catch {
      collection = await chromaClient.createCollection({ name: COLLECTION_NAME });
    }

    // Split content into chunks
    const chunks = splitTextIntoChunks(content, 1000, 200);

    // Generate embeddings for each chunk
    const embeddings: number[][] = [];
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk);
      embeddings.push(embedding);
    }

    // Prepare ids and metadatas
    const ids: string[] = chunks.map((_: string, i: number) => `${userId}-${fileName}-${i}`);
    const metadatas: Record<string, any>[] = chunks.map((chunk: string, i: number) => ({
      userId,
      fileName,
      chunkIndex: i,
      text: chunk, // store original text in metadata for retrieval
    }));

    // Add to ChromaDB
    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents: chunks, // ChromaDB also accepts documents directly
    });

    console.log(`? Added ${chunks.length} chunks for ${fileName}`);
  } catch (error) {
    console.error('Error adding document to vector store:', error);
    throw error;
  }
}

/**
 * Query the vector store for relevant chunks
 */
export async function queryVectorStore(
  userId: string,
  query: string,
  nResults: number = 5
): Promise<string[]> {
  try {
    const collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
    const queryEmbedding = await generateEmbedding(query);

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
      where: { userId }, // filter by user
    });

    // Extract documents from results
    const documents = results.documents[0] || [];
    return documents as string[];
  } catch (error) {
    console.error('Error querying vector store:', error);
    return [];
  }
}

/**
 * Answer a question using RAG: retrieve relevant chunks, then query Ollama
 */
export async function answerQuestion(userId: string, question: string): Promise<string> {
  try {
    // Retrieve relevant chunks
    const chunks = await queryVectorStore(userId, question, 5);
    if (chunks.length === 0) {
      return 'No relevant documents found. Please upload some documents first.';
    }

    // Build context from chunks
    const context = chunks.join('\n\n---\n\n');

    // Create prompt for Ollama
    const prompt = `Answer the question based on the following context. If the answer cannot be found in the context, say "I don't have information about that in the provided documents."

Context:
${context}

Question: ${question}

Answer:`;

    // Query Ollama (using tinyllama or mistral)
    const answer = await queryOllama(prompt, 'tinyllama');
    return answer;
  } catch (error) {
    console.error('Error answering question:', error);
    return 'Sorry, an error occurred while processing your question.';
  }
}
