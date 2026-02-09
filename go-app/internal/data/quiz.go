package data

// QuizPersonalityType defines a financial personality result.
type QuizPersonalityType struct {
	ID          string
	Title       string
	Emoji       string
	Color       string // tailwind color name
	Description string
	Strengths   []string
	WatchOuts   []string
	Tips        []string
	Tools       []QuizTool
}

// QuizTool is a recommended tool for a personality type.
type QuizTool struct {
	Name string
	Desc string
	URL  string
}

// QuizOption is a single answer choice.
type QuizOption struct {
	Text   string
	Points map[string]int // personality type -> points
}

// QuizQuestion is a single quiz question.
type QuizQuestion struct {
	Question string
	Options  []QuizOption
}

// QuizQuestions contains all 10 quiz questions.
var QuizQuestions = []QuizQuestion{
	{
		Question: "You receive an unexpected $5,000. What's your first move?",
		Options: []QuizOption{
			{Text: "Put it straight into savings or an emergency fund", Points: map[string]int{"saver": 3, "balanced": 1}},
			{Text: "Invest it in stocks or index funds", Points: map[string]int{"investor": 3, "builder": 1}},
			{Text: "Treat yourself to something you've been eyeing", Points: map[string]int{"spender": 3}},
			{Text: "Split it between saving, investing, and fun money", Points: map[string]int{"balanced": 3, "builder": 1}},
		},
	},
	{
		Question: "How often do you check your bank account?",
		Options: []QuizOption{
			{Text: "Daily — I track every transaction", Points: map[string]int{"saver": 3, "builder": 1}},
			{Text: "Weekly — I review my portfolio performance", Points: map[string]int{"investor": 3}},
			{Text: "When I need to buy something or get a notification", Points: map[string]int{"spender": 3}},
			{Text: "A few times a month to stay on track", Points: map[string]int{"balanced": 3}},
		},
	},
	{
		Question: "What's your approach to budgeting?",
		Options: []QuizOption{
			{Text: "Strict budget with every dollar assigned", Points: map[string]int{"saver": 3, "builder": 1}},
			{Text: "I focus on maximizing investments, not cutting expenses", Points: map[string]int{"investor": 3}},
			{Text: "Budgets feel restrictive — I prefer going with the flow", Points: map[string]int{"spender": 3}},
			{Text: "50/30/20 rule or something similar", Points: map[string]int{"balanced": 3, "saver": 1}},
		},
	},
	{
		Question: "How big is your emergency fund?",
		Options: []QuizOption{
			{Text: "6+ months of expenses — I sleep well at night", Points: map[string]int{"saver": 3}},
			{Text: "3 months — the rest is invested for growth", Points: map[string]int{"investor": 3, "balanced": 1}},
			{Text: "I don't really have one — I'll figure it out", Points: map[string]int{"spender": 3}},
			{Text: "I'm building toward 3-6 months systematically", Points: map[string]int{"builder": 3, "balanced": 1}},
		},
	},
	{
		Question: "When you see something you want but don't need, you...",
		Options: []QuizOption{
			{Text: "Walk away — I don't need it", Points: map[string]int{"saver": 3}},
			{Text: "Calculate the opportunity cost of not investing that money", Points: map[string]int{"investor": 3}},
			{Text: "Buy it — life is short and you deserve it", Points: map[string]int{"spender": 3}},
			{Text: "Add it to a wish list and revisit in 30 days", Points: map[string]int{"balanced": 3, "builder": 1}},
		},
	},
	{
		Question: "What's your primary financial goal?",
		Options: []QuizOption{
			{Text: "Building a large safety net and being debt-free", Points: map[string]int{"saver": 3}},
			{Text: "Growing wealth and achieving financial independence", Points: map[string]int{"investor": 3, "builder": 1}},
			{Text: "Enjoying life now while maintaining the basics", Points: map[string]int{"spender": 3}},
			{Text: "Having a balanced life with steady progress", Points: map[string]int{"balanced": 3}},
		},
	},
	{
		Question: "How do you feel about debt?",
		Options: []QuizOption{
			{Text: "I avoid it at all costs — even for a house", Points: map[string]int{"saver": 3}},
			{Text: "Strategic debt is a tool — leverage for investments", Points: map[string]int{"investor": 3, "builder": 2}},
			{Text: "It's unavoidable — minimum payments are fine", Points: map[string]int{"spender": 3}},
			{Text: "Pay it down steadily while saving for the future", Points: map[string]int{"balanced": 3}},
		},
	},
	{
		Question: "What excites you most about money?",
		Options: []QuizOption{
			{Text: "Watching my savings account grow steadily", Points: map[string]int{"saver": 3}},
			{Text: "Seeing my investments compound over time", Points: map[string]int{"investor": 3}},
			{Text: "The experiences and things it lets me enjoy", Points: map[string]int{"spender": 3}},
			{Text: "Building a system that runs on autopilot", Points: map[string]int{"builder": 3, "balanced": 1}},
		},
	},
	{
		Question: "How do you handle financial stress?",
		Options: []QuizOption{
			{Text: "Cut spending immediately and reassess", Points: map[string]int{"saver": 3}},
			{Text: "Stay the course — markets always recover", Points: map[string]int{"investor": 3}},
			{Text: "Try not to think about it", Points: map[string]int{"spender": 3}},
			{Text: "Review my plan and make targeted adjustments", Points: map[string]int{"balanced": 2, "builder": 2}},
		},
	},
	{
		Question: "Where do you see yourself in 10 years?",
		Options: []QuizOption{
			{Text: "Completely debt-free with a massive savings cushion", Points: map[string]int{"saver": 3}},
			{Text: "Financially independent with passive income streams", Points: map[string]int{"investor": 3, "builder": 1}},
			{Text: "Living my best life with great memories", Points: map[string]int{"spender": 3}},
			{Text: "Owning a diversified portfolio of assets and businesses", Points: map[string]int{"builder": 3, "investor": 1}},
		},
	},
}

// QuizPersonalities maps personality IDs to their full data.
var QuizPersonalities = map[string]QuizPersonalityType{
	"saver": {
		ID: "saver", Title: "The Saver", Emoji: "🏦", Color: "blue",
		Description: "You prioritize financial security above all else. Your disciplined approach to money means you always have a safety net.",
		Strengths:  []string{"Excellent emergency fund discipline", "Low debt-to-income ratio", "Strong spending awareness", "Financial resilience during downturns"},
		WatchOuts:  []string{"May miss investment growth opportunities", "Could under-enjoy present life", "Might be overly risk-averse", "Savings may lose value to inflation"},
		Tips:       []string{"Consider investing a portion beyond your emergency fund", "Set a guilt-free spending budget for enjoyment", "Look into high-yield savings accounts to beat inflation", "Automate investments to overcome analysis paralysis"},
		Tools: []QuizTool{
			{Name: "High-Yield Savings", Desc: "Earn 4-5% APY on your savings", URL: "/best/high-yield-savings"},
			{Name: "Budget Planner", Desc: "Track your 50/30/20 split", URL: "/smart-money"},
			{Name: "Tax Calculator", Desc: "Optimize your take-home pay", URL: "/taxes"},
		},
	},
	"investor": {
		ID: "investor", Title: "The Investor", Emoji: "📈", Color: "emerald",
		Description: "You see money as a tool for building wealth. Compound growth excites you, and you're always looking for the next opportunity.",
		Strengths:  []string{"Strong long-term wealth building", "Comfortable with calculated risk", "Understands compound growth", "Diversified income potential"},
		WatchOuts:  []string{"May neglect emergency savings", "Could over-leverage with debt", "Might chase returns over stability", "May undervalue present experiences"},
		Tips:       []string{"Maintain at least 3 months in liquid emergency savings", "Diversify across asset classes, not just stocks", "Consider tax-advantaged accounts like 401(k) and IRA", "Set a ceiling on speculative investments"},
		Tools: []QuizTool{
			{Name: "Investment Apps", Desc: "Compare top investment platforms", URL: "/best/investment-apps"},
			{Name: "Income Calculator", Desc: "Project your annual earnings", URL: "/calculator"},
			{Name: "Tax Calculator", Desc: "Minimize your tax burden", URL: "/taxes"},
		},
	},
	"spender": {
		ID: "spender", Title: "The Spender", Emoji: "🛍️", Color: "purple",
		Description: "You believe money is meant to be enjoyed. You prioritize experiences and quality of life, living fully in the present.",
		Strengths:  []string{"Rich life experiences and memories", "Generous with family and friends", "Low financial anxiety day-to-day", "Strong motivation to earn more"},
		WatchOuts:  []string{"May lack emergency savings", "Could accumulate unnecessary debt", "Retirement planning may fall behind", "Impulse purchases can add up"},
		Tips:       []string{"Start with just 10% automatic savings — you won't miss it", "Use the 24-hour rule for purchases over $100", "Track your subscriptions — they add up fast", "Set up a separate spending account with a weekly allowance"},
		Tools: []QuizTool{
			{Name: "Budget Planner", Desc: "Find your ideal spending balance", URL: "/smart-money"},
			{Name: "Subscription Tracker", Desc: "See what you're really spending", URL: "/smart-money"},
			{Name: "Affordability Guide", Desc: "What can you really afford?", URL: "/afford"},
		},
	},
	"balanced": {
		ID: "balanced", Title: "The Balancer", Emoji: "⚖️", Color: "amber",
		Description: "You've found the sweet spot between saving and spending. You plan for the future while still enjoying today.",
		Strengths:  []string{"Healthy saving-spending equilibrium", "Consistent progress toward goals", "Adaptable financial approach", "Low financial stress"},
		WatchOuts:  []string{"May plateau without ambitious goals", "Could miss aggressive growth windows", "Might become complacent", "Balance can mean slow progress"},
		Tips:       []string{"Set a stretch financial goal for the year", "Consider increasing your investment allocation by 2-3%", "Review and optimize your budget quarterly", "Look into tax optimization strategies"},
		Tools: []QuizTool{
			{Name: "Budget Planner", Desc: "Fine-tune your 50/30/20 split", URL: "/smart-money"},
			{Name: "Income Calculator", Desc: "Project and maximize earnings", URL: "/calculator"},
			{Name: "Product Comparisons", Desc: "Find the best financial tools", URL: "/best"},
		},
	},
	"builder": {
		ID: "builder", Title: "The Builder", Emoji: "🏗️", Color: "cyan",
		Description: "You're focused on creating systems that generate wealth automatically. Financial freedom through multiple income streams is your goal.",
		Strengths:  []string{"Systematic wealth creation approach", "Multiple income stream mindset", "Long-term strategic thinking", "Strong financial automation skills"},
		WatchOuts:  []string{"May over-optimize and under-enjoy", "Could spread too thin across projects", "Might neglect personal relationships for hustle", "Analysis paralysis on complex decisions"},
		Tips:       []string{"Schedule regular breaks from financial optimization", "Focus on 2-3 income streams max to avoid burnout", "Automate your financial systems then step back", "Celebrate milestones along the way"},
		Tools: []QuizTool{
			{Name: "Income Streams", Desc: "Track all your income sources", URL: "/income-streams"},
			{Name: "Gig Calculator", Desc: "Optimize your side hustle income", URL: "/gig-calculator"},
			{Name: "Salary Guide", Desc: "Benchmark your earning potential", URL: "/salary"},
		},
	},
}

// CalculateQuizResult scores answers and returns the winning personality type.
func CalculateQuizResult(answers []int) string {
	scores := map[string]int{
		"saver": 0, "investor": 0, "spender": 0, "balanced": 0, "builder": 0,
	}

	for i, answerIdx := range answers {
		if i >= len(QuizQuestions) || answerIdx < 0 || answerIdx >= len(QuizQuestions[i].Options) {
			continue
		}
		for pType, pts := range QuizQuestions[i].Options[answerIdx].Points {
			scores[pType] += pts
		}
	}

	best := "balanced"
	bestScore := 0
	for pType, score := range scores {
		if score > bestScore {
			bestScore = score
			best = pType
		}
	}
	return best
}

// GetQuizPersonality returns a personality type by ID.
func GetQuizPersonality(id string) *QuizPersonalityType {
	if p, ok := QuizPersonalities[id]; ok {
		return &p
	}
	return nil
}
