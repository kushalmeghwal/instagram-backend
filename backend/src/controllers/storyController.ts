import { Response } from 'express';
import { IncomingForm } from 'formidable';
import { FileUpload } from '../utils/fileUpload.ts';
import { pool } from '../config/databse.ts';
import CronJob from 'cron';
export class StoryController {
  async create(request: any, response: Response) {
    const token = request.token;
    const username = token.username;

    const form = new IncomingForm();

    form.parse(request, async (error, fields, files: any) => {
      if (error) {
        return response.status(500).json({ msg: 'Form parsing error', error });
      }

      try {
        const { text } = fields;
  
        const backgroundMediaFile = Array.isArray(files.backgroundMedia)
  ? files.backgroundMedia[0]
  : files.backgroundMedia;

       if (!backgroundMediaFile?.filepath) {
  return response.status(400).json({ msg: 'No media file provided' });
}

const media_url = await FileUpload(backgroundMediaFile.filepath);
     
        const query = `
          INSERT INTO stories (owner, media, text, timestamp)
          VALUES ($1, $2, $3, NOW())
          RETURNING *;
        `;
        const values = [username, media_url, text];

        const result = await pool.query(query, values);
        console.log("story added successfully");
        console.log(`Story added by ${username} at ${new Date().toLocaleString('en-IN')}`);
console.log(`⌛ It will expire at ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('en-IN')}`);

        return response.status(201).json({ msg: 'Story added', story: result.rows[0] });

      } catch (err) {
        console.error('Create story error:', err);
        return response.status(500).json({ msg: 'Internal server error', error: err });
      }
    });
  }

}

const Cron = CronJob.CronJob;

export const job = new Cron(
  '* * * * *',
  async () => {
    try {
      const deleteQuery = `
        DELETE FROM stories
        WHERE NOW() - timestamp >= INTERVAL '24 hours'
        RETURNING *;
      `;
      const result = await pool.query(deleteQuery);

      if (result.rows.length > 0) {
        console.log(`🗑️ Deleted ${result.rows.length} expired stories`);
        result.rows.forEach(story => {
          console.log(`-> Deleted story from ${story.owner} at ${story.timestamp}`);
        });
      } else {
        console.log(`No expired stories at ${new Date().toLocaleString('en-IN')}`);
      }
    } catch (error) {
      console.error('Failed to delete expired stories:', error);
    }
  },
  null,
  true,
  'Asia/Kolkata'
);
