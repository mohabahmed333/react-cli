import readline from 'readline';
import chalk from 'chalk';

export function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

export interface ChoiceOption {
  value: string;
  label: string;
  condition?: boolean;
}

export interface MultiSelectResult {
  [key: string]: boolean;
}

/**
 * Ask a single choice question with numbered options
 */
export async function askChoice(
  rl: readline.Interface,
  title: string,
  options: ChoiceOption[]
): Promise<string> {
  const availableOptions = options.filter(opt => opt.condition !== false);
  
  let prompt = chalk.blue(`${title}\n`);
  availableOptions.forEach((option, index) => {
    prompt += `${index + 1}. ${option.label}\n`;
  });
  prompt += `Select option (1-${availableOptions.length}): `;

  const answer = await askQuestion(rl, prompt);
  const selectedIndex = parseInt(answer) - 1;

  if (selectedIndex >= 0 && selectedIndex < availableOptions.length) {
    return availableOptions[selectedIndex].value;
  }

  // Invalid selection, ask again
  console.log(chalk.red('Invalid selection. Please try again.'));
  return askChoice(rl, title, options);
}

/**
 * Ask a multi-select question with numbered options
 */
export async function askMultiSelect(
  rl: readline.Interface,
  title: string,
  options: ChoiceOption[]
): Promise<MultiSelectResult> {
  const availableOptions = options.filter(opt => opt.condition !== false);
  
  let prompt = chalk.blue(`${title} (separate multiple choices with commas)\n`);
  availableOptions.forEach((option, index) => {
    prompt += `${index + 1}. ${option.label}\n`;
  });
  prompt += `Select options (e.g., 1,3,5) or press Enter for none: `;

  const answer = await askQuestion(rl, prompt);
  const result: MultiSelectResult = {};

  // Initialize all options as false
  availableOptions.forEach(option => {
    result[option.value] = false;
  });

  if (answer.trim()) {
    const selectedNumbers = answer.split(',').map(choice => parseInt(choice.trim()));
    
    selectedNumbers.forEach(num => {
      const index = num - 1;
      if (index >= 0 && index < availableOptions.length) {
        const option = availableOptions[index];
        result[option.value] = true;
      }
    });
  }

  return result;
}

/**
 * Ask a boolean question with Yes/No options
 */
export async function askBoolean(
  rl: readline.Interface,
  title: string
): Promise<boolean> {
  const result = await askChoice(rl, title, [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ]);
  
  return result === 'true';
}
