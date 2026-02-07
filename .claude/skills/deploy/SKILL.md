## Deploy to Production
1. Run `cd go-app && go test ./...` — fix any failures
2. Run `cd go-app && go build -o server .` — verify build succeeds
3. Run `pm2 restart autolytiq-go` — restart production server
4. Run `curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health` — confirm 200
5. Run `curl -s -o /dev/null -w "%{http_code}" https://autolytiqs.com/` — confirm live site 200
6. Commit changes: `git add -A && git commit -m "<summarize changes>"`
7. Push: `git push origin main`
