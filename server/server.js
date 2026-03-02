const app=require("./src/app");

require("dotenv").config();
const connectToDB=require("./src/config/db");
connectToDB();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});