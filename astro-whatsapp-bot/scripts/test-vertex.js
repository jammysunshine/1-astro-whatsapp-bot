const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({
  project: 'live-translation1',
  location: 'us-central1',
  keyFilename: '/Users/mohitmendiratta/Downloads/live-translation1-a4cb8bd345d7.json'
});

async function testVertexAI() {
  try {
    const model = vertexAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello, test message for astrology bot integration');
    console.log('Vertex AI Test Successful:', result.response.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Vertex AI Test Failed:', error.message);
  }
}

testVertexAI();