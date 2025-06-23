import React from 'react';

interface FormattedSummaryProps {
  summary: {
    formatted_text: string;
    has_formatting: boolean;
    sections?: Array<{
      type: 'paragraph' | 'header' | 'list';
      content?: string;
      level?: number;
      items?: string[];
    }>;
  };
}

const FormattedSummary: React.FC<FormattedSummaryProps> = ({ summary }) => {
  // If no formatting detected, return plain text
  if (!summary.has_formatting || !summary.sections) {
    return (
      <div className="prose prose-sm max-w-none hidden-scrollbar">
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
          {summary.formatted_text}
        </div>
      </div>
    );
  }

  // Render formatted sections
  return (
    <div className="prose prose-sm max-w-none hidden-scrollbar">
      {summary.sections.map((section, index) => {
        switch (section.type) {
          case 'header':
            const HeaderTag = `h${Math.min(section.level || 1, 6)}` as keyof JSX.IntrinsicElements;
            return (
              <HeaderTag 
                key={index} 
                className={`font-bold text-gray-900 ${
                  section.level === 1 ? 'text-lg mb-3' : 
                  section.level === 2 ? 'text-base mb-2' : 
                  'text-sm mb-2'
                }`}
              >
                {section.content}
              </HeaderTag>
            );

          case 'list':
            return (
              <ul key={index} className="list-disc list-inside space-y-1 mb-4 ml-2">
                {section.items?.map((item, itemIndex) => (
                  <li 
                    key={itemIndex} 
                    className="text-gray-800 text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </ul>
            );

          case 'paragraph':
            return (
              <p 
                key={index} 
                className="text-gray-800 text-sm leading-relaxed mb-3"
                dangerouslySetInnerHTML={{ __html: section.content || '' }}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default FormattedSummary;
