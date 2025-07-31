import { Request, Response } from 'express';
import { File, IncomingForm } from 'formidable';
import dotenv from 'dotenv';

import { FileUpload } from '../utils/fileUpload.ts';
import { pool } from '../config/databse.ts';

dotenv.config();

interface Post {
  create(request: Request, response: Response): Promise<void>;
  getPosts(request: Request, response: Response): Promise<Response<any, Record<string, any>>>;
}

export class PostController implements Post {

  async create(request: Request, response: Response): Promise<void> {
    try {
      const form = new IncomingForm({
          keepExtensions: true,
  multiples: true,
  uploadDir: '/tmp' 
      });

  
      const { fields, files } = await new Promise<{ fields: any, files: any }>((resolve, reject) => {
          form.parse(request, (err, fields, files) => {
  
              if (err) return reject(err);
              resolve({ fields, files });
            });
        });


      const token = (request as any).token; 
      const author = token.username;
      const { caption } = fields;

      const media_keys = Object.keys(files);
       const media_urls = [];

      for (const key of media_keys) {
         const fileData = files[key];
          const fileArray = Array.isArray(fileData) ? fileData : [fileData];
               for (const fileObj of fileArray) {
    const filepath = (fileObj as File).filepath;
    console.log("File path:", filepath);  
    const file_url = await FileUpload(filepath);
    media_urls.push(file_url);
  }
      }

      const query = 'INSERT INTO posts (media, caption, author) VALUES ($1, $2, $3)';
      await pool.query(query, [media_urls, caption, author]);

      response.status(201).json({ msg: 'Post made successfully' });

    } catch (error) {
      console.error(error);
      response.status(500).json({ msg: 'Network Error: Failed to upload post', error });
    }
  }

  async getPosts(request: Request, response: Response): Promise<Response<any, Record<string, any>>> {
    try{
    const query = `
      SELECT posts.id, posts.media, posts.caption, posts.likes, posts.comments, users.username
      FROM posts
      INNER JOIN users ON posts.author = users.username
    `;
    const data = (await pool.query(query)).rows;
    console.log(data);
    return response.status(200).json(data);
  }catch(error){
    console.log(error);
    return response.status(400).json({"error":error});
  }
}


async like(request: any, response: Response) {
  try {
    const token = request.token;
    const username = token.username;
    const post_id = request.params.id;

    const query = 'SELECT * FROM posts WHERE posts.id=$1';
    const data = (await pool.query(query, [post_id])).rows[0];

    if (!data) {
      return response.status(404).json({ msg: 'Post not found' });
    }

    let updatedLikes: string[];

    if (!data.likes) {
      updatedLikes = [username];
    } else if (!data.likes.includes(username)) {
      updatedLikes = [...data.likes, username];
    } else {
      return response.status(200).json({ msg: 'Already liked' });
    }

    const updateQuery = 'UPDATE posts SET likes=$1 WHERE posts.id=$2';
    await pool.query(updateQuery, [updatedLikes, post_id]);
    console.log("Liked post successfully");
    return response.status(200).json({ msg: 'Liked post successfully' });

  } catch (error) {
    console.error('Like error:', error);
    return response.status(500).json({ msg: 'Error liking post', error });
  }
}


async comment(request: any, response: Response) {
  try {
    const token = request.token;
    const username = token.username;
    const { comment } = request.body;
    const post_id = request.params.id;

    const query = 'SELECT * FROM posts WHERE posts.id=$1';
    const data = (await pool.query(query, [post_id])).rows[0];

    if (!data) {
      return response.status(404).json({ msg: 'Post not found' });
    }

    const newComment = {
      username,
      comment: comment,
      likes: [],
      replies: [],
    };

    let updatedComments: any[];

    if (!data.comments) {
      updatedComments = [newComment];
    } else {
      updatedComments = [...data.comments, newComment];
    }

    const updateQuery = 'UPDATE posts SET comments=$1 WHERE posts.id=$2';
    await pool.query(updateQuery, [JSON.stringify(updatedComments), post_id]);
    console.log("Comment made successfully");
    return response.status(200).json({ msg: 'Comment made successfully' });

  } catch (error) {
    console.error('Comment error:', error);
    return response.status(500).json({ msg: 'Error making comment', error });
  }
}


async replyComment(request: any, response: Response) {
  try {
    const token = request.token;
    const username = token.username;
    const post_id = request.params.id;
    const commentIdx = parseInt(request.params.idx, 10);
    const { reply } = request.body;

    const query = 'SELECT * FROM posts WHERE posts.id=$1';
    const postResult = await pool.query(query, [post_id]);
    const post = postResult.rows[0];

    if (!post) {
      return response.status(404).json({ msg: 'Post not found' });
    }

    const comments = [...post.comments];

    if (!comments[commentIdx]) {
      return response.status(400).json({ msg: 'Invalid comment index' });
    }

    comments[commentIdx].replies.push({ username, reply });

    const updateQuery = 'UPDATE posts SET comments=$1 WHERE posts.id=$2';
    await pool.query(updateQuery, [JSON.stringify(comments), post_id]);

    return response.status(200).json({ msg: 'Replied to comment' });

  } catch (error) {
    console.error('Reply error:', error);
    return response.status(500).json({ msg: 'Error replying to comment', error });
  }
}


async getPostById(request: Request, response: Response) {
  try {
    const post_id = request.params.id;
    const query = 'SELECT * FROM posts WHERE posts.id=$1';
    const post = (await pool.query(query, [post_id])).rows;

    if (post.length === 0) {
      return response.status(404).json({ msg: 'Post not found' });
    }

    return response.status(200).json(post[0]);

  } catch (error) {
    console.error('Get post error:', error);
    return response.status(500).json({ msg: 'Error fetching post', error });
  }
}

}