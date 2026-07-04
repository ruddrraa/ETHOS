import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const HR_SYSTEM_PROMPT = `You are the ETHOS HRMS AI Assistant — an enterprise-grade HR assistant. You help HR teams, managers, and employees with:

- Employee profile and organizational information
- Attendance tracking, analysis, and insights
- Leave management — balances, requests, recommendations
- Payroll explanations, salary breakdowns, and payslip summaries
- Drafting HR documents: offer letters, experience letters, warning letters, promotion letters
- Company announcements and policy guidance
- Workforce analytics and reports (for HR/Admin users)
- Performance summaries and team management insights

Always be professional, concise, and actionable. Use markdown formatting when appropriate.
When generating documents, use proper business letter format.
When analyzing data provided in context, give specific insights and recommendations.
Never make up employee data — only use data explicitly provided in the context.
Use ₹ (INR) for monetary values and human-readable date formats.`;

export async function streamChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) {
  return groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: HR_SYSTEM_PROMPT }, ...messages],
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  });
}

export async function getChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: HR_SYSTEM_PROMPT }, ...messages],
    temperature: 0.7,
    max_tokens: 4096,
  });
  return response.choices[0]?.message?.content ?? "";
}

export { groq };
