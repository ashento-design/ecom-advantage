import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { title, description, niche } = await request.json()

  const prompt = `You are an expert e-commerce analyst specializing in dropshipping. Analyze this product and return ONLY a JSON object with no markdown.

Product Title: ${title}
Description: ${description}
Niche: ${niche}

Return exactly this JSON structure:
{
  "demand_score": <integer 1-100>,
  "competition_level": "<Low|Medium|High>",
  "suggested_price": "<range like $19.99-$34.99>",
  "ad_angles": ["<angle 1>", "<angle 2>", "<angle 3>"],
  "hooks": ["<hook 1>", "<hook 2>", "<hook 3>"],
  "summary": "<2-3 sentences on market opportunity and why this product works>"
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(completion.choices[0].message.content!)
  return Response.json(result)
}
