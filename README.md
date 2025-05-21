# 🌤️ Weather Backend Case Study

This is a weather query service built with Node.js, Express, Prisma, PostgreSQL, Redis, and TypeScript.  
It includes authentication, role-based access, admin control, and OpenWeather API integration.

## 🛠️ Setup

1. Clone the repo  
```bash
git clone https://github.com/yourusername/weather-backend-case.git
cd weather-backend-case
```
2.Install dependencies

```bash
npm install
```

3.Setup Environment Files
```bash
cp .env.example .env
# Update with your PostgreSQL & OpenWeather API key
```

4. Run Prisma and Start Server
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
5. Redis Setup
```bash
sudo service redis-server start
```

## 📬 API Docs

- You may test endpoints with interactive Swagger UI → [http://localhost:3000/docs](http://localhost:3000/docs)
---

## Architecture Justification
- **Service Structure: ** Monolithic structure is used for this demo due to simlicity and maintainabiliry. This project has a few number of endpoints and 2 schemas. Dividing this project to microservices might create overhead for development. However, if the requirements were more detailed, microservice structure might be used. Besides that If there is an idea to expand the project, it would be reasonable to divide it into microservices. 
- **Express.js** is used in this project for simplicity. Since this project is a case study and the developer was not experienced with TypeScript although the developer has experience with backend development, Express.js is selected as framework.
- **Prisma ORM** is selected for type-safe DB operations.
- **Redis** is used to cache weather queries requested by USERS. This caching decreases the number of request sent to the OpenWeatherMap API and fastens the execution (reduces the response time).
- **JWT** is used for role based access and authentication systems. JWT is wide used and with tokens attributes like userId or role can be passed to other endpoints without checking the database for control.
- **Jest** is used for tests, for each endpoints various scenarios can be tested. To run the tests following bash command can be called:
```bash
  npm test
```


### If you want to use seperate database (strongly suggested) and do not want to use .env.test file use the following command before above npm test command:
```bash
  DATABASE_URL="postgresql://*username*:*your_password*@localhost:5432/weatherTest" npx prisma migrate deploy --schema=prisma/schema.prisma
```


