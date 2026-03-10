// AutoInsight: auto-generated note templates triggered on task completion
// Triggers for: learning + creative categories with keyword-matched titles

const KEYWORDS = ['podcast', 'article', 'read', 'listen', 'watch']

const AUTOINSIGHT_TEMPLATES = {
  learning: {
    podcast: [
      { key: 'key_ideas',    title: 'Key Ideas (3 max)',   placeholder: 'What were the 3 biggest takeaways?' },
      { key: 'action_items', title: 'Action Items',        placeholder: 'What will you do differently?' },
      { key: 'quotes',       title: 'Memorable Quotes',    placeholder: 'Any quotes worth keeping?' },
    ],
    article: [
      { key: 'key_ideas',    title: 'Key Ideas (3 max)',   placeholder: 'What were the 3 biggest takeaways?' },
      { key: 'action_items', title: 'Action Items',        placeholder: 'What will you do differently?' },
      { key: 'quotes',       title: 'Memorable Quotes',    placeholder: 'Any passages worth saving?' },
    ],
    default: [
      { key: 'key_ideas',    title: 'Key Ideas (3 max)',   placeholder: 'What were the 3 biggest takeaways?' },
      { key: 'action_items', title: 'Action Items',        placeholder: 'What will you do differently?' },
      { key: 'quotes',       title: 'Memorable Quotes',    placeholder: 'Any quotes worth keeping?' },
    ],
  },
  creative: {
    default: [
      { key: 'inspiration',      title: 'Inspiration',       placeholder: 'What sparked this? What excites you about it?' },
      { key: 'execution_steps',  title: 'Execution Steps',   placeholder: 'How will you bring this to life?' },
    ],
  },
}

/**
 * Returns { category, insightType } if the task should trigger AutoInsight, or null.
 */
export function detectInsightType(task) {
  const category = task.category
  if (!['learning', 'creative'].includes(category)) return null

  const title = (task.title || '').toLowerCase()
  const desc  = (task.description || '').toLowerCase()
  const text  = `${title} ${desc}`

  const matched = KEYWORDS.find((kw) => text.includes(kw))
  if (!matched) return null

  let insightType = 'default'
  if (text.includes('podcast') || text.includes('listen')) {
    insightType = 'podcast'
  } else if (text.includes('article') || text.includes('read') || text.includes('watch')) {
    insightType = 'article'
  }

  return { category, insightType }
}

/** Returns the array of template sections for a given category + insightType. */
export function getTemplate(category, insightType) {
  const catTemplates = AUTOINSIGHT_TEMPLATES[category]
  if (!catTemplates) return []
  return catTemplates[insightType] || catTemplates.default || []
}
