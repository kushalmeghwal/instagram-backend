import express from 'express';
import userRouter from './routes/authRoutes.ts';
import postRouter from './routes/postRoutes.ts';
import storyRouter from './routes/storyRoutes.ts';
const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});
server.get('/', (req, res) => {
    res.send("Welcome to the server!");
});
server.use(userRouter);
server.use(postRouter);
server.use(storyRouter);

const PORT=process.env.PORT || 4500
server.listen(PORT,()=>{
    console.log(`server is running on port no ${PORT}`)
})