-- Article image sliders: ordered list of image URLs per post (JSON array).
ALTER TABLE blog_posts ADD COLUMN gallery_images TEXT;
