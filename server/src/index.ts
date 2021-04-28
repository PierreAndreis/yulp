import app from './app';
const PORT = process.env.PORT || 1234;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('\x1b[44m%s\x1b[0m', `Server API is running on PORT ${PORT} 🚀`);
});
