# article-co-authors-with-edit-locks

Collaborative article editing demo with:

- signed-cookie authentication
- co-authors on create and edit
- single-tab edit locks with heartbeats
- Playwright coverage for the primary acceptance flow

## Setup

```bash
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Sign in with either:

- `Zolly / password`
- `John / password`

## Test

```bash
npm run test:e2e
```
