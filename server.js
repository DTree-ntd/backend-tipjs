const app = require("./src/app");

const PORT = process.env.PORT || 8080

const server = app.listen( PORT, () => {
  console.log(`Server run on ${PORT}`);
})

// process.on('SIGINT', () => {
//   server.close(() => console.log(`Exit Server Express`))
// })