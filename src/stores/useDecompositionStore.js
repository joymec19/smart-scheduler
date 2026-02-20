import { create } from 'zustand'
import {
  generateSubtasks,
  adjustForUserPatterns,
  saveSubtasks,
  learnFromEdits,
} from '../lib/decomposition-engine'
import { getPatternSuggestion } from '../lib/decomposition-suggestions'

const useDecompositionStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  wizardStep: 1,           // 1 | 2 | 3
  confirmed: false,        // true once subtasks are saved (step 3 success screen)
  clarifyingAnswer: '',
  generatedSubtasks: [],
  selectedTemplate: null,
  granularity: 'balanced', // 'fewer_steps' | 'balanced' | 'more_detail'
  isLoading: false,
  patternSuggestion: null,

  // Internal — not exposed to consumers
  _currentTask: null,
  _decompositionLogId: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  startWizard: async (task) => {
    set({
      wizardStep: 1,
      confirmed: false,
      clarifyingAnswer: '',
      generatedSubtasks: [],
      selectedTemplate: null,
      granularity: 'balanced',
      isLoading: true,
      patternSuggestion: null,
      _currentTask: task,
      _decompositionLogId: null,
    })
    try {
      const suggestion = await getPatternSuggestion(task.user_id, task.category)
      set({ patternSuggestion: suggestion.hasSuggestion ? suggestion : null })
    } catch (_) {
      // non-fatal — pattern suggestion is best-effort
    } finally {
      set({ isLoading: false })
    }
  },

  setClarifyingAnswer: (answer) => set({ clarifyingAnswer: answer }),

  // Called after user picks a granularity card in Step 2.
  // Sets the chosen level, navigates to Step 3, and generates subtasks.
  loadSubtasksForGranularity: async (task, answer, granularity) => {
    set({ granularity, clarifyingAnswer: answer, isLoading: true, wizardStep: 3, confirmed: false })
    try {
      const raw = await generateSubtasks(task, answer, {
        granularity_preference: granularity === 'balanced' ? undefined : granularity,
      })
      const adjusted = await adjustForUserPatterns(task.user_id, raw)
      set({ generatedSubtasks: adjusted })
    } catch (err) {
      console.error('[decompositionStore] loadSubtasksForGranularity:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  // Kept for back-compat; alias to loadSubtasksForGranularity using stored task/answer.
  setGranularity: async (level) => {
    const { _currentTask, clarifyingAnswer } = get()
    set({ granularity: level, isLoading: true, wizardStep: 3, confirmed: false })
    try {
      const raw = await generateSubtasks(_currentTask, clarifyingAnswer, {
        granularity_preference: level === 'balanced' ? undefined : level,
      })
      const adjusted = await adjustForUserPatterns(_currentTask.user_id, raw)
      set({ generatedSubtasks: adjusted })
    } catch (err) {
      console.error('[decompositionStore] setGranularity:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  editSubtask: (index, updates) =>
    set((state) => ({
      generatedSubtasks: state.generatedSubtasks.map((s, i) =>
        i === index ? { ...s, ...updates } : s
      ),
    })),

  removeSubtask: (index) =>
    set((state) => ({
      generatedSubtasks: state.generatedSubtasks.filter((_, i) => i !== index),
    })),

  addSubtask: (subtask) =>
    set((state) => ({
      generatedSubtasks: [
        ...state.generatedSubtasks,
        {
          ...subtask,
          order: state.generatedSubtasks.length + 1,
          isBlocking: subtask.isBlocking ?? false,
        },
      ],
    })),

  reorderSubtasks: (fromIndex, toIndex) =>
    set((state) => {
      const list = [...state.generatedSubtasks]
      const [moved] = list.splice(fromIndex, 1)
      list.splice(toIndex, 0, moved)
      return { generatedSubtasks: list.map((s, i) => ({ ...s, order: i + 1 })) }
    }),

  confirmDecomposition: async (parentTaskId) => {
    const { generatedSubtasks, selectedTemplate, clarifyingAnswer, _currentTask } = get()
    set({ isLoading: true })
    try {
      const result = await saveSubtasks(
        parentTaskId,
        generatedSubtasks,
        selectedTemplate,
        { question: _currentTask?.category, answer: clarifyingAnswer }
      )
      // Persist empty edits array to initialise the log row for future learnFromEdits calls
      if (result.logId) {
        await learnFromEdits(result.logId, [])
      }
      set({ confirmed: true, _decompositionLogId: result.logId })
      return result
    } catch (err) {
      console.error('[decompositionStore] confirmDecomposition:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  resetWizard: () =>
    set({
      wizardStep: 1,
      confirmed: false,
      clarifyingAnswer: '',
      generatedSubtasks: [],
      selectedTemplate: null,
      granularity: 'balanced',
      isLoading: false,
      patternSuggestion: null,
      _currentTask: null,
      _decompositionLogId: null,
    }),
}))

export default useDecompositionStore
