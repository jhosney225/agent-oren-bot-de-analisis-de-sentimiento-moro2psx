
```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Sample financial news articles for sentiment analysis
const financialNews = [
  {
    id: 1,
    headline: "Tech Giant Reports Record Q4 Earnings, Stock Soars 15%",
    content:
      "In a remarkable performance, the technology company exceeded analyst expectations by 40%, reporting $50 billion in quarterly revenue. The CEO attributed the success to innovative product launches and strong international expansion.",
  },
  {
    id: 2,
    headline: "Oil Prices Plummet as Global Demand Weakens",
    content:
      "Crude oil prices fell below $60 per barrel today as economic slowdown concerns spread. Analysts warn that energy stocks could face further pressure if the downward trend continues.",
  },
  {
    id: 3,
    headline: "Federal Reserve Maintains Interest Rates Despite Inflation Concerns",
    content:
      "The Federal Reserve decided to hold interest rates steady at their latest meeting, citing mixed economic signals. Some analysts believe this could provide relief for borrowers while others express concern about inflation management.",
  },
  {
    id: 4,
    headline: "Biotech Startup Announces Breakthrough Drug Trial Results",
    content:
      "A promising pharmaceutical company revealed that their experimental drug passed Phase 3 trials with excellent safety and efficacy profiles. The company is now preparing for FDA submission, potentially revolutionizing treatment for a major disease.",
  },
  {
    id: 5,
    headline: "Major Bank Faces Regulatory Fine Over Compliance Violations",
    content:
      "A leading financial institution has been fined $2.5 billion for failing to maintain proper compliance procedures. The incident raises concerns about risk management practices in the banking sector.",
  },
];

interface SentimentResult {
  id: number;
  headline: string;
  sentiment: string;
  confidence: number;
  impact: string;
  reasoning: string;
}

async function analyzeSentiment(
  newsArticles: (typeof financialNews)[0][]
): Promise<SentimentResult[]> {
  const results: SentimentResult[] = [];

  for (const article of newsArticles) {
    const prompt = `Analyze the sentiment of this financial news article and provide your analysis in the following JSON format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": 0.0-1.0,
  "impact": "bullish" | "bearish" | "neutral",
  "reasoning": "brief explanation"
}

Article Headline: ${article.headline}
Article Content: ${article.content}

Provide ONLY valid JSON, no additional text.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const analysis = JSON.parse(responseText);

    results.push({
      id: article.id,
      headline: article.headline,
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      impact: analysis.impact,
      reasoning: analysis.reasoning,
    });

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

function generateReport(results: SentimentResult[]): void {
  console.log("\n=".repeat(80));
  console.log("FINANCIAL NEWS SENTIMENT ANALYSIS REPORT");
  console.log("=".repeat(80));
  console.log();

  // Summary statistics
  const positiveCount = results.filter((r) => r.sentiment === "positive").length;
  const negativeCount = results.filter((r) => r.sentiment === "negative").length;
  const neutralCount = results.filter((r) => r.sentiment === "neutral").length;
  const avgConfidence = (
    results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  ).toFixed(2);

  console.log("SUMMARY STATISTICS:");
  console.log(`Total Articles Analyzed: ${results.length}`);
  console.log(
    `Positive Sentiment: ${positiveCount} (${((positiveCount / results.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `Negative Sentiment: ${negativeCount} (${((negativeCount / results.length) * 100).toFixed(1)}%)`
  );
  console.log(
    `Neutral Sentiment: ${neutralCount} (${((neutralCount / results.length) * 100).toFixed(1)}%)`
  );
  console.log(`Average Confidence: ${avgConfidence}`);
  console.log();

  // Detailed analysis for each article
  console.log("DETAILED ANALYSIS:");
  console.log("-".repeat(80));

  results.forEach((result) => {
    console.log(`\n[${result.id}] ${result.headline}`);
    console.log(`Sentiment: ${result.sentiment.toUpperCase()}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`Market Impact: ${result.impact.toUpperCase()}`);
    console.log(`Analysis: ${result.reasoning}`);
    console.log("-".repeat(80));
  });

  // Market sentiment summary
  console.log("\nMARKET SENTIMENT SUMMARY:");
  const bullishCount = results.filter((r) => r.impact === "bullish").length;
  const bearishCount = results.filter((r) => r.impact === "bearish").length;

  if (bullishCount > bearishCount) {
    console.log("Overall Sentiment: BULLISH ⬆️");
  } else if (bearishCount > bullishCount) {
    console.log("Overall Sentiment: BEARISH ⬇