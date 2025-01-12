export default class SerperService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://google.serper.dev/search';
  }

  async generateCompletion(prompt, options = {}) {
    const headers = new Headers();
    headers.append("X-API-KEY", this.apiKey);
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ q: prompt }),
      redirect: "follow"
    };

    const response = await fetch(this.baseUrl, requestOptions);
    const result = await response.json();
    
    // Format each source as a separate item
    let sources = [];
    
    if (result.organic) {
      sources = result.organic.slice(0, 5).map(item => (
        `${item.title}\n${item.snippet}\n[Source](${item.link})`
      ));
    }

    if (result.knowledgeGraph) {
      const kg = result.knowledgeGraph;
      let kgText = [];
      if (kg.title) kgText.push(`${kg.title}`);
      if (kg.type) kgText.push(`Type: ${kg.type}`);
      if (kg.description) kgText.push(kg.description);
      if (kgText.length > 0) {
        sources.push(kgText.join('\n'));
      }
    }

    if (result.relatedSearches) {
      sources.push(...result.relatedSearches.map(search => search.query));
    }

    return { text: sources.join('\n\n---\n\n') };
  }
} 