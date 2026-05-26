const mysql = require('mysql2/promise');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadToCloudinary(url, folder) {
  try {
    const result = await cloudinary.uploader.upload(url, { folder });
    return { url: result.secure_url, public_id: result.public_id };
  } catch (err) {
    console.error('Cloudinary upload failed for', url, err);
    return null;
  }
}

async function run() {
  const con = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_DATABASE || 'booking_db'
  });

  console.log('Migrating Banners...');
  const [banners] = await con.query('SELECT id, image_url FROM banners WHERE image_public_id IS NULL AND image_url LIKE "http%"');
  for (const banner of banners) {
    console.log(`Uploading banner ${banner.id}...`);
    const res = await uploadToCloudinary(banner.image_url, 'clinic/banners');
    if (res) {
      await con.query('UPDATE banners SET image_url = ?, image_public_id = ? WHERE id = ?', [res.url, res.public_id, banner.id]);
    }
  }

  console.log('Migrating Fanpages...');
  const [fanpages] = await con.query('SELECT id, cover_image_url, avatar_url FROM fanpages WHERE cover_public_id IS NULL OR avatar_public_id IS NULL');
  for (const fp of fanpages) {
    if (fp.cover_image_url && fp.cover_image_url.startsWith('http') && !fp.cover_public_id) {
      console.log(`Uploading cover for fanpage ${fp.id}...`);
      const res = await uploadToCloudinary(fp.cover_image_url, 'clinic/fanpages');
      if (res) {
        await con.query('UPDATE fanpages SET cover_image_url = ?, cover_public_id = ? WHERE id = ?', [res.url, res.public_id, fp.id]);
      }
    }
    if (fp.avatar_url && fp.avatar_url.startsWith('http') && !fp.avatar_public_id) {
      console.log(`Uploading avatar for fanpage ${fp.id}...`);
      const res = await uploadToCloudinary(fp.avatar_url, 'clinic/fanpages');
      if (res) {
        await con.query('UPDATE fanpages SET avatar_url = ?, avatar_public_id = ? WHERE id = ?', [res.url, res.public_id, fp.id]);
      }
    }
  }

  console.log('Migrating Posts...');
  const [posts] = await con.query('SELECT id, image_url FROM posts WHERE image_public_id IS NULL AND image_url LIKE "http%"');
  for (const post of posts) {
    console.log(`Uploading post image ${post.id}...`);
    const res = await uploadToCloudinary(post.image_url, 'clinic/posts');
    if (res) {
      await con.query('UPDATE posts SET image_url = ?, image_public_id = ? WHERE id = ?', [res.url, res.public_id, post.id]);
    }
  }

  console.log('Migration completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
