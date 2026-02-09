package data

// DripEmail defines a single email in the drip sequence.
type DripEmail struct {
	Step    int    // 1-8
	Subject string // email subject line
	Delay   int    // days after signup to send (0 = immediately)
	Body    string // HTML body (with {{.Name}}, {{.UnsubscribeURL}} placeholders)
}

// DripSequence returns the 8-week financial education email series.
func DripSequence() []DripEmail {
	return []DripEmail{
		{
			Step:    1,
			Subject: "Welcome to Autolytiq - Your Financial Clarity Starts Here",
			Delay:   0,
			Body: `<h2>Welcome to Autolytiq, {{.Name}}!</h2>
<p>Thanks for signing up. You now have access to all our free financial calculators:</p>
<ul>
<li><strong>Income Calculator</strong> - Project your annual income from any paystub</li>
<li><strong>50/30/20 Budget Planner</strong> - Build a budget that actually works</li>
<li><strong>Tax Estimator</strong> - See your federal + state tax breakdown</li>
<li><strong>Housing & Auto</strong> - Know what you can truly afford</li>
</ul>
<p><a href="https://autolytiqs.com/calculator" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Start Calculating</a></p>
<p>Over the next few weeks, we'll send you practical financial tips. No fluff, just actionable advice.</p>`,
		},
		{
			Step:    2,
			Subject: "The #1 Rule for Financial Clarity: Know Your Real Numbers",
			Delay:   3,
			Body: `<h2>Do you know your real annual income?</h2>
<p>Most people guess. But if you're paid biweekly, have variable hours, or started mid-year, your "annual salary" and your actual annual income can be very different.</p>
<p><strong>Here's why it matters:</strong></p>
<ul>
<li>Mortgage lenders use projected annual income to approve loans</li>
<li>Budget rules (like 50/30/20) only work with accurate numbers</li>
<li>Tax planning requires knowing your actual bracket</li>
</ul>
<p><strong>Action step:</strong> Grab your latest paystub and run it through our <a href="https://autolytiqs.com/calculator">Income Calculator</a>. It takes 30 seconds and gives you your projected annual, monthly, and weekly income.</p>`,
		},
		{
			Step:    3,
			Subject: "The 50/30/20 Budget Rule (And When to Break It)",
			Delay:   7,
			Body: `<h2>The simplest budget that actually works</h2>
<p>The 50/30/20 rule is the most popular budgeting framework for a reason: it's dead simple.</p>
<ul>
<li><strong>50% Needs</strong> - Rent, utilities, groceries, insurance, minimum debt payments</li>
<li><strong>30% Wants</strong> - Dining out, entertainment, shopping, subscriptions</li>
<li><strong>20% Savings</strong> - Emergency fund, retirement, investments, extra debt payments</li>
</ul>
<p><strong>When to adjust:</strong></p>
<ul>
<li>High-cost city? Try 60/20/20</li>
<li>Aggressive debt payoff? Try 50/20/30 (30% to debt)</li>
<li>High income ($150k+)? You can push savings to 30-40%</li>
</ul>
<p><a href="https://autolytiqs.com/smart-money" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Build Your Budget</a></p>`,
		},
		{
			Step:    4,
			Subject: "How Much House Can You Actually Afford?",
			Delay:   14,
			Body: `<h2>The 28/36 Rule Explained</h2>
<p>Banks use two key ratios to decide how much house you can afford:</p>
<ul>
<li><strong>28% Rule</strong> - Your total housing payment (PITI) shouldn't exceed 28% of gross monthly income</li>
<li><strong>36% Rule</strong> - Total debt payments shouldn't exceed 36% of gross monthly income</li>
</ul>
<p><strong>PITI = Principal + Interest + Taxes + Insurance</strong></p>
<p>Most people only think about the mortgage payment. But property taxes, insurance, and PMI (if you put less than 20% down) add up fast.</p>
<p><strong>Quick example:</strong> On $75,000/year income, the 28% rule limits you to $1,750/month total housing. That includes everything.</p>
<p><a href="https://autolytiqs.com/housing" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Calculate Your Affordability</a></p>`,
		},
		{
			Step:    5,
			Subject: "Your Taxes Are Probably Higher Than You Think",
			Delay:   21,
			Body: `<h2>Understanding your total tax burden</h2>
<p>When people think about taxes, they usually think about federal income tax. But that's just the beginning:</p>
<ul>
<li><strong>Federal income tax</strong> - 10% to 37% (progressive brackets)</li>
<li><strong>State income tax</strong> - 0% to 13.3% depending on your state</li>
<li><strong>Social Security</strong> - 6.2% (up to $168,600 in 2025)</li>
<li><strong>Medicare</strong> - 1.45% (plus 0.9% on income over $200k)</li>
</ul>
<p><strong>The surprise:</strong> Someone earning $80,000 in California pays roughly $23,000 in total taxes - an effective rate of about 29%. That means your real take-home is around $57,000.</p>
<p><strong>Ways to reduce your tax bill:</strong></p>
<ul>
<li>Max out your 401(k) contribution ($23,500 in 2025)</li>
<li>Use an HSA if eligible ($4,150 individual, $8,300 family)</li>
<li>Consider a Traditional vs Roth IRA based on your bracket</li>
</ul>
<p><a href="https://autolytiqs.com/taxes" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Estimate Your Taxes</a></p>`,
		},
		{
			Step:    6,
			Subject: "The Car Affordability Rule No One Talks About",
			Delay:   28,
			Body: `<h2>The 12% rule for auto affordability</h2>
<p>Most people decide what car to buy based on the monthly payment they can "afford." That's a trap.</p>
<p><strong>The 12% rule:</strong> Your total car payment should be no more than 12% of your gross monthly income.</p>
<p><strong>Why 12%?</strong></p>
<ul>
<li>It leaves room for insurance ($150-300/month)</li>
<li>It accounts for maintenance and fuel</li>
<li>It prevents you from being "car poor"</li>
</ul>
<p><strong>Example:</strong> On $60,000/year ($5,000/month gross), your max car payment should be $600/month. With a 5-year loan at 6%, that's roughly a $31,000 car with $2,000 down.</p>
<p><a href="https://autolytiqs.com/auto" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Check Your Auto Budget</a></p>`,
		},
		{
			Step:    7,
			Subject: "The Power of Multiple Income Streams",
			Delay:   42,
			Body: `<h2>Why one income source is risky</h2>
<p>The average millionaire has 7 income streams. That's not because they're greedy - it's because diversification protects you.</p>
<p><strong>Types of income:</strong></p>
<ul>
<li><strong>Earned income</strong> - Your job salary</li>
<li><strong>Side business</strong> - Freelancing, consulting, gig work</li>
<li><strong>Investment income</strong> - Dividends, interest, capital gains</li>
<li><strong>Rental income</strong> - Real estate</li>
<li><strong>Royalties/passive</strong> - Content, courses, digital products</li>
</ul>
<p><strong>Start small:</strong> Even $500/month from a side income ($6,000/year) invested at 8% grows to over $90,000 in 10 years.</p>
<p><a href="https://autolytiqs.com/income-streams" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Calculate Your Total Income</a></p>`,
		},
		{
			Step:    8,
			Subject: "Your 5-Year Financial Roadmap",
			Delay:   56,
			Body: `<h2>Putting it all together</h2>
<p>Over the past few weeks, we've covered the fundamentals. Here's your action checklist:</p>
<ol>
<li><strong>Know your real income</strong> - Use the <a href="https://autolytiqs.com/calculator">Income Calculator</a> with your latest paystub</li>
<li><strong>Set up 50/30/20</strong> - Automate transfers with our <a href="https://autolytiqs.com/smart-money">Budget Planner</a></li>
<li><strong>Understand your taxes</strong> - Know your effective rate and optimize with <a href="https://autolytiqs.com/taxes">Tax Estimator</a></li>
<li><strong>Right-size housing</strong> - Stay under 28% of gross with our <a href="https://autolytiqs.com/housing">Housing Calculator</a></li>
<li><strong>Don't overspend on cars</strong> - Follow the 12% rule via <a href="https://autolytiqs.com/auto">Auto Calculator</a></li>
<li><strong>Build multiple streams</strong> - Track everything with <a href="https://autolytiqs.com/income-streams">Income Streams</a></li>
</ol>
<p><strong>The compound effect:</strong> Small, consistent actions create massive results over 5-10 years. Use our <a href="https://autolytiqs.com/inflation">Compound Interest Calculator</a> to see how even modest monthly investing grows.</p>
<p>Thanks for being part of Autolytiq. Keep using the calculators as your income and goals change - they're free forever.</p>`,
		},
	}
}

// GetDripEmail returns a specific step in the sequence.
func GetDripEmail(step int) *DripEmail {
	for _, e := range DripSequence() {
		if e.Step == step {
			return &e
		}
	}
	return nil
}
