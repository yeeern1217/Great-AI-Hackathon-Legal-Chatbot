// src/hooks/useLanguage.ts
export function useLanguage() {
  // For now, just return identity translations
  const t = (key: string) => {
    const dictionary: Record<string, string> = {
      'hero.subtitle': 'Your AI Legal Assistant',
      'hero.title': 'Understand Your Employment Contract Easily',
      'hero.description': 'Upload your contract or chat with our assistant to learn about your rights in Malaysia.',
      'hero.chatButton': 'Chat Now',
      'hero.uploadButton': 'Upload Contract',
      'stats.contracts': 'Contracts Reviewed',
      'stats.users': 'Active Users',
      'stats.satisfaction': 'User Satisfaction',
      'features.title': 'Our Features',
      'features.subtitle': 'Everything you need to review and protect your employment rights.',
      'features.chatbot.title': 'AI Chatbot',
      'features.chatbot.desc': 'Ask questions about your employment contract instantly.',
      'features.checker.title': 'Contract Checker',
      'features.checker.desc': 'Upload contracts and receive AI-powered compliance analysis.',
      'features.experts.title': 'Expert Insights',
      'features.experts.desc': 'Backed by Malaysian legal professionals for accuracy.'
    };
    return dictionary[key] || key;
  };

  return { t };
}