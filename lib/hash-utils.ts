export const encodeParams = (params: Record<string, string>): string => {
  const encoded = btoa(JSON.stringify(params));
  return encoded.replace(/[+/=]/g, (match) => {
    return { '+': '-', '/': '_', '=': '' }[match] || match;
  });
};

export const decodeParams = (hash: string): Record<string, string> => {
  try {
    const normalized = hash.replace(/[-_]/g, (match) => {
      return { '-': '+', '_': '/' }[match] || match;
    });
    const padded = normalized + '=='.slice(0, (4 - normalized.length % 4) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
};