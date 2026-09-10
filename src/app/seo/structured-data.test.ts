import { describe, expect, it } from 'vitest';
import { buildStructuredData } from './structured-data';

describe('buildStructuredData', () => {
  it('builds a JSON-LD root object with @context and @graph', () => {
    const data = buildStructuredData({
      locale: 'es',
      name: 'PseudoLearn · Aprende a programar',
      description: 'Editor de pseudocódigo',
      canonical: 'https://pseudolearn.app/',
    });

    expect(data['@context']).toBe('https://schema.org');
    expect(Array.isArray(data['@graph'])).toBe(true);

    const graph = data['@graph'] as Record<string, unknown>[];
    expect(graph).toHaveLength(3);

    const types = graph.map((entry) => entry['@type']);
    expect(types).toEqual(['WebSite', 'Organization', 'SoftwareApplication']);

    const webSite = graph[0];
    expect(webSite?.name).toBe('PseudoLearn');
    expect(webSite?.inLanguage).toBe('es');

    const organization = graph[1];
    expect(organization?.name).toBe('PseudoLearn');
    expect(organization?.url).toBe('https://pseudolearn.app');

    const app = graph[2];
    expect(app?.name).toBe('PseudoLearn · Aprende a programar');
    expect(app?.operatingSystem).toBe('macOS 13+, iOS 16+');
  });
});
