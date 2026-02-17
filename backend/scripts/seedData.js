require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const connectDB = require('../config/database');

const questions = [
  { difficulty: 1, prompt: "What is 2 + 2?", choices: ["3", "4", "5", "6"], correctAnswer: "4", tags: ["math", "basic"] },
  { difficulty: 1, prompt: "What color is the sky on a clear day?", choices: ["Red", "Blue", "Green", "Yellow"], correctAnswer: "Blue", tags: ["general"] },
  { difficulty: 1, prompt: "How many days are in a week?", choices: ["5", "6", "7", "8"], correctAnswer: "7", tags: ["general"] },
  
  { difficulty: 2, prompt: "What is 15 × 3?", choices: ["35", "40", "45", "50"], correctAnswer: "45", tags: ["math"] },
  { difficulty: 2, prompt: "Which planet is known as the Red Planet?", choices: ["Venus", "Mars", "Jupiter", "Saturn"], correctAnswer: "Mars", tags: ["science"] },
  { difficulty: 2, prompt: "What is the capital of France?", choices: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: "Paris", tags: ["geography"] },
  
  { difficulty: 3, prompt: "What is the square root of 144?", choices: ["10", "11", "12", "13"], correctAnswer: "12", tags: ["math"] },
  { difficulty: 3, prompt: "Who wrote 'Romeo and Juliet'?", choices: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correctAnswer: "William Shakespeare", tags: ["literature"] },
  { difficulty: 3, prompt: "What is the chemical symbol for gold?", choices: ["Go", "Gd", "Au", "Ag"], correctAnswer: "Au", tags: ["science"] },
  
  { difficulty: 4, prompt: "What is 17² (17 squared)?", choices: ["269", "279", "289", "299"], correctAnswer: "289", tags: ["math"] },
  { difficulty: 4, prompt: "In which year did World War II end?", choices: ["1943", "1944", "1945", "1946"], correctAnswer: "1945", tags: ["history"] },
  { difficulty: 4, prompt: "What is the largest ocean on Earth?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], correctAnswer: "Pacific", tags: ["geography"] },
  
  { difficulty: 5, prompt: "What is the derivative of x³?", choices: ["2x²", "3x²", "x²", "3x"], correctAnswer: "3x²", tags: ["math", "calculus"] },
  { difficulty: 5, prompt: "Who painted the Mona Lisa?", choices: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"], correctAnswer: "Leonardo da Vinci", tags: ["art"] },
  { difficulty: 5, prompt: "What is the speed of light in vacuum (approximately)?", choices: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"], correctAnswer: "300,000 km/s", tags: ["science", "physics"] },
  
  { difficulty: 6, prompt: "What is the integral of 2x?", choices: ["x²", "x² + C", "2x²", "2x² + C"], correctAnswer: "x² + C", tags: ["math", "calculus"] },
  { difficulty: 6, prompt: "Which element has the atomic number 79?", choices: ["Silver", "Gold", "Platinum", "Mercury"], correctAnswer: "Gold", tags: ["science", "chemistry"] },
  { difficulty: 6, prompt: "Who developed the theory of general relativity?", choices: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Stephen Hawking"], correctAnswer: "Albert Einstein", tags: ["science", "physics"] },
  
  { difficulty: 7, prompt: "What is the solution to the equation: 3x² - 12x + 12 = 0?", choices: ["x = 1", "x = 2", "x = 3", "x = 4"], correctAnswer: "x = 2", tags: ["math", "algebra"] },
  { difficulty: 7, prompt: "What is the Planck constant (approximately)?", choices: ["6.626 × 10⁻³⁴ J·s", "3.14 × 10⁻³⁴ J·s", "9.81 × 10⁻³⁴ J·s", "1.602 × 10⁻³⁴ J·s"], correctAnswer: "6.626 × 10⁻³⁴ J·s", tags: ["science", "physics"] },
  { difficulty: 7, prompt: "In computer science, what does 'NP' stand for in 'NP-complete'?", choices: ["Non-Polynomial", "Nondeterministic Polynomial", "Non-Prime", "New Polynomial"], correctAnswer: "Nondeterministic Polynomial", tags: ["computer science"] },
  
  { difficulty: 8, prompt: "What is the time complexity of QuickSort in the average case?", choices: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correctAnswer: "O(n log n)", tags: ["computer science", "algorithms"] },
  { difficulty: 8, prompt: "What is Euler's identity?", choices: ["e^(iπ) + 1 = 0", "e^(iπ) - 1 = 0", "e^(iπ) = 1", "e^(iπ) = -1"], correctAnswer: "e^(iπ) + 1 = 0", tags: ["math", "advanced"] },
  { difficulty: 8, prompt: "Which programming paradigm does Haskell primarily follow?", choices: ["Object-Oriented", "Functional", "Procedural", "Logic"], correctAnswer: "Functional", tags: ["computer science", "programming"] },
  
  { difficulty: 9, prompt: "What is the Riemann Hypothesis concerned with?", choices: ["Prime numbers", "Complex analysis", "Zeros of zeta function", "All of the above"], correctAnswer: "All of the above", tags: ["math", "advanced"] },
  { difficulty: 9, prompt: "In quantum mechanics, what does the Schrödinger equation describe?", choices: ["Wave function evolution", "Particle position", "Energy levels", "Spin states"], correctAnswer: "Wave function evolution", tags: ["science", "physics", "quantum"] },
  { difficulty: 9, prompt: "What is the halting problem in computer science?", choices: ["A decidable problem", "An undecidable problem", "A P problem", "An NP problem"], correctAnswer: "An undecidable problem", tags: ["computer science", "theory"] },
  
  { difficulty: 10, prompt: "What is the Kolmogorov complexity of a string?", choices: ["Length of shortest program that produces it", "Number of unique characters", "Entropy of the string", "Hash value"], correctAnswer: "Length of shortest program that produces it", tags: ["computer science", "theory", "advanced"] },
  { difficulty: 10, prompt: "In category theory, what is a monad?", choices: ["A monoid in the category of endofunctors", "A type of functor", "A natural transformation", "A morphism"], correctAnswer: "A monoid in the category of endofunctors", tags: ["math", "category theory", "advanced"] },
  { difficulty: 10, prompt: "What is the Yang-Mills existence and mass gap problem?", choices: ["Solved", "Millennium Prize Problem", "Disproven", "Partially solved"], correctAnswer: "Millennium Prize Problem", tags: ["science", "physics", "advanced"] },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Question.deleteMany({});
    console.log('Cleared existing questions');

    for (const q of questions) {
      await Question.createWithAnswer(
        {
          difficulty: q.difficulty,
          prompt: q.prompt,
          choices: q.choices,
          tags: q.tags,
        },
        q.correctAnswer
      );
    }

    console.log(`Seeded ${questions.length} questions successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
