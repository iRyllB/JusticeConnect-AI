import { Briefcase, Home, Users, Scale, Car, FileText } from 'lucide-react';

interface QuickAction {
  icon: any;
  label: string;
  question: string;
  color: string;
}

interface QuickActionsProps {
  onActionClick: (question: string) => void;
  language: string;
}

export function QuickActions({ onActionClick, language }: QuickActionsProps) {
  const getActions = (): QuickAction[] => {
    switch (language) {
      case 'tagalog':
        return [
          {
            icon: Briefcase,
            label: 'Karapatan sa Trabaho',
            question: 'Ano ang mga karapatan ko bilang manggagawa sa Pilipinas?',
            color: 'from-blue-500 to-blue-600'
          },
          {
            icon: Home,
            label: 'Ari-arian',
            question: 'Paano ang proseso ng pagbili ng lupa at bahay?',
            color: 'from-green-500 to-green-600'
          },
          {
            icon: Users,
            label: 'Pamilya',
            question: 'Ano ang batas tungkol sa annulment at legal separation?',
            color: 'from-purple-500 to-purple-600'
          },
          {
            icon: Scale,
            label: 'Small Claims',
            question: 'Paano mag-file ng small claims case?',
            color: 'from-amber-500 to-amber-600'
          },
          {
            icon: Car,
            label: 'Trapiko',
            question: 'Ano ang mga batas sa trapiko at kaparusahan?',
            color: 'from-red-500 to-red-600'
          },
          {
            icon: FileText,
            label: 'Dokumento',
            question: 'Paano kumuha ng birth certificate at iba pang dokumento?',
            color: 'from-teal-500 to-teal-600'
          }
        ];
      case 'bisaya':
        return [
          {
            icon: Briefcase,
            label: 'Katungod sa Trabaho',
            question: 'Unsa ang akong mga katungod isip trabahador sa Pilipinas?',
            color: 'from-blue-500 to-blue-600'
          },
          {
            icon: Home,
            label: 'Kabtangan',
            question: 'Unsaon pag-palit ug yuta ug balay?',
            color: 'from-green-500 to-green-600'
          },
          {
            icon: Users,
            label: 'Pamilya',
            question: 'Unsa ang balaod bahin sa annulment ug legal separation?',
            color: 'from-purple-500 to-purple-600'
          },
          {
            icon: Scale,
            label: 'Small Claims',
            question: 'Unsaon pag-file ug small claims case?',
            color: 'from-amber-500 to-amber-600'
          },
          {
            icon: Car,
            label: 'Trapiko',
            question: 'Unsa ang mga balaod sa trapiko ug silot?',
            color: 'from-red-500 to-red-600'
          },
          {
            icon: FileText,
            label: 'Dokumento',
            question: 'Unsaon pagkuha ug birth certificate ug uban pang dokumento?',
            color: 'from-teal-500 to-teal-600'
          }
        ];
      default: // English
        return [
          {
            icon: Briefcase,
            label: 'Labor Rights',
            question: 'What are my rights as an employee in the Philippines?',
            color: 'from-blue-500 to-blue-600'
          },
          {
            icon: Home,
            label: 'Property',
            question: 'How do I buy land or property in the Philippines?',
            color: 'from-green-500 to-green-600'
          },
          {
            icon: Users,
            label: 'Family Law',
            question: 'What are the laws on annulment and legal separation?',
            color: 'from-purple-500 to-purple-600'
          },
          {
            icon: Scale,
            label: 'Small Claims',
            question: 'How do I file a small claims case?',
            color: 'from-amber-500 to-amber-600'
          },
          {
            icon: Car,
            label: 'Traffic',
            question: 'What are the traffic laws and penalties?',
            color: 'from-red-500 to-red-600'
          },
          {
            icon: FileText,
            label: 'Documents',
            question: 'How do I get a birth certificate and other documents?',
            color: 'from-teal-500 to-teal-600'
          }
        ];
    }
  };

  const actions = getActions();

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={() => onActionClick(action.question)}
            className={`relative overflow-hidden rounded-xl p-4 text-left bg-gradient-to-br ${action.color} text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105`}
          >
            <div className="flex flex-col gap-2">
              <Icon className="w-6 h-6" />
              <span className="text-sm">{action.label}</span>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-20">
              <Icon className="w-16 h-16" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
