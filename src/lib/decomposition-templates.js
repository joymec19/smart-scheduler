// ============================================================================
// decomposition-templates.js — Static template data for task decomposition
// Step shapes mirror the 002_task_decomposition.sql seed data exactly.
// ============================================================================

export const TEMPLATES = {
  learning: {
    clarifyingQuestion:
      'What does completing this mean in concrete terms? (e.g., finish reading, write summary, pass quiz)',
    basePattern: ['Discover', 'Consume', 'Capture', 'Recall', 'Apply'],
    defaultSteps: [
      { title: 'Skim overview',             estimatedMinutes: 15, isBlocking: true  },
      { title: 'Deep read/watch',           estimatedMinutes: 30, isBlocking: true  },
      { title: 'Take structured notes',     estimatedMinutes: 20, isBlocking: false },
      { title: 'Create flashcards/summary', estimatedMinutes: 15, isBlocking: false },
      { title: 'Do 3 practice problems',    estimatedMinutes: 20, isBlocking: false },
    ],
    subTypes: {
      long_form_article: {
        defaultSteps: [
          { title: 'Clarify outcome',              estimatedMinutes: 20, isBlocking: true  },
          { title: 'Discover & select references', estimatedMinutes: 60, isBlocking: true  },
          { title: 'Capture structured notes',     estimatedMinutes: 45, isBlocking: true  },
          { title: 'Draft outline & skeleton',     estimatedMinutes: 45, isBlocking: true  },
          { title: 'Write first draft',            estimatedMinutes: 90, isBlocking: true  },
          { title: 'Edit for clarity & format',    estimatedMinutes: 60, isBlocking: false },
          { title: 'Final polish & schedule',      estimatedMinutes: 30, isBlocking: false },
        ],
      },
    },
  },

  work: {
    clarifyingQuestion:
      'What is the final deliverable? (e.g., doc, email, presentation, deployed code)',
    basePattern: ['Clarify', 'Plan', 'Produce', 'Review', 'Ship'],
    defaultSteps: [
      { title: 'Clarify requirements',    estimatedMinutes: 20, isBlocking: true  },
      { title: 'Draft outline',           estimatedMinutes: 25, isBlocking: true  },
      { title: 'Create v1',               estimatedMinutes: 45, isBlocking: true  },
      { title: 'Review with stakeholder', estimatedMinutes: 20, isBlocking: false },
      { title: 'Finalize and send',       estimatedMinutes: 15, isBlocking: false },
    ],
    subTypes: {},
  },

  health: {
    clarifyingQuestion:
      'What does the session involve? (e.g., gym workout, meal prep, meditation, outdoor run)',
    basePattern: ['Prep', 'Execute', 'Reflect'],
    defaultSteps: [
      { title: 'Plan workout/meal',        estimatedMinutes: 10, isBlocking: true  },
      { title: 'Do session',               estimatedMinutes: 30, isBlocking: true  },
      { title: 'Log results/energy level', estimatedMinutes:  5, isBlocking: false },
    ],
    subTypes: {},
  },

  personal: {
    clarifyingQuestion:
      "What needs to happen for this to be done? (e.g., make a call, buy something, visit somewhere)",
    basePattern: ['Decide', 'Prepare', 'Do', 'Follow-up'],
    defaultSteps: [
      { title: 'Decide',    estimatedMinutes: 10, isBlocking: true  },
      { title: 'Prepare',   estimatedMinutes: 15, isBlocking: true  },
      { title: 'Do',        estimatedMinutes: 30, isBlocking: true  },
      { title: 'Follow-up', estimatedMinutes: 10, isBlocking: false },
    ],
    subTypes: {},
  },

  info: {
    clarifyingQuestion:
      "What will 'done' look like? (e.g., summary doc, decision made, sources collected)",
    basePattern: ['Collect sources', 'Skim & filter', 'Deep read', 'Synthesize'],
    defaultSteps: [
      { title: 'Collect sources',       estimatedMinutes: 15, isBlocking: true  },
      { title: 'Skim & filter',         estimatedMinutes: 20, isBlocking: true  },
      { title: 'Deep read 2-3 best',    estimatedMinutes: 30, isBlocking: true  },
      { title: 'Synthesize into notes', estimatedMinutes: 20, isBlocking: false },
    ],
    subTypes: {},
  },

  creative: {
    clarifyingQuestion:
      'What are you creating? (e.g., blog post, design, video, illustration)',
    basePattern: ['Warm-up', 'Idea generation', 'Selection', 'Execution', 'Polish'],
    defaultSteps: [
      { title: 'Warm-up',         estimatedMinutes: 10, isBlocking: false },
      { title: 'Idea generation', estimatedMinutes: 20, isBlocking: true  },
      { title: 'Selection',       estimatedMinutes: 10, isBlocking: true  },
      { title: 'Execution',       estimatedMinutes: 40, isBlocking: true  },
      { title: 'Polish',          estimatedMinutes: 20, isBlocking: false },
    ],
    subTypes: {},
  },
}
