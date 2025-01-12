class SerperService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://google.serper.dev/search';
  }

  async search(query) {
    try {
      const headers = new Headers({
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      });

      const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ q: query }),
        redirect: 'follow'
      };

      const response = await fetch(this.baseUrl, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in SerperService:', error);
      throw error;
    }
  }

  // Helper method to extract main points from search results
  extractMainPoints(searchResults) {
    const mainPoints = [];

    if (searchResults.organic) {
      searchResults.organic.forEach(result => {
        mainPoints.push({
          title: result.title,
          snippet: result.snippet,
          link: result.link
        });
      });
    }

    if (searchResults.knowledgeGraph) {
      mainPoints.push({
        type: 'knowledge',
        title: searchResults.knowledgeGraph.title,
        description: searchResults.knowledgeGraph.description,
        attributes: searchResults.knowledgeGraph.attributes
      });
    }

    return mainPoints;
  }

  // Method to get a formatted research summary
  async getResearchSummary(query) {
    const results = await this.search(query);
    const mainPoints = this.extractMainPoints(results);
    
    return {
      query,
      timestamp: new Date().toISOString(),
      mainPoints,
      rawResults: results
    };
  }
}

export default SerperService; 