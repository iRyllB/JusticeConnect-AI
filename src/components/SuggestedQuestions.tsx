interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  const questions = [
    "Ano ang karapatan ko bilang empleyado?",
    "How do I file a small claims case?",
    "Paano mag-file ng barangay complaint?",
    "What are my rights as a tenant?",
    "Ano ang batas tungkol sa child support?",
    "How to report labor violations?"
  ];

  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-2 px-4">Suggested questions:</p>
      <div className="flex flex-wrap gap-2 px-4">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
