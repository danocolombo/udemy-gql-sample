const express = require("express");
const graphqlHTTP = require("express-graphql");
const mongoose = require("mongoose");
const schema = require("./schema/schema");

const cors = require("cors");
const port = process.env.PORT || 4000;
const app = express();

mongoose.connect(
    "mongodb+srv://USERNAME:PASSWORD@rogueintel-ox4iq.mongodb.net/test",
    { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.connection.once("open", () => {
    console.log("yes we are connected");
});

// mongodb+srv://udemy:Admin@rogueintel-ox4iq.mongodb.net/test?retryWrites=true&w=majority
app.use(cors());
app.use(
    "/graphql",
    graphqlHTTP({
        graphiql: true,
        schema: schema
    })
);

app.listen(port, () => {
    //localhost:4000
    console.log("listening for requests on port 4000");
});
