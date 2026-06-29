import { mockEngine } from './mock-engine'
import { getSession } from './session'

export async function generateAIResponse(
  prompt: string,
  freelancerId?: string
): Promise<string> {
  try {
    await new Promise((r) => setTimeout(r, 500))

    const session = freelancerId ? getSession(freelancerId) : null

    const result = mockEngine(prompt, session ?? undefined)

    return JSON.stringify(result)
  } catch (error) {
    console.error('[Mock Provider Error]', error)
    throw new Error('Mock AI service failed')
  }
}